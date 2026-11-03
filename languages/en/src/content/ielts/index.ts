import { assemble } from '../unit-content.ts';
import i1 from './i1.ts';
import i2 from './i2.ts';
import i3 from './i3.ts';
import i4 from './i4.ts';

export const { units, lessons, quests, assessments, days, tests } = assemble([
  i1, i2, i3, i4,
]);

