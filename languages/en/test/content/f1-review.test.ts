import { describe, expect, it } from 'vitest';
import { checkCurriculum } from '@solo/content-schema/testing';
import pack from '../../src/content/index.ts';
import { generalCurriculumOptions } from '../../src/content/authoring-checks.ts';
import type { ContentPack } from '@solo/content-schema';

const options = generalCurriculumOptions(pack);
const clone = () => structuredClone(pack);

const laterGeneralStages = pack.stages.filter(({ id, courseCode }) =>
  courseCode === 'general' && id !== 'en:stage:foundation').map(({ id }) => id);

/** Move the pilot's linked lessons/unit/schedule into a later stage, without changing the source pack. */
function inStage(stageId: string): ContentPack {
  const copy = clone();
  const move = <T extends { readonly stageId?: string }>(record: T): T =>
    record.stageId === 'en:stage:foundation' ? { ...record, stageId } : record;
  return { ...copy, lessons: copy.lessons.map(move), units: copy.units!.map(move),
    quests: copy.quests.map(move), days: copy.days!.map(move) };
}

describe.each(laterGeneralStages)('general scope includes non-foundation stage %s', (stageId) => {
  it('accepts the clean relocated pack and retains schedule truncation', () => {
    const copy = inStage(stageId);
    const config = generalCurriculumOptions(copy);
    expect(config.scopeStageIds).toContain(stageId);
    expect(config.truncateAtScheduleEnd).toBe(true);
    expect(checkCurriculum(copy, config)).toEqual([]);
  });
  it.each(['copied practice', 'untaught distractor', 'meta phrase', 'option parity'])('reports %s in the later stage', (fault) => {
    const copy = inStage(stageId);
    const lesson = copy.lessons[0]!;
    const question = lesson.questions[0]!;
    if (question.kind !== 'choice') throw new Error('Fixture needs a choice');
    const test = copy.tests![0]!;
    const replacement = fault === 'untaught distractor'
      ? { ...question, options: question.options.map((value, index) =>
        index === (question.correctIndex + 1) % question.options.length ? 'ninety' : value) }
      : fault === 'option parity'
        ? { ...question, options: question.options.map((value, index) =>
          index === question.correctIndex ? `${value} (hint)` : value) } : question;
    const changed = { ...copy,
      lessons: [{ ...lesson, questions: [replacement, ...lesson.questions.slice(1)],
        blocks: fault === 'meta phrase'
          ? [...lesson.blocks, { kind: 'tip' as const, text: { vi: 'Cần giáo viên nghe và chỉnh trực tiếp.' } }]
          : lesson.blocks }, ...copy.lessons.slice(1)],
      assessments: fault === 'copied practice'
        ? copy.assessments.map((assessment) => assessment.id === test.questionIds[0]
          ? { ...question, id: assessment.id } : assessment) : copy.assessments,
    };
    const issues = checkCurriculum(changed, generalCurriculumOptions(changed));
    const marker = { 'copied practice': 'Test novelty:', 'untaught distractor': 'en:vocab:ninety',
      'meta phrase': 'forbidden phrase', 'option parity': 'Option parity:' }[fault]!;
    expect(issues.some(({ path, message }) => message.includes(marker)
      && (fault === 'copied practice' ? path[0] === 'tests' : path[0] === 'lessons')
      && (fault !== 'untaught distractor' || path.includes('options')))).toBe(true);
  });
});

