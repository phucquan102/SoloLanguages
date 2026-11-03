import { describe, expect, it } from 'vitest';
import { validateContentPack } from '../src/index.ts';
import type { ContentValidationContext } from '../src/index.ts';
import { curriculumContext, curriculumPack } from './fixtures/curriculum.ts';
import { context, question, validPack, validationOptions } from './fixtures/pack.ts';

function expectIssue(pack: unknown, path: (string | number)[], message?: string) {
  expect(validateContentPack(pack, context, validationOptions)).toEqual(expect.arrayContaining([
    expect.objectContaining({ path, ...(message ? { message: expect.stringContaining(message) } : {}) }),
  ]));
}

describe('validateContentPack', () => {
  it('accepts a complete pack with resolved references and foundation stages', () => {
    expect(validateContentPack(validPack(), context, validationOptions)).toEqual([]);
  });

  it('preserves valid data through a JSON round-trip without mutating input', () => {
    const pack = validPack();
    const before = JSON.stringify(pack);
    const roundTrip: unknown = JSON.parse(before);
    expect(roundTrip).toEqual(pack);
    expect(validateContentPack(pack, context, validationOptions)).toEqual([]);
    expect(validateContentPack(roundTrip, context, validationOptions)).toEqual([]);
    expect(JSON.stringify(pack)).toBe(before);
  });

  it.each(['stages', 'vocab', 'lessons', 'quests', 'placement', 'assessments'] as const)(
    'rejects duplicate ids in %s', (collection) => {
      const pack = validPack();
      const records: { id: string }[] = pack[collection];
      records.push(records[0]!);
      expectIssue(pack, [collection, records.length - 1, 'id'], 'Duplicate');
    },
  );

  it('rejects duplicate ids within a lesson question collection', () => {
    const pack = validPack();
    pack.lessons[0]!.questions.push(question());
    expectIssue(pack, ['lessons', 0, 'questions', 1, 'id'], 'Duplicate');
  });

  it('rejects the same question id in separate collections', () => {
    const pack = validPack();
    pack.placement = [question()];
    pack.assessments = [question()];
    expectIssue(pack, ['placement', 0, 'id'], 'Duplicate');
    expectIssue(pack, ['assessments', 0, 'id'], 'Duplicate');
  });

  it('rejects unresolved quest lessonIds', () => {
    const pack = validPack();
    pack.quests[0]!.lessonIds = ['missing'];
    expectIssue(pack, ['quests', 0, 'lessonIds', 0], 'Unresolved');
  });

  it.each(['vocab', 'lessons', 'quests'] as const)('rejects unresolved %s stageId', (collection) => {
    const pack = validPack();
    pack[collection][0]!.stageId = 'missing';
    expectIssue(pack, [collection, 0, 'stageId'], 'Unknown stage');
  });

  it('rejects unresolved lesson vocabulary references', () => {
    const pack = validPack();
    pack.lessons[0]!.vocabIds = ['missing'];
    expectIssue(pack, ['lessons', 0, 'vocabIds', 0], 'Unresolved');
  });

  it.each(['placement', 'assessments', 'lesson'] as const)('rejects unresolved %s question vocabulary references', (collection) => {
    const pack = validPack();
    const records = collection === 'lesson' ? pack.lessons[0]!.questions : pack[collection];
    records[0] = { ...records[0]!, vocabIds: ['missing'] };
    const path = collection === 'lesson' ? ['lessons', 0, 'questions', 0, 'vocabIds', 0] : [collection, 0, 'vocabIds', 0];
    expectIssue(pack, path, 'Unresolved');
  });

  it.each(['lessons', 'quests'] as const)('rejects unknown skills in %s', (collection) => {
    const pack = validPack();
    pack[collection][0]!.skill = 'missing';
    expectIssue(pack, [collection, 0, 'skill'], 'Unknown skill');
  });

  it.each(['stages', 'vocab'] as const)('rejects unknown level codes in %s', (collection) => {
    const pack = validPack();
    pack[collection][0]!.levelCode = 'missing';
    expectIssue(pack, [collection, 0, 'levelCode'], 'Unknown level');
  });

  it.each(['stages', 'vocab'] as const)('rejects a level from a different framework in %s', (collection) => {
    const pack = validPack();
    pack[collection][collection === 'stages' ? 1 : 0]!.levelCode = 'X1';
    expectIssue(pack, [collection, collection === 'stages' ? 1 : 0, 'levelCode'], 'Unknown level');
  });

  it('allows unqualified level codes from declared frameworks', () => {
    const pack = validPack();
    Reflect.deleteProperty(pack.stages[1]!, 'frameworkCode');
    expect(validateContentPack(pack, context, validationOptions)).toEqual([]);
  });

  it('rejects an unknown framework even for a foundation stage', () => {
    const pack = validPack();
    Object.assign(pack.stages[0]!, { frameworkCode: 'missing' });
    expectIssue(pack, ['stages', 0, 'frameworkCode'], 'Unknown framework');
  });

  it.each([-1, 2, 0.5])('rejects invalid correctIndex %s', (correctIndex) => {
    const pack = validPack();
    pack.placement[0] = { ...pack.placement[0]!, correctIndex };
    expectIssue(pack, ['placement', 0, 'correctIndex']);
  });

  it.each(['placement', 'assessments', 'lesson'] as const)('checks correctIndex in %s', (collection) => {
    const pack = validPack();
    const records = collection === 'lesson' ? pack.lessons[0]!.questions : pack[collection];
    records[0] = { ...records[0]!, correctIndex: 2 };
    expect(validateContentPack(pack, context, validationOptions).length).toBeGreaterThan(0);
  });

  it('rejects an own __proto__ locale key instead of dropping it', () => {
    const pack = validPack();
    Object.defineProperty(pack.vocab[0]!.glosses, '__proto__', { value: 'Bad', enumerable: true });
    expect(validateContentPack(pack, context, validationOptions).length).toBeGreaterThan(0);
  });

  it('rejects non-canonical locale keys', () => {
    const pack = validPack();
    pack.vocab[0]!.glosses = { 'EN-us': 'Bad' } as unknown as { vi: string };
    expect(validateContentPack(pack, context, validationOptions).length).toBeGreaterThan(0);
  });

  it.each(['source', 'license', 'attribution', 'version', 'retrievedAt'] as const)('requires provenance.%s', (key) => {
    const pack = structuredClone(validPack());
    Reflect.deleteProperty(pack.vocab[0]!.provenance, key);
    expectIssue(pack, ['vocab', 0, 'provenance', key]);
  });

  it.each(['file', 'declaration'] as const)('requires provenance.source.%s', (key) => {
    const pack = structuredClone(validPack());
    Reflect.deleteProperty(pack.vocab[0]!.provenance.source, key);
    expectIssue(pack, ['vocab', 0, 'provenance', 'source', key]);
  });

  it.each(['stages', 'vocab', 'lessons', 'quests', 'placement', 'assessments'] as const)('requires provenance on %s records', (collection) => {
    const pack = structuredClone(validPack());
    Reflect.deleteProperty(pack[collection][0]!, 'provenance');
    expectIssue(pack, [collection, 0, 'provenance']);
  });

  it('requires provenance on nested questions', () => {
    const pack = structuredClone(validPack());
    Reflect.deleteProperty(pack.lessons[0]!.questions[0]!, 'provenance');
    expectIssue(pack, ['lessons', 0, 'questions', 0, 'provenance']);
  });

  it.each(['dataset', 'qaa:', ':dataset', 'QAA:dataset', 'qaa:bad:name', 'long:dataset'])('rejects malformed extension key %s', (key) => {
    expect(validateContentPack({ ...validPack(), extensions: { [key]: null } }, context, validationOptions).length).toBeGreaterThan(0);
  });

  it.each([undefined, null, [], [1], 'pack', 1, true, Symbol('pack'), () => null])('returns issues for garbage input %#', (pack) => {
    expect(() => validateContentPack(pack, context, validationOptions)).not.toThrow();
    expect(validateContentPack(pack, context, validationOptions).length).toBeGreaterThan(0);
  });

  it('returns issues for throwing getters without invoking them', () => {
    let invoked = false;
    const pack = { ...validPack(), get language() { invoked = true; throw new Error('getter'); } };
    expect(validateContentPack(pack, context, validationOptions).length).toBeGreaterThan(0);
    expect(invoked).toBe(false);
  });

  it.each(['get', 'ownKeys', 'getOwnPropertyDescriptor', 'getPrototypeOf'] as const)('never throws for hostile proxy trap %s', (trap) => {
    const pack = new Proxy(validPack(), { [trap]: () => { throw new Error('hostile'); } });
    expect(() => validateContentPack(pack, context, validationOptions)).not.toThrow();
    // A get-only trap need not run: descriptor-based snapshots can validate safely.
    if (trap !== 'get') expect(validateContentPack(pack, context, validationOptions).length).toBeGreaterThan(0);
  });

  it('never throws for revoked proxies or hostile thrown values', () => {
    const { proxy, revoke } = Proxy.revocable({}, {});
    revoke();
    const hostile = new Proxy({}, { get: () => { throw null; }, getPrototypeOf: () => { throw null; } });
    for (const pack of [proxy, new Proxy({}, { ownKeys: () => { throw hostile; } })]) {
      expect(() => validateContentPack(pack, context, validationOptions)).not.toThrow();
      expect(validateContentPack(pack, context, validationOptions).length).toBeGreaterThan(0);
    }
  });

  it.each([null, [], {}, new Proxy({}, { ownKeys: () => { throw null; } })])('never throws for malformed context %#', (badContext) => {
    const validate = () => validateContentPack(validPack(), badContext as ContentValidationContext, validationOptions);
    expect(validate).not.toThrow();
    expect(validate().length).toBeGreaterThan(0);
  });

  it.each([undefined, NaN, Infinity, -0, 1n, () => 1, Symbol('value'), new Date(), new Map()])('rejects data changed or lost by JSON serialization %#', (value) => {
    expectIssue({ ...validPack(), extensions: { 'qaa:dataset': value } }, ['extensions', 'qaa:dataset']);
  });

  it('rejects cycles, sparse arrays, symbols, hidden properties, and extra array properties', () => {
    const cycle: unknown[] = []; cycle.push(cycle);
    const extra = [1]; Object.assign(extra, { extra: 2 });
    const symbol = { [Symbol('hidden')]: 1 };
    const hidden = Object.defineProperty({}, 'hidden', { value: 1 });
    for (const value of [cycle, new Array(2), extra, symbol, hidden]) {
      expect(validateContentPack({ ...validPack(), extensions: { 'qaa:dataset': value } }, context, validationOptions).length).toBeGreaterThan(0);
    }
  });

  it('allows repeated object references because they round-trip by value', () => {
    const value = { sample: 1 };
    expect(validateContentPack({ ...validPack(), extensions: { 'qaa:dataset': [value, value] } }, context, validationOptions)).toEqual([]);
  });

  it('accepts course-scoped levels without an explicit stage framework', () => {
    const pack = validPack();
    Reflect.deleteProperty(pack.stages[1]!, 'frameworkCode');
    expect(validateContentPack(pack, context, validationOptions)).toEqual([]);
  });

  it('rejects unknown courses even for foundation stages', () => {
    const pack = validPack(); pack.stages[0]!.courseCode = 'missing';
    expectIssue(pack, ['stages', 0, 'courseCode'], 'Unknown course');
  });

  it('restricts stage levels to the course subset of its framework', () => {
    const pack = validPack(); pack.stages[1]!.levelCode = 'L2';
    const restricted = { ...context, courses: { ...context.courses, general: { framework: 'rubric', levels: ['L1'] } } };
    expect(validateContentPack(pack, restricted, validationOptions)).toContainEqual(expect.objectContaining({ path: ['stages', 1, 'levelCode'] }));
  });

  it('rejects a different declared framework on a stage', () => {
    const pack = validPack(); pack.stages[1]!.frameworkCode = 'alternate';
    expectIssue(pack, ['stages', 1, 'frameworkCode'], 'framework differs');
  });

  it('checks course levels even when the stage framework is omitted', () => {
    const pack = validPack(); Reflect.deleteProperty(pack.stages[1]!, 'frameworkCode'); pack.stages[1]!.levelCode = 'X1';
    expectIssue(pack, ['stages', 1, 'levelCode'], 'Unknown level');
  });

  it('rejects a pack for another module language', () => {
    expectIssue({ ...validPack(), language: 'qab' }, ['language'], 'context language');
  });

  it('requires a validator for every extension key', () => {
    expect(validateContentPack(validPack(), context)).toContainEqual(expect.objectContaining({
      path: ['extensions', 'qaa:dataset'], message: expect.stringContaining('no validator'),
    }));
  });

  it('runs extension validators once and prefixes relative issue paths', () => {
    let calls = 0;
    const result = validateContentPack(validPack(), context, { extensions: {
      'qaa:dataset': (value) => { calls++; expect(value).toEqual(validPack().extensions['qaa:dataset']); return [{ path: ['nested', 0], message: 'Invalid sample' }]; },
    } });
    expect(calls).toBe(1);
    expect(result).toEqual([{ path: ['extensions', 'qaa:dataset', 'nested', 0], message: 'Invalid sample' }]);
  });

  it.each(['pack', 'stages', 'vocab', 'lessons', 'quests', 'placement', 'assessments', 'nested'] as const)(
    'checks extension ownership and hooks on %s', (collection) => {
      const pack = validPack();
      const record = collection === 'pack' ? pack : collection === 'nested' ? pack.lessons[0]!.questions[0]! : pack[collection][0]!;
      const path = collection === 'pack' ? [] : collection === 'nested' ? ['lessons', 0, 'questions', 0] : [collection, 0];
      Object.assign(record, { extensions: { 'qaa:details': true } });
      const hooks = { extensions: { ...validationOptions.extensions, 'qaa:details': () => [] } };
      expect(validateContentPack(pack, context, hooks)).toEqual([]);
      expect(validateContentPack(pack, context, validationOptions)).toContainEqual(expect.objectContaining({ path: [...path, 'extensions', 'qaa:details'] }));
      Object.assign(record, { extensions: { 'qab:details': true } });
      expect(validateContentPack(pack, context, { extensions: { ...hooks.extensions, 'qab:details': () => [] } }))
        .toContainEqual(expect.objectContaining({ path: [...path, 'extensions', 'qab:details'], message: expect.stringContaining('belong') }));
    },
  );

  it.each([
    () => { throw null; }, () => undefined, () => [null], () => [{ path: [true], message: 'bad' }],
    () => [{ path: [], message: 1 }], () => new Proxy([], { ownKeys: () => { throw null; } }),
    () => [{ get path() { throw null; }, message: 'bad' }],
  ])('returns issues for throwing or malformed extension validators %#', (hook) => {
    const options = { extensions: { 'qaa:dataset': hook } } as unknown as import('../src/index.ts').ContentValidationOptions;
    expect(() => validateContentPack(validPack(), context, options)).not.toThrow();
    expect(validateContentPack(validPack(), context, options).length).toBeGreaterThan(0);
  });

  it.each([null, new Proxy({}, { get: () => { throw null; } })])('never throws for malformed hook options %#', (options) => {
    expect(validateContentPack(validPack(), context, options as never).length).toBeGreaterThan(0);
  });

  it('rejects cross-record id collisions including module extension records', () => {
    const pack = validPack(); pack.vocab[0]!.id = pack.stages[0]!.id;
    expectIssue(pack, ['vocab', 0, 'id'], 'Duplicate');
    const extensionPack = { ...validPack(), extensions: { 'qaa:dataset': [{ id: 'stage-1' }] } };
    expectIssue(extensionPack, ['extensions', 'qaa:dataset', 0, 'id'], 'Duplicate');
  });

  it('does not interpret locale maps or vocabulary field names as records or extension maps', () => {
    const pack = validPack();
    Object.assign(pack.stages[0]!.labels, { id: 'same' });
    Object.assign(pack.vocab[0]!.glosses, { id: 'same' });
    Object.assign(pack.vocab[0]!.fields, { id: 'stage-1', extensions: 'field value' });
    expect(validateContentPack(pack, context, validationOptions)).toEqual([]);
  });

  it('keeps module hook mutations isolated from pack auditing and caller input', () => {
    const pack = validPack(); const before = JSON.stringify(pack);
    expect(validateContentPack(pack, context, { extensions: { 'qaa:dataset': (value) => {
      Object.assign(value as object, { id: 'stage-1', extensions: { 'qab:bad': null } }); return [];
    } } })).toEqual([]);
    expect(JSON.stringify(pack)).toBe(before);
  });

  it('rejects duplicate stage orders within a course but permits them across courses', () => {
    const pack = validPack(); pack.stages[1]!.order = 0;
    expectIssue(pack, ['stages', 1, 'order'], 'Duplicate');
    Object.assign(pack.stages[1]!, { courseCode: 'other', frameworkCode: 'alternate', levelCode: 'X1' });
    pack.vocab[0]!.levelCode = 'X1';
    expect(validateContentPack(pack, context, validationOptions)).toEqual([]);
  });

  it('requires vocabulary and non-null stage levels to match', () => {
    const pack = validPack(); pack.vocab[0]!.levelCode = 'L2';
    expectIssue(pack, ['vocab', 0, 'levelCode'], 'equal its stage');
    pack.vocab[0]!.stageId = 'foundation';
    expect(validateContentPack(pack, context, validationOptions)).toEqual([]);
    pack.vocab[0]!.stageId = 'stage-1'; Reflect.deleteProperty(pack.vocab[0]!, 'levelCode');
    expect(validateContentPack(pack, context, validationOptions)).toEqual([]);
  });

  it.each([
    { language: '' }, { language: 'QAA' }, { skills: null }, { levels: null }, { courses: null },
    { courses: { general: { framework: 'missing', levels: [] } } },
    { courses: { general: { framework: 'rubric', levels: ['missing'] } } },
  ])('reports malformed context before malformed pack fields %#', (fields) => {
    const issues = validateContentPack({}, { ...context, ...fields } as ContentValidationContext);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((issue) => issue.path[0] === 'context')).toBe(true);
  });

  it('reports hostile context before inspecting pack getters', () => {
    let invoked = false;
    const pack = new Proxy({}, { ownKeys() { invoked = true; throw null; } });
    const badContext = new Proxy({}, { ownKeys() { throw null; } });
    expect(validateContentPack(pack, badContext as ContentValidationContext)).toEqual([
      { path: ['context'], message: 'Unable to validate input as lossless JSON data' },
    ]);
    expect(invoked).toBe(false);
  });
});

