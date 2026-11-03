import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { provenanceSchema, validateContentPack } from '@solo/content-schema';
import type { ContentRecord, ContentValidationContext, Lesson, Question, Quest, Stage, Vocab } from '@solo/content-schema';
import { checkContentHygiene } from '@solo/content-schema/testing';
import type { Messages } from '@solo/language-sdk';
import language from '../src/index.ts';
import pack from '../src/content/index.ts';
import { extensionSchemas, extensionValidators } from '../src/content/extension-schemas.ts';
import type { ExtensionKey } from '../src/content/extension-schemas.ts';
import { isNativeText } from './fixtures/native-text.ts';
import { extensionOccurrences } from './fixtures/occurrences.ts';
import { AUTHORED_AT, ATTRIBUTION, LEGACY_RETRIEVED_AT, LEGACY_VERSION, LICENSE } from '../src/content/provenance.ts';
import { hskVocabManifest } from '../src/content/manifest/hsk.ts';

// Derived from the module's declarations, so the content is validated against what the module really declares.
const context: ContentValidationContext = {
  language: language.manifest.code,
  skills: language.skills.map((skill) => skill.id),
  levels: Object.fromEntries(language.levelFrameworks.map((framework) => [framework.code, framework.levels.map((level) => level.code)])),
  courses: Object.fromEntries(language.courses.map((course) => [course.code, { framework: course.framework, levels: course.levels }])),
};
const validate = (value: unknown, extensions = extensionValidators) => validateContentPack(value, context, { extensions });
const hygiene = (value: unknown) => checkContentHygiene(value, { nativeLocales: ['vi'], isNativeText });
// A mutable deep copy for negative tests.
const copy = (): any => structuredClone(pack);
const paths = (issues: readonly { path: readonly (string | number)[] }[]) => issues.map((issue) => JSON.stringify(issue.path));

function records(value: unknown): ContentRecord[] {
  if (value === null || typeof value !== 'object') return [];
  const current = 'id' in value ? [value as ContentRecord] : [];
  return [...current, ...Object.values(value).flatMap(records)];
}

const sourceText = new Map<string, string>();
function mockup(file: string): string {
  if (!sourceText.has(file)) sourceText.set(file, readFileSync(new URL(`../../../${file}`, import.meta.url), 'utf8'));
  return sourceText.get(file)!;
}

const occurrences = extensionOccurrences(pack);
// Typed against the shared schema so the per-record shapes can be inspected without the literal data types.
const stages: readonly Stage[] = pack.stages;
const vocab: readonly Vocab[] = pack.vocab;
const lessons: readonly Lesson[] = pack.lessons;
const quests: readonly Quest[] = pack.quests;
const placement: readonly Question[] = pack.placement;
const assessments: readonly Question[] = pack.assessments;
const extensionOf = (location: string, key: ExtensionKey) => occurrences.filter((item) => item.location === location && item.key === key);
const questions: readonly Question[] = [
  ...lessons.flatMap((lesson) => lesson.questions),
  ...placement,
  ...assessments,
];

