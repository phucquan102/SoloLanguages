import { defineLevelFramework } from '@solo/language-sdk';

export const hsk = defineLevelFramework({
  code: 'hsk-3.0',
  kind: 'ordinal',
  certification: true,
  levels: [
    { code: 'HSK1', order: 1 },
    { code: 'HSK2', order: 2 },
    { code: 'HSK3', order: 3 },
    { code: 'HSK4', order: 4 },
    { code: 'HSK5', order: 5 },
    { code: 'HSK6', order: 6 },
    { code: 'HSK7-9', order: 7 },
  ],
});
