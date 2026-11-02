import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStateProvider, createRegistry } from '../../src/index.ts';
import type { LanguageStateProvider } from '../../src/index.ts';
import { makeModule } from '../fixtures/valid.ts';
import { src, thrower, valid } from '../fixtures/registry.ts';
import { deferred } from '../fixtures/deferred.ts';

afterEach(() => { vi.useRealTimers(); });

describe('registry state', () => {
  const two = [valid, src('other', async () => makeModule('qot'))];

  it('memory provider: registered is not enabled by default', async () => {
    const reg = createRegistry({ stateProvider: createMemoryStateProvider() });
    await reg.discover(two);
    expect(reg.list()).toEqual([]);
    expect(reg.list({ includeDisabled: true }).map((m) => m.manifest.code)).toEqual(['qot', 'qtv']);
    expect(reg.isEnabled('qtv')).toBe(false);
    expect(reg.get('qtv')).toBeUndefined();
    expect(reg.get('qtv', { includeDisabled: true })).toBeDefined();
  });

  it('enable/disable one module never affects another, and persists', async () => {
    const provider = createMemoryStateProvider({ qot: { enabled: true } });
    const reg = createRegistry({ stateProvider: provider });
    await reg.discover(two);
    expect(await reg.enable('qtv')).toEqual({ ok: true, value: undefined });
    expect(reg.list().map((m) => m.manifest.code)).toEqual(['qot', 'qtv']);
    await reg.disable('qot');
    expect(reg.isEnabled('qtv')).toBe(true);
    expect(reg.isEnabled('qot')).toBe(false);
    expect(await provider.getAll()).toEqual({ qtv: { enabled: true }, qot: { enabled: false } });
  });

  it('enable unknown code returns NOT_REGISTERED', async () => {
    const reg = createRegistry({ stateProvider: createMemoryStateProvider() });
    await reg.discover([valid]);
    expect(await reg.enable('zzz')).toMatchObject({ ok: false, issue: { code: 'NOT_REGISTERED', language: 'zzz' } });
    expect(await reg.disable('zzz')).toMatchObject({ ok: false, issue: { code: 'NOT_REGISTERED' } });
  });

  it('throwing provider fails closed with STATE_UNAVAILABLE', async () => {
    const provider: LanguageStateProvider = {
      defaultEnabled: true,
      getAll: () => Promise.reject(new Error('db down')),
      set: () => Promise.reject(new Error('db down')),
    };
    const reg = createRegistry({ stateProvider: provider });
    const r = await reg.discover(two);
    expect(r.registered).toEqual(['qot', 'qtv']);
    expect(r.issues).toMatchObject([{ code: 'STATE_UNAVAILABLE' }]);
    expect(reg.list()).toEqual([]);
    expect(reg.isEnabled('qtv')).toBe(false);
    expect(await reg.enable('qtv')).toMatchObject({ ok: false, issue: { code: 'STATE_UNAVAILABLE' } });
  });

  it('refresh re-reads state and recovers', async () => {
    let fail = true;
    const inner = createMemoryStateProvider({ qtv: { enabled: true } });
    const provider: LanguageStateProvider = { getAll: () => (fail ? Promise.reject(new Error('x')) : inner.getAll()), set: inner.set };
    const reg = createRegistry({ stateProvider: provider });
    await reg.discover([valid]);
    expect(reg.isEnabled('qtv')).toBe(false);
    fail = false;
    expect(await reg.refresh()).toEqual([]);
    expect(reg.isEnabled('qtv')).toBe(true);
  });
});

