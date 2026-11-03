import { expect, it } from 'vitest';
import { courses } from '../../src/courses/index.ts';

it('maps the general course to every CEFR level and the IELTS course to every band', () => {
  expect(courses).toEqual([
    { code: 'general', framework: 'cefr', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
    {
      code: 'ielts', framework: 'ielts',
      levels: [
        '0.0', '0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5',
        '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0',
      ],
    },
  ]);
});