describe('Chinese content pack', () => {
  it('validates with the declared module context and every extension validator in one call', () => {
    expect(validate(pack)).toEqual([]);
  });

  it('reports bad course references, a missing extension validator and extension violations with full paths', () => {
    const wrongCourse = copy();
    wrongCourse.stages[1].courseCode = 'unknown';
    expect(paths(validate(wrongCourse))).toContain(JSON.stringify(['stages', 1, 'courseCode']));

    const wrongLevel = copy();
    wrongLevel.stages[2].levelCode = 'HSK9';
    expect(paths(validate(wrongLevel))).toContain(JSON.stringify(['stages', 2, 'levelCode']));

    const wrongFramework = copy();
    wrongFramework.stages[2].frameworkCode = 'cefr';
    expect(paths(validate(wrongFramework))).toContain(JSON.stringify(['stages', 2, 'frameworkCode']));

    const { 'zh:icon': _omitted, ...withoutIcon } = extensionValidators;
    expect(paths(validate(pack, withoutIcon as typeof extensionValidators))).toContain(JSON.stringify(['quests', 0, 'extensions', 'zh:icon']));

    const brokenExtension = copy();
    brokenExtension.stages[1].extensions['zh:roadmap-band'].hours = -1;
    expect(paths(validate(brokenExtension))).toContain(JSON.stringify(['stages', 1, 'extensions', 'zh:roadmap-band', 'hours']));

    const foreign = copy();
    foreign.stages[0].extensions['en:note'] = 'x';
    expect(paths(validate(foreign))).toContain(JSON.stringify(['stages', 0, 'extensions', 'en:note']));

    const otherLanguage = copy();
    otherLanguage.language = 'en';
    expect(paths(validate(otherLanguage))).toContain(JSON.stringify(['language']));
  });

  it('passes the shared content hygiene audit with the module native-text heuristic', () => {
    expect(hygiene(pack)).toEqual([]);
  });

  it('flags native-language text left in plain-string fields, unresolved templates and HTML', () => {
    const nativeIcon = copy();
    nativeIcon.quests[0].extensions['zh:icon'] = 'Cảm ơn';
    expect(paths(hygiene(nativeIcon))).toContain(JSON.stringify(['quests', 0, 'extensions', 'zh:icon']));

    const html = copy();
    html.lessons[0].blocks[0].text.vi = 'Chữ <b>ü</b>';
    expect(paths(hygiene(html))).toContain(JSON.stringify(['lessons', 0, 'blocks', 0, 'text', 'vi']));

    const template = copy();
    template.vocab[0].examples[0].text = '你好${name}';
    expect(paths(hygiene(template))).toContain(JSON.stringify(['vocab', 0, 'examples', 0, 'text']));
  });

  it('tells Vietnamese from pinyin, Han text and digits', () => {
    for (const vietnamese of ['Cảm ơn', 'Tạm biệt', 'Đi từ thấp lên cao', 'Gần như, xấp xỉ', 'ngã']) {
      expect(isNativeText(vietnamese), vietnamese).toBe(true);
    }
    for (const target of ['nǐ hǎo', 'xièxie', 'lǜ', 'Zàijiàn, péngyou!', 'ü', '你好，老师！', '123', 'mā má mǎ mà']) {
      expect(isNativeText(target), target).toBe(false);
    }
  });

  it('preserves the pack across JSON serialization', () => {
    expect(JSON.parse(JSON.stringify(pack))).toEqual(pack);
  });

  it('has complete owner-approved provenance on every record: legacy mockup records share one extraction run, authored records another', () => {
    const all = records(pack);
    const legacy = all.filter((item) => item.provenance.version === LEGACY_VERSION);
    const authoredRecords = all.filter((item) => item.provenance.version === 'curriculum-v1');
    expect(legacy.length + authoredRecords.length).toBe(all.length);
    expect(legacy).toHaveLength(60);
    expect(new Set(legacy.map((item) => item.provenance.retrievedAt))).toEqual(new Set([LEGACY_RETRIEVED_AT]));
    expect(new Set(authoredRecords.map((item) => item.provenance.retrievedAt))).toEqual(new Set([AUTHORED_AT]));
    for (const item of all) {
      expect(provenanceSchema.safeParse(item.provenance).success, item.id).toBe(true);
      expect(item.provenance.license).toBe(LICENSE);
      expect(item.provenance.attribution).toBe(ATTRIBUTION);
      expect(item.provenance.source.item).toBeDefined();
    }
    for (const item of legacy) {
      expect(item.provenance.source.line).toBeGreaterThan(0);
      const sourceLines = mockup(item.provenance.source.file).split(/\r?\n/u);
      expect(sourceLines[item.provenance.source.line! - 1], item.id).toContain(item.provenance.source.declaration);
      expect(item.review, item.id).toBeUndefined();
    }
    const authoredFiles = new Map<string, string>();
    for (const item of authoredRecords) {
      expect(item.provenance.source.file, item.id).toMatch(/^languages\/zh\/src\/content\/(?:foundation|hsk1|manifest)\/[a-z0-9]+\.ts$/u);
      if (!authoredFiles.has(item.provenance.source.file)) {
        authoredFiles.set(item.provenance.source.file, readFileSync(new URL(`../../../${item.provenance.source.file}`, import.meta.url), 'utf8'));
      }
      expect(authoredFiles.get(item.provenance.source.file), item.id).toContain(item.provenance.source.declaration);
      expect(item.review, item.id).toEqual({ status: 'ai-draft', reviewerRoles: [], date: '2026-11-03' });
    }
    // Curriculum records point at the unit file that authors them; vocabulary at the frozen manifest.
    for (const lesson of lessons) expect(lesson.provenance.source.file).toBe('languages/zh/src/content/foundation/n1.ts');
    expect(new Set(vocab.map((word) => word.provenance.source.file))).toEqual(new Set(['languages/zh/src/content/manifest/hsk.ts']));
  });

  it('traces every localized and target-language string of a mockup record to the mockup file it cites', () => {
    const targetKeys = new Set(['headword', 'text', 'pinyin', 'examplePinyin', 'character', 'reading', 'collocations', 'options', 'mark', 'vowel']);
    // The one deliberate edit: the mockup sentence pointed at a control below the text (see SOURCE.md).
    const neutralised = 'Nhìn kỹ cặp u và ü: hai chấm là một phần của chữ ü, không phải dấu thanh. Bài sau mình mới thêm dấu thanh lên nguyên âm. Bạn có thể viết thử hai chữ u và ü.';
    const missing: string[] = [];
    let traced = 0;
    const walk = (value: unknown, file: string | undefined, targeted: boolean): void => {
      if (typeof value === 'string') {
        if (!targeted || !file || value === neutralised) return;
        traced++;
        // Example blocks join the source columns with a middle dot.
        for (const part of value.split(' · ')) if (!mockup(file).includes(part)) missing.push(`${file}: ${part}`);
        return;
      }
      if (value === null || typeof value !== 'object') return;
      if (Array.isArray(value)) { value.forEach((child) => walk(child, file, targeted)); return; }
      const object = value as Record<string, unknown>;
      // Authored records are checked by the curriculum tests; only mockup-extracted records trace to the mockup.
      if ((object['provenance'] as { version?: string } | undefined)?.version === 'curriculum-v1') return;
      const here = (object['provenance'] as { source: { file: string } } | undefined)?.source.file ?? file;
      const entries = Object.entries(object);
      const localeMap = entries.length > 0 && entries.every(([key, child]) => /^[a-z]{2,3}$/u.test(key) && typeof child === 'string');
      for (const [key, child] of entries) {
        if (key !== 'provenance' && key !== 'id') walk(child, here, localeMap || targetKeys.has(key));
      }
    };
    walk(pack, undefined, false);
    expect(missing).toEqual([]);
    expect(traced).toBeGreaterThan(150);
  });
});

