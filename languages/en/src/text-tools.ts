import type { AnswerResult, TextTools } from '@solo/language-sdk';

// Zero-width space/non-joiner/joiner, byte-order mark and soft hyphen carry no visible text.
const INVISIBLE = /[\u200b-\u200d\ufeff\u00ad]/gu;
// U+2019, U+2018, U+02BC, U+2032 and the grave accent all stand for an apostrophe.
const APOSTROPHES = /[\u2019\u2018\u02bc\u2032\u0060]/gu;
const DOUBLE_QUOTES = /[\u201c\u201d]/gu;
const WHITESPACE = /\s+/gu;

const INCORRECT: AnswerResult = { correct: false, score: 0 };

/**
 * NFKC, optionally preserve case, strip invisible characters, unify quotes, NFKC again (stripping and mapping can
 * expose new compositions, so the last step keeps the result a fixed point), collapse whitespace, trim.
 * Non-string input yields ''. Never throws.
 */
export const normalizeText = (text: unknown, caseSensitive = false): string => {
  if (typeof text !== 'string') return '';
  const composed = text.normalize('NFKC');
  return (caseSensitive ? composed : composed.toLowerCase())
    .replace(INVISIBLE, '')
    .replace(APOSTROPHES, "'")
    .replace(DOUBLE_QUOTES, '"')
    .normalize('NFKC')
    .replace(WHITESPACE, ' ')
    .trim();
};

/** SDK normalization is case-insensitive and idempotent; punctuation remains visible. */
export const normalize = (text: unknown): string => normalizeText(text);
/** Sentence-final punctuation is optional; internal punctuation remains significant. */
export const withoutFinalPunctuation = (text: string): string => text.replace(/[.!?\s]+$/u, '').trim();
/** Commas are optional in communication answers; apostrophes and word boundaries remain significant. */
const defaultSurface = (text: string): string => withoutFinalPunctuation(normalize(text))
  .replace(/,/gu, ' ').replace(WHITESPACE, ' ').trim();

/** Default match: optional commas/final . ! ?; empty/punctuation-only input never matches. Never throws. */
export const compareAnswer = (input: unknown, accepted: unknown): AnswerResult => {
  try {
    if (typeof input !== 'string' || !Array.isArray(accepted)) return INCORRECT;
    const value = defaultSurface(input);
    if (value.length === 0) return INCORRECT;
    const correct = accepted.some((answer: unknown) => typeof answer === 'string' && defaultSurface(answer) === value);
    return correct ? { correct: true, score: 1 } : INCORRECT;
  } catch {
    return INCORRECT;
  }
};

export const textTools: TextTools = { normalize, compareAnswer };
