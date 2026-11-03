import { describe, expect, it } from 'vitest';
import { checkCurriculum } from '@solo/content-schema/testing';
import type { CurriculumOptions } from '@solo/content-schema/testing';
import { curriculumOptions, curriculumPack, STAGE } from '../fixtures/curriculum.ts';
import type { MutablePack } from '../fixtures/curriculum.ts';

const check = (pack: unknown, options: Partial<CurriculumOptions>) =>
  checkCurriculum(pack, { ...curriculumOptions, ...options });
const messages = (pack: unknown, options: Partial<CurriculumOptions>) => check(pack, options).map(({ message }) => message);
const has = (pack: unknown, options: Partial<CurriculumOptions>, marker: string) =>
  messages(pack, options).some((message) => message.includes(marker));

function novelPack(): MutablePack {
  const pack = curriculumPack();
  for (const question of pack.assessments) if (question.kind === 'choice') {
    question.options = [`key ${question.id}`, `alternative ${question.id}`, `other ${question.id}`];
  }
  return pack;
}

describe('opt-in testNovelty', () => {
  it('preserves existing callers when the answer check is not enabled', () => {
    expect(check(curriculumPack(), {})).toEqual([]);
  });
  it('accepts novel daily AND unit tests', () => {
    const pack = novelPack();
    pack.tests![4]!.kind = 'unit';
    expect(check(pack, { testNovelty: true })).toEqual([]);
  });
  it.each(['daily', 'unit'] as const)('rejects a normalized copied prompt in a %s test', (kind) => {
    const pack = novelPack();
    pack.tests![0]!.kind = kind;
    pack.assessments[0]!.prompt = { vi: 'LESSON 5 TYPED 1!' };
    expect(messages(pack, { testNovelty: true })).toEqual(expect.arrayContaining([expect.stringContaining('Test novelty:')]));
  });
  it('checks every accepted alternative against practice typed answers across the whole unit', () => {
    const pack = novelPack();
    const practice = pack.lessons[4]!.questions.find((q) => q.kind === 'typed')!;
    if (practice.kind !== 'typed') throw new Error('Typed fixture');
    practice.acceptedAnswers.push('A-B-C');
    const test = pack.assessments.find((q) => q.kind === 'typed')!;
    if (test.kind !== 'typed') throw new Error('Typed fixture');
    test.acceptedAnswers.push('a, b, c!');
    expect(messages(pack, { testNovelty: true })).toEqual(expect.arrayContaining([expect.stringContaining('Test novelty:')]));
  });
  it('compares typed answers with choice keys in both directions', () => {
    const pack = novelPack();
    const typed = pack.assessments.find((q) => q.kind === 'typed')!;
    if (typed.kind !== 'typed') throw new Error('Typed fixture');
    typed.acceptedAnswers = ['TWO!'];
    expect(has(pack, { testNovelty: true }, 'Test novelty:')).toBe(true);
    typed.acceptedAnswers = ['independent'];
    const choice = pack.assessments[0]!;
    const practice = pack.lessons[0]!.questions.find((q) => q.kind === 'typed')!;
    if (choice.kind !== 'choice' || practice.kind !== 'typed') throw new Error('Fixture');
    choice.options[choice.correctIndex] = practice.acceptedAnswers[1]!;
    expect(has(pack, { testNovelty: true }, 'Test novelty:')).toBe(true);
  });
  it('compares localized choice keys, but does not treat a distractor as an accepted answer', () => {
    const pack = novelPack();
    const test = pack.assessments[0]!;
    if (test.kind !== 'choice') throw new Error('Choice fixture');
    test.options[0] = 'two';
    expect(check(pack, { testNovelty: true })).toEqual([]);
    test.options[test.correctIndex] = { vi: 'Two!' };
    expect(has(pack, { testNovelty: true }, 'Test novelty:')).toBe(true);
  });
  it('allows answer reuse from a different unit and respects stage scope', () => {
    const pack = novelPack();
    pack.lessons[0]!.unitId = 'another-unit';
    const test = pack.assessments.find((q) => q.kind === 'typed')!;
    if (test.kind !== 'typed') throw new Error('Typed fixture');
    test.acceptedAnswers = ['answer l1-t1'];
    expect(check(pack, { testNovelty: true })).toEqual([]);
    test.acceptedAnswers = ['two'];
    expect(check(pack, { testNovelty: true, scopeStageIds: ['outside'] })).toEqual([]);
  });
  it('uses the optional answerKey for every accepted alternative and localized choice key', () => {
    const pack = novelPack();
    const practice = pack.lessons[0]!.questions.find((question) => question.kind === 'typed')!;
    if (practice.kind !== 'typed') throw new Error('Typed fixture');
    practice.acceptedAnswers.push('oh');
    const test = pack.assessments[0]!;
    if (test.kind !== 'choice') throw new Error('Choice fixture');
    test.options[test.correctIndex] = { vi: 'zero' };
    expect(check(pack, { testNovelty: true })).toEqual([]);
    const answerKey: NonNullable<CurriculumOptions['answerKey']> = (question) => {
      const answer = question.kind === 'typed' ? question.acceptedAnswers[0]! : question.options[question.correctIndex]!;
      const text = typeof answer === 'string' ? answer : Object.values(answer)[0]!;
      return text === 'oh' ? 'zero' : text;
    };
    expect(has(pack, { testNovelty: true, answerKey }, 'Test novelty:')).toBe(true);
  });
  it.each([() => { throw new Error('bad callback'); }, () => null, () => 42])('reports a broken answerKey without throwing', (answerKey) => {
    const options = { testNovelty: true, answerKey: answerKey as never };
    expect(() => check(novelPack(), options)).not.toThrow();
    expect(has(novelPack(), options, 'answerKey threw or returned a non-string')).toBe(true);
  });
});

