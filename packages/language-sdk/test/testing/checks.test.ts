import { describe, expect, it, vi } from 'vitest';
import { defineLanguage } from '../../src/index.ts';
import { CONTRACT_CHECKS, checkLanguageModule } from '../../src/testing/index.ts';
import type { ContractOptions } from '../../src/testing/index.ts';
import { makeModule } from '../fixtures/valid.ts';

const opts: ContractOptions = {
  expectedCode: 'qtv',
  requiredLocales: ['vi'],
  supportedLocales: ['vi', 'en'],
  samples: { equivalent: [[' Hello ', 'hello']], nonEquivalent: [['hello', 'world']] },
  timeoutMs: 50,
};

const results = (mod: unknown, o: Partial<ContractOptions> = {}) => checkLanguageModule(mod, { ...opts, ...o });
const failed = async (mod: unknown, o: Partial<ContractOptions> = {}) => (await results(mod, o)).filter((r) => !r.ok).map((r) => r.id);
const messageOf = async (id: number, mod: unknown, o: Partial<ContractOptions> = {}) => (await results(mod, o)).find((r) => r.id === id)?.message ?? '';
const frozen = (overrides: Parameters<typeof makeModule>[1], code = 'qtv') => defineLanguage(makeModule(code, overrides));
const manifest = (patch: object) => ({ manifest: { ...makeModule().manifest, ...patch } });
const tools = (patch: object) => ({ textTools: { ...makeModule().textTools, ...patch } });

