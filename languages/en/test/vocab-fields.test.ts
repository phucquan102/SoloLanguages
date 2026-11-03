import { expect, it } from 'vitest';
import { vocabFields } from '../src/vocab-fields.ts';

it('requires an IPA transcription and declares no other vocabulary field', () => {
  expect(vocabFields).toEqual([{ id: 'ipa', required: true }]);
});
