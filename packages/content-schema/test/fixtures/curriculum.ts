import type { ChoiceQuestion, ContentPack, LessonBlock, Question, Review, TypedQuestion } from '../../src/index.ts';
import type { CurriculumOptions } from '@solo/content-schema/testing';
import { provenance } from './pack.ts';

type Writable<T> = T extends readonly (infer E)[] ? Writable<E>[]
  : T extends object ? { -readonly [K in keyof T]: Writable<T[K]> } : T;

/** A deeply mutable pack so tests can break one rule at a time. */
export type MutablePack = Writable<ContentPack>;

export const STAGE = 'stage-c';
export const WORDS = ['alpha', 'bravo', 'charlie', 'delta'] as const;
export const DAYS = 5;

/** Language-neutral stand-ins for the module text tools. */
export const normalize = (text: string): string =>
  text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/gu, ' ').trim();
export const compareAnswer = (input: string, accepted: readonly string[]): { correct: boolean } =>
  ({ correct: accepted.some((answer) => normalize(answer) === normalize(input)) });

export const curriculumOptions: CurriculumOptions = { nativeLocales: ['vi'], normalize, compareAnswer };

export const curriculumContext = {
  language: 'qaa',
  skills: ['reading'],
  levels: { rubric: ['L1'] },
  courses: { general: { framework: 'rubric', levels: ['L1'] } },
};

export const approved: Review = { status: 'approved', reviewerRoles: ['native', 'editor'], date: '2026-11-02' };

const choice = (id: string, prompt: string, vocabIds?: string[]): ChoiceQuestion => ({
  id, provenance, kind: 'choice', prompt: { vi: prompt }, options: ['one', 'two', 'three'], correctIndex: 1,
  explanations: { vi: `Why ${id}` }, ...(vocabIds ? { vocabIds } : {}),
});

const typed = (id: string, prompt: string, vocabIds?: string[]): TypedQuestion => ({
  id, provenance, kind: 'typed', prompt: { vi: prompt }, acceptedAnswers: [`answer ${id}`, `reply ${id}`],
  explanations: { vi: `Why ${id}` }, ...(vocabIds ? { vocabIds } : {}),
});

function lesson(n: number) {
  const word = WORDS[n - 1];
  const ids = word === undefined ? [] : [`word-${n}`];
  const examples: LessonBlock[] = [1, 2, 3, 4].map((k) => ({
    kind: 'example', text: k === 1 && word !== undefined ? `This is the ${word} sample` : `Plain sample ${n} ${k}`,
    translations: { vi: `Ví dụ ${n} ${k}` }, transcription: `/s${k}/`,
  }));
  const questions: Question[] = [
    choice(`l${n}-c1`, `Lesson ${n} choice 1`, ids), choice(`l${n}-c2`, `Lesson ${n} choice 2`, ids),
    choice(`l${n}-c3`, `Lesson ${n} choice 3`), choice(`l${n}-c4`, `Lesson ${n} choice 4`),
    typed(`l${n}-t1`, `Lesson ${n} typed 1`), typed(`l${n}-t2`, `Lesson ${n} typed 2`), typed(`l${n}-t3`, `Lesson ${n} typed 3`),
  ];
  return {
    id: `lesson-${n}`, provenance, stageId: STAGE, unitId: 'unit-1', order: n, titles: { vi: `Bài ${n}` }, skill: 'reading',
    blocks: [
      { kind: 'objective', text: { vi: 'Mục tiêu' } },
      { kind: 'explanation', text: { vi: 'Giải thích' }, pattern: 'a + b' },
      ...examples,
      { kind: 'mistake', wrong: 'wrong form', right: 'right form', note: { vi: 'Lỗi thường gặp' } },
      { kind: 'tip', text: { vi: 'Mẹo' } },
    ] satisfies LessonBlock[],
    questions,
    ...(ids.length ? { vocabIds: ids } : {}),
    ...(n > 1 ? { reviewVocabIds: WORDS.slice(0, n - 1).map((_word, index) => `word-${index + 1}`) } : {}),
  };
}

function testQuestions(day: number): Question[] {
  return Array.from({ length: 10 }, (_item, index) => index < 7
    ? choice(`test-${day}-q${index + 1}`, `Test ${day} item ${index + 1}`)
    : typed(`test-${day}-q${index + 1}`, `Test ${day} item ${index + 1}`));
}

/**
 * A pack that satisfies every curriculum rule: five days, one lesson per day, four introduced words,
 * daily tests of ten questions that revisit earlier words.
 */
export function curriculumPack(): MutablePack {
  const days = Array.from({ length: DAYS }, (_item, index) => index + 1);
  return {
    schemaVersion: 1,
    language: 'qaa',
    stages: [{ id: STAGE, provenance, courseCode: 'general', order: 0, levelCode: null, labels: { vi: 'Curriculum' } }],
    units: [{ id: 'unit-1', provenance, stageId: STAGE, order: 1, titles: { vi: 'Đơn vị 1' }, canDo: [{ vi: 'Làm được việc' }] }],
    vocab: WORDS.map((word, index) => ({
      id: `word-${index + 1}`, provenance, headword: word, glosses: { vi: `Nghĩa ${word}` }, examples: [],
      fields: { reading: word }, stageId: STAGE,
    })),
    lessons: days.map(lesson),
    quests: days.map((n) => ({
      id: `quest-${n}`, provenance, stageId: STAGE, titles: { vi: `Nhiệm vụ ${n}` }, skill: 'reading',
      minutes: 10, xp: 10, lessonIds: [`lesson-${n}`], optional: false,
    })),
    days: days.map((n) => ({
      id: `day-${n}`, provenance, stageId: STAGE, unitId: 'unit-1', day: n, mainQuestIds: [`quest-${n}`], testId: `test-${n}`,
    })),
    tests: days.map((n) => ({
      id: `test-${n}`, provenance, kind: 'daily', questionIds: testQuestions(n).map((question) => question.id), passRatio: 0.85,
      ...(n > 1 ? { reviewVocabIds: WORDS.slice(0, n - 1).map((_word, index) => `word-${index + 1}`) } : {}),
    })),
    placement: [],
    assessments: days.flatMap(testQuestions),
  } as unknown as MutablePack;
}

/** Adds the same review to every record, including nested questions. */
export function withReview(pack: MutablePack, review: Review = approved): MutablePack {
  const visit = (value: unknown): void => {
    if (value === null || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    const object = value as Record<string, unknown>;
    if (Object.hasOwn(object, 'provenance')) object['review'] = structuredClone(review);
    Object.values(object).forEach(visit);
  };
  visit(pack);
  return pack;
}
