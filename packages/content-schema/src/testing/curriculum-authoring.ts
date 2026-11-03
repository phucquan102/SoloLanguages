import type { ContentIssuePath } from '../types.ts';
import type { PackData, PackQuestion } from './pack-data.ts';
import type { AddIssue, CurriculumConfig } from './curriculum-questions.ts';
import { sameText, textVariants } from './curriculum-questions.ts';
import { locateQuestions } from './curriculum-tests.ts';
import type { Schedule, Slot } from './curriculum-schedule.ts';

const fold = (text: string): string => text.normalize('NFKC').toLowerCase().replace(/\s+/gu, ' ').trim();
// Separator and sentence punctuation differences cannot make an answer novel.
const surface = (text: string, config: CurriculumConfig): string =>
  config.normalize(text.replace(/[\p{P}\p{S}]+/gu, ' ')).replace(/\s+/gu, ' ').trim();

function answers(question: PackQuestion): string[] {
  if (question.kind === 'typed') return question.acceptedAnswers;
  const option = question.options[question.correctIndex]!;
  return typeof option === 'string' ? [option] : Object.values(option);
}

function repeats(test: PackQuestion, practice: PackQuestion, config: CurriculumConfig): boolean {
  if (sameText(textVariants(test.prompt, config), textVariants(practice.prompt, config))) return true;
  const left = answers(test);
  const right = answers(practice);
  if (config.answerKey) {
    const key = (question: PackQuestion, answer: string) => config.answerKey!(question.kind === 'typed'
      ? { ...question, acceptedAnswers: [answer] }
      : { ...question, options: question.options.map((option, index) => index === question.correctIndex ? answer : option) });
    return left.some((answer) => {
      const value = key(test, answer);
      return value !== undefined && right.some((other) => value === key(practice, other));
    });
  }
  return left.some((answer) => right.some((other) => surface(answer, config) === surface(other, config)
    || config.accepts(answer, [other]) || config.accepts(other, [answer])));
}

/** Compare each locale with that locale, rather than using the combined length of translations. */
function checkParity(question: PackQuestion, path: ContentIssuePath, add: AddIssue): void {
  if (question.kind !== 'choice') return;
  const key = question.options[question.correctIndex]!;
  const locales = typeof key === 'string' ? [undefined] : Object.keys(key);
  for (const locale of locales) {
    const texts = question.options.map((option) => typeof option === 'string'
      ? option : locale === undefined ? undefined : option[locale]);
    if (texts.some((text) => text === undefined)) continue;
    const correct = texts[question.correctIndex]!;
    const others = texts.filter((_text, index) => index !== question.correctIndex) as string[];
    const parenthesised = (text: string) => /\([^)]*\)/u.test(text.normalize('NFKC'));
    if (parenthesised(correct) && others.every((text) => !parenthesised(text))) {
      add([...path, 'options', question.correctIndex], 'Option parity: only the correct option has a parenthesised segment');
    }
    const length = (text: string) => [...text.normalize('NFKC').trim()].length;
    if (others.every((text) => length(correct) > 2 * length(text))) {
      add([...path, 'options', question.correctIndex], 'Option parity: correct option is more than twice as long as every distractor');
    }
  }
}

/** Scan text values, including module extension instructions, but never author/reviewer metadata. */
function checkPhrases(
  value: unknown, path: ContentIssuePath, phrases: readonly string[], add: AddIssue, seen: Set<string>,
): void {
  if (typeof value === 'string') {
    for (const phrase of phrases) if (fold(value).includes(fold(phrase))) {
      const key = JSON.stringify([path, phrase]);
      if (!seen.has(key)) {
        seen.add(key);
        add(path, `Learner-facing text contains forbidden phrase "${phrase}"`);
      }
    }
  } else if (Array.isArray(value)) {
    value.forEach((child, index) => checkPhrases(child, [...path, index], phrases, add, seen));
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (['provenance', 'review', 'kind', 'vocabIds', 'reviewVocabIds', 'skill',
        'stageId', 'unitId', 'lessonIds', 'mainQuestIds', 'sideQuestIds', 'testId',
        'questionIds', 'group', 'category'].includes(key)) continue;
      // `id` is also a valid locale tag, so skip it only on content records.
      if (key === 'id' && Object.hasOwn(value, 'provenance')) continue;
      checkPhrases(child, [...path, key], phrases, add, seen);
    }
  }
}

