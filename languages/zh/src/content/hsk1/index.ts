import { assemble } from '../unit-content.ts';
import h1 from './h1.ts';
import h2 from './h2.ts';
import h3 from './h3.ts';
import h4 from './h4.ts';

export const { units, lessons, quests, assessments, days, tests } = assemble([
  h1, h2, h3, h4,
]);
