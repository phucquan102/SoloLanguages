import { describe, expect, it } from 'vitest';
import { checkCurriculum } from '@solo/content-schema/testing';
import type { CurriculumOptions } from '@solo/content-schema/testing';
import { validateContentPack } from '../../src/index.ts';
import type { ContentValidationIssue } from '../../src/index.ts';
import { provenance } from '../fixtures/pack.ts';
import { curriculumContext, curriculumOptions, curriculumPack, STAGE } from '../fixtures/curriculum.ts';
import type { MutablePack } from '../fixtures/curriculum.ts';

type Lesson = MutablePack['lessons'][number];
type Block = Lesson['blocks'][number];
type Question = Lesson['questions'][number];

const check = (pack: unknown, extra: Partial<CurriculumOptions> = {}) => checkCurriculum(pack, { ...curriculumOptions, ...extra });

function expectIssue(issues: readonly ContentValidationIssue[], path: (string | number)[], message: string) {
  expect(issues).toContainEqual(expect.objectContaining({ path, message: expect.stringContaining(message) }));
}

const lessonOf = (pack: MutablePack, n = 1): Lesson => pack.lessons[n - 1]!;
const dropBlocks = (lesson: Lesson, kind: string) => { lesson.blocks = lesson.blocks.filter((block) => block.kind !== kind); };
const asTyped = (question: Question): Question => {
  const { options: _options, correctIndex: _index, ...rest } = question as Question & { options: unknown; correctIndex: unknown };
  return { ...rest, kind: 'typed', acceptedAnswers: [`answer ${question.id}`] } as Question;
};
const extraTyped = (id: string): Question => ({
  id, provenance, kind: 'typed', prompt: { vi: `Extra ${id}` }, acceptedAnswers: [`answer ${id}`], explanations: { vi: 'Why' },
});

function setExampleCount(lesson: Lesson, count: number) {
  const others = lesson.blocks.filter((block) => block.kind !== 'example');
  const examples = lesson.blocks.filter((block) => block.kind === 'example');
  while (examples.length < count) examples.push({ kind: 'example', text: `Extra ${examples.length}`, translations: { vi: 'Thêm' } });
  lesson.blocks = [...others, ...examples.slice(0, count)];
}

/** Adds a second stage whose content breaks several rules, to exercise scoping. */
function withBrokenStage(pack: MutablePack): MutablePack {
  pack.stages.push({ id: 'stage-bad', provenance, courseCode: 'general', order: 1, levelCode: null, labels: { vi: 'Bad' } });
  pack.lessons.push({ id: 'lesson-bad', provenance, stageId: 'stage-bad', skill: 'reading', blocks: [], questions: [] });
  pack.vocab.push({
    id: 'word-bad', provenance, headword: 'orphan', glosses: { vi: 'Mồ côi' }, examples: [], fields: { reading: 'orphan' }, stageId: 'stage-bad',
  });
  pack.days!.push({ id: 'day-bad', provenance, stageId: 'stage-bad', unitId: 'unit-1', day: 1, mainQuestIds: [], testId: 'test-1' });
  return pack;
}

describe('checkCurriculum baseline', () => {
  it('accepts a pack that meets every rule, and the fixture is also a valid content pack', () => {
    expect(check(curriculumPack())).toEqual([]);
    expect(validateContentPack(curriculumPack(), curriculumContext)).toEqual([]);
  });

  it('accepts a structurally valid pack that has no lessons, days or tests', () => {
    const pack = { ...curriculumPack(), lessons: [], quests: [], days: [], tests: [], vocab: [], assessments: [] };
    expect(check(pack)).toEqual([]);
  });

  it('does not mutate the input and gives the same result for a JSON copy', () => {
    const pack = curriculumPack();
    const before = JSON.stringify(pack);
    expect(check(pack)).toEqual([]);
    expect(JSON.stringify(pack)).toBe(before);
    expect(check(JSON.parse(before))).toEqual([]);
  });
});

