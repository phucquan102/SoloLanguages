import type { Day, Lesson, Question, Quest, Test, Unit } from '@solo/content-schema';
import { authored } from '../provenance.ts';
import type { UnitContent } from '../unit-content.ts';

/** Authoring stub: edit this unit only; the barrel already includes it in curriculum order. */
export const unit: Unit = {
  id: 'en:unit:i4', stageId: 'en:stage:ielts-foundation', order: 4,
  titles: { vi: 'Viết và nói', en: 'Writing and speaking' },
  canDo: [{ vi: 'Tổ chức câu, đoạn văn và bài nói ngắn.' }],
  ...authored('languages/en/src/content/ielts/i4.ts', 'unit', 'i4'),
};
export const lessons: readonly Lesson[] = [];
export const quests: readonly Quest[] = [];
export const assessments: readonly Question[] = [];
export const days: readonly Day[] = [];
export const tests: readonly Test[] = [];
export default { unit, lessons, quests, assessments, days, tests } satisfies UnitContent;
