import { describe, expect, it } from 'vitest';
import language from '../../src/index.ts';
import { courses } from '../../src/courses/index.ts';

describe('Chinese courses', () => {
  it('has one HSK course on the HSK 3.0 framework covering all seven levels', () => {
    expect(courses).toEqual([{
      code: 'hsk',
      framework: 'hsk-3.0',
      levels: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6', 'HSK7-9'],
    }]);
    expect(language.courses).toEqual(courses);
  });

  it('lists the framework levels in ascending order', () => {
    const framework = language.levelFrameworks.find((item) => item.code === courses[0].framework)!;
    const order = new Map(framework.levels.map((level) => [level.code, level.order]));
    const orders = courses[0].levels.map((level) => order.get(level)!);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(new Set(courses[0].levels)).toEqual(new Set(framework.levels.map((level) => level.code)));
  });
});
