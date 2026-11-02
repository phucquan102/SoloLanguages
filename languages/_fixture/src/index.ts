import { defineLanguage, defineLevelFramework } from '@solo/language-sdk';
import type { AnswerResult } from '@solo/language-sdk';

/** Test-only module using ISO 639 private-use code `qaa`. Never shipped (`_`-prefixed folder). */
const normalize = (text: string): string => text.normalize('NFKC').toLowerCase().replace(/[\s\u200b]+/gu, ' ').trim();

const steps = defineLevelFramework({
  code: 'fx-steps',
  kind: 'ordinal',
  certification: false,
  levels: [
    { code: 'step-1', order: 1 },
    { code: 'step-2', order: 2 },
    { code: 'step-3', order: 3 },
  ],
});

const band = defineLevelFramework({
  code: 'fx-band',
  kind: 'band',
  certification: true,
  levels: [
    { code: 'band-low', order: 1, minScore: 0, maxScore: 4.5 },
    { code: 'band-mid', order: 2, minScore: 5, maxScore: 6.5 },
    { code: 'band-high', order: 3, minScore: 7, maxScore: 9 },
  ],
});

export default defineLanguage({
  sdk: '^0.1.0',
  manifest: {
    code: 'qaa',
    bcp47: 'qaa',
    nativeName: 'Fixture',
    glyph: 'Q',
    names: { vi: 'Ngôn ngữ mẫu', en: 'Fixture language' },
    scripts: ['Latn'],
    direction: 'ltr',
    version: '0.1.0',
  },
  levelFrameworks: [steps, band],
  courses: [
    { code: 'basic', framework: 'fx-steps', levels: ['step-1', 'step-2', 'step-3'] },
    { code: 'exam', framework: 'fx-band', levels: ['band-mid', 'band-high'] },
  ],
  skills: [{ id: 'vocabulary' }, { id: 'reading' }, { id: 'listening' }, { id: 'qaa:spelling' }],
  textTools: {
    normalize,
    compareAnswer(input: string, accepted: readonly string[]): AnswerResult {
      const value = normalize(input);
      const correct = value.length > 0 && accepted.some((a) => normalize(a) === value);
      return { correct, score: correct ? 1 : 0 };
    },
    tokenize: (text: string) => normalize(text).split(' ').filter(Boolean),
  },
  speech: { tags: ['qaa'], voiceFilter: (voice) => voice.lang.toLowerCase().startsWith('qaa') },
  placement: { course: 'basic', levels: ['step-1', 'step-2'] },
  content: () => import('./content.ts').then((m) => m.default),
  i18n: { vi: () => import('./i18n/vi.ts').then((m) => m.default) },
});
