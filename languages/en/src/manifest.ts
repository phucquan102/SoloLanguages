import type { LanguageManifest } from '@solo/language-sdk';

export const manifest = {
  code: 'en',
  bcp47: 'en',
  nativeName: 'English',
  glyph: 'EN',
  names: { vi: 'Tiếng Anh' },
  scripts: ['Latn'],
  direction: 'ltr',
  version: '0.1.0',
} satisfies LanguageManifest;
