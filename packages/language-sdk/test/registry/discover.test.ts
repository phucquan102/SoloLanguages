import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRegistry, discoverFromRecord } from '../../src/index.ts';
import * as hangs from '../fixtures/loader-hangs.ts';
import * as throws from '../fixtures/loader-throws.ts';
import { makeModule } from '../fixtures/valid.ts';
import { setup, src, thrower, valid } from '../fixtures/registry.ts';
import { deferred } from '../fixtures/deferred.ts';

afterEach(() => { vi.useRealTimers(); });

describe('registry discovery', () => {
  it('registers a valid module (default export unwrapped)', async () => {
    const reg = setup();
    expect(await reg.discover([valid])).toEqual({ registered: ['qtv'], issues: [] });
    expect(reg.get('qtv')?.manifest.nativeName).toBe('Testish');
    expect(Object.isFrozen(reg.get('qtv'))).toBe(true);
  });

  it('LOAD_FAILED when loader rejects or throws synchronously, others continue', async () => {
    const reg = setup();
    const sync = src('sync-throw', () => {
      throw new Error('sync boom');
    });
    const r = await reg.discover([src('loader-throws', throws.load), sync, valid]);
    expect(r.registered).toEqual(['qtv']);
    expect(r.issues.map((i) => [i.code, i.sourceId, i.message])).toEqual([
      ['LOAD_FAILED', 'loader-throws', 'boom'],
      ['LOAD_FAILED', 'sync-throw', 'sync boom'],
    ]);
  });

  it('LOAD_FAILED on timeout', async () => {
    vi.useFakeTimers();
    const reg = setup({ loadTimeoutMs: 500 });
    const pending = reg.discover([src('loader-hangs', hangs.load), valid]);
    await vi.advanceTimersByTimeAsync(500);
    const r = await pending;
    expect(r.registered).toEqual(['qtv']);
    expect(r.issues).toMatchObject([{ code: 'LOAD_FAILED', sourceId: 'loader-hangs', message: 'Timed out after 500ms' }]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('leaves no timers behind after successful loads and lazy loads', async () => {
    vi.useFakeTimers();
    const reg = setup();
    await reg.discover([valid]);
    await reg.getContent('qtv');
    await reg.getMessages('qtv', 'vi');
    await reg.enable('qtv');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('SCHEMA_INVALID with paths, not registered', async () => {
    const r = await setup().discover([src('schema-invalid', () => import('../fixtures/schema-invalid.ts')), valid]);
    expect(r.registered).toEqual(['qtv']);
    expect(r.issues.every((i) => i.code === 'SCHEMA_INVALID' && i.language === 'qsc')).toBe(true);
    expect(r.issues.map((i) => i.path?.join('.'))).toEqual(expect.arrayContaining(['manifest.scripts', 'textTools.normalize', 'textTools.compareAnswer']));
  });

  it('SCHEMA_INVALID for non-module values', async () => {
    const r = await setup().discover([src('null', async () => null)]);
    expect(r.issues).toMatchObject([{ code: 'SCHEMA_INVALID', sourceId: 'null' }]);
  });

  it('SDK_INCOMPATIBLE when range is not satisfied', async () => {
    const r = await setup().discover([src('sdk-incompatible', () => import('../fixtures/sdk-incompatible.ts'))]);
    expect(r).toMatchObject({ registered: [], issues: [{ code: 'SDK_INCOMPATIBLE', language: 'qsi' }] });
  });

  it('SDK_INCOMPATIBLE on major mismatch even for newer runtime', async () => {
    const r = await setup({ sdkVersion: '1.0.0' }).discover([valid]);
    expect(r).toMatchObject({ registered: [], issues: [{ code: 'SDK_INCOMPATIBLE' }] });
  });

  it('SEMANTIC_INVALID on cross-reference errors', async () => {
    const r = await setup().discover([src('semantic-invalid', () => import('../fixtures/semantic-invalid.ts'))]);
    expect(r).toMatchObject({ registered: [], issues: [{ code: 'SEMANTIC_INVALID', language: 'qse', path: ['courses', 0, 'framework'] }] });
  });

  it('DUPLICATE_CODE: sorted by id, first wins, issue names winner', async () => {
    const reg = setup();
    const r = await reg.discover([src('b-duplicate', () => import('../fixtures/duplicate.ts')), src('a-valid', valid.load)]);
    expect(r.registered).toEqual(['qtv']);
    expect(r.issues).toMatchObject([{ code: 'DUPLICATE_CODE', sourceId: 'b-duplicate', language: 'qtv' }]);
    expect(r.issues[0]?.message).toContain('"a-valid"');
    expect(reg.get('qtv')?.manifest.nativeName).toBe('Testish');
  });
});

describe('discoverFromRecord', () => {
  it('skips _-prefixed folders unless opted in, sorts by id', () => {
    const load = async () => ({});
    const record = { '../languages/zh/index.ts': load, '../languages/_template/index.ts': load, '../languages/en/index.ts': load };
    expect(discoverFromRecord(record).map((s) => s.id)).toEqual(['../languages/en/index.ts', '../languages/zh/index.ts']);
    expect(discoverFromRecord(record, { includeUnderscored: true })).toHaveLength(3);
  });
});

describe('discovery source isolation', () => {
  it.each([null, undefined, 42, {}])('non-iterable sources %j -> issue, resolves', async (sources) => {
    const r = await setup().discover(sources as never);
    expect(r.registered).toEqual([]);
    expect(r.issues).toMatchObject([{ code: 'LOAD_FAILED', message: expect.stringContaining('not iterable') }]);
  });

  it('null entries, throwing id getters, bad ids and loaders -> issues, others continue', async () => {
    const throwingId = Object.defineProperty({ load: valid.load }, 'id', { get: thrower('id') });
    const r = await setup().discover([null, throwingId, { id: 5, load: valid.load }, { id: 'x', load: 'no' }, valid] as never);
    expect(r.registered).toEqual(['qtv']);
    expect(r.issues.map((i) => [i.code, i.sourceId])).toEqual([
      ['LOAD_FAILED', '#0'],
      ['LOAD_FAILED', '#1'],
      ['LOAD_FAILED', '#2'],
      ['LOAD_FAILED', 'x'],
    ]);
  });

  it('an older overlapping discover() cannot overwrite a newer one', async () => {
    const reg = setup();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const older = reg.discover([
      src('slow', async () => {
        await gate;
        return makeModule('qol');
      }),
    ]);
    const newer = await reg.discover([src('fast', async () => makeModule('qnw'))]);
    release();
    const old = await older;
    expect(newer.registered).toEqual(['qnw']);
    expect(old).toEqual({ registered: [], issues: [], superseded: true });
    expect(newer.superseded).toBeUndefined();
    expect(reg.list().map((m) => m.manifest.code)).toEqual(['qnw']);
  });
});

describe('overlapping discovery', () => {
  it('superseded discovery cannot invalidate the newer pending state read', async () => {
    vi.useFakeTimers();
    try {
      const loader = deferred<unknown>();
      const state = deferred<{ qtv: { enabled: boolean } }>();
      const reading = deferred<void>();
      const getAll = vi.fn(() => {
        reading.resolve();
        return getAll.mock.calls.length === 1 ? state.promise : Promise.resolve({ qtv: { enabled: true } });
      });
      const registry = createRegistry({ stateProvider: { getAll, set: async () => {} } });
      const older = registry.discover([{ id: 'older', load: () => loader.promise }]);
      const newer = registry.discover([{ id: 'newer', load: async () => makeModule() }]);
      await reading.promise;
      loader.resolve(makeModule());
      const discarded = await older;
      state.resolve({ qtv: { enabled: true } });
      expect(await newer).toEqual({ registered: ['qtv'], issues: [] });
      expect(discarded).toEqual({ registered: [], issues: [], superseded: true });
      expect(registry.isEnabled('qtv')).toBe(true);
      expect(getAll).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
