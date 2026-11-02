import type { LanguageModule } from '../../src/index.ts';

/** Fresh, mutable, valid module for tests. */
export function makeModule(code = 'qtv', overrides: Partial<Record<keyof LanguageModule, unknown>> = {}): LanguageModule {
  const normalize = (s: string) => s.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');
  const mod = {
    sdk: '^0.1.0',
    manifest: {
      code,
      bcp47: code,
      nativeName: 'Testish',
      glyph: 'T',
      names: { vi: 'Tiếng Thử', en: 'Testish' },
      scripts: ['Latn'],
      direction: 'ltr',
      version: '1.0.0',
    },
    levelFrameworks: [
      { code: 'steps', kind: 'ordinal', certification: false, levels: [{ code: 's1', order: 1 }, { code: 's2', order: 2 }, { code: 's3', order: 3 }] },
      { code: 'band', kind: 'band', certification: true, levels: [{ code: 'b1', order: 1, minScore: 0, maxScore: 4.5 }, { code: 'b2', order: 2, minScore: 5, maxScore: 9 }] },
    ],
    courses: [{ code: 'core', framework: 'steps', levels: ['s1', 's2'] }],
    skills: [{ id: 'vocabulary' }, { id: 'reading' }, { id: `${code}:tones` }],
    textTools: {
      normalize,
      compareAnswer: (input: string, accepted: readonly string[]) => ({ correct: accepted.some((a) => normalize(a) === normalize(input)) }),
      tokenize: (s: string) => normalize(s).split(' ').filter(Boolean),
    },
    speech: { tags: [code], voiceFilter: (v: { lang: string }) => v.lang.startsWith(code) },
    placement: { course: 'core', levels: ['s1', 's2'] },
    content: async () => ({ units: [] }),
    i18n: { vi: async () => ({ hello: 'Xin chào' }) },
    ...overrides,
  };
  return mod as LanguageModule;
}

export default makeModule();