describe('checkCurriculum lesson blocks', () => {
  it.each(['objective', 'explanation', 'mistake'])('rejects a lesson without a %s block', (kind) => {
    const pack = curriculumPack();
    dropBlocks(lessonOf(pack), kind);
    expectIssue(check(pack), ['lessons', 0, 'blocks'], kind);
  });

  it('does not require a tip block and accepts several mistake blocks', () => {
    const pack = curriculumPack();
    dropBlocks(lessonOf(pack), 'tip');
    const mistake = lessonOf(pack).blocks.find((block) => block.kind === 'mistake') as Block;
    lessonOf(pack).blocks.push(structuredClone(mistake));
    expect(check(pack)).toEqual([]);
  });
});

describe('checkCurriculum examples', () => {
  it.each([4, 5, 6])('accepts %i examples', (count) => {
    const pack = curriculumPack();
    setExampleCount(lessonOf(pack), count);
    expect(check(pack)).toEqual([]);
  });

  it.each([3, 7])('rejects %i examples', (count) => {
    const pack = curriculumPack();
    setExampleCount(lessonOf(pack), count);
    expectIssue(check(pack), ['lessons', 0, 'blocks'], `needs 4-6 examples, found ${count}`);
  });

  it('applies custom example ranges', () => {
    expect(check(curriculumPack(), { ranges: { examples: [4, 4] } })).toEqual([]);
    expectIssue(check(curriculumPack(), { ranges: { examples: [1, 3] } }), ['lessons', 0, 'blocks'], 'needs 1-3 examples');
  });

  it('requires a translation for every native locale', () => {
    const pack = curriculumPack();
    const example = lessonOf(pack).blocks.find((block) => block.kind === 'example') as Extract<Block, { kind: 'example' }>;
    const index = lessonOf(pack).blocks.indexOf(example);
    Reflect.deleteProperty(example, 'translations');
    expectIssue(check(pack), ['lessons', 0, 'blocks', index, 'translations'], 'locale "vi"');
    example.translations = { vi: 'Có' };
    expect(check(pack)).toEqual([]);
    expectIssue(check(pack, { nativeLocales: ['vi', 'en'] }), ['lessons', 0, 'blocks', index, 'translations'], 'locale "en"');
  });

  it('does not require translations when no native locale is configured', () => {
    const pack = curriculumPack();
    for (const block of lessonOf(pack).blocks) if (block.kind === 'example') Reflect.deleteProperty(block, 'translations');
    expect(check(pack, { nativeLocales: [] })).toEqual([]);
  });
});

describe('checkCurriculum practice questions', () => {
  const keep = (lesson: Lesson, ids: string[]) => { lesson.questions = lesson.questions.filter((question) => ids.includes(question.id)); };

  it.each([6, 7, 10])('accepts %i questions', (count) => {
    const pack = curriculumPack();
    const lesson = lessonOf(pack);
    if (count < 7) keep(lesson, ['l1-c1', 'l1-c2', 'l1-c3', 'l1-c4', 'l1-t1', 'l1-t2']);
    for (let index = lesson.questions.length; index < count; index++) lesson.questions.push(extraTyped(`extra-${index}`));
    expect(check(pack)).toEqual([]);
  });

  it.each([5, 11])('rejects %i questions', (count) => {
    const pack = curriculumPack();
    const lesson = lessonOf(pack);
    if (count < 7) keep(lesson, ['l1-c1', 'l1-c2', 'l1-c3', 'l1-t1', 'l1-t2']);
    for (let index = lesson.questions.length; index < count; index++) lesson.questions.push(extraTyped(`extra-${index}`));
    expectIssue(check(pack), ['lessons', 0, 'questions'], `needs 6-10 questions, found ${count}`);
  });

  it('applies custom question ranges', () => {
    expect(check(curriculumPack(), { ranges: { questions: [7, 7] } })).toEqual([]);
    expectIssue(check(curriculumPack(), { ranges: { questions: [8, 9] } }), ['lessons', 0, 'questions'], 'needs 8-9 questions');
  });

  it('requires the minimum number of choice questions', () => {
    const pack = curriculumPack();
    const lesson = lessonOf(pack);
    lesson.questions[2] = asTyped(lesson.questions[2]!);
    lesson.questions[3] = asTyped(lesson.questions[3]!);
    expect(check(pack)).toEqual([]);
    lesson.questions[1] = asTyped(lesson.questions[1]!);
    expectIssue(check(pack), ['lessons', 0, 'questions'], 'at least 2 choice questions, found 1');
    expect(check(pack, { ranges: { minChoice: 1 }, minQuestionsPerVocab: 1 })).toEqual([]);
  });

  it('requires the minimum number of typed questions', () => {
    const pack = curriculumPack();
    const lesson = lessonOf(pack);
    lesson.questions = lesson.questions.filter((question) => question.id !== 'l1-t3' && question.id !== 'l1-t2');
    lesson.questions.push({ ...lesson.questions[2]!, id: 'l1-c5' }, { ...lesson.questions[3]!, id: 'l1-c6' });
    expectIssue(check(pack), ['lessons', 0, 'questions'], 'at least 2 typed questions, found 1');
    expect(check(pack, { ranges: { minTyped: 1 } })).toEqual([]);
  });

  it('requires explanations in every native locale', () => {
    const pack = curriculumPack();
    const question = lessonOf(pack).questions[0]!;
    Reflect.deleteProperty(question, 'explanations');
    expectIssue(check(pack), ['lessons', 0, 'questions', 0, 'explanations'], 'needs explanations');
    question.explanations = { vi: 'Có' };
    expect(check(pack)).toEqual([]);
    expectIssue(check(pack, { nativeLocales: ['vi', 'en'] }), ['lessons', 0, 'questions', 0, 'explanations', 'en'], 'locale "en"');
  });
});

