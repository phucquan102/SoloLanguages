import { localeTagSchema } from '@solo/language-sdk';
import type { TextTools } from '@solo/language-sdk';
import { z } from 'zod';
import { checkQuestionAnswers, checkQuestionExplanations, missingLocales } from './curriculum-questions.ts';
import type { AddIssue, CurriculumConfig } from './curriculum-questions.ts';
import { buildSchedule, checkVocabulary } from './curriculum-schedule.ts';
import { checkDaysAndTests } from './curriculum-tests.ts';
import { readPack } from './pack-data.ts';
import type { PackData } from './pack-data.ts';
import type { ContentIssuePath, ContentValidationIssue } from '../types.ts';
import type { PackQuestion } from './pack-data.ts';
import { checkAuthoringRules } from './curriculum-authoring.ts';

export interface CurriculumRanges {
  /** Inclusive example-block count per lesson. Default [4, 6]. */
  readonly examples?: readonly [number, number];
  /** Inclusive practice-question count per lesson. Default [6, 10]. */
  readonly questions?: readonly [number, number];
  /** Minimum choice questions per lesson. Default 2. */
  readonly minChoice?: number;
  /** Minimum typed questions per lesson. Default 2. */
  readonly minTyped?: number;
}

export type CurriculumChoice = Extract<PackQuestion, { kind: 'choice' }>;

export interface CurriculumOptions extends Pick<TextTools, 'normalize' | 'compareAnswer'> {
  /** Compare test prompts AND answer surfaces against every practice question in the same unit. */
  readonly testNovelty?: boolean;
  /** Optional novelty key, called for each accepted answer surface as a single-answer question. */
  readonly answerKey?: (question: PackQuestion) => string;
  /** Require question/option vocabulary to have been introduced by its scheduled day. */
  readonly taughtVocabulary?: boolean;
  /** Module adapter for option metadata or tokenization; called for EVERY option, including the key. */
  readonly optionVocabIds?: (question: CurriculumChoice, optionIndex: number) => readonly string[];
  /** Case-insensitive, Unicode-normalized substrings forbidden in learner-facing text. */
  readonly forbiddenPhrases?: readonly string[];
  /** Flag a uniquely parenthesised or more than twice as long correct option. */
  readonly optionParity?: boolean;
  /** Learner locales; every example translation and question explanation must cover each. */
  readonly nativeLocales: readonly string[];
  readonly ranges?: CurriculumRanges;
  /** Days after introduction in which recycling counts. Default 14. */
  readonly recycleWindowDays?: number;
  /** Recycles needed per introduced vocabulary. Default 2. */
  readonly minRecycles?: number;
  /**
   * Cap the recycles required for vocabulary introduced near the end of a course's schedule at the
   * number of scheduled days left in the window. For courses still being authored. Default false.
   */
  readonly truncateAtScheduleEnd?: boolean;
  /** Lesson questions that must carry each introduced vocabulary id. Default 2. */
  readonly minQuestionsPerVocab?: number;
  /** Restrict the checks to the lessons, days and tests of these stages. Default: the whole pack. */
  readonly scopeStageIds?: readonly string[];
}

const count = z.number().int().nonnegative();
const range = z.tuple([count, count]).refine(([min, max]) => min <= max, 'Expected [min, max] with min <= max');
const optionsSchema = z.strictObject({
  testNovelty: z.boolean().optional(), taughtVocabulary: z.boolean().optional(),
  forbiddenPhrases: z.array(z.string().trim().min(1)).optional(), optionParity: z.boolean().optional(),
  nativeLocales: z.array(localeTagSchema),
  ranges: z.strictObject({
    examples: range.optional(), questions: range.optional(), minChoice: count.optional(), minTyped: count.optional(),
  }).optional(),
  recycleWindowDays: z.number().int().positive().optional(),
  minRecycles: count.optional(),
  truncateAtScheduleEnd: z.boolean().optional(),
  minQuestionsPerVocab: count.optional(),
  scopeStageIds: z.array(z.string().min(1)).optional(),
});

