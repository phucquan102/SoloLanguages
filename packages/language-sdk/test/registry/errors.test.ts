import { afterEach, describe, expect, it, vi } from 'vitest';
import * as throws from '../fixtures/loader-throws.ts';
import { setup, src, thrower, valid } from '../fixtures/registry.ts';

afterEach(() => { vi.useRealTimers(); });

describe('error reporting isolation', () => {
  it('throwing logger (method or getter) does not break discover', async () => {
    const loggers = [{ warn: thrower('log') }, Object.defineProperty({}, 'warn', { get: thrower('log') })];
    for (const logger of loggers) {
      const r = await setup({ logger: logger as never }).discover([src('loader-throws', throws.load), valid]);
      expect(r.registered).toEqual(['qtv']);
      expect(r.issues).toHaveLength(1);
    }
  });

  it('unprintable rejection values get a fixed fallback message', async () => {
    const badToString = { toString: thrower('nope') };
    const badMessage = Object.defineProperty(new Error('x'), 'message', { get: thrower('nope') });
    const r = await setup().discover([
      src('a', () => Promise.reject(Object.create(null))),
      src('b', () => Promise.reject(badToString)),
      src('c', () => Promise.reject(badMessage)),
    ]);
    expect(r.issues.map((i) => i.message)).toEqual(Array(3).fill('Unknown error (value could not be converted to a string)'));
  });

  it('logs issues through the logger', async () => {
    const warn = vi.fn();
    await setup({ logger: { warn } }).discover([src('loader-throws', throws.load)]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('LOAD_FAILED'), expect.objectContaining({ sourceId: 'loader-throws' }));
  });
});
