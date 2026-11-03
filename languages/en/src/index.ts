import { defineLanguage } from '@solo/language-sdk';
import { manifest } from './manifest.ts';
import { skills } from './skills.ts';
import { vocabFields } from './vocab-fields.ts';
import { placement } from './placement.ts';
import { cefr } from './levels/cefr.ts';
import { ielts } from './levels/ielts.ts';
import { courses } from './courses/index.ts';
import { textTools } from './text-tools.ts';
import { speech } from './speech.ts';

export { gradeAnswer } from './grading.ts';
export type { AnswerMode } from './grading.ts';

export default defineLanguage({
  sdk: '^0.1.0', manifest, skills, vocabFields, placement,
  levelFrameworks: [cefr, ielts], courses, textTools, speech,
  content: () => import('./content/index.ts').then((module) => module.default),
  i18n: { vi: () => import('./i18n/vi.ts').then((module) => module.default) },
});
