import { expect, it } from 'vitest';
import { skills } from '../src/skills.ts';

it('declares the six core skills and the namespaced pronunciation skill', () => {
  expect(skills.map(({ id }) => id)).toEqual([
    'vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'en:pronunciation',
  ]);
});
