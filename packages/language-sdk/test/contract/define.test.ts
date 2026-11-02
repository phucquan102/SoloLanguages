import { describe, expect, it } from 'vitest';
import { defineLanguage, defineLevelFramework } from '../../src/index.ts';
import { makeModule } from '../fixtures/valid.ts';

describe('defineLanguage', () => {
  it('returns the same object, deeply frozen', () => {
    const m = makeModule();
    const d = defineLanguage(m);
    expect(d).toBe(m);
    expect(Object.isFrozen(d)).toBe(true);
    expect(Object.isFrozen(d.manifest.names)).toBe(true);
    expect(Object.isFrozen(d.levelFrameworks[0]?.levels[0])).toBe(true);
    expect(Object.isFrozen(d.textTools.normalize)).toBe(true);
    expect(() => {
      (d.manifest as { code: string }).code = 'zz';
    }).toThrow(TypeError);
  });

  it('does not validate', () => {
    expect(() => defineLanguage({} as never)).not.toThrow();
  });

  it('handles cycles', () => {
    const a: Record<string, unknown> = {};
    a.self = a;
    expect(() => defineLanguage(a as never)).not.toThrow();
  });
});

describe('defineLevelFramework', () => {
  it('freezes levels', () => {
    const fw = defineLevelFramework({ code: 'f', kind: 'ordinal', certification: false, levels: [{ code: 'a', order: 1 }] });
    expect(Object.isFrozen(fw.levels)).toBe(true);
    expect(fw.levels[0]?.code).toBe('a');
  });
});
