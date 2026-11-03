import type { AnswerResult } from '@solo/language-sdk';
import type { Question } from '@solo/content-schema';
import { extensionSchemas } from './content/extension-schemas.ts';
import { compareAnswer, normalize, normalizeText, withoutFinalPunctuation } from './text-tools.ts';

export type AnswerMode = 'sequence' | 'spelling' | 'phone' | 'case-sensitive';
const result = (correct: boolean): AnswerResult => ({ correct, score: correct ? 1 : 0 });

/** Canonicalize spoken digit names. Requiring words prevents copying a displayed phone number. */
export function phoneDigits(text: string): string | undefined {
  const names = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const tokens = withoutFinalPunctuation(normalize(text)).split(/[\s,./()\-–—]+/u).filter(Boolean);
  let digits = '';
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!;
    const count = token === 'double' ? 2 : token === 'triple' ? 3 : 1;
    const next = count === 1 ? token : tokens[++index];
    if (next === undefined) return undefined;
    const digit = next === 'oh' ? '0' : names.includes(next) ? String(names.indexOf(next)) : undefined;
    if (digit === undefined) return undefined;
    digits += digit.repeat(count);
  }
  return digits || undefined;
}

export function spellingLetters(value: string): string | undefined {
  const tokens = withoutFinalPunctuation(normalize(value)).split(/[\s,.\-–—]+/u);
  let expanded = '';
  for (let index = 0; index < tokens.length; index++) {
    const count = tokens[index] === 'double' ? 2 : 1;
    const token = tokens[count === 2 ? ++index : index];
    if (token === undefined || !/^[a-z]$/u.test(token)) return undefined;
    expanded += token.repeat(count);
  }
  return expanded || undefined;
}

/** Typed input is text; for choice questions input is the numeric option index. Invalid modes fail closed. */
export function gradeAnswer(input: unknown, question: Question): AnswerResult {
  if (question.kind === 'choice') return result(typeof input === 'number' && input === question.correctIndex);
  const mode = question.extensions?.['en:answer-mode'];
  if (mode === undefined) return compareAnswer(input, question.acceptedAnswers);
  if (!extensionSchemas['en:answer-mode'].safeParse(mode).success || typeof input !== 'string') return result(false);
  if (mode === 'case-sensitive') {
    const value = withoutFinalPunctuation(normalizeText(input, true));
    return result(value.length > 0 && question.acceptedAnswers.some((answer) =>
      withoutFinalPunctuation(normalizeText(answer, true)) === value));
  }
  if (mode === 'phone') {
    const value = phoneDigits(input);
    return result(value !== undefined && question.acceptedAnswers.some((answer) => phoneDigits(answer) === value));
  }
  if (mode === 'spelling') {
    const value = spellingLetters(input);
    return result(value !== undefined && question.acceptedAnswers.some((answer) => spellingLetters(answer) === value));
  }
  const sequence = (value: string): string => withoutFinalPunctuation(normalize(value)).split(/[\s,\/-]+/u).join(' ');
  const value = sequence(input);
  return result(value.length > 0 && question.acceptedAnswers.some((answer) => {
    const expected = sequence(answer);
    // Compact or chunked digits are unambiguous only for a sequence of single digits.
    return value === expected || (/^\d(?: \d)+$/u.test(expected) && /^\d+(?: \d+)*$/u.test(value) && value.replaceAll(' ', '') === expected.replaceAll(' ', ''));
  }));
}