describe('checkCurriculum choice answer keys', () => {
  const setOptions = (pack: MutablePack, options: unknown[], correctIndex: number) => {
    Object.assign(lessonOf(pack).questions[2]!, { options, correctIndex });
  };

  it('accepts distinct options, including localized ones', () => {
    const pack = curriculumPack();
    setOptions(pack, ['one', 'Two!', { vi: 'Xin chào' }, { vi: 'Tạm biệt' }], 1);
    expect(check(pack)).toEqual([]);
  });

  it('rejects wrong options that are equal after normalization', () => {
    const pack = curriculumPack();
    setOptions(pack, ['one', 'Two!', 'two'], 0);
    expectIssue(check(pack), ['lessons', 0, 'questions', 2, 'options', 2], 'Options are not distinct');
  });

  it('rejects a correct option that equals a wrong option after normalization', () => {
    const pack = curriculumPack();
    setOptions(pack, ['Same', 'same.', 'other'], 0);
    expectIssue(check(pack), ['lessons', 0, 'questions', 2, 'options', 1], 'Correct option is not distinct');
  });

  it('rejects localized options that repeat after folding', () => {
    const pack = curriculumPack();
    setOptions(pack, [{ vi: 'Xin chào' }, { vi: 'xin chào!' }, { vi: 'Cảm ơn' }], 2);
    expectIssue(check(pack), ['lessons', 0, 'questions', 2, 'options', 1], 'Options are not distinct');
    setOptions(pack, [{ vi: 'Xin chào' }, { vi: 'xin chào!' }, { vi: 'Cảm ơn' }], 0);
    expectIssue(check(pack), ['lessons', 0, 'questions', 2, 'options', 1], 'Correct option is not distinct');
  });

  it('also checks the questions of tests', () => {
    const pack = curriculumPack();
    Object.assign(pack.assessments[0]!, { options: ['same', 'same', 'other'], correctIndex: 2 });
    expectIssue(check(pack), ['assessments', 0, 'options', 1], 'Options are not distinct');
  });
});

describe('checkCurriculum typed answer keys', () => {
  it('accepts typed questions whose answers the module accepts', () => {
    expect(check(curriculumPack())).toEqual([]);
  });

  it('rejects an accepted answer that compareAnswer does not accept', () => {
    const rejecting = (input: string) => ({ correct: input !== 'reply l1-t1' });
    expectIssue(check(curriculumPack(), { compareAnswer: rejecting }), ['lessons', 0, 'questions', 4, 'acceptedAnswers', 1], 'compareAnswer');
  });

  it('passes the full answer list to compareAnswer', () => {
    const seen: (readonly string[])[] = [];
    check(curriculumPack(), { compareAnswer: (input, accepted) => { seen.push(accepted); return { correct: true }; } });
    expect(seen).toContainEqual(['answer l1-t1', 'reply l1-t1']);
  });

  it('also checks the typed questions of tests', () => {
    const rejecting = (input: string) => ({ correct: input !== 'answer test-1-q10' });
    expectIssue(check(curriculumPack(), { compareAnswer: rejecting }), ['assessments', 9, 'acceptedAnswers', 0], 'compareAnswer');
  });
});

