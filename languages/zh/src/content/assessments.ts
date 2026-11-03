import { assessments as foundation } from './foundation/index.ts';
import { assessments as hsk1 } from './hsk1/index.ts';

export const assessments = [...foundation, ...hsk1];
export default assessments;
