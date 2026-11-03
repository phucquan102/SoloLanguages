import { expect, it } from 'vitest';
import { placement } from '../src/placement.ts';

it('places learners into the general course at A1 to C1', () => {
  expect(placement).toEqual({ course: 'general', levels: ['A1', 'A2', 'B1', 'B2', 'C1'] });
});
