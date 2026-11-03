import { expect, it } from 'vitest';
import { manifest } from '../src/manifest.ts';

it('declares the English manifest', () => {
  expect(manifest).toEqual({
    code: 'en', bcp47: 'en', nativeName: 'English', glyph: 'EN',
    names: { vi: 'Tiếng Anh' }, scripts: ['Latn'], direction: 'ltr', version: '0.1.0',
  });
});
