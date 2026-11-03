import { expect, it } from 'vitest';
import { ielts } from '../../src/levels/ielts.ts';

it('declares a certified band framework', () => {
  expect(ielts.code).toBe('ielts');
  expect(ielts.kind).toBe('band');
  expect(ielts.certification).toBe(true);
});

it('declares every half band as a distinct singleton interval, including zero', () => {
  expect(ielts.levels).toHaveLength(19);
  expect(ielts.levels.map((level) => level.code)).toEqual([
    '0.0', '0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5',
    '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0',
  ]);
  ielts.levels.forEach((level, i) => {
    expect(level).toEqual({ code: (i / 2).toFixed(1), order: i, minScore: i / 2, maxScore: i / 2 });
  });
});
