import { describe, expect, it } from 'vitest';
import pack from '../../src/content/index.ts';
import {
  charactersSchema, extensionSchemas, extensionValidators, roadmapBandSchema, roadmapSchema, toneExercisesSchema, tonesSchema,
} from '../../src/content/extension-schemas.ts';
import type { ExtensionKey } from '../../src/content/extension-schemas.ts';
import { extensionOccurrences } from '../fixtures/occurrences.ts';

const occurrences = extensionOccurrences(pack);
const legacyProvenance = {
  source: { file: 'mockup/language.js', declaration: 'zl', line: 39, item: 'fixture' },
  license: 'LicenseRef-SoloLanguages-Proprietary', attribution: '© SoloLanguages. All rights reserved.',
  version: 'bc95722', retrievedAt: '2026-11-02T08:40:09.589Z',
};
// Extensions the curriculum does not use yet (the side and HSK1 units will): checked against fixtures.
const reserved: Partial<Record<ExtensionKey, unknown>> = {
  'zh:topic': { vi: 'Chào hỏi' },
  'zh:collocation-translations': [{ vi: 'Xin chào, bạn!' }],
  'zh:variants': [{ id: 'zh:vocab-variant:fixture', headword: '你好', pinyin: 'nǐ hǎo', glosses: { vi: 'xin chào' }, provenance: legacyProvenance }],
  'zh:character-ids': ['zh:character:ren'],
  'zh:writing-samples': [{ id: 'zh:writing-sample:fixture', text: '人', reading: 'rén', kind: 'hanzi', vocabIds: [], characterIds: [], provenance: legacyProvenance }],
  'zh:activity': { vi: 'Viết chữ 木 theo bốn nét và đối chiếu với mẫu.' },
};
const sample = (key: ExtensionKey): unknown => occurrences.find((item) => item.key === key)?.value ?? reserved[key]!;
const keys = Object.keys(extensionSchemas) as ExtensionKey[];
const withProvenance: ExtensionKey[] = [
  'zh:tones', 'zh:characters', 'zh:tone-exercises', 'zh:roadmap', 'zh:placement-routing',
  'zh:roadmap-band', 'zh:onboarding-band', 'zh:variants', 'zh:writing-samples',
];