describe('opt-in taughtVocabulary', () => {
  const adapter: NonNullable<CurriculumOptions['optionVocabIds']> = (question, index) => {
    const metadata = question.extensions?.['qaa:option-vocab'];
    return Array.isArray(metadata) && Array.isArray(metadata[index]) ? metadata[index] as string[] : [];
  };
  it('accepts same-day introductions and earlier-day question/option vocabulary', () => {
    const pack = curriculumPack();
    const question = pack.assessments[0]!;
    question.vocabIds = ['word-1'];
    question.extensions = { 'qaa:option-vocab': [['word-1'], ['word-1'], []] };
    expect(check(pack, { taughtVocabulary: true, optionVocabIds: adapter })).toEqual([]);
  });
  it('uses the explicit schedule rather than lesson array order', () => {
    const pack = curriculumPack();
    pack.lessons.reverse();
    expect(check(pack, { taughtVocabulary: true })).toEqual([]);
  });
  it.each(['word-2', 'not-introduced'])('rejects future or absent question vocabulary: %s', (id) => {
    const pack = curriculumPack();
    pack.lessons[0]!.questions[0]!.vocabIds = [id];
    expect(has(pack, { taughtVocabulary: true }, `Vocabulary "${id}" is not introduced`)).toBe(true);
    expect(has(pack, {}, 'on or before')).toBe(false);
  });
  it.each([0, 1, 2])('checks option-level vocabulary at option %i, including the correct index', (index) => {
    const pack = curriculumPack();
    const question = pack.assessments[0]!;
    question.extensions = { 'qaa:option-vocab': [0, 1, 2].map((at) => at === index ? ['word-2'] : []) };
    const issues = check(pack, { taughtVocabulary: true, optionVocabIds: adapter });
    expect(issues).toContainEqual({ path: ['assessments', 0, 'options', index, 'vocabIds', 0],
      message: 'Vocabulary "word-2" is not introduced on or before the question\'s day' });
  });
  it('does not borrow introductions from a different course', () => {
    const pack = curriculumPack();
    pack.stages.push({ ...pack.stages[0]!, id: 'other', courseCode: 'other' });
    pack.days![1]!.stageId = 'other';
    pack.assessments[20]!.vocabIds = ['word-2'];
    expect(has(pack, { taughtVocabulary: true }, 'Vocabulary "word-2" is not introduced')).toBe(true);
  });
  it.each([() => { throw new Error('bad callback'); }, () => null, () => [42]])('reports a broken option adapter without throwing', (adapter) => {
    const options = { taughtVocabulary: true, optionVocabIds: adapter as never };
    expect(() => check(curriculumPack(), options)).not.toThrow();
    expect(has(curriculumPack(), options, 'optionVocabIds threw or returned malformed ids')).toBe(true);
  });
});