describe('answer-mode-aware test novelty', () => {
  it.each([
    ['phone', 'oh one four', 'zero one four'],
    ['phone', 'double seven triple two', 'seven seven two two two'],
    ['spelling', 'double Z', 'Z Z'],
  ])('reports a %s practice answer copied as %s / %s', (mode, practiceAnswer, testAnswer) => {
    const copy = clone();
    const lesson = copy.lessons[0]!;
    const original = lesson.questions[0]!;
    const practice = { id: original.id, provenance: original.provenance, explanations: { vi: 'Đáp án mẫu.' },
      kind: 'typed' as const,
      prompt: { vi: 'Câu luyện mới.' }, acceptedAnswers: [practiceAnswer!],
      extensions: { 'en:answer-mode': mode! } };
    const first = copy.assessments[0]!;
    const assessment = { ...practice, id: first.id, prompt: { vi: 'Câu kiểm tra khác.' }, acceptedAnswers: [testAnswer!] };
    const changed = { ...copy, lessons: [{ ...lesson, questions: [practice, ...lesson.questions.slice(1)] }, ...copy.lessons.slice(1)],
      assessments: [assessment, ...copy.assessments.slice(1)] };
    const config = generalCurriculumOptions(changed);
    const atCopiedAnswer = ({ path, message }: ReturnType<typeof checkCurriculum>[number]) =>
      path[0] === 'tests' && path[1] === 0 && path[2] === 'questionIds' && path[3] === 0 && message.startsWith('Test novelty:');
    const { answerKey: _answerKey, ...defaultConfig } = config;
    expect(checkCurriculum(changed, defaultConfig).some(atCopiedAnswer)).toBe(false);
    expect(checkCurriculum(changed, config).some(atCopiedAnswer)).toBe(true);
  });
});

describe('general course authoring gate (all current and future units)', () => {
  it('passes novelty, taught vocabulary, meta-text and option parity checks', () => {
    expect(checkCurriculum(pack, options)).toEqual([]);
  });
  it('detects a copied answer with a new prompt and different separators', () => {
    const mutated = clone();
    const practice = mutated.lessons.flatMap(({ questions }) => questions)
      .find((question) => question.kind === 'typed' && question.extensions?.['en:answer-mode'] === 'spelling')!;
    if (practice.kind !== 'typed') throw new Error('Fixture needs spelling practice');
    const first = mutated.assessments[0]!;
    const copy = { id: first.id, provenance: first.provenance, prompt: first.prompt,
      kind: 'typed' as const, extensions: practice.extensions,
      acceptedAnswers: [practice.acceptedAnswers[0]!.replaceAll('-', ', ') + '!'] };
    expect(checkCurriculum({ ...mutated, assessments: [copy, ...mutated.assessments.slice(1)] }, options)
      .some(({ message }) => message.startsWith('Test novelty:'))).toBe(true);
  });
  it.each([0, 1, 2])('checks untaught words in EVERY option, including the key (option %i)', (index) => {
    const mutated = clone();
    const lesson = mutated.lessons[0]!;
    const first = lesson.questions[0]!;
    if (first.kind !== 'choice') throw new Error('Fixture needs a choice');
    const replacement = { ...first, options: first.options.map((value, at) => at === index ? 'ninety' : value) };
    const changed = { ...mutated, lessons: [{ ...lesson, questions: [replacement, ...lesson.questions.slice(1)] },
      ...mutated.lessons.slice(1)] };
    expect(checkCurriculum(changed, options).some(({ path, message }) =>
      path.includes('options') && message.includes('en:vocab:ninety'))).toBe(true);
  });
  it('detects the remaining review marker in a learner tip', () => {
    const mutated = clone();
    const lesson = mutated.lessons[0]!;
    const changed = { ...mutated, lessons: [{ ...lesson,
      blocks: [...lesson.blocks, { kind: 'tip' as const, text: { vi: 'Cần giáo viên nghe và chỉnh trực tiếp.' } }],
    }, ...mutated.lessons.slice(1)] };
    expect(checkCurriculum(changed, options).some(({ message }) => message.includes('forbidden phrase'))).toBe(true);
  });
  it('detects an answer given away by a unique parenthetical hint', () => {
    const mutated = clone();
    const lesson = mutated.lessons[0]!;
    const first = lesson.questions[0]!;
    if (first.kind !== 'choice') throw new Error('Fixture needs a choice');
    const changed = { ...mutated, lessons: [{ ...lesson, questions: [{ ...first,
      options: first.options.map((value, index) => index === first.correctIndex ? `${value} (hint)` : value),
    }, ...lesson.questions.slice(1)] }, ...mutated.lessons.slice(1)] };
    expect(checkCurriculum(changed, options).some(({ message }) => message.startsWith('Option parity:'))).toBe(true);
  });
});
