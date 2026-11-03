import { defineLevelFramework } from '@solo/language-sdk';

export const ielts = defineLevelFramework({
  code: 'ielts', kind: 'band', certification: true,
  levels: Array.from({ length: 19 }, (_, index) => ({
    code: (index / 2).toFixed(1), order: index, minScore: index / 2, maxScore: index / 2,
  })),
});