describe('opt-in forbiddenPhrases', () => {
  const forbiddenPhrases = ['editor only'];
  it('accepts clean learner copy while ignoring provenance and review metadata', () => {
    const pack = curriculumPack();
    pack.lessons[0]!.provenance.attribution = 'editor only';
    expect(check(pack, { forbiddenPhrases })).toEqual([]);
  });
  it('does not scan ids or vocabulary reference arrays in blocks as learner text', () => {
    const pack = curriculumPack();
    const example = pack.lessons[0]!.blocks.find((block) => block.kind === 'example')!;
    if (example.kind !== 'example') throw new Error('Example fixture');
    example.vocabIds = ['word-1'];
    expect(check(pack, { forbiddenPhrases: ['word-'] })).toEqual([]);
  });
  const mutate = [
    (p: MutablePack) => { p.units![0]!.canDo[0] = { vi: 'EDITOR ONLY' }; },
    (p: MutablePack) => { p.lessons[0]!.titles = { vi: 'editor only' }; },
    (p: MutablePack) => { p.lessons[0]!.blocks.push({ kind: 'tip', text: { vi: 'editor only' } }); },
    (p: MutablePack) => { p.lessons[0]!.blocks.push({ kind: 'mistake', wrong: 'x', right: 'y', note: { vi: 'editor only' } }); },
    (p: MutablePack) => { p.lessons[0]!.blocks.push({ kind: 'example', text: 'x', translations: { vi: 'editor only' } }); },
    (p: MutablePack) => { p.lessons[0]!.questions[0]!.prompt = { vi: 'editor only' }; },
    (p: MutablePack) => { p.lessons[0]!.questions[0]!.explanations = { vi: 'editor only' }; },
    (p: MutablePack) => { const q = p.lessons[0]!.questions[0]!; if (q.kind === 'choice') q.options[0] = 'editor only'; },
    (p: MutablePack) => { p.quests[0]!.extensions = { 'qaa:activity': { vi: 'editor only' } }; },
    (p: MutablePack) => { p.vocab[0]!.notes = { vi: 'editor only' }; },
    (p: MutablePack) => { p.assessments[0]!.prompt = 'ｅｄｉｔｏｒ　ｏｎｌｙ'; },
  ];
  it.each(mutate.map((apply, index) => [index, apply] as const))('detects a marker in learner surface %i', (_index, apply) => {
    const pack = curriculumPack();
    apply(pack);
    expect(has(pack, { forbiddenPhrases }, 'forbidden phrase')).toBe(true);
    expect(has(pack, {}, 'forbidden phrase')).toBe(false);
  });
  it('respects stage scope', () => {
    const pack = curriculumPack();
    pack.lessons[0]!.titles = { vi: 'editor only' };
    expect(check(pack, { forbiddenPhrases, scopeStageIds: ['outside'] })).toEqual([]);
  });
  it('checks every localized value, including locale id, without reporting a linked assessment twice', () => {
    const pack = curriculumPack();
    pack.assessments[0]!.prompt = { vi: 'A prompt', id: 'editor only' };
    const issues = check(pack, { forbiddenPhrases }).filter(({ message }) => message.includes('forbidden phrase'));
    expect(issues).toHaveLength(1);
    expect(issues[0]!.path).toEqual(['assessments', 0, 'prompt', 'id']);
  });
});