describe('checkCurriculum vocabulary', () => {
  const vocabPath = (lesson = 0) => ['lessons', lesson, 'vocabIds', 0];

  it('requires every introduced word in the configured number of lesson questions', () => {
    const pack = curriculumPack();
    Reflect.deleteProperty(lessonOf(pack).questions[1]!, 'vocabIds');
    expectIssue(check(pack), vocabPath(), 'appears in 1 lesson questions, needs at least 2');
    expect(check(pack, { minQuestionsPerVocab: 1 })).toEqual([]);
    expectIssue(check(curriculumPack(), { minQuestionsPerVocab: 3 }), vocabPath(), 'needs at least 3');
  });

  it('requires an example for every introduced word, matching the headword when examples name no vocabulary', () => {
    const pack = curriculumPack();
    const example = lessonOf(pack).blocks.find((block) => block.kind === 'example') as Extract<Block, { kind: 'example' }>;
    example.text = 'Plain sample without it';
    expectIssue(check(pack), vocabPath(), 'no example');
    example.text = 'The ALPHA, again';
    expect(check(pack)).toEqual([]);
  });

  it('prefers the vocabIds of an example over a text match', () => {
    const pack = curriculumPack();
    const example = lessonOf(pack).blocks.find((block) => block.kind === 'example') as Extract<Block, { kind: 'example' }>;
    example.text = 'Plain sample without it';
    example.vocabIds = ['word-1'];
    expect(check(pack)).toEqual([]);
    example.text = 'This is the alpha sample';
    example.vocabIds = ['word-2'];
    expectIssue(check(pack), vocabPath(), 'no example');
  });

  it('matches words inside spaceless text but not inside longer cased words', () => {
    const pack = curriculumPack();
    const example = lessonOf(pack).blocks.find((block) => block.kind === 'example') as Extract<Block, { kind: 'example' }>;
    pack.vocab[0]!.headword = 'lph';
    expectIssue(check(pack), vocabPath(), 'no example');
    pack.vocab[0]!.headword = '你好';
    example.text = '他说你好吗';
    expect(check(pack)).toEqual([]);
  });

  it('requires every vocabulary record to be introduced exactly once', () => {
    const pack = curriculumPack();
    lessonOf(pack, 2).vocabIds = ['word-1', 'word-2'];
    expectIssue(check(pack), ['vocab', 0], 'introduced 2 times');
    const orphan = curriculumPack();
    Reflect.deleteProperty(lessonOf(orphan), 'vocabIds');
    expectIssue(check(orphan), ['vocab', 0], 'never introduced');
  });

  it('counts a repeated id inside one lesson as a second introduction', () => {
    const pack = curriculumPack();
    lessonOf(pack).vocabIds = ['word-1', 'word-1'];
    expectIssue(check(pack), ['vocab', 0], 'introduced 2 times');
  });

  it('accepts recycling by lessons and by tests alike', () => {
    const lessonsOnly = curriculumPack();
    for (const test of lessonsOnly.tests!) Reflect.deleteProperty(test, 'reviewVocabIds');
    expectIssue(check(lessonsOnly), vocabPath(3), 'recycled 1 times');
    const withTest = curriculumPack();
    for (const lesson of withTest.lessons) Reflect.deleteProperty(lesson, 'reviewVocabIds');
    expectIssue(check(withTest), vocabPath(3), 'recycled 1 times');
    expect(check(curriculumPack())).toEqual([]);
  });

  it('rejects too few recycles and honours minRecycles', () => {
    expectIssue(check(curriculumPack(), { minRecycles: 3 }), vocabPath(3), 'recycled 2 times within 14 days, needs at least 3');
    const pack = curriculumPack();
    for (const lesson of pack.lessons) Reflect.deleteProperty(lesson, 'reviewVocabIds');
    for (const test of pack.tests!) Reflect.deleteProperty(test, 'reviewVocabIds');
    expectIssue(check(pack), vocabPath(), 'recycled 0 times');
    expect(check(pack, { minRecycles: 0 })).toEqual([]);
  });

  it('caps required recycles at the remaining scheduled days only when truncateAtScheduleEnd is set', () => {
    const pack = curriculumPack();
    for (const lesson of pack.lessons) Reflect.deleteProperty(lesson, 'reviewVocabIds');
    for (const test of pack.tests!) Reflect.deleteProperty(test, 'reviewVocabIds');
    expectIssue(check(pack), vocabPath(), 'recycled 0 times');
    const recycleIssues = (options: Parameters<typeof check>[1]) =>
      check(pack, options).filter((issue) => issue.message.includes('recycled'));
    // The word introduced on the second-to-last day has one scheduled day left in the window.
    expect(recycleIssues({}).some((issue) => issue.message.includes('needs at least 1'))).toBe(false);
    expect(recycleIssues({ truncateAtScheduleEnd: true }).some((issue) => issue.message.includes('needs at least 1'))).toBe(true);
    const lastDayWords = check(pack, { truncateAtScheduleEnd: true, minRecycles: 99 })
      .filter((issue) => issue.message.includes('recycled'));
    expect(lastDayWords.every((issue) => !issue.message.includes('needs at least 99'))).toBe(true);
    expect(check(curriculumPack(), { truncateAtScheduleEnd: 'yes' as unknown as boolean }))
      .toEqual([expect.objectContaining({ path: ['options'] })]);
  });

  it('counts only recycles within the window', () => {
    expect(check(curriculumPack(), { recycleWindowDays: 1 })).toEqual([]);
    const pack = curriculumPack();
    Reflect.deleteProperty(lessonOf(pack, 2), 'reviewVocabIds');
    expectIssue(check(pack, { recycleWindowDays: 1 }), vocabPath(), 'recycled 1 times within 1 days');
    expect(check(pack, { recycleWindowDays: 14 })).toEqual([]);
  });

  it('counts only later days: earlier and same-day reviews do not recycle', () => {
    const pack = curriculumPack();
    Reflect.deleteProperty(lessonOf(pack, 5), 'reviewVocabIds');
    lessonOf(pack, 1).reviewVocabIds = ['word-4'];
    pack.tests![3]!.reviewVocabIds = ['word-4'];
    expectIssue(check(pack), vocabPath(3), 'recycled 1 times');
  });

  it('orders days by stage order then day number, whatever the array order', () => {
    const pack = curriculumPack();
    pack.days!.reverse();
    expect(check(pack)).toEqual([]);
  });

  it('continues the timeline across stages of one course but not across courses', () => {
    const pack = curriculumPack();
    pack.stages.push({ id: 'stage-2', provenance, courseCode: 'general', order: 1, levelCode: null, labels: { vi: 'Second' } });
    Object.assign(pack.days![4]!, { stageId: 'stage-2', day: 1 });
    expect(check(pack)).toEqual([]);
    pack.stages[1]!.courseCode = 'other';
    expectIssue(check(pack), ['lessons', 3, 'vocabIds', 0], 'recycled 0 times');
  });

  it('reports lessons that no day schedules instead of guessing their position', () => {
    const pack = curriculumPack();
    pack.days = pack.days!.filter((day) => day.day !== 5);
    expectIssue(check(pack), ['lessons', 4], 'not scheduled in any day');
    const noDays = curriculumPack();
    Reflect.deleteProperty(noDays, 'days');
    expectIssue(check(noDays), ['lessons', 0], 'not scheduled in any day');
  });

  it('reaches lessons through side quests too', () => {
    const pack = curriculumPack();
    pack.quests.push({ ...pack.quests[4]!, id: 'side-5', optional: true });
    pack.quests[4]!.lessonIds = [];
    pack.quests[5]!.lessonIds = ['lesson-5'];
    pack.days![4]!.sideQuestIds = ['side-5'];
    expect(check(pack)).toEqual([]);
  });
});

