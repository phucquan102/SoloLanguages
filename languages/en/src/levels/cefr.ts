import { defineLevelFramework } from '@solo/language-sdk';

export const cefr = defineLevelFramework({
  code: 'cefr', kind: 'ordinal', certification: false,
  levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((code, index) => ({ code, order: index + 1 })),
});