interface Callbacks { failed: { normalize: boolean; compareAnswer: boolean; optionVocabIds: boolean; answerKey: boolean } }

/** Validates options and wraps module callbacks. Returns issues when the options are unusable. */
function readOptions(options: CurriculumOptions, callbacks: Callbacks): CurriculumConfig | ContentValidationIssue[] {
  if (options === null || typeof options !== 'object') return [{ path: ['options'], message: 'Expected curriculum options' }];
  const { normalize, compareAnswer } = options;
  const parsed = optionsSchema.safeParse({
    testNovelty: options.testNovelty, taughtVocabulary: options.taughtVocabulary,
    forbiddenPhrases: options.forbiddenPhrases, optionParity: options.optionParity,
    nativeLocales: options.nativeLocales, ranges: options.ranges, recycleWindowDays: options.recycleWindowDays,
    minRecycles: options.minRecycles, truncateAtScheduleEnd: options.truncateAtScheduleEnd,
    minQuestionsPerVocab: options.minQuestionsPerVocab, scopeStageIds: options.scopeStageIds,
  });
  if (!parsed.success || typeof normalize !== 'function' || typeof compareAnswer !== 'function'
    || (options.optionVocabIds !== undefined && typeof options.optionVocabIds !== 'function')
    || (options.answerKey !== undefined && typeof options.answerKey !== 'function')) {
    return [{ path: ['options'], message: 'Expected normalize, compareAnswer, canonical nativeLocales and well-formed limits' }];
  }
  const value = parsed.data;
  return {
    testNovelty: value.testNovelty ?? false,
    answerKey: options.answerKey === undefined ? undefined : (question) => {
      try {
        const key: unknown = options.answerKey!(question);
        if (typeof key === 'string') return key;
      } catch { /* reported once after the run */ }
      callbacks.failed.answerKey = true;
      return undefined;
    },
    taughtVocabulary: value.taughtVocabulary ?? false,
    forbiddenPhrases: value.forbiddenPhrases ?? [],
    optionParity: value.optionParity ?? false,
    optionVocabIds: (question, index) => {
      if (options.optionVocabIds === undefined) return [];
      try {
        const ids = options.optionVocabIds(question, index);
        if (Array.isArray(ids) && ids.every((id) => typeof id === 'string' && id.length > 0)) return ids;
      } catch { /* reported once after the run */ }
      callbacks.failed.optionVocabIds = true;
      return [];
    },
    nativeLocales: value.nativeLocales,
    normalize: (text) => {
      try {
        const result: unknown = normalize(text);
        if (typeof result === 'string') return result;
      } catch { /* reported once after the run */ }
      callbacks.failed.normalize = true;
      return text;
    },
    accepts: (input, accepted) => {
      try {
        return compareAnswer(input, accepted).correct === true;
      } catch {
        callbacks.failed.compareAnswer = true;
        return false;
      }
    },
    examples: value.ranges?.examples ?? [4, 6],
    questions: value.ranges?.questions ?? [6, 10],
    minChoice: value.ranges?.minChoice ?? 2,
    minTyped: value.ranges?.minTyped ?? 2,
    recycleWindowDays: value.recycleWindowDays ?? 14,
    minRecycles: value.minRecycles ?? 2,
    truncateAtScheduleEnd: value.truncateAtScheduleEnd ?? false,
    minQuestionsPerVocab: value.minQuestionsPerVocab ?? 2,
    scope: value.scopeStageIds === undefined ? undefined : new Set(value.scopeStageIds),
  };
}

