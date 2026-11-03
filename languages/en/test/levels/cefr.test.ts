import { expect, it } from 'vitest';
import { cefr } from '../../src/levels/cefr.ts';

it('declares six ordinal CEFR levels without foundation, score fields or certification', () => {
  expect(cefr).toEqual({
    code: 'cefr', kind: 'ordinal', certification: false,
    levels: [
      { code: 'A1', order: 1 }, { code: 'A2', order: 2 }, { code: 'B1', order: 3 },
      { code: 'B2', order: 4 }, { code: 'C1', order: 5 }, { code: 'C2', order: 6 },
    ],
  });
});
