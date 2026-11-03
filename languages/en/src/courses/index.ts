import type { Course } from '@solo/language-sdk';
import { cefr } from '../levels/cefr.ts';
import { ielts } from '../levels/ielts.ts';

export const courses = [
  { code: 'general', framework: 'cefr', levels: cefr.levels.map(({ code }) => code) },
  { code: 'ielts', framework: 'ielts', levels: ielts.levels.map(({ code }) => code) },
] satisfies readonly Course[];
