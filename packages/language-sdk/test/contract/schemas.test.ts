import { describe, expect, it } from 'vitest';
import { languageModuleSchema } from '../../src/index.ts';
import { makeModule } from '../fixtures/valid.ts';

const paths = (value: unknown) => {
  const r = languageModuleSchema.safeParse(value);
  return r.success ? [] : r.error.issues.map((i) => i.path.join('.'));
};

describe('languageModuleSchema', () => {
  it('accepts a valid module', () => {
    expect(paths(makeModule())).toEqual([]);
  });

  it('accepts a module without optional fields', () => {
    const { speech, placement, content, i18n, ...rest } = makeModule();
    expect(paths(rest)).toEqual([]);
  });

  it('rejects non-objects', () => {
    expect(languageModuleSchema.safeParse(null).success).toBe(false);
    expect(languageModuleSchema.safeParse('x').success).toBe(false);
  });

  it('reports issue paths', () => {
    const m = makeModule();
    const bad = { ...m, manifest: { ...m.manifest, code: 'EN1', scripts: ['latin'], direction: 'up' } };
    expect(paths(bad)).toEqual(expect.arrayContaining(['manifest.code', 'manifest.scripts.0', 'manifest.direction']));
  });

  it('requires functions in textTools', () => {
    expect(paths(makeModule('qtv', { textTools: { normalize: 'x', compareAnswer: () => ({ correct: true }) } }))).toEqual(['textTools.normalize']);
  });

  it('requires a caret sdk range and semver version', () => {
    expect(paths(makeModule('qtv', { sdk: '>=0.1.0' }))).toEqual(['sdk']);
    const m = makeModule();
    expect(paths({ ...m, manifest: { ...m.manifest, version: '1.0' } })).toEqual(['manifest.version']);
  });

  it('requires at least one framework and course', () => {
    expect(paths(makeModule('qtv', { levelFrameworks: [], courses: [] }))).toEqual(['levelFrameworks', 'courses']);
  });

  it('rejects unknown framework kind and non-integer order', () => {
    const fw = [{ code: 'x', kind: 'tier', certification: false, levels: [{ code: 'a', order: 1.5 }] }];
    expect(paths(makeModule('qtv', { levelFrameworks: fw }))).toEqual(['levelFrameworks.0.kind', 'levelFrameworks.0.levels.0.order']);
  });

  it('requires i18n loaders to be functions', () => {
    expect(paths(makeModule('qtv', { i18n: { vi: { hello: 'x' } } }))).toEqual(['i18n.vi']);
  });
});

describe('schema key safety and snapshots', () => {
  const withOwnKey = (key: string, value: unknown) => Object.defineProperty({}, key, { value, enumerable: true, configurable: true, writable: true });

  it('rejects __proto__ and non-canonical locale keys in i18n and names', () => {
    const loader = async () => ({});
    expect(paths(makeModule('qtv', { i18n: withOwnKey('__proto__', loader) }))).toContain('i18n.__proto__');
    expect(paths(makeModule('qtv', { i18n: { EN: loader } }))).toContain('i18n.EN');
    const m = makeModule();
    expect(paths({ ...m, manifest: { ...m.manifest, names: withOwnKey('__proto__', 'x') } })).toContain('manifest.names.__proto__');
  });

  it('rejects unsafe keys in features/tutor and non-JSON tutor values', () => {
    expect(paths(makeModule('qtv', { features: withOwnKey('__proto__', true) }))).toContain('features.__proto__');
    expect(paths(makeModule('qtv', { tutor: { persona: () => 'x' } }))).toContain('tutor.persona');
    expect(paths(makeModule('qtv', { tutor: { persona: { tone: 'calm', tags: ['a'] } } }))).toEqual([]);
  });

  it('uses strict SemVer for version and allows a prerelease sdk range', () => {
    const m = makeModule();
    expect(paths({ ...m, manifest: { ...m.manifest, version: '1.0.0-01' } })).toEqual(['manifest.version']);
    expect(paths(makeModule('qtv', { sdk: '^0.1.0-beta.1' }))).toEqual([]);
    expect(paths(makeModule('qtv', { sdk: '^0.01.0' }))).toEqual(['sdk']);
  });

  it('requires skill ids to be core or <code>:<id>', () => {
    expect(paths(makeModule('qtv', { skills: [{ id: 'tones' }] }))).toEqual(['skills.0.id']);
  });

  it('parses to an own plain snapshot (inherited props copied, unknown keys dropped, functions kept)', () => {
    const base = makeModule();
    const inherited = Object.assign(Object.create(base) as object, { extra: 1 });
    const r = languageModuleSchema.safeParse(inherited);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(Object.getPrototypeOf(r.data)).toBe(Object.prototype);
    expect(Object.hasOwn(r.data, 'manifest')).toBe(true);
    expect(r.data.manifest).not.toBe(base.manifest);
    expect(r.data.textTools.normalize).toBe(base.textTools.normalize);
    expect('extra' in r.data).toBe(false);
  });
});

describe('schema rejects unsafe numeric version identifiers', () => {
  const unsafeVersions = ['9007199254740992.0.0', '1.9007199254740992.0', '1.0.9007199254740992', '1.0.0-9007199254740992'];

  it.each(unsafeVersions)('schema rejects unsafe version and sdk identifiers in %s', (version) => {
    const mod = makeModule();
    expect(languageModuleSchema.safeParse({ ...mod, manifest: { ...mod.manifest, version } }).success).toBe(false);
    expect(languageModuleSchema.safeParse({ ...mod, sdk: `^${version}` }).success).toBe(false);
  });
});
