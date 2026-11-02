import type { Messages } from '../contract/types.ts';

/** Internal. Validates every own descriptor without invoking accessors and returns an owned data snapshot. */
export function snapshotMessages(value: unknown): Messages | undefined {
  if (value === null || typeof value !== 'object') return undefined;
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return undefined;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const snapshot = Object.create(null) as Record<string, string>;
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== 'string') return undefined;
    const descriptor = descriptors[key]!;
    if (!Object.hasOwn(descriptor, 'value') || typeof descriptor.value !== 'string') return undefined;
    snapshot[key] = descriptor.value;
  }
  return snapshot;
}
