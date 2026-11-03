import type { Day, Lesson, Question, Quest, Test, Unit } from '@solo/content-schema';
import { authored } from '../provenance.ts';
import type { UnitContent } from '../unit-content.ts';

/** Authoring stub: edit this unit only; the barrel already includes it in curriculum order. */
export const unit: Unit = {
  id: 'en:unit:i1', stageId: 'en:stage:ielts-foundation', order: 1,
  titles: { vi: 'Bản đồ kỳ thi', en: 'Test overview' },
  canDo: [{ vi: 'Xác định yêu cầu bài thi và đặt mục tiêu học.' }],
  ...authored('languages/en/src/content/ielts/i1.ts', 'unit', 'i1'),
};
export const lessons: readonly Lesson[] = [];
export const quests: readonly Quest[] = [];
export const assessments: readonly Question[] = [];
export const days: readonly Day[] = [];
export const tests: readonly Test[] = [];
export default { unit, lessons, quests, assessments, days, tests } satisfies UnitContent;
