import { pinyinForms } from '../pinyin.ts';

export { pinyinForms };

/** Accepted hanzi forms: the stored simplified text; grading folds final punctuation and 。！？，. */
export const hanziForms = (...answers: string[]): string[] => [...new Set(answers)];

/** A tone digit answer: the digit itself (grading reads 5 as 0). */
export const toneForms = (...answers: string[]): string[] => [...new Set(answers)];
