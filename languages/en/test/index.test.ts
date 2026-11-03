import { expect, it } from 'vitest';
import language from '../src/index.ts';

it('assembles the module from its declarations', async () => {
  expect(language.sdk).toBe('^0.1.0');
  expect(language.levelFrameworks.map(({ code }) => code)).toEqual(['cefr', 'ielts']);
  expect(language.courses.map(({ code }) => code)).toEqual(['general', 'ielts']);
  expect(Object.keys(language.i18n!)).toEqual(['vi']);
  expect(typeof language.content).toBe('function');
});