describe('checkLanguageModule', () => {
  it('exposes 20 checks', () => {
    expect(CONTRACT_CHECKS.map((c) => c.id)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it('passes a valid frozen module', async () => {
    expect(await failed(frozen({}))).toEqual([]);
  });

  describe('schema-covered checks (attributed when check 1 fails)', () => {
    it('unrelated checks are skipped', async () => {
      const r = await results(frozen(tools({ normalize: 'nope' })));
      expect(r.filter((x) => !x.ok).map((x) => x.id)).toEqual(CONTRACT_CHECKS.map((c) => c.id));
      expect(r.find((x) => x.id === 12)?.message).toContain('textTools.normalize');
      expect(r.find((x) => x.id === 2)?.message).toBe('skipped: schema invalid');
    });

    it.each([
      [2, { sdk: '>=0.1.0' }],
      [3, manifest({ code: 'QTV' })],
      [6, manifest({ direction: 'up' })],
      [6, manifest({ scripts: [] })],
      [7, manifest({ version: '1.0' })],
      [8, { levelFrameworks: [] }],
      [10, { courses: [] }],
      [11, { skills: [{ id: 'tones' }] }],
      [15, { speech: { tags: [] } }],
      [16, { placement: { course: '', levels: [] } }],
      [17, { content: 'not a loader' }],
    ] as const)('check %i fails with its schema message', async (id, overrides) => {
      const r = (await results(makeModule('qtv', overrides as never))).find((x) => x.id === id);
      expect(r?.ok).toBe(false);
      expect(r?.message).not.toBe('skipped: schema invalid');
    });
  });

  it('2/20: incompatible sdk', async () => {
    expect(await failed(frozen({}), { sdkVersion: '1.0.0' })).toEqual([2, 20]);
  });

  it('3: unexpected code', async () => {
    expect(await failed(frozen({}), { expectedCode: 'qzz' })).toEqual([3]);
  });

  it('4: non-canonical bcp47', async () => {
    expect(await failed(frozen(manifest({ bcp47: 'qtv-latn' })))).toEqual([4]);
  });

  it('5: missing required locale names', async () => {
    expect(await failed(frozen({}), { requiredLocales: ['vi', 'ja'] })).toEqual([5]);
  });

  it('8/9/10/11/16: semantic problems map to their checks', async () => {
    const levelFrameworks = [
      { code: 'steps', kind: 'ordinal', certification: false, levels: [{ code: 's1', order: 1 }, { code: 's2', order: 1, minScore: 1 }] },
    ];
    const mod = frozen({ levelFrameworks, courses: [{ code: 'core', framework: 'nope', levels: ['s1'] }], skills: [{ id: 'qzz:tones' }] });
    expect(await failed(mod)).toEqual([8, 9, 10, 11, 16, 20]);
  });

  it('12: non-idempotent, non-string or throwing normalize', async () => {
    expect(await messageOf(12, frozen(tools({ normalize: (s: string) => `${s}!` })))).toContain('not idempotent');
    expect(await messageOf(12, frozen(tools({ normalize: () => 1 })))).toContain('did not return a string');
    const throwing = (s: string) => {
      if (!s) throw new Error('empty');
      return s;
    };
    expect(await messageOf(12, frozen(tools({ normalize: throwing })))).toContain('threw: empty');
  });

  it('13: throwing on empty, bad score, bad shape', async () => {
    const compareAnswer = (input: string) => {
      if (!input) throw new Error('empty');
      return { correct: true, score: 2 };
    };
    const message = await messageOf(13, frozen(tools({ compareAnswer })));
    expect(message).toContain('threw: empty');
    expect(message).toContain('score must be within 0..1');
    expect(await messageOf(13, frozen(tools({ compareAnswer: () => ({ correct: 'yes' }) })))).toContain('must return { correct: boolean }');
  });

  it('13: always-correct compareAnswer fails', async () => {
    const message = await messageOf(13, frozen(tools({ compareAnswer: () => ({ correct: true }) })));
    expect(message).toContain('compareAnswer("hello", ["world"]) expected correct=false');
    expect(message).toContain('compareAnswer("", ["a"]) expected correct=false');
    expect(message).toContain('compareAnswer("a", []) expected correct=false');
  });

  it('13: never-correct compareAnswer fails', async () => {
    const message = await messageOf(13, frozen(tools({ compareAnswer: () => ({ correct: false }) })));
    expect(message).toContain('compareAnswer("a", ["a"]) expected correct=true');
    expect(message).toContain('compareAnswer(" Hello ", ["hello"]) expected correct=true');
  });

  it('samples that normalize to empty skip (s,[s]) and ("",[s]) and are noted in detail', async () => {
    const normalize = (s: string) => s.replace(/[^a-z]/gi, '').toLowerCase();
    const compareAnswer = (input: string, accepted: readonly string[]) => {
      const v = normalize(input);
      return { correct: v.length > 0 && accepted.some((a) => normalize(a) === v) };
    };
    const tokenize = (s: string) => (normalize(s) ? [normalize(s)] : []);
    const emoji = String.fromCodePoint(0x1f600);
    const r = (await results(frozen({ textTools: { normalize, compareAnswer, tokenize } }), { samples: { ...opts.samples, text: [emoji] } })).find(
      (x) => x.id === 13,
    );
    expect(r).toMatchObject({ ok: true });
    expect(r?.detail).toContain(JSON.stringify(emoji));
    expect(r?.detail).toContain("skipped (s, [s]) and ('', [s])");
  });

  it('13: samples.nonEquivalent is required at runtime too', async () => {
    const samples = { nonEquivalent: [] } as unknown as ContractOptions['samples'];
    expect(await messageOf(13, frozen({}), { samples })).toContain('samples.nonEquivalent must contain at least one pair');
  });

  it('14: empty tokens, non-determinism, throwing, non-array', async () => {
    expect(await failed(frozen(tools({ tokenize: (s: string) => s.split(' ') })))).toEqual([14]);
    let n = 0;
    expect(await messageOf(14, frozen(tools({ tokenize: () => [`t${n++}`] })))).toContain('not deterministic');
    expect(await messageOf(14, frozen(tools({ tokenize: () => { throw new Error('tok'); } })))).toContain('threw: tok');
    expect(await messageOf(14, frozen(tools({ tokenize: () => 'a b' })))).toContain('non-empty string tokens');
  });

  it('15: invalid speech tag, non-boolean or throwing voiceFilter', async () => {
    expect(await messageOf(15, frozen({ speech: { tags: ['not a tag!'], voiceFilter: () => 'yes' } }))).toMatch(
      /invalid speech tag.*voiceFilter must return a boolean/,
    );
    expect(await messageOf(15, frozen({ speech: { tags: ['qtv'], voiceFilter: () => { throw new Error('vf'); } } }))).toContain('voiceFilter threw: vf');
  });

  it('17: hanging content, rejecting or unsupported i18n', async () => {
    const mod = frozen({ content: () => new Promise(() => {}), i18n: { de: async () => ({}), vi: () => Promise.reject(new Error('x')) } });
    const message = await messageOf(17, mod);
    expect(message).toContain('content() failed: Timed out after 50ms');
    expect(message).toContain('i18n locale "de" is not supported');
    expect(message).toContain('i18n.vi() failed: x');
  });

  it('17: i18n loader resolving undefined / non-plain / non-string values fails', async () => {
    expect(await messageOf(17, frozen({ i18n: { vi: async () => undefined } }))).toContain('i18n.vi() must resolve to a plain object of strings');
    expect(await messageOf(17, frozen({ i18n: { vi: async () => ({ a: 1 }) } }))).toContain('plain object of strings');
    expect(await messageOf(17, frozen({ i18n: { vi: async () => new Map() } }))).toContain('plain object of strings');
    expect(await messageOf(17, frozen({ i18n: { vi: async () => null } }))).toContain('plain object of strings');
  });

  it('17: content() resolving undefined fails', async () => {
    expect(await messageOf(17, frozen({ content: async () => undefined }))).toContain('content() must resolve to a defined value');
  });

  it('18: non-JSON values', async () => {
    const courses = [{ code: 'core', framework: 'steps', levels: ['s1'], created: new Date(0) }];
    expect(await failed(frozen({ courses, placement: undefined }))).toEqual([18]);
  });

  it('19: unfrozen module; check 20 does not freeze or mutate the input', async () => {
    const mod = makeModule();
    const r = await results(mod);
    expect(r.filter((x) => !x.ok).map((x) => x.id)).toEqual([19]);
    expect(r.find((x) => x.id === 19)?.message).toContain('<root>');
    expect(Object.isFrozen(mod)).toBe(false);
    expect(Object.isFrozen(mod.manifest)).toBe(false);
    expect(Object.isFrozen(mod.textTools.normalize)).toBe(false);
  });

  it('never throws: throwing getter after schema pass yields failed results', async () => {
    const base = frozen({});
    let reads = 0;
    const tricky = Object.freeze(
      Object.defineProperty({ ...base }, 'manifest', {
        enumerable: true,
        get() {
          if (reads++ > 0) throw new Error('getter boom');
          return base.manifest;
        },
      }),
    );
    const r = await results(tricky);
    expect(r).toHaveLength(20);
    // Checks 2-17 use the snapshot; check 19 inspects descriptors without invoking the getter.
    expect(r.filter((x) => !x.ok).map((x) => x.id)).toEqual([18, 20]);
    expect(r.find((x) => x.id === 18)).toMatchObject({ ok: false, message: expect.stringContaining('getter boom') });
  });

  it('checks 2-17 see one consistent snapshot of a getter-flip module', async () => {
    const base = frozen({});
    const flipped = Object.freeze({ ...base.manifest, code: 'qzz', bcp47: 'QZZ-latn', names: Object.freeze({}) });
    let reads = 0;
    const flip = Object.freeze(
      Object.defineProperty({ ...base }, 'manifest', { enumerable: true, get: () => (reads++ === 0 ? base.manifest : flipped) }),
    );
    const r = await results(flip);
    // only registration (raw module, read again) observes the flipped code
    expect(r.filter((x) => !x.ok).map((x) => x.id)).toEqual([20]);
  });

  it('never throws: schema validation throwing (proxy) yields failed results', async () => {
    const hostile = new Proxy({}, { get: () => { throw new Error('trap'); }, has: () => { throw new Error('trap'); } });
    const r = await results(hostile);
    expect(r).toHaveLength(20);
    expect(r[0]).toMatchObject({ ok: false, message: expect.stringContaining('schema validation threw: trap') });
    expect(r.every((x) => !x.ok)).toBe(true);
  });
});

describe('contract descriptor validation and sample reporting', () => {
  const opts: ContractOptions = {
    expectedCode: 'qtv',
    requiredLocales: ['vi'],
    supportedLocales: ['vi'],
    samples: { nonEquivalent: [['first', 'second']] },
  };

  const invalidMessages = [
    ['non-enumerable non-string', () => Object.defineProperty({}, 'hidden', { value: 123 })],
    ['accessor', () => Object.defineProperty({}, 'visible', { enumerable: true, get: () => 'text' })],
    ['symbol key', () => ({ [Symbol('hidden')]: 'text' })],
  ] as const;

  it.each(invalidMessages)('contract check 17 rejects %s properties', async (_label, makeValue) => {
    const value = makeValue();
    const results = await checkLanguageModule(defineLanguage(makeModule('qtv', { i18n: { vi: async () => value } })), opts);
    expect(results.find((r) => r.id === 17)).toMatchObject({ ok: false, message: expect.stringContaining('plain object of strings') });
  });

  it.each(['hidden', Symbol('hidden')])('check 19 finds mutable children behind own key %s', async (key) => {
    const base = defineLanguage(makeModule());
    const mod = Object.freeze(Object.defineProperty({ ...base }, key, { value: { x: 1 } }));
    const results = await checkLanguageModule(mod, opts);
    expect(results.find((r) => r.id === 19)).toMatchObject({ ok: false, message: expect.stringContaining(String(key)) });
  });

  it('check 19 guards throwing properties and still finds mutable siblings', async () => {
    const base = defineLanguage(makeModule());
    const mod = Object.freeze(Object.defineProperties({ ...base }, {
      broken: { get() { throw new Error('property failed'); } },
      hidden: { value: { x: 1 } },
    }));
    const results = await checkLanguageModule(mod, opts);
    expect(results.find((r) => r.id === 19)).toMatchObject({ ok: false, message: expect.stringContaining('hidden') });
  });

  it('check 19 terminates on frozen cycles through hidden and symbol properties', async () => {
    const mod = { ...defineLanguage(makeModule()) };
    Object.defineProperty(mod, 'self', { value: mod });
    Object.defineProperty(mod, Symbol('self'), { value: mod });
    Object.freeze(mod);
    expect((await checkLanguageModule(mod, opts)).find((r) => r.id === 19)).toMatchObject({ ok: true });
  });

  it('check 13 lists each repeated normalize-to-empty sample once in detail', async () => {
    const normalize = (s: string) => s.replace(/[^a-z]/gi, '').toLowerCase();
    const compareAnswer = (s: string, accepted: readonly string[]) => ({ correct: !!normalize(s) && accepted.some((a) => normalize(a) === normalize(s)) });
    const mod = defineLanguage(makeModule('qtv', { textTools: { normalize, compareAnswer } }));
    const samples: ContractOptions['samples'] = { text: ['!!!', '!!!'], equivalent: [['first', 'first']], nonEquivalent: [['!!!', 'second']] };
    const result = (await checkLanguageModule(mod, { ...opts, samples })).find((r) => r.id === 13);
    expect(result).toMatchObject({ ok: true });
    expect(result?.detail?.split(JSON.stringify('!!!')).length).toBe(2);
  });
});

describe('frozen object descriptor inspection', () => {
  it('check 19 skips accessor values while defineLanguage reads and freezes them', async () => {
    const child = { mutable: true };
    const getter = vi.fn(() => child);
    const mod = Object.freeze(Object.defineProperty({ ...defineLanguage(makeModule()) }, 'hidden', { get: getter }));

    expect((await results(mod)).find((r) => r.id === 19)).toMatchObject({ ok: true });
    expect(getter).not.toHaveBeenCalled();
    expect(Object.isFrozen(child)).toBe(false);

    defineLanguage(mod);
    expect(getter).toHaveBeenCalledTimes(1);
    expect(Object.isFrozen(child)).toBe(true);
  });

  it.each(['hidden', Symbol('hidden')])('check 19 never invokes an accessor behind own key %s', async (key) => {
    const getter = vi.fn(() => { throw new Error('getter must not run'); });
    const mod = Object.freeze(Object.defineProperty({ ...defineLanguage(makeModule()) }, key, { get: getter }));

    expect((await results(mod)).find((r) => r.id === 19)).toMatchObject({ ok: true });
    expect(getter).not.toHaveBeenCalled();
  });

  it('check 19 does not evaluate getters returning mutable children', async () => {
    const getter = vi.fn(() => ({ mutable: true }));
    const mod = Object.freeze(Object.defineProperty({ ...defineLanguage(makeModule()) }, 'hidden', { get: getter }));

    expect((await results(mod)).find((r) => r.id === 19)).toMatchObject({ ok: true });
    expect(getter).not.toHaveBeenCalled();
  });

  it('check 19 skips mutable data and accessors inside frozen functions', async () => {
    const mod = makeModule();
    const getter = vi.fn(() => { throw new Error('function getter must not run'); });
    Object.defineProperties(mod.textTools.normalize, {
      hidden: { value: { mutable: true } },
      accessor: { get: getter },
    });
    const frozenMod = defineLanguage(mod);

    expect((await results(frozenMod)).find((r) => r.id === 19)).toMatchObject({ ok: true });
    expect(getter).not.toHaveBeenCalled();
  });
});
