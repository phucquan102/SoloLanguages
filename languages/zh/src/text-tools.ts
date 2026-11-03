import type { AnswerResult, TextTools } from '@solo/language-sdk';

// ECMAScript whitespace plus zero-width characters and the soft hyphen, which are invisible in answers.
const IGNORED = /[\s­​-‍﻿]+/gu;
const CURLY_APOSTROPHES = /[‘’]/gu;

/**
 * NFKC, lowercase, drop whitespace and zero-width characters, map curly to ASCII apostrophes, then NFKC again.
 * The final pass recomposes sequences that removal brought together, so the result is idempotent.
 * Tone marks and tone numbers stay distinct. Non-string input yields ''.
 */
export const normalize = (text: unknown): string => {
  if (typeof text !== 'string') return '';
  return text.normalize('NFKC').toLowerCase().replace(IGNORED, '').replace(CURLY_APOSTROPHES, "'").normalize('NFKC');
};

/** Never throws: non-string input, normalized-empty input, or a malformed accepted list is incorrect. */
export const compareAnswer = (input: unknown, accepted: unknown): AnswerResult => {
  try {
    const value = normalize(input);
    const correct = value.length > 0 && Array.isArray(accepted) && accepted.some((answer) => normalize(answer) === value);
    return { correct, score: correct ? 1 : 0 };
  } catch {
    return { correct: false, score: 0 };
  }
};

export const textTools = { normalize, compareAnswer } satisfies TextTools;
