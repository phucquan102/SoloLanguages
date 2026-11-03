import { expect, it } from 'vitest';
import { speech } from '../src/speech.ts';

it('accepts British and American speech tags without a voice filter', () => {
  expect(speech).toEqual({ tags: ['en-GB', 'en-US'] });
});