describe('checkCurriculum days and tests', () => {
  it('requires main quests and an existing test on every day', () => {
    const pack = curriculumPack();
    pack.days![0]!.mainQuestIds = [];
    pack.days![1]!.testId = 'missing';
    const issues = check(pack);
    expectIssue(issues, ['days', 0, 'mainQuestIds'], 'at least one main quest');
    expectIssue(issues, ['days', 1, 'testId'], 'does not exist');
  });

  it('requires ten questions in a daily test', () => {
    const pack = curriculumPack();
    pack.tests![0]!.questionIds = pack.tests![0]!.questionIds.slice(0, 9);
    expectIssue(check(pack), ['tests', 0, 'questionIds'], 'at least 10 questions, found 9');
  });

  it('counts a repeated question once towards the daily test size', () => {
    const pack = curriculumPack();
    pack.tests![0]!.questionIds = [...pack.tests![0]!.questionIds.slice(0, 9), 'test-1-q1'];
    expectIssue(check(pack), ['tests', 0, 'questionIds'], 'found 9');
  });

  it('requires three typed questions in a daily test', () => {
    const pack = curriculumPack();
    pack.assessments[9] = { ...pack.assessments[6]!, id: 'test-1-q10' } as never;
    expectIssue(check(pack), ['tests', 0, 'questionIds'], 'at least 3 typed questions, found 2');
  });

  it('applies the daily composition only to daily tests', () => {
    const pack = curriculumPack();
    pack.tests![0]!.kind = 'unit';
    pack.tests![0]!.questionIds = pack.tests![0]!.questionIds.slice(0, 3);
    expect(check(pack)).toEqual([]);
  });

  it('rejects test questions that do not exist', () => {
    const pack = curriculumPack();
    pack.tests![0]!.questionIds[3] = 'missing';
    expectIssue(check(pack), ['tests', 0, 'questionIds', 3], 'does not exist');
  });

  it('accepts test questions drawn from lessons and placement when their prompts are unique', () => {
    const pack = curriculumPack();
    pack.placement.push({ ...pack.assessments[0]!, id: 'placement-1', prompt: { vi: 'Placement only' } } as never);
    pack.tests![0]!.questionIds[0] = 'placement-1';
    expect(check(pack)).toEqual([]);
  });

  it('rejects a test question whose normalized prompt repeats a practice prompt', () => {
    const pack = curriculumPack();
    pack.assessments[0]!.prompt = { vi: 'LESSON 2 choice 1?' };
    expectIssue(check(pack), ['tests', 0, 'questionIds', 0], 'repeats the prompt of a practice question');
  });

  it('normalizes string prompts with the module text tools', () => {
    const pack = curriculumPack();
    lessonOf(pack).questions[0]!.prompt = 'Say Hello!';
    pack.assessments[0]!.prompt = 'say   hello';
    expectIssue(check(pack), ['tests', 0, 'questionIds', 0], 'repeats the prompt');
    pack.assessments[0]!.prompt = 'say goodbye';
    expect(check(pack)).toEqual([]);
  });

  it('rejects a test that reuses a practice question itself', () => {
    const pack = curriculumPack();
    pack.tests![0]!.questionIds[0] = 'l1-c1';
    expectIssue(check(pack), ['tests', 0, 'questionIds', 0], 'repeats the prompt');
  });
});

