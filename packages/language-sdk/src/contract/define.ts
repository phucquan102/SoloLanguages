import type { LanguageModule, LevelFramework } from './types.ts';

/**
 * Internal. Recursively freezes objects and arrays in place (cycle-safe).
 * Functions are frozen only when `functions` is true and are never traversed.
 */
export function deepFreeze<T>(value: T, { functions = true }: { functions?: boolean } = {}, seen = new WeakSet<object>()): T {
  if (typeof value === 'function') return functions ? Object.freeze(value) : value;
  if (value === null || typeof value !== 'object' || seen.has(value)) return value;
  seen.add(value);
  Object.freeze(value);
  for (const key of Reflect.ownKeys(value)) deepFreeze((value as Record<PropertyKey, unknown>)[key], { functions }, seen);
  return value;
}

/** Typed identity + deep freeze (including functions). Validation happens in the registry. */
export function defineLanguage<const T extends LanguageModule>(mod: T): T {
  return deepFreeze(mod);
}

export function defineLevelFramework<const T extends LevelFramework>(framework: T): T {
  return deepFreeze(framework);
}
