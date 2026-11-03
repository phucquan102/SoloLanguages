import { describe, expect, it } from 'vitest';
import { compareAnswer, normalize, textTools } from '../src/text-tools.ts';
import { equivalent, nonEquivalent } from './fixtures/text-samples.ts';

/** Deterministic PRNG (mulberry32) so the fuzz inputs are identical on every run. */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CODE_POINTS = [
  // ASCII letters, digits and punctuation
  ...'abcxyzABCXYZ0123459 .,;:!?-_()[]"/\\'.split(''), "'", '`',
  // pinyin letters and tone marks, composed and decomposed
  ...'āáǎàēéěèīíǐìōóǒòūúǔùüǖǘǚǜÜǙ'.split(''), 'ü', 'ā', 'é',
  // Han, full-width and ideographic punctuation
  ...'你好谢再见妈麻马骂學學'.split(''), '，', '。', '！', 'Ａ', 'ｚ', '１',
  // combining marks
  '̀', '́', '̄', '̆', '̇', '̈', '̌', '̣', 'ͅ', '͜',
  // whitespace variants, including U+3000 and U+FEFF
  ' ', '\t', '\n', '\r', '\u000b', '\u000c', ' ', ' ', ' ', ' ', ' ',
  ' ', ' ', ' ', ' ', '　', '﻿',
  // zero-width characters and the soft hyphen
  '​', '‌', '‍', '­', '⁠',
  // typographic quotes and apostrophes
  '‘', '’', 'ʼ', '′', '“', '”',
  // compatibility and case-folding oddities
  '¨', 'ẞ', 'ß', 'İ', 'ı', 'Σ', 'ς', 'ǅ', 'ǆ', 'ﬁ', '㎏', 'K', 'Ω', 'ℌ', '²', 'ｱ',
  // astral code points and lone surrogates
  '\u{1f44d}', '\u{20bb7}', '\u{1d400}', '\ud800', '\udc00', '\udbff', '\udfff',
];

function fuzzInputs(count: number): string[] {
  const next = random(20261102);
  return Array.from({ length: count }, () => {
    const length = Math.floor(next() * 25);
    return Array.from({ length }, () => CODE_POINTS[Math.floor(next() * CODE_POINTS.length)]).join('');
  });
}

