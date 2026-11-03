import type { Placement } from '@solo/language-sdk';

export const placement = {
  course: 'hsk', levels: ['HSK1', 'HSK2', 'HSK4', 'HSK5'],
} as const satisfies Placement;
