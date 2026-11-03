import { describe, expect, it } from 'vitest';
import { provenanceSchema, validateContentPack } from '@solo/content-schema';
import type { ContentPack, ContentRecord, ContentValidationContext, Question } from '@solo/content-schema';
import { checkContentHygiene } from '@solo/content-schema/testing';
import language, { gradeAnswer } from '../src/index.ts';
import content from '../src/content/index.ts';
import { extensionSchemas, extensionValidators } from '../src/content/extension-schemas.ts';
import { AUTHORED_AT, ATTRIBUTION, LICENSE, RETRIEVED_AT } from '../src/content/provenance.ts';
import { generalVocabManifest } from '../src/content/manifest/general.ts';
import { ieltsVocabManifest } from '../src/content/manifest/ielts.ts';
import { unitFiles } from './content/unit-files.ts';
import { isNativeText } from './native-text.ts';

const pack: ContentPack = content;
export const context: ContentValidationContext = {
  language: language.manifest.code, skills: language.skills.map(({ id }) => id),
  levels: Object.fromEntries(language.levelFrameworks.map(({ code, levels }) => [code, levels.map((level) => level.code)])),
  courses: Object.fromEntries(language.courses.map(({ code, framework, levels }) => [code, { framework, levels: [...levels] }])),
};
type Plain = Record<string, unknown>;
function walk(value: unknown, visit: (object: Plain) => void): void {
  if (value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) { value.forEach((child) => walk(child, visit)); return; }
  visit(value as Plain);
  Object.values(value).forEach((child) => walk(child, visit));
}
const records = (): ContentRecord[] => {
  const found: ContentRecord[] = [];
  walk(pack, (object) => { if ('id' in object && 'provenance' in object) found.push(object as unknown as ContentRecord); });
  return found;
};
const allQuestions = (): Question[] => [...pack.lessons.flatMap(({ questions }) => questions), ...pack.placement, ...pack.assessments];
const onboarding = () => extensionSchemas['en:onboarding'].parse(pack.extensions?.['en:onboarding']);

