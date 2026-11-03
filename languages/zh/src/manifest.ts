import type { LanguageManifest } from '@solo/language-sdk';

export const manifest = {
  code: 'zh',
  bcp47: 'zh-Hans',
  nativeName: '中文',
  glyph: '中',
  names: { vi: 'Tiếng Trung' },
  scripts: ['Hani', 'Latn'],
  direction: 'ltr',
  version: '0.1.0',
} as const satisfies LanguageManifest;
