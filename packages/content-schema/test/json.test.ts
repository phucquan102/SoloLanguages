import { describe, expect, it } from 'vitest';
import { jsonSnapshot } from '../src/json.ts';
import type { ContentValidationIssue } from '../src/index.ts';

describe('jsonSnapshot', () => {
  it('copies plain and null-prototype JSON values independently without changing own keys', () => {
    const value = Object.assign(Object.create(null) as Record<string, unknown>, { nested: [null, true, 1, 'text'] });
    Object.defineProperty(value, '__proto__', { enumerable: true, value: 'retained' });
    const issues: ContentValidationIssue[] = [];
    const result = jsonSnapshot(value, [], new Set(), issues) as Record<string, unknown>;
    expect(issues).toEqual([]);
    expect(result).toEqual(value);
    expect(result).not.toBe(value);
    expect(result['nested']).not.toBe(value['nested']);
    expect(Object.hasOwn(result, '__proto__')).toBe(true);
  });

  it('reports the caller path before rejecting accessor descriptors without invoking them', () => {
    let invoked = false;
    const value = { get sample() { invoked = true; return 'text'; } };
    const issues: ContentValidationIssue[] = [];
    expect(() => jsonSnapshot(value, ['root'], new Set(), issues)).toThrow();
    expect(issues).toEqual([{ path: ['root', 'sample'], message: 'Expected an enumerable data property' }]);
    expect(invoked).toBe(false);
  });
});
