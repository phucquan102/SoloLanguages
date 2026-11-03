import { describe, expect, it } from 'vitest';
import {
  contentPackSchema, daySchema, extensionKeySchema, lessonBlockSchema, lessonSchema, localizedTextSchema,
  provenanceSchema, questionSchema, questSchema, reviewSchema, stageSchema, testSchema, unitSchema, vocabSchema,
} from '../src/index.ts';
import { curriculumPack } from './fixtures/curriculum.ts';
import { provenance, question, validPack } from './fixtures/pack.ts';

describe('content schemas', () => {
  it('parses a complete pack without changing its shape', () => {
    const pack = validPack();
    expect(contentPackSchema.parse(pack)).toEqual(pack);
  });

  it('accepts empty collections and omitted extensions', () => {
    expect(contentPackSchema.safeParse({
      schemaVersion: 1, language: 'qaa', stages: [], vocab: [], lessons: [],
      quests: [], placement: [], assessments: [],
    }).success).toBe(true);
  });

  it.each(['stages', 'vocab', 'lessons', 'quests', 'placement', 'assessments'])('requires collection %s', (key) => {
    const pack = validPack();
    Reflect.deleteProperty(pack, key);
    expect(contentPackSchema.safeParse(pack).success).toBe(false);
  });

  it.each([
    { schemaVersion: 2 }, { language: '' }, { characters: [] }, { tones: [] }, { roadmap: [] },
  ])('rejects invalid pack fields %#', (fields) => {
    expect(contentPackSchema.safeParse({ ...validPack(), ...fields }).success).toBe(false);
  });

  it.each(['EN', 'en-us', 'not_a_tag', '__proto__'])('rejects non-canonical locale %s', (key) => {
    const value = Object.fromEntries([[key, 'text']]);
    expect(localizedTextSchema.safeParse(value).success).toBe(false);
  });

  it('accepts canonical locales with script and region subtags', () => {
    expect(localizedTextSchema.safeParse({ 'en-US': 'text', 'zh-Hans': 'text' }).success).toBe(true);
  });

  it('requires string localized values', () => {
    expect(localizedTextSchema.safeParse({ vi: 1 }).success).toBe(false);
  });

  it.each([
    { retrievedAt: 'yesterday' }, { retrievedAt: '2026-11-02' },
    { retrievedAt: '2026-02-30T00:00:00Z' },
    { license: '' }, { attribution: '' }, { version: '' },
    { source: { file: '', declaration: 'source' } },
    { source: { file: 'source.txt', declaration: '' } },
    { source: { ...provenance.source, line: 0 } },
    { source: { ...provenance.source, line: 1.5 } },
    { source: { ...provenance.source, item: -1 } },
  ])('rejects malformed provenance %#', (fields) => {
    expect(provenanceSchema.safeParse({ ...provenance, ...fields }).success).toBe(false);
  });

  it('allows minimal provenance source, string items, and ISO timezone offsets', () => {
    expect(provenanceSchema.safeParse({
      ...provenance, source: { file: 'source.txt', declaration: 'source', item: 'entry' },
      retrievedAt: '2026-11-02T07:00:00+07:00',
    }).success).toBe(true);
    expect(provenanceSchema.safeParse({
      ...provenance, source: { file: 'source.txt', declaration: 'source' },
    }).success).toBe(true);
  });

  it.each([{ id: '' }, { order: -1 }, { order: 0.5 }, { levelCode: '' }, { frameworkCode: '' }])(
    'rejects malformed stage fields %#', (fields) => {
      expect(stageSchema.safeParse({ ...validPack().stages[0], ...fields }).success).toBe(false);
    },
  );

  it.each([{ options: [] }, { options: ['one'] }, { correctIndex: -1 }, { correctIndex: 0.5 }, { correctIndex: 2 }])(
    'rejects malformed questions %#', (fields) => {
      expect(questionSchema.safeParse({ ...question(), ...fields }).success).toBe(false);
    },
  );

  it('accepts a target-language string prompt', () => {
    expect(questionSchema.safeParse({ ...question(), prompt: 'Sample?' }).success).toBe(true);
  });

  it.each([
    { kind: 'text', text: 'Instruction' },
    { kind: 'text', text: { vi: 'Instruction' } },
    { kind: 'example', text: 'Sample', translations: { vi: 'Translation' } },
    { kind: 'example', text: 'Sample' },
  ])('accepts supported block shape %#', (block) => {
    expect(lessonBlockSchema.safeParse(block).success).toBe(true);
  });

  it.each([
    { kind: 'html', text: '<div>sample</div>' },
    { kind: 'example', text: { vi: 'Target text must be plain' } },
    { kind: 'text' },
  ])('rejects malformed block shape %#', (block) => {
    expect(lessonBlockSchema.safeParse(block).success).toBe(false);
  });

  it.each([{ headword: '' }, { fields: { reading: 1 } }, { examples: [{ text: 'sample' }] }])(
    'rejects malformed vocabulary %#', (fields) => {
      expect(vocabSchema.safeParse({ ...validPack().vocab[0], ...fields }).success).toBe(false);
    },
  );

  it.each([{ minutes: 0 }, { minutes: Infinity }, { xp: -1 }, { xp: 1.5 }, { optional: 'yes' }])(
    'rejects malformed quest fields %#', (fields) => {
      expect(questSchema.safeParse({ ...validPack().quests[0], ...fields }).success).toBe(false);
    },
  );

  it('accepts namespaced extension JSON and defers dataset shape to the owner', () => {
    expect(extensionKeySchema.safeParse('qaa:custom-data.v1').success).toBe(true);
    expect(contentPackSchema.safeParse({ ...validPack(), extensions: { 'qaa:anything': [true, null, {}] } }).success).toBe(true);
  });

  it('rejects non-JSON extension values', () => {
    expect(contentPackSchema.safeParse({ ...validPack(), extensions: { 'qaa:dataset': () => 1 } }).success).toBe(false);
  });

  it('accepts mixed localized and target-language choice options', () => {
    expect(questionSchema.parse({ ...question(), options: ['target', { vi: 'native' }] }))
      .toMatchObject({ options: ['target', { vi: 'native' }] });
  });

  it.each([{}, { vi: '' }, { vi: ' padded ' }, { 'VI': 'text' }, 1, null])(
    'rejects malformed localized choice option %#', (option) => {
      expect(questionSchema.safeParse({ ...question(), options: ['target', option] }).success).toBe(false);
    },
  );

  it('accepts typed answers and preserves both display group and category', () => {
    const { options: _options, correctIndex: _index, ...base } = question();
    const typed = { ...base, kind: 'typed', acceptedAnswers: ['answer', 'variant'] };
    expect(questionSchema.parse(typed)).toEqual(typed);
    expect(questionSchema.parse(question())).toMatchObject({ kind: 'choice', group: 'group-1', category: 'category-1' });
  });

  it.each([
    { acceptedAnswers: [] }, { acceptedAnswers: [''] }, { acceptedAnswers: [' answer '] },
    { acceptedAnswers: [{ vi: 'answer' }] }, { options: ['a', 'b'] }, { correctIndex: 0 },
  ])('rejects malformed typed question %#', (fields) => {
    const { options: _options, correctIndex: _index, ...base } = question();
    expect(questionSchema.safeParse({ ...base, kind: 'typed', acceptedAnswers: ['answer'], ...fields }).success).toBe(false);
  });

  it.each([undefined, 'display-category', null])('rejects missing or free-form question kind %#', (kind) => {
    expect(questionSchema.safeParse({ ...question(), kind }).success).toBe(false);
  });

  it('rejects typed fields on choice questions and missing required answer fields', () => {
    expect(questionSchema.safeParse({ ...question(), acceptedAnswers: ['answer'] }).success).toBe(false);
    for (const key of ['options', 'correctIndex']) {
      const value = { ...question() }; Reflect.deleteProperty(value, key);
      expect(questionSchema.safeParse(value).success).toBe(false);
    }
    expect(questionSchema.safeParse({ id: 'typed', provenance, kind: 'typed', prompt: 'Prompt' }).success).toBe(false);
  });

  it('requires a course code on every stage', () => {
    const stage = { ...validPack().stages[0] }; Reflect.deleteProperty(stage, 'courseCode');
    expect(stageSchema.safeParse(stage).success).toBe(false);
  });

  it.each(['stages', 'vocab', 'lessons', 'quests', 'placement', 'assessments', 'nested'] as const)(
    'accepts namespaced per-record extensions on %s', (collection) => {
      const pack = validPack();
      const record = collection === 'nested' ? pack.lessons[0]!.questions[0]! : pack[collection][0]!;
      Object.assign(record, { extensions: { 'qaa:details': { value: true } } });
      expect(contentPackSchema.safeParse(pack).success).toBe(true);
    },
  );

  it.each(['stages', 'vocab', 'lessons', 'quests', 'placement', 'assessments', 'nested'] as const)(
    'rejects malformed per-record extension keys on %s', (collection) => {
      const pack = validPack();
      const record = collection === 'nested' ? pack.lessons[0]!.questions[0]! : pack[collection][0]!;
      Object.assign(record, { extensions: { details: null } });
      expect(contentPackSchema.safeParse(pack).success).toBe(false);
    },
  );

  it.each(['', ' ', ' padded', 'padded ', '\tline\n'])('rejects untrimmed or empty ids, headwords and localized values %#', (text) => {
    expect(stageSchema.safeParse({ ...validPack().stages[0], id: text }).success).toBe(false);
    expect(vocabSchema.safeParse({ ...validPack().vocab[0], headword: text }).success).toBe(false);
    expect(localizedTextSchema.safeParse({ vi: text }).success).toBe(false);
  });

  it('rejects an empty localized map and accepts trimmed multiword text', () => {
    expect(localizedTextSchema.safeParse({}).success).toBe(false);
    expect(localizedTextSchema.safeParse({ vi: 'two words' }).success).toBe(true);
  });
});

