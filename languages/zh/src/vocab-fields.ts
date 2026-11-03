import type { VocabField } from '@solo/language-sdk';

export const vocabFields = [
  { id: 'pinyin', required: true }, { id: 'examplePinyin' },
] as const satisfies readonly VocabField[];