describe('checkCurriculum scope', () => {
  it('checks every stage without a scope', () => {
    const issues = check(withBrokenStage(curriculumPack()));
    expectIssue(issues, ['lessons', 5, 'blocks'], 'objective');
    expectIssue(issues, ['vocab', 4], 'never introduced');
    expectIssue(issues, ['days', 5, 'mainQuestIds'], 'main quest');
  });

  it('limits checks to the lessons, vocabulary, days and tests of the scoped stages', () => {
    const pack = withBrokenStage(curriculumPack());
    expect(check(pack, { scopeStageIds: [STAGE] })).toEqual([]);
    expect(check(pack, { scopeStageIds: [] })).toEqual([]);
    const issues = check(pack, { scopeStageIds: ['stage-bad'] });
    expectIssue(issues, ['lessons', 5, 'blocks'], 'objective');
    expectIssue(issues, ['vocab', 4], 'never introduced');
    expect(issues.some((issue) => issue.path[0] === 'lessons' && issue.path[1] !== 5)).toBe(false);
  });

  it('skips tests that no scoped day closes with', () => {
    const pack = curriculumPack();
    pack.tests![0]!.questionIds = ['missing'];
    expectIssue(check(pack, { scopeStageIds: [STAGE] }), ['tests', 0, 'questionIds', 0], 'does not exist');
    const other = withBrokenStage(curriculumPack());
    other.days![5]!.testId = 'test-5';
    other.tests![0]!.questionIds = ['missing'];
    expect(check(other, { scopeStageIds: ['stage-bad'] }).some((issue) => issue.path[0] === 'tests')).toBe(false);
  });

  it('does not treat lessons without a stage as in scope', () => {
    const pack = curriculumPack();
    Reflect.deleteProperty(lessonOf(pack), 'stageId');
    dropBlocks(lessonOf(pack), 'objective');
    expect(check(pack, { scopeStageIds: [STAGE] }).some((issue) => issue.path[1] === 0)).toBe(false);
    expectIssue(check(pack), ['lessons', 0, 'blocks'], 'objective');
  });
});

