import type { AddIssue, CurriculumConfig } from './curriculum-questions.ts';
import type { PackData } from './pack-data.ts';

/** Position of a study day on its course timeline: days sorted by stage order, then day number. */
export interface Slot {
  readonly course: string;
  readonly ordinal: number;
}

export interface Schedule {
  /** Slot of the earliest day that reaches the lesson through a main or side quest. */
  readonly lessons: ReadonlyMap<string, Slot>;
  /** Slot of the earliest day that closes with the test. */
  readonly tests: ReadonlyMap<string, Slot>;
  /** Ordinal of the last scheduled day per course. */
  readonly lastOrdinal: ReadonlyMap<string, number>;
}

export function buildSchedule(data: PackData): Schedule {
  const stages = new Map(data.stages.map((stage) => [stage.id, stage]));
  const quests = new Map(data.quests.map((quest) => [quest.id, quest]));
  const days = (data.days ?? []).map((day) => ({
    day, course: stages.get(day.stageId)?.courseCode ?? '', stageOrder: stages.get(day.stageId)?.order ?? 0,
  })).sort((left, right) => (left.course < right.course ? -1 : left.course > right.course ? 1 : 0)
    || left.stageOrder - right.stageOrder || left.day.day - right.day.day);
  const next = new Map<string, number>();
  const lessons = new Map<string, Slot>();
  const tests = new Map<string, Slot>();
  for (const { day, course } of days) {
    const ordinal = next.get(course) ?? 0;
    next.set(course, ordinal + 1);
    const slot = { course, ordinal };
    for (const questId of [...day.mainQuestIds, ...(day.sideQuestIds ?? [])]) {
      for (const lessonId of quests.get(questId)?.lessonIds ?? []) if (!lessons.has(lessonId)) lessons.set(lessonId, slot);
    }
    if (!tests.has(day.testId)) tests.set(day.testId, slot);
  }
  const lastOrdinal = new Map([...next].map(([course, count]) => [course, count - 1]));
  return { lessons, tests, lastOrdinal };
}

const isCased = (char: string): boolean => char.toLowerCase() !== char.toUpperCase();

/**
 * Tokenizer-agnostic headword lookup. Scripts with letter case separate words by spaces, so a match
 * must not touch a neighbouring letter or digit there; other scripts are matched as plain substrings.
 */
export function mentions(text: string, headword: string, normalize: (text: string) => string): boolean {
  const haystack = normalize(text);
  const needle = normalize(headword);
  if (needle === '') return false;
  const chars = [...needle];
  const first = chars[0]!;
  const last = chars[chars.length - 1]!;
  for (let at = haystack.indexOf(needle); at >= 0; at = haystack.indexOf(needle, at + 1)) {
    const touchesBefore = isCased(first) && /[\p{L}\p{N}]$/u.test(haystack.slice(0, at));
    const touchesAfter = isCased(last) && /^[\p{L}\p{N}]/u.test(haystack.slice(at + needle.length));
    if (!touchesBefore && !touchesAfter) return true;
  }
  return false;
}

/** Vocabulary rules for the lessons in scope, given as indexes into `data.lessons`. */
export function checkVocabulary(
  data: PackData, scopedLessons: readonly number[], schedule: Schedule, config: CurriculumConfig, add: AddIssue,
): void {
  const vocab = new Map(data.vocab.map((record, index) => [record.id, { record, index }]));
  const introducedBy = new Map<string, number>();
  for (const lesson of data.lessons) {
    for (const id of lesson.vocabIds ?? []) introducedBy.set(id, (introducedBy.get(id) ?? 0) + 1);
  }
  const scopedIds = new Set(scopedLessons.flatMap((index) => data.lessons[index]!.vocabIds ?? []));
  data.vocab.forEach((record, index) => {
    const inScope = config.scope === undefined
      || (record.stageId !== undefined && config.scope.has(record.stageId)) || scopedIds.has(record.id);
    if (!inScope) return;
    const count = introducedBy.get(record.id) ?? 0;
    if (count === 0) add(['vocab', index], `Vocabulary "${record.id}" is never introduced by a lesson`);
    else if (count > 1) add(['vocab', index], `Vocabulary "${record.id}" is introduced ${count} times, expected exactly once`);
  });

  // Each lesson or test counts once per vocabulary id, however often it lists the id.
  const revisits = new Map<string, Slot[]>();
  const addRevisits = (ids: readonly string[] | undefined, slot: Slot | undefined) => {
    if (slot === undefined) return;
    for (const id of new Set(ids)) revisits.set(id, [...revisits.get(id) ?? [], slot]);
  };
  data.lessons.forEach((lesson) => addRevisits(lesson.reviewVocabIds, schedule.lessons.get(lesson.id)));
  (data.tests ?? []).forEach((test) => addRevisits(test.reviewVocabIds, schedule.tests.get(test.id)));

  for (const index of scopedLessons) {
    const lesson = data.lessons[index]!;
    const path = ['lessons', index, 'vocabIds'];
    const examples = lesson.blocks.flatMap((block) => block.kind === 'example' ? [block] : []);
    const introduced = lesson.vocabIds ?? [];
    introduced.forEach((id, position) => {
      const entry = vocab.get(id);
      if (entry === undefined) return;
      const questions = lesson.questions.filter((question) => question.vocabIds?.includes(id)).length;
      if (questions < config.minQuestionsPerVocab) {
        add([...path, position], `Vocabulary "${id}" appears in ${questions} lesson questions, needs at least ${config.minQuestionsPerVocab}`);
      }
      const shown = examples.some((example) => example.vocabIds !== undefined
        ? example.vocabIds.includes(id) : mentions(example.text, entry.record.headword, config.normalize));
      if (!shown) add([...path, position], `Vocabulary "${id}" appears in no example of its lesson`);
      const slot = schedule.lessons.get(lesson.id);
      if (slot === undefined) return;
      const recycled = (revisits.get(id) ?? []).filter((later) => later.course === slot.course
        && later.ordinal > slot.ordinal && later.ordinal - slot.ordinal <= config.recycleWindowDays).length;
      // With `truncateAtScheduleEnd`, a schedule that ends inside the window demands at most one
      // revisit per remaining day, so a course that is still being authored can pass.
      const laterDays = config.truncateAtScheduleEnd
        ? Math.min(config.recycleWindowDays, (schedule.lastOrdinal.get(slot.course) ?? slot.ordinal) - slot.ordinal)
        : Infinity;
      const required = Math.min(config.minRecycles, laterDays);
      if (recycled < required) {
        add([...path, position], `Vocabulary "${id}" is recycled ${recycled} times within ${config.recycleWindowDays} days, needs at least ${required}`);
      }
    });
  }
}
