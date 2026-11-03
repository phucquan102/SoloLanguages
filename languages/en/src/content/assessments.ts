import { assessments as general } from './general/index.ts';
import { assessments as ielts } from './ielts/index.ts';

export const assessments = [...general, ...ielts];
