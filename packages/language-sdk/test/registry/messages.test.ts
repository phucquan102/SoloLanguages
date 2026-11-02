import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStateProvider, createRegistry } from '../../src/index.ts';
import { makeModule } from '../fixtures/valid.ts';
import { setup, src, valid } from '../fixtures/registry.ts';

afterEach(() => { vi.useRealTimers(); });

describe('own locale keys', () => {
  it.each(['toString', '__proto__', 'constructor', 'hasOwnProperty'])('getMessages(%j) only resolves own locale keys', async (locale) => {
    const reg = setup();
    await reg.discover([valid]);
    expect(await reg.getMessages('qtv', locale)).toEqual({ ok: true, value: undefined });
  });
});

describe('message result validation', () => {
  const withMessages = async (value: unknown) => {
    const reg = setup();
    await reg.discover([src('m', async () => makeModule('qms', { i18n: { vi: async () => value } }))]);
    return reg.getMessages('qms', 'vi');
  };

  it.each([undefined, null, 'text', ['a'], new Map([['a', 'b']]), { a: 1 }, { a: 'x', b: null }])('getMessages resolving %j -> LOAD_FAILED', async (value) => {
    expect(await withMessages(value)).toMatchObject({
      ok: false,
      issue: { code: 'LOAD_FAILED', language: 'qms', message: expect.stringContaining('expected a plain object of strings') },
    });
  });

  it('getMessages accepts plain and null-prototype objects of strings', async () => {
    expect(await withMessages({ a: 'x' })).toEqual({ ok: true, value: { a: 'x' } });
    const bare = Object.assign(Object.create(null) as object, { a: 'y' });
    expect(await withMessages(bare)).toMatchObject({ ok: true });
  });
});

describe('message descriptors and snapshots', () => {
  const invalidMessages = [
    ['non-enumerable non-string', () => Object.defineProperty({}, 'hidden', { value: 123 })],
    ['accessor', () => Object.defineProperty({}, 'visible', { enumerable: true, get: () => 'text' })],
    ['symbol key', () => ({ [Symbol('hidden')]: 'text' })],
  ] as const;

  it.each(invalidMessages)('getMessages rejects %s properties', async (_label, makeValue) => {
    const value = makeValue();
    const registry = createRegistry({ stateProvider: createMemoryStateProvider() });
    await registry.discover([{ id: 'messages', load: async () => makeModule('qtv', { i18n: { vi: async () => value } }) }]);
    expect(await registry.getMessages('qtv', 'vi')).toMatchObject({ ok: false, issue: { code: 'LOAD_FAILED' } });
  });

  it('getMessages returns owned data properties including non-enumerable strings', async () => {
    const value = Object.defineProperties({ visible: 'original' }, {
      hidden: { value: 'hidden text' },
    });
    // Define this key explicitly so object-literal prototype syntax does not consume it.
    Object.defineProperty(value, '__proto__', { value: 'ordinary key', enumerable: true });
    const registry = createRegistry({ stateProvider: createMemoryStateProvider() });
    await registry.discover([{ id: 'messages', load: async () => makeModule('qtv', { i18n: { vi: async () => value } }) }]);
    const result = await registry.getMessages('qtv', 'vi');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).not.toBe(value);
    value.visible = 'changed';
    expect(result.value?.visible).toBe('original');
    expect(Object.getOwnPropertyDescriptor(result.value, 'hidden')?.value).toBe('hidden text');
    expect(Object.getOwnPropertyDescriptor(result.value, '__proto__')?.value).toBe('ordinary key');
  });
});

describe('null-prototype message results', () => {
  it('supports Object.hasOwn for own message keys without inherited object methods', async () => {
    const registry = setup();
    await registry.discover([src('messages', async () => makeModule('qtv', {
      i18n: { vi: async () => ({ greeting: 'text' }) },
    }))]);
    const result = await registry.getMessages('qtv', 'vi');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Object.getPrototypeOf(result.value)).toBeNull();
    expect(Object.hasOwn(result.value!, 'greeting')).toBe(true);
    expect(Object.hasOwn(result.value!, 'hasOwnProperty')).toBe(false);
    expect(result.value?.hasOwnProperty).toBeUndefined();
  });
});