/** Opt-in authoring rules; all language-specific metadata/tokenization belongs to the caller. */
export function checkAuthoringRules(
  data: PackData, scoped: readonly number[], schedule: Schedule, config: CurriculumConfig, add: AddIssue,
): void {
  if (!config.testNovelty && !config.taughtVocabulary && !config.optionParity && !config.forbiddenPhrases.length) return;
  const introductions = new Map<string, Slot[]>();
  for (const lesson of data.lessons) {
    const slot = schedule.lessons.get(lesson.id);
    if (slot) for (const id of lesson.vocabIds ?? []) {
      introductions.set(id, [...introductions.get(id) ?? [], slot]);
    }
  }
  const parityChecked = new Set<string>();
  const checkOptionParity = (question: PackQuestion, path: ContentIssuePath) => {
    if (config.optionParity && !parityChecked.has(question.id)) {
      parityChecked.add(question.id);
      checkParity(question, path, add);
    }
  };
  const checkQuestion = (question: PackQuestion, path: ContentIssuePath, slot: Slot | undefined) => {
    checkOptionParity(question, path);
    if (!config.taughtVocabulary) return;
    const checkIds = (ids: readonly string[], idPath: ContentIssuePath) => {
      ids.forEach((id, index) => {
        if (!slot || !(introductions.get(id) ?? []).some((intro) =>
          intro.course === slot.course && intro.ordinal <= slot.ordinal)) {
          add([...idPath, index], `Vocabulary "${id}" is not introduced on or before the question's day`);
        }
      });
    };
    checkIds(question.vocabIds ?? [], [...path, 'vocabIds']);
    if (question.kind === 'choice') question.options.forEach((_option, index) => {
      checkIds(config.optionVocabIds(question, index), [...path, 'options', index, 'vocabIds']);
    });
  };
  const inScope = (stageId: string | undefined) => config.scope === undefined
    || (stageId !== undefined && config.scope.has(stageId));
  const phrasesSeen = new Set<string>();
  const scan = (value: unknown, path: ContentIssuePath) => {
    if (config.forbiddenPhrases.length) checkPhrases(value, path, config.forbiddenPhrases, add, phrasesSeen);
  };
  for (const index of scoped) {
    const lesson = data.lessons[index]!;
    scan(lesson, ['lessons', index]);
    lesson.questions.forEach((question, position) =>
      checkQuestion(question, ['lessons', index, 'questions', position], schedule.lessons.get(lesson.id)));
  }
  const located = locateQuestions(data);
  (data.tests ?? []).forEach((test, index) => {
    const days = (data.days ?? []).filter((day) => day.testId === test.id && inScope(day.stageId));
    if (config.scope !== undefined && !days.length) return;
    const units = new Set(days.map((day) => day.unitId));
    const practice = data.lessons.filter((lesson) => lesson.unitId !== undefined && units.has(lesson.unitId))
      .flatMap((lesson) => lesson.questions);
    test.questionIds.forEach((id, position) => {
      const found = located.get(id);
      if (!found) return;
      scan(found.question, found.path);
      checkQuestion(found.question, found.path, schedule.tests.get(test.id));
      if (config.testNovelty && practice.some((question) => repeats(found.question, question, config))) {
        add(['tests', index, 'questionIds', position], 'Test novelty: prompt or accepted answer repeats practice in the same unit');
      }
    });
  });
  for (const collection of ['stages', 'units', 'quests', 'vocab', 'days'] as const) {
    (data[collection] ?? []).forEach((record, index) => {
      const stageId = collection === 'stages' ? record.id : 'stageId' in record ? record.stageId : undefined;
      if (inScope(stageId)) scan(record, [collection, index]);
    });
  }
  // Unscoped calls also cover standalone placement/assessment records and pack-level datasets.
  if (config.scope === undefined) {
    for (const { question, path } of located.values()) checkOptionParity(question, path);
    scan(data.placement, ['placement']);
    scan(data.assessments, ['assessments']);
    scan(data.extensions, ['extensions']);
  }
}
