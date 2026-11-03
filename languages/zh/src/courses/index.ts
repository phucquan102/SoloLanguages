import type { Course } from '@solo/language-sdk';
import { hsk } from '../levels/hsk.ts';

// Levels come from the framework definition, in ascending order, so the two cannot drift apart.
export const courses = [{
  code: 'hsk',
  framework: hsk.code,
  levels: [...hsk.levels].sort((a, b) => a.order - b.order).map((level) => level.code),
}] as const satisfies readonly Course[];
