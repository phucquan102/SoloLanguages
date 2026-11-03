import { describe, expect, it } from 'vitest';
import { generalVocabManifest } from '../../src/content/manifest/general.ts';
import type { VocabManifestRow } from '../../src/content/manifest/general.ts';
import { ieltsReusedVocabIds, ieltsVocabManifest } from '../../src/content/manifest/ielts.ts';

/** Units and lesson slugs hardcoded from docs/curriculum/plan-foundation-level1.md sections 2a and 2b. */
const GENERAL_LESSONS: Readonly<Record<string, readonly string[]>> = {
  'en:unit:f1': ['f1-alphabet-a-m', 'f1-alphabet-n-z', 'f1-greetings', 'f1-my-name', 'f1-numbers-0-20', 'f1-numbers-phone'],
  'en:unit:f2': ['f2-objects', 'f2-this-that', 'f2-colours', 'f2-classroom', 'f2-plurals', 'f2-days'],
  'en:unit:a1-u1': ['be-positive', 'be-neg-questions', 'countries', 'jobs', 'age-address', 'read-profile'],
  'en:unit:a1-u2': ['family', 'possessives', 'have-has', 'apostrophe-s', 'describe-people', 'write-family'],
  'en:unit:a1-u3': ['routines', 'present-simple', 'third-person-s', 'do-does-q', 'time', 'frequency', 'listen-day'],
  'en:unit:a1-u4': ['food', 'countable-some-any', 'like-dont-like', 'id-like', 'how-much', 'there-is-are'],
};

const IELTS_LESSONS: Readonly<Record<string, readonly string[]>> = {
  'en:unit:i1': ['i1-test-format', 'i1-instruction-words', 'i1-band-scale', 'i1-part1-hometown', 'i1-spelling-dates', 'i1-study-goal'],
  'en:unit:i2': ['i2-numbers-prices', 'i2-names-addresses', 'i2-corrections', 'i2-directions-map', 'i2-form-completion', 'i2-review'],
  'en:unit:i3': ['i3-skimming', 'i3-scanning', 'i3-paraphrase', 'i3-tfng', 'i3-sentence-completion', 'i3-review'],
  'en:unit:i4': ['i4-svo-sentences', 'i4-linkers', 'i4-trend-words', 'i4-opinion', 'i4-paragraph', 'i4-part2-planning'],
};

/** Sample words from the plan tables (section 2a), plus the function words the grammar points need. */
const GENERAL_SAMPLE_WORDS: readonly string[] = [
  // F1
  'letter', 'spell', 'name', 'hello', 'hi', 'goodbye', 'please', 'thank you', 'sorry', 'yes', 'no',
  'my', 'your', 'what', 'I', 'am',
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
  'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'phone', 'number',
  // F2
  'book', 'pen', 'bag', 'desk', 'chair', 'door', 'window', 'notebook', 'this', 'that', 'it',
  'red', 'blue', 'green', 'black', 'white',
  'open', 'close', 'read', 'write', 'listen', 'repeat', 'sit down', 'box', 'boxes',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'today', 'tomorrow',
  // A1-U1
  'Vietnam', 'Vietnamese', 'China', 'Chinese', 'teacher', 'doctor', 'nurse', 'driver', 'live', 'city', 'years old',
  // A1-U2
  'mother', 'father', 'brother', 'sister', 'son', 'daughter', 'tall', 'young', 'happy',
  // A1-U3
  'get up', 'have breakfast', 'go to work', 'study', 'always', 'usually', 'never',
  // A1-U4
  'rice', 'bread', 'egg', 'milk', 'coffee', 'chicken', 'fish', 'apple', 'noodles', 'cheap', 'expensive',
  // function words needed by the grammar points
  'a', 'an', 'the', 'is', 'are', 'do', 'does', 'have', 'has', 'some', 'any',
];

/** The plan names no IELTS sample table; these come from the lesson hints in section 2b. */
const IELTS_SAMPLE_WORDS: readonly string[] = ['word', 'true', 'false', 'given'];

const POS_VALUES = [
  'noun', 'verb', 'modal', 'adjective', 'adverb', 'pronoun', 'determiner',
  'article', 'preposition', 'conjunction', 'interjection', 'numeral', 'phrase',
];

const courses = [
  {
    name: 'general', rows: generalVocabManifest, lessons: GENERAL_LESSONS, samples: GENERAL_SAMPLE_WORDS, min: 180, max: 240,
  },
  {
    name: 'ielts', rows: ieltsVocabManifest, lessons: IELTS_LESSONS, samples: IELTS_SAMPLE_WORDS, min: 90, max: 150,
  },
] as const;

