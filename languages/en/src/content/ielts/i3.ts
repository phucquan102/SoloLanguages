import type { Day, Lesson, Question, Quest, Test, Unit } from '@solo/content-schema';
import { authored } from '../provenance.ts';
import type { UnitContent } from '../unit-content.ts';

/** Authoring stub: edit this unit only; the barrel already includes it in curriculum order. */
export const unit: Unit = {
  id: 'en:unit:i3', stageId: 'en:stage:ielts-foundation', order: 3,
  titles: { vi: 'Đọc có mục đích', en: 'Reading with a purpose' },
  canDo: [{ vi: 'Đọc tìm ý chính, chi tiết và đối chiếu thông tin.' }],
  ...authored('languages/en/src/content/ielts/i3.ts', 'unit', 'i3'),
};
export const lessons: readonly Lesson[] = [];
export const quests: readonly Quest[] = [];
export const assessments: readonly Question[] = [];
export const days: readonly Day[] = [];
export const tests: readonly Test[] = [];
export default { unit, lessons, quests, assessments, days, tests } satisfies UnitContent;
