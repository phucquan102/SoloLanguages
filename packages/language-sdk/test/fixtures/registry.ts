import { createMemoryStateProvider, createRegistry } from '../../src/index.ts';
import type { RegistryOptions, RegistrySource } from '../../src/index.ts';

export const src = (id: string, load: () => Promise<unknown>): RegistrySource => ({ id, load });
export const valid = src('valid', () => import('./valid.ts'));
export const setup = (opts: Partial<RegistryOptions> = {}) =>
  createRegistry({ stateProvider: createMemoryStateProvider({}, { defaultEnabled: true }), ...opts });
export const thrower = (message: string) => () => { throw new Error(message); };