describe('curriculum schema additions', () => {
  const unit = () => curriculumPack().units![0]!;
  const day = () => curriculumPack().days![0]!;
  const test = () => curriculumPack().tests![1]!;
  const review = { status: 'approved', reviewerRoles: ['native'], date: '2026-11-02' };

  it('parses a pack that uses every new collection and field without changing its shape', () => {
    const pack = curriculumPack();
    expect(contentPackSchema.parse(pack)).toEqual(pack);
  });

  it('keeps every new collection optional so existing packs still parse', () => {
    const pack = validPack();
    for (const key of ['units', 'days', 'tests']) expect(pack).not.toHaveProperty(key);
    expect(contentPackSchema.safeParse(pack).success).toBe(true);
  });

  it.each([
    { kind: 'objective', text: { vi: 'Goal' } },
    { kind: 'explanation', text: { vi: 'Explain' } },
    { kind: 'explanation', text: { vi: 'Explain' }, pattern: 'a + b' },
    { kind: 'mistake', wrong: 'wrong', right: 'right', note: { vi: 'Note' } },
    { kind: 'tip', text: { vi: 'Tip' } },
    { kind: 'example', text: 'Sample', transcription: '/s/' },
    { kind: 'example', text: 'Sample', vocabIds: ['word-1'] },
  ])('accepts new block shape %#', (block) => {
    expect(lessonBlockSchema.safeParse(block).success).toBe(true);
  });

  it.each([
    { kind: 'objective', text: 'Plain string' }, { kind: 'objective' },
    { kind: 'explanation', text: { vi: 'Explain' }, pattern: '' },
    { kind: 'explanation', text: { vi: 'Explain' }, pattern: { vi: 'localized' } },
    { kind: 'mistake', wrong: 'wrong', right: 'right' }, { kind: 'mistake', wrong: '', right: 'right', note: { vi: 'Note' } },
    { kind: 'mistake', wrong: 'wrong', right: { vi: 'right' }, note: { vi: 'Note' } },
    { kind: 'tip', text: 'Plain string' }, { kind: 'tip', text: { vi: 'Tip' }, extra: true },
    { kind: 'example', text: 'Sample', transcription: '' }, { kind: 'example', text: 'Sample', vocabIds: [''] },
  ])('rejects malformed new block shape %#', (block) => {
    expect(lessonBlockSchema.safeParse(block).success).toBe(false);
  });

  it.each([
    { titles: { vi: 'Title' } }, { unitId: 'unit-1' }, { order: 0 }, { vocabIds: ['word-1'], reviewVocabIds: ['word-2'] },
  ])('accepts new lesson fields %#', (fields) => {
    expect(lessonSchema.safeParse({ ...validPack().lessons[0], ...fields }).success).toBe(true);
  });

  it.each([{ titles: {} }, { titles: 'Title' }, { unitId: '' }, { order: -1 }, { order: 1.5 }, { reviewVocabIds: [''] }])(
    'rejects malformed new lesson fields %#', (fields) => {
      expect(lessonSchema.safeParse({ ...validPack().lessons[0], ...fields }).success).toBe(false);
    },
  );

  it.each([
    { status: 'ai-draft', reviewerRoles: [], date: '2026-11-02' },
    { status: 'dev-checked', reviewerRoles: ['developer'], date: '2026-11-02T07:00:00+07:00' },
    { status: 'native-reviewed', reviewerRoles: ['native'], date: '2026-11-02T00:00:00Z' },
    { status: 'vi-reviewed', reviewerRoles: ['native', 'editor'], date: '2026-11-02' },
    { status: 'approved', reviewerRoles: ['native', 'editor'], date: '2026-11-02' },
  ])('accepts review %#', (value) => {
    expect(reviewSchema.safeParse(value).success).toBe(true);
    expect(stageSchema.safeParse({ ...validPack().stages[0], review: value }).success).toBe(true);
  });

  it.each([
    { status: 'done' }, { status: 'Approved' }, { reviewerRoles: 'native' }, { reviewerRoles: [''] }, { reviewerRoles: undefined },
    { date: 'yesterday' }, { date: '2026-02-30' }, { date: '' }, { date: undefined }, { extra: true },
  ])('rejects malformed review %#', (fields) => {
    const value = { ...review, ...fields };
    expect(reviewSchema.safeParse(value).success).toBe(false);
    expect(stageSchema.safeParse({ ...validPack().stages[0], review: value }).success).toBe(false);
  });

  it('allows review on every record type', () => {
    const records = [
      [unitSchema, unit()], [daySchema, day()], [testSchema, test()], [vocabSchema, validPack().vocab[0]!], [questSchema, validPack().quests[0]!],
    ] as const;
    for (const [schema, record] of records) expect(schema.safeParse({ ...record, review }).success).toBe(true);
  });

  it('accepts a unit and rejects malformed units', () => {
    expect(unitSchema.safeParse(unit()).success).toBe(true);
    expect(unitSchema.safeParse({ ...unit(), canDo: [] }).success).toBe(true);
    for (const fields of [{ stageId: '' }, { order: -1 }, { order: 0.5 }, { titles: {} }, { canDo: ['plain'] }, { canDo: [{}] }]) {
      expect(unitSchema.safeParse({ ...unit(), ...fields }).success).toBe(false);
    }
    const missing = { ...unit() }; Reflect.deleteProperty(missing, 'canDo');
    expect(unitSchema.safeParse(missing).success).toBe(false);
  });

  it('accepts a day with or without side quests and rejects malformed days', () => {
    expect(daySchema.safeParse(day()).success).toBe(true);
    expect(daySchema.safeParse({ ...day(), sideQuestIds: ['quest-2'] }).success).toBe(true);
    expect(daySchema.safeParse({ ...day(), mainQuestIds: [] }).success).toBe(true);
    for (const fields of [{ day: 0 }, { day: 1.5 }, { stageId: '' }, { unitId: '' }, { testId: '' }, { mainQuestIds: [''] }, { sideQuestIds: [1] }]) {
      expect(daySchema.safeParse({ ...day(), ...fields }).success).toBe(false);
    }
    const missing = { ...day() }; Reflect.deleteProperty(missing, 'testId');
    expect(daySchema.safeParse(missing).success).toBe(false);
  });

  it.each([{ kind: 'daily' }, { kind: 'unit' }, { passRatio: 1 }, { passRatio: 0.01 }, { questionIds: [] }])(
    'accepts test fields %#', (fields) => {
      expect(testSchema.safeParse({ ...test(), ...fields }).success).toBe(true);
    },
  );

  it.each([{ kind: 'weekly' }, { passRatio: 0 }, { passRatio: 1.01 }, { passRatio: NaN }, { questionIds: [''] }, { reviewVocabIds: [''] }])(
    'rejects malformed test fields %#', (fields) => {
      expect(testSchema.safeParse({ ...test(), ...fields }).success).toBe(false);
    },
  );

  it.each(['units', 'days', 'tests'] as const)('rejects a malformed %s collection', (collection) => {
    expect(contentPackSchema.safeParse({ ...curriculumPack(), [collection]: [{ id: 'x' }] }).success).toBe(false);
    expect(contentPackSchema.safeParse({ ...curriculumPack(), [collection]: 'x' }).success).toBe(false);
  });
});
