import type { ContentIssuePath, ContentValidationIssue } from './types.ts';

/**
 * Copy only plain JSON data without invoking accessors or serialization hooks.
 * Reject values whose JSON round-trip would lose or change data.
 */
export function jsonSnapshot(value: unknown, path: ContentIssuePath, ancestors: Set<object>, issues: ContentValidationIssue[]): unknown {
  const fail = (issuePath: ContentIssuePath, message: string): never => {
    issues.push({ path: issuePath, message });
    throw null;
  };
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0)) return value;
  if (typeof value !== 'object' || value === null) return fail(path, 'Expected lossless JSON data');
  if (ancestors.has(value)) return fail(path, 'Circular reference is not JSON data');
  const array = Array.isArray(value);
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== (array ? Array.prototype : Object.prototype)) {
    return fail(path, 'Expected a plain JSON object or array');
  }
  ancestors.add(value);
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const result: Record<string, unknown> | unknown[] = array ? [] : {};
  let count = 0;
  for (const key of Reflect.ownKeys(descriptors)) {
    if (array && key === 'length') continue;
    if (typeof key !== 'string') return fail(path, 'Symbol keys are not JSON data');
    const childPath = [...path, array ? Number(key) : key];
    const descriptor = descriptors[key]!;
    if (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) {
      return fail(childPath, 'Expected an enumerable data property');
    }
    if (array && (!/^(0|[1-9][0-9]*)$/.test(key) || Number(key) !== count)) {
      return fail(childPath, 'Expected a dense JSON array without extra properties');
    }
    Object.defineProperty(result, key, {
      value: jsonSnapshot(descriptor.value, childPath, ancestors, issues),
      enumerable: true, configurable: true, writable: true,
    });
    count++;
  }
  if (array && count !== descriptors['length']?.value) return fail(path, 'Sparse arrays are not lossless JSON data');
  ancestors.delete(value);
  return result;
}