describe('Chinese answer normalization', () => {
  it.each(equivalent)('accepts equivalent %j and %j in both directions', (a, b) => {
    expect(compareAnswer(a, [b])).toEqual({ correct: true, score: 1 });
    expect(compareAnswer(b, [a])).toEqual({ correct: true, score: 1 });
    expect(normalize(a)).toBe(normalize(b));
  });

  it.each(nonEquivalent)('rejects non-equivalent %j and %j in both directions', (a, b) => {
    expect(compareAnswer(a, [b])).toEqual({ correct: false, score: 0 });
    expect(compareAnswer(b, [a])).toEqual({ correct: false, score: 0 });
  });

  it.each(['', ' \t\r\n 　﻿', ...equivalent.flat(), ...nonEquivalent.flat(), "ＬǙ，西安 xi'an！", 'ma1', 'ＡＢＣ', '​', 'u​̈', 'u ̈'])('is idempotent for %j', (input) => {
    expect(normalize(normalize(input))).toBe(normalize(input));
  });

  it('is idempotent for 2,000 deterministic pseudo-random strings of mixed code points', () => {
    const inputs = fuzzInputs(2000);
    expect(new Set(inputs).size).toBeGreaterThan(1500);
    expect(inputs.some((input) => /\p{M}/u.test(input))).toBe(true);
    expect(inputs.some((input) => input.includes('　'))).toBe(true);
    // With the u flag this class only matches a lone surrogate, never one half of a valid pair.
    expect(inputs.some((input) => /[\ud800-\udfff]/u.test(input))).toBe(true);
    const failures = inputs.filter((input) => normalize(normalize(input)) !== normalize(input));
    expect(failures).toEqual([]);
  });

  it('removes all ECMAScript whitespace and folds full-width Latin case', () => {
    expect(normalize(' ＮǏ\t\n 　ＨǍＯ﻿ ')).toBe('nǐhǎo');
  });

  it('removes zero-width characters and the soft hyphen', () => {
    expect(normalize('n​ǐ‌h‍ǎ­o﻿')).toBe('nǐhǎo');
    expect(compareAnswer('你​好', ['你好'])).toEqual({ correct: true, score: 1 });
  });

  it('recomposes sequences that removing invisible characters brought together', () => {
    expect(normalize('u​̈')).toBe('ü');
    expect(normalize('u ̈')).toBe('ü');
    expect(normalize('a­́')).toBe('á');
  });

  it('maps curly single quotes to the ASCII apostrophe', () => {
    expect(normalize('xi’an')).toBe("xi'an");
    expect(normalize('xi‘an')).toBe("xi'an");
    expect(compareAnswer('xi’an', ["xi'an"])).toEqual({ correct: true, score: 1 });
  });

  it('preserves tones, umlauts, punctuation, and script distinctions', () => {
    expect(normalize("ＬǙ，西安 xi'an！")).toBe("lǚ,西安xi'an!");
    expect(compareAnswer('你好！', ['你好']).correct).toBe(false);
    expect(compareAnswer('mā', ['ma1']).correct).toBe(false);
    expect(compareAnswer('妈妈', ['媽媽']).correct).toBe(false);
  });

  it.each(['', ' ', '\t\n', '　 ﻿', '​‌‍­'])('rejects normalized-empty %j', (input) => {
    expect(normalize(input)).toBe('');
    expect(compareAnswer(input, [input, '', '你好'])).toEqual({ correct: false, score: 0 });
  });

  it('rejects empty alternatives and searches all accepted alternatives without this', () => {
    expect(compareAnswer('你好', [])).toEqual({ correct: false, score: 0 });
    expect(compareAnswer('', [])).toEqual({ correct: false, score: 0 });
    expect(compareAnswer('你好', ['', '再见', '你 好'])).toEqual({ correct: true, score: 1 });
    const { normalize: detachedNormalize, compareAnswer: detachedCompare } = textTools;
    expect(detachedNormalize(' ＡＢ ')).toBe('ab');
    expect(detachedCompare('你 好', ['你好'])).toEqual({ correct: true, score: 1 });
  });
});

describe('Chinese answer normalization with non-string input', () => {
  const values: readonly (readonly [string, unknown])[] = [
    ['undefined', undefined], ['null', null], ['zero', 0], ['number', 42], ['boolean', true],
    ['object', {}], ['empty array', []], ['array of text', ['你好']], ['symbol', Symbol('x')],
    ['function', () => '你好'], ['bigint', 10n], ['object with toString', { toString: () => '你好' }],
  ];

  it.each(values)('normalizes %s to an empty string and rejects it without throwing', (_label, value) => {
    expect(normalize(value)).toBe('');
    expect(compareAnswer(value, ['你好', ''])).toEqual({ correct: false, score: 0 });
  });

  it('rejects malformed accepted lists and ignores non-string alternatives', () => {
    expect(compareAnswer('你好', undefined)).toEqual({ correct: false, score: 0 });
    expect(compareAnswer('你好', '你好')).toEqual({ correct: false, score: 0 });
    expect(compareAnswer('你好', { length: 1, 0: '你好' })).toEqual({ correct: false, score: 0 });
    expect(compareAnswer('你好', [null, 42, {}, '你好'])).toEqual({ correct: true, score: 1 });
    expect(compareAnswer('你好', [null, 42, {}])).toEqual({ correct: false, score: 0 });
  });

  it('never throws for a hostile accepted list', () => {
    const revoked = Proxy.revocable([], {});
    revoked.revoke();
    expect(compareAnswer('你好', revoked.proxy)).toEqual({ correct: false, score: 0 });
    const throwing = new Proxy(['你好'], { get() { throw new Error('boom'); } });
    expect(compareAnswer('你好', throwing)).toEqual({ correct: false, score: 0 });
  });
});
