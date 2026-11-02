import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStateProvider, createRegistry } from '../../src/index.ts';
import { makeModule } from '../fixtures/valid.ts';
import { setup, src, valid } from '../fixtures/registry.ts';

afterEach(() => { vi.useRealTimers(); });

describe('module snapshots and lazy receivers', () => {
  it('registers a frozen snapshot and never freezes or mutates the caller object', async () => {
    const mod = makeModule();
    const reg = setup();
    await reg.discover([src('plain', async () => mod)]);
    const snap = reg.get('qtv');
    expect(snap).toBeDefined();
    expect(snap).not.toBe(mod);
    expect(Object.isFrozen(snap)).toBe(true);
    expect(Object.isFrozen(snap?.manifest.names)).toBe(true);
    expect(Object.isFrozen(mod)).toBe(false);
    expect(Object.isFrozen(mod.manifest)).toBe(false);
    expect(Object.isFrozen(mod.textTools.normalize)).toBe(false);
    (mod.manifest as { nativeName: string }).nativeName = 'changed later';
    expect(reg.get('qtv')?.manifest.nativeName).toBe('Testish');
  });

  it('getter-flip module: code is captured once from the snapshot', async () => {
    const base = makeModule('qtv');
    let reads = 0;
    const flip = Object.defineProperty({ ...base }, 'manifest', {
      enumerable: true,
      get: () => (reads++ === 0 ? base.manifest : { ...base.manifest, code: 'qfl' }),
    });
    const reg = setup();
    const r = await reg.discover([src('flip', async () => flip), src('other', async () => makeModule('qfl'))]);
    expect(r).toEqual({ registered: ['qtv', 'qfl'], issues: [] });
    expect(reg.get('qtv')?.manifest.code).toBe('qtv');
    expect(reg.get('qfl')?.manifest.code).toBe('qfl');
  });

  it('inherited-prototype module is snapshotted into own properties', async () => {
    const reg = setup();
    const r = await reg.discover([src('inherited', async () => Object.create(makeModule('qin')) as unknown)]);
    expect(r).toEqual({ registered: ['qin'], issues: [] });
    const snap = reg.get('qin');
    expect(snap && Object.hasOwn(snap, 'manifest')).toBe(true);
    expect(snap && Object.getPrototypeOf(snap)).toBe(Object.prototype);
  });

  it('lazy loaders are called with the original receiver', async () => {
    const i18n = {
      vi(this: unknown) {
        return Promise.resolve({ sameReceiver: String(this === i18n) });
      },
    };
    const original: object = makeModule('qrc', {
      content(this: unknown) {
        return Promise.resolve(this === original);
      },
      i18n,
    });
    const reg = setup();
    await reg.discover([src('receiver', async () => original)]);
    expect(await reg.getContent('qrc')).toEqual({ ok: true, value: true });
    expect(await reg.getMessages('qrc', 'vi')).toEqual({ ok: true, value: { sameReceiver: 'true' } });
  });
});

describe('loadTimeoutMs validation', () => {
  it.each([0, -1, 1.5, 2 ** 31, Number.NaN, Number.POSITIVE_INFINITY])('throws RangeError for %s', (loadTimeoutMs) => {
    expect(() => createRegistry({ stateProvider: createMemoryStateProvider(), loadTimeoutMs })).toThrow(RangeError);
  });

  it.each([1, 2 ** 31 - 1])('accepts %s', (loadTimeoutMs) => {
    expect(() => createRegistry({ stateProvider: createMemoryStateProvider(), loadTimeoutMs })).not.toThrow();
  });
});

describe('disabled module content access', () => {
  it('content and messages remain available for disabled modules', async () => {
    const reg = createRegistry({ stateProvider: createMemoryStateProvider() });
    await reg.discover([valid]);
    expect(reg.isEnabled('qtv')).toBe(false);
    expect(await reg.getContent('qtv')).toEqual({ ok: true, value: { units: [] } });
    expect((await reg.getMessages('qtv', 'vi')).ok).toBe(true);
  });
});

describe('lazy content validation', () => {
  it('getContent resolving undefined -> LOAD_FAILED; no loader -> ok undefined', async () => {
    const reg = setup();
    const { content, ...noContent } = makeModule('qnc');
    await reg.discover([src('u', async () => makeModule('qun', { content: async () => undefined })), src('n', async () => noContent)]);
    expect(await reg.getContent('qun')).toMatchObject({ ok: false, issue: { code: 'LOAD_FAILED', message: expect.stringContaining('expected a defined value') } });
    expect(await reg.getContent('qnc')).toEqual({ ok: true, value: undefined });
    expect(content).toBeTypeOf('function');
  });

  it('lazy content/i18n failures return LOAD_FAILED results', async () => {
    const reg = setup();
    const broken = makeModule('qlz', {
      content: async () => {
        throw new Error('no content');
      },
      i18n: { vi: () => Promise.reject(new Error('no messages')) },
    });
    await reg.discover([src('lazy', async () => broken), valid]);
    await expect(reg.getContent('qlz')).resolves.toMatchObject({ ok: false, issue: { code: 'LOAD_FAILED', language: 'qlz' } });
    await expect(reg.getMessages('qlz', 'vi')).resolves.toMatchObject({ ok: false, issue: { code: 'LOAD_FAILED' } });
    await expect(reg.getContent('qtv')).resolves.toEqual({ ok: true, value: { units: [] } });
    await expect(reg.getMessages('qtv', 'vi')).resolves.toEqual({ ok: true, value: { hello: 'Xin chào' } });
    await expect(reg.getMessages('qtv', 'xx')).resolves.toEqual({ ok: true, value: undefined });
    await expect(reg.getContent('nope')).resolves.toMatchObject({ ok: false, issue: { code: 'NOT_REGISTERED' } });
  });
});
