import { describe, expect, it } from 'vitest';
import { validateLanguageModule } from '../../src/index.ts';
import type { LanguageModule } from '../../src/index.ts';
import { makeModule } from '../fixtures/valid.ts';

const paths = (m: LanguageModule) => validateLanguageModule(m).map((i) => i.path.join('.'));
const fw = (code: string, kind: 'ordinal' | 'band', levels: object[]) => ({ code, kind, certification: false, levels });
const withFrameworks = (levelFrameworks: object[], level = 'x') =>
  makeModule('qtv', { levelFrameworks, courses: [{ code: 'c', framework: 'a', levels: [level] }], placement: undefined });

describe('validateLanguageModule', () => {
  it('accepts a valid module', () => {
    expect(validateLanguageModule(makeModule())).toEqual([]);
  });

  it('flags duplicate framework and level codes', () => {
    const m = withFrameworks([fw('a', 'ordinal', [{ code: 'x', order: 1 }, { code: 'x', order: 2 }]), fw('a', 'ordinal', [{ code: 'y', order: 1 }])]);
    expect(paths(m)).toEqual(['levelFrameworks.1.code', 'levelFrameworks.0.levels.1.code']);
  });

  it('requires strictly increasing order', () => {
    expect(paths(withFrameworks([fw('a', 'ordinal', [{ code: 'x', order: 2 }, { code: 'y', order: 2 }])]))).toEqual(['levelFrameworks.0.levels.1.order']);
  });

  it('forbids scores on ordinal levels', () => {
    expect(paths(withFrameworks([fw('a', 'ordinal', [{ code: 'x', order: 1, minScore: 0 }])]))).toEqual(['levelFrameworks.0.levels.0']);
  });

  it('validates band ranges', () => {
    const levels = [
      { code: 'a', order: 1, minScore: 0, maxScore: 5 },
      { code: 'b', order: 2, minScore: 5, maxScore: 6 },
      { code: 'c', order: 3, minScore: 8, maxScore: 7 },
      { code: 'd', order: 4, minScore: 9 },
    ];
    expect(paths(withFrameworks([fw('a', 'band', levels)], 'a'))).toEqual([
      'levelFrameworks.0.levels.1.minScore',
      'levelFrameworks.0.levels.2',
      'levelFrameworks.0.levels.3',
    ]);
  });

  it('validates course references and level ordering', () => {
    const m = makeModule('qtv', {
      courses: [
        { code: 'a', framework: 'missing', levels: ['s1'] },
        { code: 'b', framework: 'steps', levels: ['s2', 's1', 'zz'] },
        { code: 'b', framework: 'steps', levels: ['s1'] },
      ],
      placement: undefined,
    });
    expect(paths(m)).toEqual(['courses.2.code', 'courses.0.framework', 'courses.1.levels.1', 'courses.1.levels.2']);
  });

  it('validates skills', () => {
    const m = makeModule('qtv', { skills: [{ id: 'reading' }, { id: 'reading' }, { id: 'tones' }, { id: 'qzz:tones' }, { id: 'qtv:tones' }] });
    expect(paths(m)).toEqual(['skills.1.id', 'skills.2.id', 'skills.3.id']);
  });

  it('validates placement references', () => {
    expect(paths(makeModule('qtv', { placement: { course: 'nope', levels: ['s1'] } }))).toEqual(['placement.course']);
    expect(paths(makeModule('qtv', { placement: { course: 'core', levels: ['s1', 's3'] } }))).toEqual(['placement.levels.1']);
  });
});