describe('Chinese content ids', () => {
  it('are unique across the whole pack, including questions and nested extension records', () => {
    const ids = records(pack).map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('are stable ASCII ids of the form zh:<kind>:<slug>', () => {
    for (const item of records(pack)) expect(item.id, item.id).toMatch(/^zh:[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/u);
  });

  it('name stages by HSK level and vocabulary by the frozen manifest, keeping the legacy ids', () => {
    expect(stages.map((stage) => stage.id)).toEqual([
      'zh:stage:foundation', 'zh:stage:hsk1', 'zh:stage:hsk2', 'zh:stage:hsk3',
      'zh:stage:hsk4', 'zh:stage:hsk5', 'zh:stage:hsk6', 'zh:stage:hsk7-9',
    ]);
    expect(vocab.map((word) => word.id)).toEqual(hskVocabManifest.map((row) => row.id));
    for (const id of ['ni-hao', 'xiexie', 'zaijian', 'ren', 'xuesheng', 'pengyou', 'shui', 'shu']) {
      expect(vocab.map((word) => word.id)).toContain(`zh:vocab:${id}`);
    }
  });

  it('never depend on array position', () => {
    for (const word of vocab) expect(word.id).toMatch(/^zh:vocab:[a-z]+(?:-[a-z]+)*$/u);
    for (const stage of stages) {
      expect(stage.id).toBe(`zh:stage:${stage.levelCode === null ? 'foundation' : stage.levelCode.toLowerCase()}`);
    }
    for (const tone of pack.extensions['zh:tones']) expect(tone.id).toBe(`zh:tone:${tone.number}`);
    expect(placement.map((question) => question.id)).toEqual(placement.map((question) => `zh:placement:${question.category}`));
  });
});

describe('Chinese content reconciliation', () => {
  it('reconciles the kept mockup datasets with the mockup and the new curriculum with the plan', () => {
    const tones = pack.extensions['zh:tones'];
    const groups = pack.extensions['zh:roadmap'].groups;
    const exercises = pack.extensions['zh:tone-exercises'];
    expect(stages).toHaveLength(8); // language.js hskNames
    expect(placement).toHaveLength(8); // onboarding-course.js quiz
    expect(pack.extensions['zh:characters']).toHaveLength(6); // language.js chars
    expect(tones).toHaveLength(4); // chinese-foundation.js tones
    expect(tones.flatMap((tone) => tone.variants)).toHaveLength(4); // language.js tones
    expect(extensionOf('stage', 'zh:roadmap-band')).toHaveLength(8); // hsk-roadmap.js bands
    expect(groups).toHaveLength(4); // hsk-roadmap.js stages
    expect(extensionOf('stage', 'zh:onboarding-band')).toHaveLength(8); // onboarding-course.js bands
    expect(extensionOf('placement', 'zh:category-label')).toHaveLength(8); // onboarding-course.js quiz kinds
    expect(exercises.filter((exercise) => exercise.mode === 'guided')).toHaveLength(3); // chinese-foundation.js guided
    expect(exercises.filter((exercise) => exercise.mode === 'check')).toHaveLength(5); // chinese-foundation.js checks
    expect(pack.extensions['zh:placement-routing'].routeStageIds).toHaveLength(5); // onboarding-course.js propose
    expect(records(pack).filter((item) => item.provenance.version === LEGACY_VERSION)).toHaveLength(60);
    // The mockup vocabulary, lessons, quests, assessments, variants and writing samples are replaced by the curriculum.
    expect(vocab).toHaveLength(hskVocabManifest.length);
    expect(lessons).toHaveLength(12);
    expect(quests).toHaveLength(18);
    expect(assessments).toHaveLength(60);
    expect(lessons.flatMap((lesson) => lesson.questions)).toHaveLength(102);
    expect(tones[1]?.glosses).toEqual({ vi: 'cây gai' });
    expect(tones[1]?.variants[0]?.glosses).toEqual({ vi: 'gai' });
  });

  it('keeps the mockup numbers of the HSK roadmap, and counts remain unverified', () => {
    const bands = stages.map((stage) => extensionSchemas['zh:roadmap-band'].parse(stage.extensions?.['zh:roadmap-band']));
    expect(bands.map((band) => band.hours)).toEqual([15, 60, 80, 120, 180, 250, 300, 600]);
    expect(bands.map((band) => band.short)).toEqual(['P0', '1', '2', '3', '4', '5', '6', '7–9']);
    expect(bands[0]?.counts).toBeUndefined();
    expect(bands.slice(1).map((band) => band.counts)).toEqual([
      { syllables: 269, characters: 300, words: 500, grammarPoints: 48, handwrittenCharacters: 100, verified: false },
      { syllables: 468, characters: 600, words: 1272, grammarPoints: 129, handwrittenCharacters: 200, verified: false },
      { syllables: 608, characters: 900, words: 2245, grammarPoints: 210, handwrittenCharacters: 300, verified: false },
      { syllables: 724, characters: 1200, words: 3245, grammarPoints: 286, handwrittenCharacters: 400, verified: false },
      { syllables: 822, characters: 1500, words: 4316, grammarPoints: 357, handwrittenCharacters: 500, verified: false },
      { syllables: 908, characters: 1800, words: 5456, grammarPoints: 424, handwrittenCharacters: 600, verified: false },
      { syllables: 1110, characters: 3000, words: 11092, grammarPoints: 572, handwrittenCharacters: 1200, verified: false },
    ]);
    expect(pack.extensions['zh:roadmap'].standard).toBe('GF0025-2021');
    expect(pack.extensions['zh:roadmap'].countsVerified).toBe(false);
    expect(pack.extensions['zh:roadmap'].hoursAreEstimates).toBe(true);
  });

  it('keeps band and onboarding names identical to the stage label they sit on', () => {
    expect(stages.map((stage) => stage.labels)).toEqual([
      { vi: 'Nền tảng' }, { vi: 'HSK 1' }, { vi: 'HSK 2' }, { vi: 'HSK 3' },
      { vi: 'HSK 4' }, { vi: 'HSK 5' }, { vi: 'HSK 6' }, { vi: 'HSK 7–9' },
    ]);
    for (const stage of stages) {
      expect(stage.extensions?.['zh:roadmap-band']).not.toHaveProperty('labels');
      expect(stage.extensions?.['zh:onboarding-band']).not.toHaveProperty('labels');
    }
  });
});

describe('Chinese content structure', () => {
  it('declares every extension in one place and puts each on the record kind it describes', () => {
    const expected: Record<ExtensionKey, string | string[]> = {
      'zh:tones': 'pack', 'zh:characters': 'pack', 'zh:tone-exercises': 'pack', 'zh:roadmap': 'pack', 'zh:placement-routing': 'pack',
      'zh:roadmap-band': 'stage', 'zh:onboarding-band': 'stage',
      'zh:topic': 'vocab', 'zh:collocation-translations': 'vocab', 'zh:variants': 'vocab',
      'zh:icon': 'quest', 'zh:reason': 'quest', 'zh:character-ids': 'quest',
      'zh:writing-samples': 'lesson', 'zh:category-label': 'placement',
      'zh:answer-mode': ['lesson-question', 'assessment'], 'zh:test-policy': 'quest', 'zh:activity': 'quest',
      'zh:listening': 'lesson-question',
    };
    // Reserved for records the side and HSK1 units will author; their schemas are tested with fixtures.
    const reserved: ExtensionKey[] = ['zh:topic', 'zh:collocation-translations', 'zh:variants', 'zh:character-ids', 'zh:writing-samples', 'zh:activity'];
    expect(Object.keys(extensionSchemas).sort()).toEqual(Object.keys(expected).sort());
    expect(Object.keys(extensionValidators).sort()).toEqual(Object.keys(expected).sort());
    for (const item of occurrences) expect([expected[item.key as ExtensionKey]!].flat(), item.key).toContain(item.location);
    for (const key of Object.keys(expected)) expect(occurrences.some((item) => item.key === key), key).toBe(!reserved.includes(key as ExtensionKey));
  });

  it('validates each extension value against its own schema without discarding extracted data', () => {
    for (const item of occurrences) {
      const schema = extensionSchemas[item.key as ExtensionKey];
      expect(schema.parse(item.value), item.key).toEqual(item.value);
    }
  });

  it('models foundation as a stage of the HSK course with no HSK level', () => {
    expect(stages.every((stage) => stage.courseCode === 'hsk' && stage.frameworkCode === 'hsk-3.0')).toBe(true);
    expect(stages.map((stage) => stage.levelCode)).toEqual([null, 'HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6', 'HSK7-9']);
    expect(stages.map((stage) => stage.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    const foundation = 'zh:stage:foundation';
    expect(vocab.every((word) => word.levelCode === undefined && (word.stageId === undefined || word.stageId === foundation))).toBe(true);
    expect(vocab.filter((word) => word.stageId === foundation).map((word) => word.id)).toEqual(hskVocabManifest.filter((row) => row.unitId === 'zh:unit:n1').map((row) => row.id));
    expect(lessons.every((lesson) => lesson.stageId === foundation)).toBe(true);
    expect(quests.every((quest) => quest.stageId === foundation)).toBe(true);
    expect(quests.every((quest) => quest.id !== 'zh:quest:write')).toBe(true);
  });

  it('resolves extension references into shared collections and other extensions', () => {
    const stageIds = stages.map((stage) => stage.id);
    const vocabIds = vocab.map((word) => word.id);
    const characterIds = pack.extensions['zh:characters'].map((character) => character.id);
    const toneIds = pack.extensions['zh:tones'].map((tone) => tone.id);
    const groupIds = pack.extensions['zh:roadmap'].groups.map((group) => group.id);
    const routing = pack.extensions['zh:placement-routing'];
    for (const item of extensionOf('lesson', 'zh:writing-samples')) {
      for (const sample of extensionSchemas['zh:writing-samples'].parse(item.value)) {
        for (const id of sample.vocabIds) expect(vocabIds).toContain(id);
        for (const id of sample.characterIds) expect(characterIds).toContain(id);
      }
    }
    for (const character of pack.extensions['zh:characters']) for (const id of character.vocabIds) expect(vocabIds).toContain(id);
    for (const item of extensionOf('quest', 'zh:character-ids')) for (const id of item.value as string[]) expect(characterIds).toContain(id);
    for (const exercise of pack.extensions['zh:tone-exercises']) expect(toneIds).toContain(exercise.toneId);
    for (const item of extensionOf('stage', 'zh:roadmap-band')) expect(groupIds).toContain(extensionSchemas['zh:roadmap-band'].parse(item.value).groupId);
    for (const id of routing.routeStageIds) expect(stageIds).toContain(id);
    expect(stageIds).toContain(routing.foundationStageId);
    expect(lessons.find((lesson) => lesson.id === 'zh:lesson:vocab')?.vocabIds).toEqual(vocab.slice(0, 6).map((word) => word.id));
  });

  it('routes placement to the module placement levels, as orientation only', () => {
    const routing = pack.extensions['zh:placement-routing'];
    const levelOf = new Map(stages.map((stage) => [stage.id, stage.levelCode]));
    expect(routing.orientationOnly).toBe(true);
    expect(levelOf.get(routing.foundationStageId)).toBeNull();
    expect(routing.routeStageIds.map((id) => levelOf.get(id)).filter((level) => level !== null)).toEqual(language.placement!.levels);
  });

  it('keeps vocabulary details on the vocabulary record they describe', () => {
    for (const word of vocab) {
      const row = hskVocabManifest.find((item) => item.id === word.id)!;
      expect(word.fields['pinyin']).toBe(row.pinyin);
      expect(word.glosses).toEqual(row.glosses);
      if (row.note === undefined) expect(word.notes).toBeUndefined(); else expect(word.notes).toEqual({ vi: row.note });
    }
    const greeting = vocab[0]!;
    expect(greeting.id).toBe('zh:vocab:ni-hao');
    expect(greeting.headword).toBe('你好');
    expect(greeting.examples).toEqual([{ text: '你好！', translations: { vi: 'Xin chào!' } }]);
    expect(vocab.find((word) => word.id === 'zh:vocab:dui-bu-qi')?.notes?.['vi']).toContain('bù');
  });

  it('keeps a quest icon and reason on each main quest, and the test quests carry their policy', () => {
    const quest = (id: string) => quests.find((item) => item.id === id)!;
    const main = quests.filter((item) => item.lessonIds.length > 0);
    expect(main.map((item) => item.extensions?.['zh:icon'])).toEqual(['ü', '〰', 'bp', 'jq', 'zh', 'ai', 'ng', '·', '3·3', '不', 'yw', '你']);
    expect(quest('zh:quest:tone').extensions?.['zh:reason']).toEqual({ vi: 'Cùng âm “ma”, bốn thanh cho bốn nghĩa khác nhau.' });
    expect(main.every((item) => item.optional === false && item.xp === 10)).toBe(true);
    expect(quests.filter((item) => item.lessonIds.length === 0).every((item) => item.extensions?.['zh:test-policy'] !== undefined && item.xp === 20)).toBe(true);
  });

  it('declares every extracted vocabulary field and supplies all required ones', () => {
    const declared = language.vocabFields!.map((field) => field.id);
    const required = language.vocabFields!.filter((field) => 'required' in field && field.required).map((field) => field.id);
    for (const word of vocab) {
      for (const field of Object.keys(word.fields)) expect(declared).toContain(field);
      for (const field of required) expect(word.fields[field]?.length).toBeGreaterThan(0);
    }
  });
});

describe('Chinese questions', () => {
  it('are choice questions in the mockup placement and mixed choice/typed in the curriculum, each typed one with a mode', () => {
    expect(placement).toHaveLength(8);
    for (const question of placement) {
      expect(question.kind, question.id).toBe('choice');
      expect(question).not.toHaveProperty('acceptedAnswers');
    }
    const curriculum = [...lessons.flatMap((lesson) => lesson.questions), ...assessments];
    expect(curriculum.some((question) => question.kind === 'typed')).toBe(true);
    for (const question of curriculum) {
      if (question.kind === 'typed') expect(extensionSchemas['zh:answer-mode'].safeParse(question.extensions?.['zh:answer-mode']).success, question.id).toBe(true);
      else expect(question.extensions?.['zh:answer-mode']).toBeUndefined();
    }
  });

  it('have a valid answer index and options that are localized unless they are target-language text', () => {
    for (const question of questions) {
      if (question.kind !== 'choice') continue;
      expect(Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex < question.options.length, question.id).toBe(true);
      for (const option of question.options) {
        if (typeof option === 'string') expect(isNativeText(option), `${question.id}: ${option}`).toBe(false);
        else expect(Object.keys(option), question.id).toEqual(['vi']);
      }
    }
  });

  it('keep Han and pinyin as plain options and localize every gloss option in the placement questions', () => {
    const plain = new Set<string>();
    const localized = new Set<string>();
    for (const question of placement) {
      if (question.kind !== 'choice') continue;
      for (const option of question.options) {
        if (typeof option === 'string') plain.add(option); else localized.add(option['vi']!);
      }
    }
    expect([...plain].sort()).toEqual(['ní hào', 'nín hāo', 'nǐ hǎo', '但是', '如果', '很高', '所以', '最高', '高'].sort());
    expect(localized).toEqual(new Set([
      'Phụ âm đầu', 'Thanh điệu', 'Nguyên âm', 'Cảm ơn', 'Xin lỗi', 'Tạm biệt', 'Tôi đi học.', 'Tôi là học sinh.', 'Tôi có sách.',
      'Nguyên nhân – kết quả', 'Tương phản', 'Điều kiện', 'Rất khác nhau', 'Không đủ', 'Gần như, xấp xỉ',
    ]));
  });

  it('keep the placement tier in group and the stable kind in category, with the label as an extension', () => {
    expect(placement.map((question) => question.group)).toEqual(['0', '0', '1', '1', '2', '2', '3', '3']);
    expect(placement.map((question) => question.category)).toEqual([
      'tone-distinction', 'pinyin', 'vocabulary-hsk1', 'simple-sentence', 'comparison', 'conjunction', 'advanced-conjunction', 'vocabulary',
    ]);
    expect(placement.map((question) => question.extensions?.['zh:category-label'])).toEqual([
      { vi: 'Thanh điệu' }, { vi: 'Pinyin' }, { vi: 'Từ vựng HSK 1' }, { vi: 'Câu đơn' },
      { vi: 'Ngữ pháp so sánh' }, { vi: 'Liên từ' }, { vi: 'Liên từ nâng cao' }, { vi: 'Từ vựng' },
    ]);
    expect(placement.map((question) => (question.kind === 'choice' ? question.correctIndex : -1))).toEqual([1, 2, 0, 1, 2, 0, 1, 2]);
  });
});

describe('Chinese content loaders', () => {
  it('load the pack and the Vietnamese messages through the module public loaders', async () => {
    expect(await language.content!()).toEqual(pack);
    const messages: Messages = await language.i18n!['vi']!();
    expect(Object.keys(messages).length).toBeGreaterThan(0);
  });
});