describe('validateContentPack curriculum references', () => {
  const issuesFor = (pack: unknown) => validateContentPack(pack, curriculumContext);
  const expectCurriculumIssue = (pack: unknown, path: (string | number)[], message: string) => {
    expect(issuesFor(pack)).toContainEqual(expect.objectContaining({ path, message: expect.stringContaining(message) }));
  };

  it('accepts a pack with units, days and tests, and still accepts packs without them', () => {
    expect(issuesFor(curriculumPack())).toEqual([]);
    expect(validateContentPack(validPack(), context, validationOptions)).toEqual([]);
  });

  it('rejects an unresolved lesson unitId', () => {
    const pack = curriculumPack(); pack.lessons[0]!.unitId = 'missing';
    expectCurriculumIssue(pack, ['lessons', 0, 'unitId'], 'Unresolved');
  });

  it('rejects unresolved lesson and test vocabulary references', () => {
    const pack = curriculumPack();
    pack.lessons[1]!.reviewVocabIds = ['missing'];
    pack.lessons[0]!.vocabIds = ['missing'];
    pack.tests![1]!.reviewVocabIds = ['missing'];
    expectCurriculumIssue(pack, ['lessons', 1, 'reviewVocabIds', 0], 'Unresolved');
    expectCurriculumIssue(pack, ['lessons', 0, 'vocabIds', 0], 'Unresolved');
    expectCurriculumIssue(pack, ['tests', 1, 'reviewVocabIds', 0], 'Unresolved');
  });

  it('rejects unresolved vocabulary references in example blocks', () => {
    const pack = curriculumPack();
    pack.lessons[0]!.blocks[2] = { kind: 'example', text: 'Sample', vocabIds: ['word-1', 'missing'] };
    expectCurriculumIssue(pack, ['lessons', 0, 'blocks', 2, 'vocabIds', 1], 'Unresolved');
  });

  it('rejects an unknown unit stageId', () => {
    const pack = curriculumPack(); pack.units![0]!.stageId = 'missing';
    expectCurriculumIssue(pack, ['units', 0, 'stageId'], 'Unknown stage');
  });

  it('rejects unresolved day references', () => {
    const pack = curriculumPack();
    Object.assign(pack.days![0]!, { stageId: 'missing', unitId: 'missing', testId: 'missing', mainQuestIds: ['quest-1', 'missing'], sideQuestIds: ['missing'] });
    expectCurriculumIssue(pack, ['days', 0, 'stageId'], 'Unknown stage');
    expectCurriculumIssue(pack, ['days', 0, 'unitId'], 'Unresolved');
    expectCurriculumIssue(pack, ['days', 0, 'testId'], 'Unresolved');
    expectCurriculumIssue(pack, ['days', 0, 'mainQuestIds', 1], 'Unresolved');
    expectCurriculumIssue(pack, ['days', 0, 'sideQuestIds', 0], 'Unresolved');
  });

  it('resolves a test id that names a unit test as well as a daily test', () => {
    const pack = curriculumPack(); pack.tests![1]!.kind = 'unit'; pack.days![1]!.testId = 'test-2';
    expect(issuesFor(pack)).toEqual([]);
  });

  it('rejects test questions that exist nowhere in the pack', () => {
    const pack = curriculumPack(); pack.tests![0]!.questionIds[2] = 'missing';
    expectCurriculumIssue(pack, ['tests', 0, 'questionIds', 2], 'Unresolved');
  });

  it('resolves test questions from lessons, placement and assessments', () => {
    const pack = curriculumPack();
    pack.placement.push({ ...pack.assessments[0]!, id: 'placement-1' } as never);
    pack.tests![0]!.questionIds = ['l1-c1', 'placement-1', 'test-1-q1'];
    expect(issuesFor(pack)).toEqual([]);
  });

  it('rejects duplicate unit orders within a stage and allows them across stages', () => {
    const pack = curriculumPack();
    pack.units!.push({ ...pack.units![0]!, id: 'unit-2' });
    expectCurriculumIssue(pack, ['units', 1, 'order'], 'Duplicate unit order');
    pack.stages.push({ ...pack.stages[0]!, id: 'stage-2', order: 1 });
    pack.units![1]!.stageId = 'stage-2';
    expect(issuesFor(pack)).toEqual([]);
  });

  it('rejects duplicate day numbers within a stage and allows them across stages', () => {
    const pack = curriculumPack();
    pack.days!.push({ ...pack.days![0]!, id: 'day-dup' });
    expectCurriculumIssue(pack, ['days', 5, 'day'], 'Duplicate day number');
    pack.stages.push({ ...pack.stages[0]!, id: 'stage-2', order: 1 });
    pack.days![5]!.stageId = 'stage-2';
    expect(issuesFor(pack)).toEqual([]);
  });

  it('rejects record ids that collide across the new collections', () => {
    const pack = curriculumPack();
    pack.units![0]!.id = pack.stages[0]!.id;
    pack.days![0]!.id = pack.tests![0]!.id;
    expectCurriculumIssue(pack, ['units', 0, 'id'], 'Duplicate');
    expectCurriculumIssue(pack, ['tests', 0, 'id'], 'Duplicate');
  });

  it('runs extension hooks on the new collections', () => {
    const pack = curriculumPack();
    Object.assign(pack.units![0]!, { extensions: { 'qaa:details': true } });
    expect(issuesFor(pack)).toContainEqual(expect.objectContaining({ path: ['units', 0, 'extensions', 'qaa:details'] }));
    expect(validateContentPack(pack, curriculumContext, { extensions: { 'qaa:details': () => [] } })).toEqual([]);
  });

  it('rejects malformed review data on a record', () => {
    const pack = curriculumPack();
    Object.assign(pack.lessons[0]!, { review: { status: 'done', reviewerRoles: [], date: '2026-11-02' } });
    expectCurriculumIssue(pack, ['lessons', 0, 'review', 'status'], 'Invalid');
  });
});
