import { assemble } from '../unit-content.ts';
import f1 from './f1.ts';
import f2 from './f2.ts';
import a1u1 from './a1-u1.ts';
import a1u2 from './a1-u2.ts';
import a1u3 from './a1-u3.ts';
import a1u4 from './a1-u4.ts';

export const { units, lessons, quests, assessments, days, tests } = assemble([
  f1, f2, a1u1, a1u2, a1u3, a1u4,
]);

