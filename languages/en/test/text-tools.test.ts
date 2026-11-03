import { describe, expect, it } from 'vitest';
import { compareAnswer, normalize, textTools, withoutFinalPunctuation } from '../src/text-tools.ts';
import { equivalent, nonEquivalent } from './samples.ts';

/** Deterministic PRNG (mulberry32) so a failure is reproducible. */
function prng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const range = (from: number, to: number): number[] => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** Code point pools: ASCII, whitespace variants, invisible and quote characters, combining marks, compatibility forms, surrogates. */
const POOLS: readonly (readonly number[])[] = [
  range(0x61, 0x7a), range(0x41, 0x5a), range(0x30, 0x39),
  [0x20, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0xa0, 0x1680, ...range(0x2000, 0x200a), 0x2028, 0x2029, 0x202f, 0x205f, 0x3000, 0xfeff],
  [0x200b, 0x200c, 0x200d, 0xfeff, 0xad],
  [0x2018, 0x2019, 0x201c, 0x201d, 0x2bc, 0x2032, 0x60, 0x27, 0x22],
  range(0x300, 0x36f),
  range(0xff01, 0xff5e), [0xfb01, 0xfb02, 0x2160, 0x2170, 0xb2, 0x2460, 0x212a, 0x2126, 0x1e9e, 0x3a3],
  range(0xc0, 0xff), [0x130, 0x131, 0x1c5, 0x17f],
  range(0x1ea0, 0x1ef9), range(0x4e00, 0x4e20), range(0x1f600, 0x1f610),
  range(0xd800, 0xdfff),
];

function fuzzStrings(count: number): string[] {
  const random = prng(20261102);
  const pick = <T>(list: readonly T[]): T => list[Math.floor(random() * list.length)]!;
  return Array.from({ length: count }, () => {
    const length = Math.floor(random() * 25);
    let value = '';
    for (let i = 0; i < length; i++) {
      const codePoint = pick(pick(POOLS));
      // Lone surrogates must stay lone code units, so build them with fromCharCode.
      value += codePoint >= 0xd800 && codePoint <= 0xdfff ? String.fromCharCode(codePoint) : String.fromCodePoint(codePoint);
    }
    return value;
  });
}

describe('English text tools', () => {
  it.each(equivalent)('accepts %j as %j', (input, accepted) => {
    expect(textTools.compareAnswer(input, [accepted])).toEqual({ correct: true, score: 1 });
    expect(normalize(input)).toBe(normalize(accepted));
  });
  it.each(nonEquivalent)('rejects %j as %j', (input, accepted) => {
    expect(textTools.compareAnswer(input, [accepted])).toEqual({ correct: false, score: 0 });
  });
  it.each(['', ' \t\n ﻿', ...equivalent.flat(), ...nonEquivalent.flat(), '‘A’ “B”\r\n C', 'İ', '​'])('is idempotent for %j', (input) => {
    expect(normalize(normalize(input))).toBe(normalize(input));
  });
  it.each(['', ' ', '\t\r\n ﻿', '​­'])('rejects normalized-empty input %j', (input) => {
    expect(textTools.compareAnswer(input, ['', ' ', 'hello'])).toEqual({ correct: false, score: 0 });
  });
  it('rejects empty alternatives and searches all accepted alternatives', () => {
    expect(textTools.compareAnswer('', [])).toEqual({ correct: false, score: 0 });
    expect(textTools.compareAnswer('hello', [])).toEqual({ correct: false, score: 0 });
    expect(textTools.compareAnswer('HELLO', ['goodbye', 'hello'])).toEqual({ correct: true, score: 1 });
  });
  it('collapses ECMAScript whitespace while preserving accents and punctuation', () => {
    expect(normalize('  CAFÉ\t\n世界 ! ')).toBe('café 世界 !');
    expect(normalize('‘Hi’ “there”')).toBe("'hi' \"there\"");
  });
  it('strips zero-width characters, the byte-order mark and the soft hyphen', () => {
    expect(normalize('a​b‌c‍d﻿e­f')).toBe('abcdef');
    expect(normalize('​ hello ​')).toBe('hello');
    expect(textTools.compareAnswer('hel­lo', ['hello'])).toEqual({ correct: true, score: 1 });
  });
  it('maps every apostrophe variant to an ASCII apostrophe and curly double quotes to ASCII', () => {
    expect(normalize('it’s it‘s itʼs it′s it`s')).toBe("it's it's it's it's it's");
    expect(normalize('“quoted”')).toBe('"quoted"');
  });
  it('composes marks that stripping an invisible character brings together', () => {
    expect(normalize('e​́')).toBe('é');
    expect(normalize('e­́')).toBe(normalize('é'));
    expect(normalize(normalize('e​́'))).toBe('é');
  });
  it('works when methods are detached', () => {
    const { normalize: detachedNormalize, compareAnswer: detachedCompare } = textTools;
    expect(detachedNormalize(' HELLO ')).toBe('hello');
    expect(detachedCompare('HELLO', ['hello']).correct).toBe(true);
  });

  describe('non-string input', () => {
    const hostile = new Proxy([], { get() { throw new Error('boom'); }, getPrototypeOf() { throw new Error('boom'); } });
    it.each([undefined, null, 42, true, {}, [], Symbol('x'), () => 'x', 10n])('normalizes %o to an empty string', (value) => {
      expect(normalize(value)).toBe('');
      expect(textTools.normalize(value as never)).toBe('');
    });
    it.each([undefined, null, 42, {}, ['hello'], Symbol('x')])('never matches input %o', (value) => {
      expect(compareAnswer(value, ['hello'])).toEqual({ correct: false, score: 0 });
    });
    it.each([undefined, null, 'hello', {}, 42, { length: 1, 0: 'hello' }])('never matches accepted list %o', (value) => {
      expect(compareAnswer('hello', value)).toEqual({ correct: false, score: 0 });
    });
    it('skips non-string alternatives instead of throwing', () => {
      expect(compareAnswer('hello', [1, null, undefined, {}, 'hello'])).toEqual({ correct: true, score: 1 });
      expect(compareAnswer('hello', [1, null, 'goodbye'])).toEqual({ correct: false, score: 0 });
    });
    it('treats a hostile accepted list as no match', () => {
      expect(compareAnswer('hello', hostile)).toEqual({ correct: false, score: 0 });
    });
  });

  describe('fuzz', () => {
    const strings = fuzzStrings(2000);
    it('generates 2000 distinct deterministic inputs that normalization actually changes', () => {
      expect(strings).toHaveLength(2000);
      expect(fuzzStrings(2000)).toEqual(strings);
      expect(new Set(strings).size).toBeGreaterThan(1500);
      expect(strings.filter((value) => normalize(value) !== value).length).toBeGreaterThan(1500);
    });
    it('normalizes idempotently: normalize(normalize(s)) === normalize(s)', () => {
      const failures = strings.filter((value) => normalize(normalize(value)) !== normalize(value));
      expect(failures.map((value) => [...value].map((char) => char.codePointAt(0)!.toString(16)))).toEqual([]);
    });
    it('matches an input against itself exactly when it has non-empty text after final punctuation', () => {
      for (const value of strings) {
        expect(compareAnswer(value, [value]).correct).toBe(withoutFinalPunctuation(normalize(value)).length > 0);
      }
    });
  });
});