describe('Chinese extension schemas', () => {
  it.each(withProvenance)('%s rejects incomplete provenance', (key) => {
    const original = sample(key);
    const invalid: unknown = Array.isArray(original)
      ? [{ ...original[0], provenance: {} }, ...original.slice(1)]
      : { ...(original as object), provenance: {} };
    expect(extensionSchemas[key].safeParse(invalid).success).toBe(false);
  });

  it.each(keys)('%s accepts the extracted value and rejects an unrelated value', (key) => {
    expect(extensionSchemas[key].safeParse(sample(key)).success).toBe(true);
    expect(extensionSchemas[key].safeParse(12345).success).toBe(false);
    expect(extensionSchemas[key].safeParse(null).success).toBe(false);
  });

  it.each(keys)('%s has a validator hook that reports relative issue paths', (key) => {
    expect(extensionValidators[key](sample(key) as never)).toEqual([]);
    const issues = extensionValidators[key](12345);
    expect(issues.length).toBeGreaterThan(0);
    for (const issue of issues) {
      expect(Array.isArray(issue.path)).toBe(true);
      expect(typeof issue.message).toBe('string');
    }
  });

  it('points hook issues at the failing field inside the value', () => {
    const band = { ...(sample('zh:roadmap-band') as object), hours: 0 };
    expect(extensionValidators['zh:roadmap-band'](band as never).map((issue) => issue.path)).toContainEqual(['hours']);
    const tones = pack.extensions['zh:tones'].map((tone, index) => (index === 1 ? { ...tone, number: 5 } : tone));
    expect(extensionValidators['zh:tones'](tones as never).map((issue) => issue.path)).toContainEqual([1, 'number']);
  });

  it('rejects missing stroke names and coordinates outside the grid the character declares', () => {
    const character = pack.extensions['zh:characters'][0]!;
    expect(charactersSchema.safeParse([{ ...character, strokeNames: [] }]).success).toBe(false);
    expect(charactersSchema.safeParse([{ ...character, strokes: [[[0, 0], [101, 10]]] }]).success).toBe(false);
    expect(charactersSchema.safeParse([{ ...character, strokes: [[[0, 0], [100, 100]]], strokeNames: [{ vi: 'x' }] }]).success).toBe(true);
    expect(charactersSchema.safeParse([{ ...character, gridSize: [200, 200], strokes: [[[0, 0], [150, 10]]], strokeNames: [{ vi: 'x' }] }]).success).toBe(true);
    expect(charactersSchema.safeParse([{ ...character, gridSize: [0, 100] }]).success).toBe(false);
  });

  it('lets verification state change without a schema change', () => {
    const character = pack.extensions['zh:characters'][0]!;
    const roadmap = pack.extensions['zh:roadmap'];
    const counted = occurrences.filter((item) => item.key === 'zh:roadmap-band').map((item) => item.value as { counts?: object }).find((value) => value.counts)!;
    for (const flag of [true, false]) {
      expect(charactersSchema.safeParse([{ ...character, verified: flag, simplifiedMockData: flag }]).success).toBe(true);
      expect(roadmapSchema.safeParse({ ...roadmap, countsVerified: flag, hoursAreEstimates: flag }).success).toBe(true);
      expect(roadmapBandSchema.safeParse({ ...counted, counts: { ...counted.counts, verified: flag } }).success).toBe(true);
    }
  });

  it('does not pin the standard, tone counts or other source data in the schema', () => {
    const roadmap = pack.extensions['zh:roadmap'];
    expect(roadmapSchema.safeParse({ ...roadmap, standard: 'another-standard' }).success).toBe(true);
    expect(roadmapSchema.safeParse({ ...roadmap, standard: '' }).success).toBe(false);
    expect(roadmapSchema.safeParse({ ...roadmap, groups: [] }).success).toBe(true);
    expect(tonesSchema.safeParse(pack.extensions['zh:tones'].slice(0, 2)).success).toBe(true);
    expect(toneExercisesSchema.safeParse(pack.extensions['zh:tone-exercises'].slice(0, 1)).success).toBe(true);
  });

  it('rejects invalid tone numbers and malformed curve points', () => {
    const tone = pack.extensions['zh:tones'][0]!;
    expect(tonesSchema.safeParse([{ ...tone, number: 5 }]).success).toBe(false);
    expect(tonesSchema.safeParse([{ ...tone, number: -1 }]).success).toBe(false);
    expect(tonesSchema.safeParse([{ ...tone, curve: '<svg />' }]).success).toBe(false);
    expect(tonesSchema.safeParse([{ ...tone, variants: [] }]).success).toBe(false);
  });

  it.each([0, 1, 2, 3, 4, 5, -1])('validates tone %i in every tone-number field (0 is neutral)', (number) => {
    const tone = pack.extensions['zh:tones'][0]!;
    const exercise = pack.extensions['zh:tone-exercises'][0]!;
    const accepted = number >= 0 && number <= 4;
    expect(tonesSchema.safeParse([{ ...tone, number }]).success).toBe(accepted);
    expect(tonesSchema.safeParse([{ ...tone, variants: [{ ...tone.variants[0]!, number }] }]).success).toBe(accepted);
    expect(toneExercisesSchema.safeParse([{ ...exercise, tone: number, toneId: `zh:tone:${number}`,
      choices: [number, number === 1 ? 2 : 1] }]).success).toBe(accepted);
    expect(toneExercisesSchema.safeParse([{ ...exercise,
      choices: [...new Set([exercise.tone, exercise.tone === 1 ? 2 : 1, number])] }]).success).toBe(accepted);
  });

  it('rejects tone exercises with missing answers, duplicate choices, or mismatched references', () => {
    const exercise = pack.extensions['zh:tone-exercises'][0]!;
    expect(exercise.mode).toBe('guided');
    expect(toneExercisesSchema.safeParse([{ ...exercise, choices: [1, 3] }]).success).toBe(false);
    expect(toneExercisesSchema.safeParse([{ ...exercise, choices: [2, 2] }]).success).toBe(false);
    expect(toneExercisesSchema.safeParse([{ ...exercise, choices: undefined }]).success).toBe(false);
    expect(toneExercisesSchema.safeParse([{ ...exercise, toneId: 'zh:tone:4' }]).success).toBe(false);
    expect(toneExercisesSchema.safeParse([{ ...exercise, mode: 'free' }]).success).toBe(false);
  });

  it('validates the answer mode, test policy, listening and activity extensions', () => {
    for (const mode of ['pinyin', 'pinyin-sandhi', 'pinyin-toneless', 'hanzi', 'tone-number']) {
      expect(extensionSchemas['zh:answer-mode'].safeParse(mode).success, mode).toBe(true);
    }
    for (const mode of ['pinyin-v2', 'toneless', 'Pinyin', '', 3]) expect(extensionSchemas['zh:answer-mode'].safeParse(mode).success, String(mode)).toBe(false);
    const policy = { testId: 'zh:test:n1-day1', afterQuestIds: ['zh:quest:pinyin'], repeatXp: 0, reward: 'first-pass-per-day' };
    expect(extensionSchemas['zh:test-policy'].safeParse(policy).success).toBe(true);
    for (const bad of [{ ...policy, repeatXp: 5 }, { ...policy, afterQuestIds: [] }, { ...policy, reward: 'always' }, { ...policy, extra: 1 }]) {
      expect(extensionSchemas['zh:test-policy'].safeParse(bad).success).toBe(false);
    }
    const listening = { speak: '马', voice: 'browser-tts' };
    expect(extensionSchemas['zh:listening'].safeParse(listening).success).toBe(true);
    for (const bad of [{ speak: 'mǎ', voice: 'browser-tts' }, { speak: '', voice: 'browser-tts' }, { speak: '马', voice: 'native-audio' }, { speak: '马' }]) {
      expect(extensionSchemas['zh:listening'].safeParse(bad).success).toBe(false);
    }
    expect(extensionSchemas['zh:activity'].safeParse({}).success).toBe(false);
  });

  it('rejects malformed per-record extension values', () => {
    expect(extensionSchemas['zh:topic'].safeParse({}).success).toBe(false);
    expect(extensionSchemas['zh:topic'].safeParse({ 'not a locale': 'x' }).success).toBe(false);
    expect(extensionSchemas['zh:collocation-translations'].safeParse([]).success).toBe(false);
    expect(extensionSchemas['zh:icon'].safeParse('').success).toBe(false);
    expect(extensionSchemas['zh:character-ids'].safeParse([]).success).toBe(false);
    expect(extensionSchemas['zh:variants'].safeParse([]).success).toBe(false);
    expect(extensionSchemas['zh:writing-samples'].safeParse([]).success).toBe(false);
    const sampleWriting = (sample('zh:writing-samples') as { kind: string }[])[0]!;
    expect(extensionSchemas['zh:writing-samples'].safeParse([{ ...sampleWriting, kind: 'braille' }]).success).toBe(false);
    expect(roadmapBandSchema.safeParse({ ...(sample('zh:roadmap-band') as object), unexpected: true }).success).toBe(false);
  });
});
