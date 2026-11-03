import type { PackQuestion } from './pack-data.ts';
import type { ContentIssuePath, LocalizedText } from '../types.ts';

export type AddIssue = (path: ContentIssuePath, message: string) => void;

/** Options after validation, with module callbacks wrapped so that a throwing callback cannot abort a run. */
export interface CurriculumConfig {
  readonly testNovelty: boolean;
  readonly answerKey: ((question: PackQuestion) => string | undefined) | undefined;
  readonly taughtVocabulary: boolean;
  readonly forbiddenPhrases: readonly string[];
  readonly optionParity: boolean;
  readonly optionVocabIds: (question: Extract<PackQuestion, { kind: 'choice' }>, optionIndex: number) => readonly string[];
  readonly nativeLocales: readonly string[];
  readonly normalize: (text: string) => string;
  /** True when the module accepts `input` against `accepted`. */
  readonly accepts: (input: string, accepted: readonly string[]) => boolean;
  readonly examples: readonly [number, number];
  readonly questions: readonly [number, number];
  readonly minChoice: number;
  readonly minTyped: number;
  readonly recycleWindowDays: number;
  readonly minRecycles: number;
  readonly truncateAtScheduleEnd: boolean;
  readonly minQuestionsPerVocab: number;
  readonly scope: ReadonlySet<string> | undefined;
}

/** Language-neutral folding for instruction text, which the target-language module does not own. */
const foldNativeText = (text: string): string =>
  text.normalize('NFC').toLowerCase().replace(/[\p{P}\p{S}]+/gu, ' ').replace(/\s+/gu, ' ').trim();

/** Target-language strings go through the module's normalize; localized text is folded per locale. */
export function textVariants(text: LocalizedText | string, config: CurriculumConfig): string[] {
  return typeof text === 'string' ? [config.normalize(text)] : Object.values(text).map(foldNativeText);
}

export const sameText = (left: readonly string[], right: readonly string[]): boolean =>
  left.some((variant) => right.includes(variant));

export function missingLocales(text: LocalizedText | undefined, config: CurriculumConfig): string[] {
  return config.nativeLocales.filter((locale) => text === undefined || !Object.hasOwn(text, locale));
}

function checkChoice(question: PackQuestion & { kind: 'choice' }, path: ContentIssuePath, config: CurriculumConfig, add: AddIssue): void {
  const variants = question.options.map((option) => textVariants(option, config));
  const correct = variants[question.correctIndex] ?? [];
  variants.forEach((wrong, index) => {
    if (index === question.correctIndex) return;
    if (sameText(correct, wrong)) {
      add([...path, 'options', index], `Correct option is not distinct from wrong option ${index} after normalization`);
      return;
    }
    // Compare wrong options with each other once, in order.
    const earlier = variants.findIndex((other, otherIndex) => otherIndex < index && otherIndex !== question.correctIndex && sameText(other, wrong));
    if (earlier >= 0) add([...path, 'options', index], `Options are not distinct after normalization: option ${index} repeats option ${earlier}`);
  });
}

function checkTyped(question: PackQuestion & { kind: 'typed' }, path: ContentIssuePath, config: CurriculumConfig, add: AddIssue): void {
  question.acceptedAnswers.forEach((answer, index) => {
    if (!config.accepts(answer, question.acceptedAnswers)) {
      add([...path, 'acceptedAnswers', index], 'Accepted answer is rejected by compareAnswer');
    }
  });
}

/** Answer-key rules shared by lesson practice questions and test questions. */
export function checkQuestionAnswers(question: PackQuestion, path: ContentIssuePath, config: CurriculumConfig, add: AddIssue): void {
  if (question.kind === 'choice') checkChoice(question, path, config, add);
  else checkTyped(question, path, config, add);
}

export function checkQuestionExplanations(question: PackQuestion, path: ContentIssuePath, config: CurriculumConfig, add: AddIssue): void {
  if (question.explanations === undefined) { add([...path, 'explanations'], 'Question needs explanations'); return; }
  for (const locale of missingLocales(question.explanations, config)) {
    add([...path, 'explanations', locale], `Question explanation is missing locale "${locale}"`);
  }
}
