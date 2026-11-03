import { defineLanguage } from '@solo/language-sdk';
import { manifest } from './manifest.ts';
import { hsk } from './levels/hsk.ts';
import { courses } from './courses/index.ts';
import { skills } from './skills.ts';
import { vocabFields } from './vocab-fields.ts';
import { textTools } from './text-tools.ts';
import { speech } from './speech.ts';
import { placement } from './placement.ts';

export { gradeAnswer } from './grading.ts';
export type { AnswerMode } from './grading.ts';

export default defineLanguage({
  sdk: '^0.1.0', manifest, levelFrameworks: [hsk], courses, skills,
  vocabFields, textTools, speech, placement,
  content: () => import('./content/index.ts').then((m) => m.default),
  i18n: { vi: () => import('./i18n/vi.ts').then((m) => m.default) },
});