describe('state provider failures and recovery', () => {
  it('getAll() hang times out -> STATE_UNAVAILABLE, fail closed, no timer leak', async () => {
    vi.useFakeTimers();
    const reg = createRegistry({ loadTimeoutMs: 100, stateProvider: { defaultEnabled: true, getAll: () => new Promise(() => {}), set: async () => {} } });
    const pending = reg.discover([src('mod', async () => makeModule())]);
    await vi.advanceTimersByTimeAsync(100);
    const r = await pending;
    expect(r.issues).toMatchObject([{ code: 'STATE_UNAVAILABLE' }]);
    expect(reg.isEnabled('qtv')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('set() hang times out -> STATE_UNAVAILABLE', async () => {
    const reg = createRegistry({ loadTimeoutMs: 20, stateProvider: { getAll: async () => ({}), set: () => new Promise(() => {}) } });
    await reg.discover([valid]);
    expect(await reg.enable('qtv')).toMatchObject({ ok: false, issue: { code: 'STATE_UNAVAILABLE', message: expect.stringContaining('Timed out') } });
  });

  it.each([null, undefined, 'x', 42])('getAll() resolving %j -> STATE_UNAVAILABLE', async (value) => {
    const reg = createRegistry({ stateProvider: { defaultEnabled: true, getAll: async () => value as never, set: async () => {} } });
    const r = await reg.discover([valid]);
    expect(r.issues).toMatchObject([{ code: 'STATE_UNAVAILABLE' }]);
    expect(reg.list()).toEqual([]);
  });

  it('accepts only real booleans; invalid entries are disabled even when defaultEnabled', async () => {
    const all = { qtv: { enabled: 'true' }, qot: { enabled: 1 }, qaa: null, qab: { enabled: true } };
    const reg = createRegistry({ stateProvider: { defaultEnabled: true, getAll: async () => all as never, set: async () => {} } });
    const codes = ['qot', 'qaa', 'qab', 'qac'];
    const r = await reg.discover([valid, ...codes.map((c) => src(c, async () => makeModule(c)))]);
    expect(r.issues).toEqual([]);
    expect(reg.list().map((m) => m.manifest.code).sort()).toEqual(['qab', 'qac']);
  });

  it('throwing defaultEnabled getter -> false + STATE_UNAVAILABLE issue', async () => {
    const provider = Object.defineProperty(createMemoryStateProvider(), 'defaultEnabled', { get: thrower('getter') });
    const reg = createRegistry({ stateProvider: provider });
    const r = await reg.discover([valid]);
    expect(r.issues).toMatchObject([{ code: 'STATE_UNAVAILABLE', message: expect.stringContaining('defaultEnabled') }]);
    expect(reg.isEnabled('qtv')).toBe(false);
  });
});

describe('enable and disable reconciliation', () => {
  it('state unavailable + set() succeeding -> STATE_UNAVAILABLE, stays disabled', async () => {
    const set = vi.fn(async () => {});
    const reg = createRegistry({ stateProvider: { getAll: () => Promise.reject(new Error('down')), set } });
    await reg.discover([valid]);
    expect(await reg.enable('qtv')).toMatchObject({ ok: false, issue: { code: 'STATE_UNAVAILABLE', language: 'qtv' } });
    expect(set).toHaveBeenCalledWith('qtv', true);
    expect(reg.isEnabled('qtv')).toBe(false);
  });

  it('provider that does not persist -> STATE_UNAVAILABLE', async () => {
    const reg = createRegistry({ stateProvider: { getAll: async () => ({}), set: async () => {} } });
    await reg.discover([valid]);
    expect(await reg.enable('qtv')).toMatchObject({ ok: false, issue: { code: 'STATE_UNAVAILABLE', message: expect.stringContaining('did not reflect enable') } });
  });

  it('recovered provider -> enable succeeds and reconciles', async () => {
    let down = true;
    const inner = createMemoryStateProvider();
    const reg = createRegistry({ stateProvider: { getAll: () => (down ? Promise.reject(new Error('down')) : inner.getAll()), set: inner.set } });
    await reg.discover([valid]);
    down = false;
    expect(await reg.enable('qtv')).toEqual({ ok: true, value: undefined });
    expect(reg.isEnabled('qtv')).toBe(true);
  });
});

describe('overlapping state reads', () => {
  type State = Awaited<ReturnType<LanguageStateProvider['getAll']>>;

  function controlledProvider() {
    const inner = createMemoryStateProvider({ qtv: { enabled: false } });
    const queued: { started: ReturnType<typeof deferred<void>>; result: ReturnType<typeof deferred<State>> }[] = [];
    const provider: LanguageStateProvider = {
      set: inner.set,
      getAll() {
        const read = queued.shift();
        if (!read) return inner.getAll();
        read.started.resolve();
        return read.result.promise;
      },
    };
    const queueRead = () => {
      const read = { started: deferred<void>(), result: deferred<State>() };
      queued.push(read);
      return read;
    };
    return { provider, queueRead, snapshot: inner.getAll };
  }

  it.each(['enable', 'disable'] as const)('%s uses a newer successful refresh after its own read fails late', async (action) => {
    const { provider, queueRead } = controlledProvider();
    const registry = createRegistry({ stateProvider: provider });
    await registry.discover([valid]);
    const ownRead = queueRead();
    const changing = registry[action]('qtv');
    await ownRead.started.promise;
    const newerRead = queueRead();
    const refreshing = registry.refresh();
    await newerRead.started.promise;
    newerRead.result.resolve({ qtv: { enabled: action === 'enable' } });
    expect(await refreshing).toEqual([]);

    ownRead.result.reject(new Error('stale failure'));
    expect(await changing).toEqual({ ok: true, value: undefined });
    expect(registry.isEnabled('qtv')).toBe(action === 'enable');
  });

  it.each(['enable', 'disable'] as const)('%s reports a newer refresh failure after its own read succeeds late', async (action) => {
    const { provider, queueRead } = controlledProvider();
    const registry = createRegistry({ stateProvider: provider });
    await registry.discover([valid]);
    const ownRead = queueRead();
    const changing = registry[action]('qtv');
    await ownRead.started.promise;
    const newerRead = queueRead();
    const refreshing = registry.refresh();
    await newerRead.started.promise;
    newerRead.result.reject(new Error('current failure'));
    await refreshing;

    ownRead.result.resolve({ qtv: { enabled: action === 'enable' } });
    expect(await changing).toMatchObject({ ok: false, issue: { code: 'STATE_UNAVAILABLE', language: 'qtv', message: expect.stringContaining('current failure') } });
    expect(registry.isEnabled('qtv')).toBe(false);
  });

  it.each([true, false])('refresh reports current availability when the newer read succeeds: %s', async (available) => {
    const { provider, queueRead } = controlledProvider();
    const registry = createRegistry({ stateProvider: provider });
    await registry.discover([valid]);
    const ownRead = queueRead();
    const refreshing = registry.refresh();
    await ownRead.started.promise;
    const newerRead = queueRead();
    const newerRefresh = registry.refresh();
    await newerRead.started.promise;
    if (available) newerRead.result.resolve({ qtv: { enabled: true } });
    else newerRead.result.reject(new Error('current failure'));
    const currentIssues = await newerRefresh;

    if (available) ownRead.result.reject(new Error('stale failure'));
    else ownRead.result.resolve({ qtv: { enabled: true } });
    expect(await refreshing).toEqual(currentIssues);
    expect(registry.isEnabled('qtv')).toBe(available);
  });

  it.each(['enable', 'disable'] as const)('%s returns NOT_REGISTERED when discovery drops the code during its read', async (action) => {
    const { provider, queueRead } = controlledProvider();
    const registry = createRegistry({ stateProvider: provider });
    await registry.discover([valid]);
    const ownRead = queueRead();
    const changing = registry[action]('qtv');
    await ownRead.started.promise;
    await registry.discover([]);

    ownRead.result.resolve({ qtv: { enabled: action === 'enable' } });
    expect(await changing).toMatchObject({ ok: false, issue: { code: 'NOT_REGISTERED', language: 'qtv' } });
    expect(registry.get('qtv', { includeDisabled: true })).toBeUndefined();
  });

  it('enable succeeds when its persisted read lands before an overlapping refresh', async () => {
    const { provider, queueRead, snapshot } = controlledProvider();
    const registry = createRegistry({ stateProvider: provider });
    await registry.discover([valid]);
    const enableRead = queueRead();
    const refreshRead = queueRead();

    const enabling = registry.enable('qtv');
    await enableRead.started.promise;
    const persisted = await snapshot();
    expect(persisted.qtv?.enabled).toBe(true);
    const refreshing = registry.refresh();
    await refreshRead.started.promise;

    enableRead.result.resolve(persisted);
    expect(await enabling).toEqual({ ok: true, value: undefined });
    expect(registry.isEnabled('qtv')).toBe(true);

    refreshRead.result.resolve(await snapshot());
    expect(await refreshing).toEqual([]);
    expect(registry.isEnabled('qtv')).toBe(true);
  });

  it.each(['discovery', 'refresh'] as const)('discovery and refresh retain provider state when %s settles first', async (first) => {
    const { provider, queueRead, snapshot } = controlledProvider();
    const registry = createRegistry({ stateProvider: provider });
    await registry.discover([valid]);
    await provider.set('qtv', true);
    const discoveryRead = queueRead();
    const discovering = registry.discover([valid]);
    await discoveryRead.started.promise;
    const discoveryState = await snapshot();

    // The later read sees a change that the earlier snapshot must never overwrite.
    await provider.set('qtv', false);
    const refreshRead = queueRead();
    const refreshing = registry.refresh();
    await refreshRead.started.promise;
    const refreshState = await snapshot();

    if (first === 'discovery') {
      discoveryRead.result.resolve(discoveryState);
      expect(await discovering).toEqual({ registered: ['qtv'], issues: [] });
      expect(registry.isEnabled('qtv')).toBe(true);
      refreshRead.result.resolve(refreshState);
      expect(await refreshing).toEqual([]);
    } else {
      refreshRead.result.resolve(refreshState);
      expect(await refreshing).toEqual([]);
      expect(registry.isEnabled('qtv')).toBe(false);
      discoveryRead.result.resolve(discoveryState);
      expect(await discovering).toEqual({ registered: ['qtv'], issues: [] });
    }
    expect(registry.isEnabled('qtv')).toBe((await snapshot()).qtv?.enabled);
  });
});
