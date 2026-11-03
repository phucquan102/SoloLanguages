import { assemble } from '../unit-content.ts';
import n1 from './n1.ts';
import side from './side.ts';

export const { units, lessons, quests, assessments, days, tests } = assemble([
  n1, side,
]);