describe('opt-in optionParity', () => {
  const optionQuestion = (options: (string | { vi: string; en?: string })[]) => {
    const pack = curriculumPack();
    const question = pack.lessons[0]!.questions[0]!;
    if (question.kind !== 'choice') throw new Error('Choice fixture');
    question.options = options;
    return pack;
  };
  it.each([
    ['a (x)', 'b (y)', 'c (z)'], ['a (x)', 'bb', 'cc'], ['abcd', 'abcdefgh', 'wxyz'],
  ])('accepts matched formats and the exact 2x boundary: %j', (...options) => {
    expect(check(optionQuestion(options), { optionParity: true })).toEqual([]);
  });
  it('flags a parenthesised key but leaves the existing default unchanged', () => {
    const pack = optionQuestion(['a', 'b (hint)', 'c']);
    expect(has(pack, { optionParity: true }, 'only the correct option has a parenthesised')).toBe(true);
    expect(check(pack, {})).toEqual([]);
  });
  it('flags a key longer than twice EVERY distractor, not just one', () => {
    expect(has(optionQuestion(['abc', 'abcdefgh', 'def']), { optionParity: true }, 'more than twice')).toBe(true);
    expect(has(optionQuestion(['abc', 'abcdefgh', 'defgh']), { optionParity: true }, 'more than twice')).toBe(false);
  });
  it('compares each translation independently and folds full-width parentheses', () => {
    const pack = optionQuestion([{ vi: 'abc', en: 'alternative' }, { vi: 'def（x）', en: 'key' }, { vi: 'ghi', en: 'distractor' }]);
    expect(has(pack, { optionParity: true }, 'parenthesised')).toBe(true);
  });
  it('checks assessment options as well as practice options', () => {
    const pack = curriculumPack();
    const question = pack.assessments[0]!;
    if (question.kind !== 'choice') throw new Error('Choice fixture');
    question.options = ['short', 'answer (hint)', 'other'];
    expect(has(pack, { optionParity: true }, 'Option parity:')).toBe(true);
  });
  it('checks standalone placement questions in an unscoped call', () => {
    const pack = curriculumPack();
    const question = pack.assessments[0]!;
    if (question.kind !== 'choice') throw new Error('Choice fixture');
    pack.placement.push({ ...question, id: 'standalone', options: ['a', 'b (hint)', 'c'] });
    expect(has(pack, { optionParity: true }, 'Option parity:')).toBe(true);
  });
});

describe('authoring option robustness', () => {
  const all = { testNovelty: true, taughtVocabulary: true, forbiddenPhrases: ['private marker'], optionParity: true };
  it.each([undefined, null, false, [], {}, 42, 'not a pack'])('never throws on garbage pack %j', (pack) => {
    expect(() => check(pack, all)).not.toThrow();
    expect(check(pack, all).length).toBeGreaterThan(0);
  });
  it('reports cycles and hostile getters', () => {
    const cyclic: { self?: unknown } = {}; cyclic.self = cyclic;
    const hostile = new Proxy({}, { get() { throw new Error('hostile'); }, ownKeys() { throw new Error('hostile'); } });
    for (const pack of [cyclic, hostile]) {
      expect(() => check(pack, all)).not.toThrow();
      expect(check(pack, all).length).toBeGreaterThan(0);
    }
  });
  it.each([
    { testNovelty: 'yes' }, { taughtVocabulary: [] }, { forbiddenPhrases: [''] },
    { forbiddenPhrases: [42] }, { optionParity: 1 }, { optionVocabIds: 3 }, { answerKey: 3 },
  ])('rejects malformed option %j', (options) => {
    expect(check(curriculumPack(), options as never)[0]!.path).toEqual(['options']);
  });
  it('keeps opt-in checks scoped to the course stages selected by the caller', () => {
    expect(check(novelPack(), { ...all, scopeStageIds: [STAGE] })).toEqual([]);
  });
});