function checkLesson(lesson: PackData['lessons'][number], path: ContentIssuePath, config: CurriculumConfig, add: AddIssue): void {
  const kinds = new Map<string, number>();
  for (const block of lesson.blocks) kinds.set(block.kind, (kinds.get(block.kind) ?? 0) + 1);
  if (!kinds.has('objective')) add([...path, 'blocks'], 'Lesson needs an objective block');
  if (!kinds.has('explanation')) add([...path, 'blocks'], 'Lesson needs an explanation block');
  if (!kinds.has('mistake')) add([...path, 'blocks'], 'Lesson needs at least one mistake block');

  const [minExamples, maxExamples] = config.examples;
  const examples = kinds.get('example') ?? 0;
  if (examples < minExamples || examples > maxExamples) {
    add([...path, 'blocks'], `Lesson needs ${minExamples}-${maxExamples} examples, found ${examples}`);
  }
  lesson.blocks.forEach((block, index) => {
    if (block.kind !== 'example') return;
    for (const locale of missingLocales(block.translations, config)) {
      add([...path, 'blocks', index, 'translations'], `Example is missing a translation for locale "${locale}"`);
    }
  });

  const [minQuestions, maxQuestions] = config.questions;
  const choice = lesson.questions.filter((question) => question.kind === 'choice').length;
  const typed = lesson.questions.length - choice;
  if (lesson.questions.length < minQuestions || lesson.questions.length > maxQuestions) {
    add([...path, 'questions'], `Lesson needs ${minQuestions}-${maxQuestions} questions, found ${lesson.questions.length}`);
  }
  if (choice < config.minChoice) add([...path, 'questions'], `Lesson needs at least ${config.minChoice} choice questions, found ${choice}`);
  if (typed < config.minTyped) add([...path, 'questions'], `Lesson needs at least ${config.minTyped} typed questions, found ${typed}`);
  lesson.questions.forEach((question, index) => {
    const questionPath = [...path, 'questions', index];
    checkQuestionExplanations(question, questionPath, config, add);
    checkQuestionAnswers(question, questionPath, config, add);
  });
}

/**
 * Strict content-authoring gate, separate from the structural validator: lesson shape, answer keys,
 * vocabulary coverage and recycling, study days and tests. Never throws; problems come back as issues.
 */
export function checkCurriculum(pack: unknown, options: CurriculumOptions): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const add: AddIssue = (path, message) => { issues.push({ path, message }); };
  try {
    const callbacks: Callbacks = { failed: { normalize: false, compareAnswer: false, optionVocabIds: false, answerKey: false } };
    const config = readOptions(options, callbacks);
    if (Array.isArray(config)) return config;
    const read = readPack(pack);
    if ('issues' in read) return read.issues;
    const data = read.pack;

    const scoped = data.lessons.flatMap((lesson, index) =>
      config.scope === undefined || (lesson.stageId !== undefined && config.scope.has(lesson.stageId)) ? [index] : []);
    const schedule = buildSchedule(data);
    const checked = new Set<string>();
    for (const index of scoped) {
      const lesson = data.lessons[index]!;
      checkLesson(lesson, ['lessons', index], config, add);
      for (const question of lesson.questions) checked.add(question.id);
      if (!schedule.lessons.has(lesson.id)) add(['lessons', index], 'Lesson is not scheduled in any day');
    }
    checkVocabulary(data, scoped, schedule, config, add);
    checkDaysAndTests(data, config, checked, add);
    checkAuthoringRules(data, scoped, schedule, config, add);

    if (callbacks.failed.normalize) add(['options', 'normalize'], 'normalize threw or returned a non-string');
    if (callbacks.failed.compareAnswer) add(['options', 'compareAnswer'], 'compareAnswer threw or returned a malformed result');
    if (callbacks.failed.optionVocabIds) add(['options', 'optionVocabIds'], 'optionVocabIds threw or returned malformed ids');
    if (callbacks.failed.answerKey) add(['options', 'answerKey'], 'answerKey threw or returned a non-string');
    return issues;
  } catch {
    // Never inspect a thrown value: even its properties may be hostile getters.
    return issues.length ? issues : [{ path: [], message: 'Unable to check curriculum' }];
  }
}
