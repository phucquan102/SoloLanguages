import { describe, expect, it } from 'vitest';
import { isSemver, parseVersion, satisfies } from '../../src/index.ts';

describe('compat', () => {
  it('parses strict SemVer 2.0.0', () => {
    expect(parseVersion('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3, prerelease: [] });
    expect(parseVersion('1.2.3-beta.1+b5')).toEqual({ major: 1, minor: 2, patch: 3, prerelease: ['beta', 1] });
    expect(parseVersion('1.2.3-0a.x-y')).toEqual({ major: 1, minor: 2, patch: 3, prerelease: ['0a', 'x-y'] });
  });

  it.each(['01.2.3', '1.02.3', '1.2.03', '1.2', 'v1.2.3', '1.2.3-', '1.2.3-01', '1.2.3-a..b', '1.2.3+', '1.2.3+a..b', '1.2.3-a_b', ''])(
    'rejects %j',
    (v) => {
      expect(isSemver(v)).toBe(false);
    },
  );

  it.each([
    ['1.4.0', '^1.2.3', true],
    ['1.2.3', '^1.2.3', true],
    ['1.2.2', '^1.2.3', false],
    ['2.0.0', '^1.2.3', false],
    ['0.1.5', '^0.1.0', true],
    ['0.2.0', '^0.1.0', false],
    ['1.0.0', '^0.1.0', false],
    ['0.0.3', '^0.0.3', true],
    ['0.0.4', '^0.0.3', false],
    ['1.2.3', '1.2.3', true],
    ['1.2.3+build', '1.2.3', true],
    ['1.2.4', '1.2.3', false],
    ['1.2.3', '~1.2.3', false],
    ['x', '^1.0.0', false],
    // prerelease runtime versions
    ['0.2.0-beta.1', '^0.1.0', false],
    ['0.1.1-beta.1', '^0.1.0', false],
    ['1.3.0-rc.1', '^1.2.3', false],
    ['1.2.3-beta.2', '^1.2.3-beta.1', true],
    ['1.2.3-beta.1', '^1.2.3-beta.1', true],
    ['1.2.3-alpha', '^1.2.3-beta.1', false],
    ['1.2.4-beta.2', '^1.2.3-beta.1', false],
    ['1.2.3', '^1.2.3-beta.1', true],
    ['1.2.5', '^1.2.3-beta.1', true],
    ['1.2.3-beta.11', '^1.2.3-beta.2', true],
    ['1.2.3-beta', '^1.2.3-beta.1', false],
    ['1.2.3-1', '^1.2.3-alpha', false],
  ])('satisfies(%s, %s) = %s', (v, r, expected) => {
    expect(satisfies(v, r)).toBe(expected);
  });
});

describe('safe numeric version identifiers', () => {
  const unsafeVersions = ['9007199254740992.0.0', '1.9007199254740992.0', '1.0.9007199254740992', '1.0.0-9007199254740992'];

  it.each(unsafeVersions)('rejects unsafe numeric identifiers in %s', (version) => {
    expect(parseVersion(version)).toBeNull();
    expect(isSemver(version)).toBe(false);
    expect(satisfies(version, `^${version}`)).toBe(false);
  });

  it('rounded numeric identifiers cannot satisfy a distinct caret range', () => {
    expect(satisfies('1.9007199254740992.0', '^1.9007199254740993.0')).toBe(false);
  });

  it('accepts the safe integer boundary and preserves nonnumeric identifiers and metadata', () => {
    expect(isSemver('9007199254740991.9007199254740991.9007199254740991-9007199254740991')).toBe(true);
    expect(isSemver('1.0.0-item9007199254740992+9007199254740992')).toBe(true);
  });
});