describe('English content pack', () => {
  describe('validation and ownership', () => {
    it('validates the whole pack with the module context and all extension validators', () => {
      expect(validateContentPack(pack, context, { extensions: extensionValidators })).toEqual([]);
    });
    it('provides a validator for every emitted extension and emits only English-owned keys', () => {
      const keys = new Set<string>();
      walk(pack, (object) => { if (object['extensions']) Object.keys(object['extensions']).forEach((key) => keys.add(key)); });
      expect([...keys].sort()).toEqual(['en:activity', 'en:answer-mode', 'en:category-label', 'en:icon', 'en:onboarding', 'en:test-policy']);
      for (const key of keys) {
        expect(Object.hasOwn(extensionValidators, key)).toBe(true);
        expect(key.startsWith('en:')).toBe(true);
      }
    });
    it('rejects extensions when validators are omitted', () => {
      const issues = validateContentPack(pack, context);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.every(({ message }) => message.includes('no validator supplied'))).toBe(true);
    });
    it('passes hygiene including the Vietnamese heuristic', () => {
      expect(checkContentHygiene(pack, { nativeLocales: ['vi'], isNativeText })).toEqual([]);
    });
    it('still catches Vietnamese copy placed in a plain extension string', () => {
      const mutated = JSON.parse(JSON.stringify(pack));
      mutated.quests[0].extensions['en:icon'] = 'Tạm biệt';
      expect(checkContentHygiene(mutated, { nativeLocales: ['vi'], isNativeText }))
        .toContainEqual(expect.objectContaining({ path: ['quests', 0, 'extensions', 'en:icon'] }));
    });
    it('loads the same pack lazily and survives a lossless JSON round trip', async () => {
      expect(await language.content!()).toEqual(pack);
      expect(JSON.parse(JSON.stringify(pack))).toStrictEqual(pack);
    });
  });

  describe('stable ids and provenance', () => {
    it('has unique, named ASCII ids across top-level and nested records', () => {
      const ids = records().map(({ id }) => id);
      const tiers = onboarding().tiers;
      const expectedCount = pack.stages.length + pack.vocab.length + pack.placement.length
        + 1 + tiers.length * 2 // onboarding, tiers, and each tier's vocabulary record
        + unitFiles.reduce((total, { content: unit }) => total + 1 + unit.lessons.length
          + unit.lessons.reduce((count, lesson) => count + lesson.questions.length, 0)
          + unit.quests.length + unit.days.length + unit.tests.length + unit.assessments.length, 0);
      expect(ids).toHaveLength(expectedCount);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) {
        expect(id).toMatch(/^en:(stage|unit|vocab|lesson|question|quest|day|test|placement|assessment|tier|tier-vocabulary|onboarding):[a-z0-9]+(-[a-z0-9]+)*$/);
        expect(id).not.toMatch(/:\d+$/);
      }
    });
    it('preserves overlapping vocabulary ids and the placement ids', () => {
      for (const slug of ['hello', 'name', 'book', 'student', 'learn']) {
        expect(pack.vocab.filter(({ id }) => id === `en:vocab:${slug}`)).toHaveLength(1);
      }
      expect(pack.placement.map(({ id }) => id)).toEqual([
        'letter-recognition', 'basic-vocabulary', 'foundation-grammar', 'sentence-reading', 'basic-grammar', 'notice-reading',
        'grammar-in-context', 'main-idea', 'conditional', 'inference', 'advanced-structure', 'argument-nuance',
      ].map((slug) => `en:placement:${slug}`));
    });
    it('attributes every record with the owner licence and the correct run', () => {
      for (const record of records()) {
        const source = record.provenance;
        expect(provenanceSchema.safeParse(source).success).toBe(true);
        expect(source.license).toBe(LICENSE);
        expect(source.attribution).toBe(ATTRIBUTION);
        expect(new Date(source.retrievedAt).toISOString()).toBe(source.retrievedAt);
        if (source.version === 'curriculum-v1') {
          expect(source.retrievedAt).toBe(AUTHORED_AT);
          expect(source.source.file).toMatch(/^languages\/en\/src\/content\/.+\.ts$/);
          expect(record.review).toEqual({ status: 'ai-draft', reviewerRoles: [], date: '2026-11-03' });
        } else {
          expect(source.version).toBe('bc95722');
          expect(source.retrievedAt).toBe(RETRIEVED_AT);
          expect(['mockup/index.html', 'mockup/onboarding.js']).toContain(source.source.file);
          expect(source.source.line).toBeGreaterThan(0);
          expect(source.source.item).toBeDefined();
        }
      }
    });
    it('traces the authored curriculum to its unit file and vocabulary to its frozen manifest', () => {
      for (const { content: unit, file } of unitFiles) {
        const owned = [unit.unit, ...unit.lessons, ...unit.quests, ...unit.assessments,
          ...unit.days, ...unit.tests, ...unit.lessons.flatMap(({ questions }) => questions)];
        for (const record of owned) {
          expect(record.provenance.source.file, record.id).toBe(file);
          expect(record.provenance.version, record.id).toBe('curriculum-v1');
        }
        for (const key of ['lessons', 'quests', 'assessments', 'days', 'tests'] as const) {
          for (const record of unit[key]) expect(pack[key]).toContainEqual(record);
        }
        expect(pack.units).toContainEqual(unit.unit);
      }
      expect(new Set(pack.vocab.map(({ provenance }) => provenance.source.file))).toEqual(new Set([
        'languages/en/src/content/manifest/general.ts', 'languages/en/src/content/manifest/ielts.ts',
      ]));
      expect(new Set(pack.placement.map(({ provenance }) => provenance.source.file))).toEqual(new Set(['mockup/onboarding.js']));
    });
  });

  describe('stage and course mapping', () => {
    it('keeps the stable routes and independent IELTS bands from fix round 1', () => {
      expect(pack.stages.map(({ id, courseCode, frameworkCode, levelCode, order }) => [id, courseCode, frameworkCode, levelCode, order])).toEqual([
        ['en:stage:foundation', 'general', 'cefr', null, 0],
        ['en:stage:english-foundation', 'general', 'cefr', 'A1', 1],
        ['en:stage:elementary-english', 'general', 'cefr', 'A2', 2],
        ['en:stage:pre-intermediate', 'general', 'cefr', 'B1', 3],
        ['en:stage:intermediate', 'general', 'cefr', null, 4],
        ['en:stage:upper-intermediate', 'general', 'cefr', 'B2', 5],
        ['en:stage:ielts-foundation', 'ielts', 'ielts', null, 0],
        ['en:stage:ielts-6-0', 'ielts', 'ielts', '6.0', 1],
        ['en:stage:ielts-6-5', 'ielts', 'ielts', '6.5', 2],
        ['en:stage:ielts-7-0', 'ielts', 'ielts', '7.0', 3],
        ['en:stage:ielts-7-5-plus', 'ielts', 'ielts', '7.5', 4],
      ]);
      for (const course of language.courses) {
        const stages = pack.stages.filter(({ courseCode }) => courseCode === course.code);
        expect(new Set(stages.map(({ order }) => order)).size).toBe(stages.length);
        for (const stage of stages) {
          expect(stage.frameworkCode).toBe(course.framework);
          if (stage.levelCode !== null) expect(course.levels).toContain(stage.levelCode);
        }
      }
    });
    it('assigns F1/F2 to Foundation, A1 units to A1, and IELTS units only to IELTS', () => {
      expect(pack.units!.map(({ id, stageId, order }) => [id, stageId, order])).toEqual([
        ['en:unit:f1', 'en:stage:foundation', 1], ['en:unit:f2', 'en:stage:foundation', 2],
        ...[1, 2, 3, 4].map((n) => [`en:unit:a1-u${n}`, 'en:stage:english-foundation', n]),
        ...[1, 2, 3, 4].map((n) => [`en:unit:i${n}`, 'en:stage:ielts-foundation', n]),
      ]);
    });
  });

  describe('questions and placement', () => {
    it('validates every answer and localizes all Vietnamese instruction and option text', () => {
      for (const question of allQuestions()) {
        expect(question.explanations?.['vi']?.length).toBeGreaterThan(0);
        const plain = [typeof question.prompt === 'string' ? question.prompt : '', question.passage ?? ''];
        if (question.kind === 'choice') {
          expect(question.options.length).toBeGreaterThanOrEqual(2);
          expect(Number.isInteger(question.correctIndex)).toBe(true);
          expect(question.correctIndex).toBeGreaterThanOrEqual(0);
          expect(question.correctIndex).toBeLessThan(question.options.length);
          for (const option of question.options) if (typeof option === 'string') plain.push(option);
        } else {
          for (const answer of question.acceptedAnswers) {
            plain.push(answer);
            expect(gradeAnswer(answer, question).correct).toBe(true);
          }
        }
        expect(plain.filter(isNativeText), question.id).toEqual([]);
      }
    });
    it('keeps placement grouping, categories and answer keys intact', () => {
      const tierIds = onboarding().tiers.map(({ id }) => id);
      expect(pack.placement).toHaveLength(12);
      for (const question of pack.placement) {
        expect(question.id).toBe(`en:placement:${question.category}`);
        expect(tierIds).toContain(question.group);
        expect(extensionSchemas['en:category-label'].parse(question.extensions?.['en:category-label'])['vi']!.length).toBeGreaterThan(0);
      }
      expect(pack.placement.map(({ group }) => group!.replace('en:tier:', ''))).toEqual([
        'foundation', 'foundation', 'a1', 'a1', 'a2', 'a2', 'b1', 'b1', 'b2', 'b2', 'c1', 'c1',
      ]);
      expect(pack.placement.map((question) => question.kind === 'choice' ? question.correctIndex : -1))
        .toEqual([1, 0, 2, 1, 1, 2, 1, 2, 1, 0, 1, 2]);
    });
  });

  describe('vocabulary and onboarding', () => {
    it('builds exactly the manifest dictionary, preserving spelling, IPA and Vietnamese glosses', () => {
      const rows = [...generalVocabManifest, ...ieltsVocabManifest];
      expect(pack.vocab).toHaveLength(351);
      expect(pack.vocab.map(({ id }) => id)).toEqual(rows.map(({ id }) => id));
      expect(new Set(pack.vocab.map(({ headword }) => headword.toLowerCase())).size).toBe(rows.length);
      pack.vocab.forEach((word, index) => {
        const row = rows[index]!;
        expect(word.headword).toBe(row.headword);
        expect(word.glosses).toEqual(row.glosses);
        expect(word.fields).toEqual({ ipa: row.ipa });
        expect(Object.keys(word.fields).every((id) => language.vocabFields!.some((field) => field.id === id))).toBe(true);
        for (const field of language.vocabFields!.filter(({ required }) => required)) expect(word.fields[field.id]!.length).toBeGreaterThan(0);
        const owner = pack.lessons.find(({ vocabIds }) => vocabIds?.includes(word.id));
        expect(word.stageId).toBe(owner?.stageId);
        if (owner) {
          expect(word.examples.length).toBeGreaterThan(0);
          for (const ex of word.examples) expect(ex.translations['vi']!.length).toBeGreaterThan(0);
        } else expect(word.examples).toEqual([]);
      });
    });
    it('retains all six orientation tiers and their general-course routes without a CEFR/IELTS equivalence', () => {
      const { tiers, course, foundationStageId, orientationOnly } = onboarding();
      expect([course, foundationStageId, orientationOnly]).toEqual(['general', 'en:stage:foundation', true]);
      expect(tiers.map(({ legacyCode, legacyProgressionLevel, legacyPhase, startStageId }) => [legacyCode, legacyProgressionLevel, legacyPhase, startStageId ?? null])).toEqual([
        ['0', 0, 0, 'en:stage:foundation'], ['A1', 1, 1, 'en:stage:english-foundation'],
        ['A2', 11, 2, 'en:stage:elementary-english'], ['B1', 21, 3, 'en:stage:pre-intermediate'],
        ['B2', 51, 5, 'en:stage:upper-intermediate'], ['C1', 91, 9, null],
      ]);
      for (const tier of tiers) {
        expect(tier.skillLabels).toHaveLength(6);
        if (tier.startStageId) expect(pack.stages.find(({ id }) => id === tier.startStageId)!.courseCode).toBe('general');
        tier.vocabulary.vocabIds?.forEach((id) => expect(pack.vocab.some((word) => word.id === id)).toBe(true));
      }
      expect(tiers.map(({ vocabulary }) => vocabulary.vocabIds)).toEqual([null, ['en:vocab:hello', 'en:vocab:student'], null, null, null, null]);
    });
    it('keeps learning copy free of interface instructions', () => {
      const copy: string[] = [];
      walk(pack, (object) => { if (typeof object['vi'] === 'string') copy.push(object['vi']); });
      expect(copy.length).toBeGreaterThan(50);
      expect(copy.filter((text) => /nút|chạm vào nút|bấm|nhấn nút|Nghe mẫu/iu.test(text))).toEqual([]);
    });
  });
});
