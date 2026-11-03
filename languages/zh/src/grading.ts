import type { AnswerResult } from '@solo/language-sdk';
import type { Question } from '@solo/content-schema';
import { extensionSchemas } from './content/extension-schemas.ts';
import { pinyinBaseKey, pinyinKey } from './pinyin.ts';
import { compareAnswer, normalize } from './text-tools.ts';

/**
 * Per-question answer modes, stored in `extensions['zh:answer-mode']`.
 *
 * - `pinyin`: pinyin with tones in the CITATION (dictionary) form. Tone marks and tone numbers are the same
 *   answer; `ü`, `v`, `u:` are the same letter; spacing is optional; unmarked syllables are neutral tone.
 *   A sandhi-pronounced form is NOT an alternative answer here (guide C4).
 * - `pinyin-sandhi`: the prompt says "ghi thanh khi đọc"; the stored answer is the pronounced form
 *   (ní hǎo, bú shì). Same comparison as `pinyin`, so the citation form is not accepted for it.
 * - `pinyin-toneless`: letters only, tones are not the objective and the prompt says so.
 * - `hanzi`: simplified characters only; final punctuation and the full-width/half-width pairs fold.
 * - `tone-number`: one digit 0-4 (5 is read as 0, the neutral tone).
 */
export type AnswerMode = 'pinyin' | 'pinyin-sandhi' | 'pinyin-toneless' | 'hanzi' | 'tone-number';

const result = (correct: boolean): AnswerResult => ({ correct, score: correct ? 1 : 0 });
const INVISIBLE = /[\s​-‍﻿­]+/gu;

/** NFKC folds ！？，to ASCII; 。 and 、 are folded here. Final . ! ? and commas are optional. */
export function hanziKey(text: unknown): string | undefined {
  if (typeof text !== 'string') return undefined;
  const folded = text.normalize('NFKC').replace(/[。｡]/gu, '.').replace(/、/gu, ',')
    .replace(INVISIBLE, '').replace(/[.!?]+$/u, '').replace(/,/gu, '');
  return folded.length > 0 ? folded : undefined;
}

/** A single tone digit; 5 and 0 are the neutral tone. */
export function toneNumberKey(text: unknown): string | undefined {
  if (typeof text !== 'string') return undefined;
  const digit = text.normalize('NFKC').replace(INVISIBLE, '').replace(/[.]$/u, '');
  return /^[0-5]$/u.test(digit) ? (digit === '5' ? '0' : digit) : undefined;
}

/** Canonical key of one answer string under a mode; undefined when the text is not valid for the mode. */
export function answerKeyFor(mode: AnswerMode, text: unknown): string | undefined {
  if (mode === 'hanzi') return hanziKey(text);
  if (mode === 'tone-number') return toneNumberKey(text);
  if (mode === 'pinyin-toneless') return pinyinBaseKey(text);
  return pinyinKey(text);
}

/**
 * Typed input is text; for choice questions the input is the numeric option index. Unknown modes and
 * non-text typed input fail closed. A typed question without a mode uses the plain normalised comparison.
 */
export function gradeAnswer(input: unknown, question: Question): AnswerResult {
  if (question.kind === 'choice') return result(typeof input === 'number' && input === question.correctIndex);
  const mode = question.extensions?.['zh:answer-mode'];
  if (mode === undefined) return compareAnswer(input, question.acceptedAnswers);
  const parsed = extensionSchemas['zh:answer-mode'].safeParse(mode);
  if (!parsed.success || typeof input !== 'string') return result(false);
  const value = answerKeyFor(parsed.data, input);
  return result(value !== undefined && question.acceptedAnswers.some((answer) => answerKeyFor(parsed.data, answer) === value));
}

/** Choice answers have no mode; use the text itself, folded so punctuation cannot make a repeat look new. */
export function plainKey(text: string): string {
  return normalize(text.replace(/[\p{P}\p{S}]+/gu, ' ')).replace(/\s+/gu, ' ').trim();
}