describe('checkCurriculum options and robustness', () => {
  it.each([
    null, {}, { ...curriculumOptions, nativeLocales: ['VI'] }, { ...curriculumOptions, nativeLocales: 'vi' },
    { ...curriculumOptions, normalize: 1 }, { ...curriculumOptions, compareAnswer: null },
    { ...curriculumOptions, ranges: { examples: [6, 4] } }, { ...curriculumOptions, ranges: { minChoice: -1 } },
    { ...curriculumOptions, ranges: { other: 1 } }, { ...curriculumOptions, recycleWindowDays: 0 },
    { ...curriculumOptions, minRecycles: 1.5 }, { ...curriculumOptions, scopeStageIds: [1] },
    new Proxy({}, { get: () => { throw null; } }),
  ])('returns issues for malformed options %#', (options) => {
    const run = () => checkCurriculum(curriculumPack(), options as CurriculumOptions);
    expect(run).not.toThrow();
    expect(run().length).toBeGreaterThan(0);
  });

  it('reports a throwing or malformed normalize without throwing', () => {
    for (const normalize of [() => { throw null; }, () => 1 as unknown as string]) {
      const run = () => check(curriculumPack(), { normalize });
      expect(run).not.toThrow();
      expectIssue(run(), ['options', 'normalize'], 'normalize');
    }
  });

  it('reports a throwing or malformed compareAnswer without throwing', () => {
    for (const compareAnswer of [() => { throw null; }, () => null as unknown as { correct: boolean }]) {
      const run = () => check(curriculumPack(), { compareAnswer });
      expect(run).not.toThrow();
      expectIssue(run(), ['options', 'compareAnswer'], 'compareAnswer');
    }
  });

  it('calls module callbacks without a receiver', () => {
    const tools = {
      normalize(this: unknown, text: string) { if (this !== undefined) throw new Error('receiver'); return text.toLowerCase(); },
      compareAnswer(this: unknown, input: string, accepted: readonly string[]) {
        if (this !== undefined) throw new Error('receiver');
        return { correct: accepted.includes(input) };
      },
    };
    expect(check(curriculumPack(), tools)).toEqual([]);
  });

  it.each([null, undefined, [], 'pack', 1, true, {}, { schemaVersion: 2 }, new Proxy({}, { ownKeys: () => { throw null; } })])(
    'returns issues without throwing on garbage input %#', (pack) => {
      expect(() => check(pack)).not.toThrow();
      expect(check(pack).length).toBeGreaterThan(0);
    },
  );

  it('reports structural schema problems in new fields before running curriculum rules', () => {
    const pack = curriculumPack();
    lessonOf(pack).blocks.push({ kind: 'tip' } as never);
    pack.tests![0]!.passRatio = 2;
    const issues = check(pack);
    expect(issues).toContainEqual(expect.objectContaining({ path: expect.arrayContaining(['lessons', 0, 'blocks']) }));
    expect(issues).toContainEqual(expect.objectContaining({ path: ['tests', 0, 'passRatio'] }));
  });

  it('does not invoke input accessors', () => {
    let invoked = false;
    const pack = { ...curriculumPack(), get language() { invoked = true; throw null; } };
    expect(check(pack).length).toBeGreaterThan(0);
    expect(invoked).toBe(false);
  });
});