const ID_PATTERN = /^en:vocab:[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugOf = (headword: string): string => headword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const idsOf = (rows: readonly VocabManifestRow[]): string[] => rows.map((row) => row.id);
const duplicates = (values: readonly string[]): string[] => values.filter((value, index) => values.indexOf(value) !== index);

describe.each(courses)('English $name vocab manifest', ({ rows, lessons, samples, min, max }) => {
  it('has unique ids', () => {
    expect(duplicates(idsOf(rows))).toEqual([]);
  });

  it('has unique headwords (case-insensitive)', () => {
    expect(duplicates(rows.map((row) => row.headword.toLowerCase()))).toEqual([]);
  });

  it('uses ASCII en:vocab:<slug> ids', () => {
    expect(rows.filter((row) => !ID_PATTERN.test(row.id)).map((row) => row.id)).toEqual([]);
  });

  it('derives each id slug from its headword', () => {
    const mismatched = rows.filter((row) => row.id !== `en:vocab:${slugOf(row.headword)}`).map((row) => row.id);
    expect(mismatched).toEqual([]);
  });

  it('contains every plan sample word', () => {
    const headwords = new Set(rows.map((row) => row.headword.toLowerCase()));
    expect(samples.filter((word) => !headwords.has(word.toLowerCase()))).toEqual([]);
  });

  it('takes every unitId and lessonSlug from the plan lists', () => {
    const unknownUnits = rows.filter((row) => !(row.unitId in lessons)).map((row) => `${row.id} -> ${row.unitId}`);
    expect(unknownUnits).toEqual([]);
    const unknownLessons = rows
      .filter((row) => !(lessons[row.unitId] ?? []).includes(row.lessonSlug))
      .map((row) => `${row.id} -> ${row.unitId}/${row.lessonSlug}`);
    expect(unknownLessons).toEqual([]);
  });

  it('introduces at least two words in every planned lesson', () => {
    const empty = Object.values(lessons).flat().filter((slug) => rows.filter((row) => row.lessonSlug === slug).length < 2);
    expect(empty).toEqual([]);
  });

  it('wraps British IPA in slashes', () => {
    const bad = rows.filter((row) => !/^\/[^/]+\/$/.test(row.ipa) || row.ipa !== row.ipa.trim()).map((row) => row.id);
    expect(bad).toEqual([]);
  });

  it('has a non-empty Vietnamese gloss, example hint and valid part of speech', () => {
    expect(rows.filter((row) => row.glosses.vi.trim() === '').map((row) => row.id)).toEqual([]);
    expect(rows.filter((row) => !/[.?!]$/.test(row.exampleHint.trim())).map((row) => row.id)).toEqual([]);
    expect(rows.filter((row) => !POS_VALUES.includes(row.pos)).map((row) => row.id)).toEqual([]);
  });

  it('sets americanVariant only when it differs from the headword', () => {
    const bad = rows
      .filter((row) => row.americanVariant !== undefined)
      .filter((row) => row.americanVariant === row.headword || row.americanVariant?.trim() === '')
      .map((row) => row.id);
    expect(bad).toEqual([]);
  });

  it('keeps optional notes non-empty', () => {
    expect(rows.filter((row) => row.note !== undefined && row.note.trim() === '').map((row) => row.id)).toEqual([]);
  });

  it(`has between ${min} and ${max} rows`, () => {
    expect(rows.length).toBeGreaterThanOrEqual(min);
    expect(rows.length).toBeLessThanOrEqual(max);
  });
});

describe('English general vocab manifest specifics', () => {
  it('records British spellings with their American variants', () => {
    const variants = Object.fromEntries(
      generalVocabManifest.filter((row) => row.americanVariant !== undefined).map((row) => [row.headword, row.americanVariant]),
    );
    expect(variants).toMatchObject({ colour: 'color', favourite: 'favorite' });
  });
});

describe('English ielts vocab manifest reuse', () => {
  const generalIds = new Set(idsOf(generalVocabManifest));
  const generalHeadwords = new Set(generalVocabManifest.map((row) => row.headword.toLowerCase()));

  it('lists reused ids that all exist in the general manifest', () => {
    expect(ieltsReusedVocabIds.filter((id) => !generalIds.has(id))).toEqual([]);
  });

  it('lists each reused id once', () => {
    expect(duplicates(ieltsReusedVocabIds)).toEqual([]);
  });

  it('does not repeat general words as new ielts rows', () => {
    expect(ieltsVocabManifest.filter((row) => generalIds.has(row.id)).map((row) => row.id)).toEqual([]);
    expect(ieltsVocabManifest.filter((row) => generalHeadwords.has(row.headword.toLowerCase())).map((row) => row.id)).toEqual([]);
  });

  it('keeps reused ids and new ielts ids disjoint', () => {
    const newIds = new Set(idsOf(ieltsVocabManifest));
    expect(ieltsReusedVocabIds.filter((id) => newIds.has(id))).toEqual([]);
  });
});
