import { describe, expect, it } from 'vitest';
import type { JsonValue } from '@solo/content-schema';
import content from '../../src/content/index.ts';
import { extensionSchemas, extensionValidators } from '../../src/content/extension-schemas.ts';
import { provenance } from '../../src/content/provenance.ts';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const sample = {
  // Legacy parsers remain supported; the curriculum no longer emits extracted vocab variants.
  variants: [{ id: 'en:vocab-variant:hello-words', exampleIndex: 0, glosses: { vi: 'xin chào' },
    fields: { ipa: '/həˈləʊ/' }, collocations: ['say hello'], provenance: provenance('index.html', 'words', 36, 0) }],
  icon: content.quests[0]!.extensions!['en:icon'] as JsonValue,
  label: clone(content.placement[0]!.extensions!['en:category-label'] as JsonValue),
  source: 'en:question:alphabet',
  onboarding: clone(content.extensions!['en:onboarding'] as { [key: string]: JsonValue }),
};

const without = (value: object, key: string): { [key: string]: JsonValue } =>
  Object.fromEntries(Object.entries(value).filter(([name]) => name !== key));

const issuesFor = (key: keyof typeof extensionValidators, value: unknown) => extensionValidators[key](value as JsonValue);

describe('English extension validators', () => {
  it('provides a validator for exactly the schemas the module owns', () => {
    expect(Object.keys(extensionValidators).sort()).toEqual(Object.keys(extensionSchemas).sort());
  });

  it.each([
    ['en:source-variants', sample.variants], ['en:icon', sample.icon], ['en:category-label', sample.label],
    ['en:source-question', sample.source], ['en:onboarding', sample.onboarding],
    ['en:activity', { vi: 'Đọc từng nhóm chữ.' }],
    ['en:answer-mode', 'sequence'], ['en:answer-mode', 'spelling'], ['en:answer-mode', 'phone'],
    ['en:answer-mode', 'case-sensitive'],
    ['en:test-policy', { testId: 'en:test:f1-day1', afterQuestIds: ['en:quest:f1-alphabet-a-m', 'en:quest:f1-alphabet-n-z'], repeatXp: 0, reward: 'first-pass-per-day' }],
  ] as const)('accepts a well-formed %s value', (key, value) => {
    expect(issuesFor(key, value)).toEqual([]);
  });
  it.each([1, 3])('accepts an explicit schedule with %i main prerequisites', (count) => {
    expect(issuesFor('en:test-policy', {
      testId: 'en:test:checkpoint', afterQuestIds: Array.from({ length: count }, (_, index) => `en:quest:main-${index}`),
      repeatXp: 0, reward: 'first-pass-per-day',
    })).toEqual([]);
  });

  it.each([
    ['en:source-variants', []], ['en:source-variants', {}], ['en:icon', ''], ['en:icon', 5], ['en:category-label', {}],
    ['en:category-label', { vi: '' }], ['en:category-label', { 'not a locale': 'x' }], ['en:category-label', 'x'],
    ['en:source-question', ''], ['en:source-question', null], ['en:onboarding', null], ['en:onboarding', {}],
    ['en:activity', 'Đọc nhại'], ['en:activity', {}], ['en:test-policy', {}],
    ['en:answer-mode', 'lenient'], ['en:answer-mode', null], ['en:answer-mode', { mode: 'spelling' }],
    ['en:test-policy', { testId: 'en:test:f1-day1', afterQuestIds: [], repeatXp: 20, reward: 'every-pass' }],
  ] as const)('rejects a malformed %s value %j', (key, value) => {
    expect(issuesFor(key, value).length).toBeGreaterThan(0);
  });

  describe('en:source-variants', () => {
    const variant = sample.variants[0] as { [key: string]: JsonValue };
    it.each([
      ['an unknown key', { ...variant, extra: 1 }],
      ['a missing provenance', without(variant, 'provenance')],
      ['a negative example index', { ...variant, exampleIndex: -1 }],
      ['a fractional example index', { ...variant, exampleIndex: 0.5 }],
      ['an empty gloss', { ...variant, glosses: { vi: '' } }],
      ['non-text fields', { ...variant, fields: { ipa: 3 } }],
      ['incomplete provenance', { ...variant, provenance: { ...provenance('index.html', 'words', 36, 0), version: '' } }],
    ])('rejects %s', (_, value) => {
      expect(issuesFor('en:source-variants', [value]).length).toBeGreaterThan(0);
    });
    it('reports issue paths relative to the extension value', () => {
      const paths = issuesFor('en:source-variants', [{ ...variant, exampleIndex: -1 }]).map(({ path }) => path);
      expect(paths).toContainEqual([0, 'exampleIndex']);
    });
    it('accepts any number of variants and any declared field set', () => {
      expect(issuesFor('en:source-variants', [variant, { ...variant, id: 'en:vocab-variant:x' }, { ...variant, id: 'en:vocab-variant:y', fields: { ipa: '/x/', other: 'y' } }])).toEqual([]);
    });
  });

  describe('en:onboarding', () => {
    const tier = (sample.onboarding['tiers'] as JsonValue[])[1] as { [key: string]: JsonValue };
    const withTiers = (tiers: JsonValue[], extra: { [key: string]: JsonValue } = {}) => ({ ...sample.onboarding, ...extra, tiers });
    it('does not pin the tier count, skill-label count or literal flags', () => {
      expect(issuesFor('en:onboarding', withTiers([tier]))).toEqual([]);
      expect(issuesFor('en:onboarding', withTiers([tier, { ...tier, id: 'en:tier:x' }], { orientationOnly: false, course: 'other' }))).toEqual([]);
      expect(issuesFor('en:onboarding', withTiers([{ ...tier, skillLabels: [{ vi: 'a' }, { vi: 'b' }] }]))).toEqual([]);
      expect(issuesFor('en:onboarding', withTiers([without(tier, 'startStageId')]))).toEqual([]);
    });
    it.each([
      ['no tiers', withTiers([])],
      ['an unknown tier key', withTiers([{ ...tier, extra: true }])],
      ['a non-boolean orientation flag', withTiers([tier], { orientationOnly: 'yes' })],
      ['an empty tier name', withTiers([{ ...tier, names: { vi: '' } }])],
      ['a vocabulary list of numbers', withTiers([{ ...tier, vocabulary: { ...(tier['vocabulary'] as object), vocabIds: [1] } }])],
      ['a tier without vocabulary', withTiers([without(tier, 'vocabulary')])],
    ])('rejects %s', (_, value) => {
      expect(issuesFor('en:onboarding', value).length).toBeGreaterThan(0);
    });
    it('reports nested issue paths relative to the extension value', () => {
      const paths = issuesFor('en:onboarding', withTiers([{ ...tier, names: { vi: '' } }])).map(({ path }) => path);
      expect(paths).toContainEqual(['tiers', 0, 'names', 'vi']);
    });
  });
});
