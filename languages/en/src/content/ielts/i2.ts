import type { Day, Lesson, Question, Quest, Test, Unit } from '@solo/content-schema';
import { authored } from '../provenance.ts';
import type { UnitContent } from '../unit-content.ts';

/** Authoring stub: edit this unit only; the barrel already includes it in curriculum order. */
export const unit: Unit = {
  id: 'en:unit:i2', stageId: 'en:stage:ielts-foundation', order: 2,
  titles: { vi: 'Nghe thông tin', en: 'Listening for information' },
  canDo: [{ vi: 'Tìm thông tin cụ thể và điền biểu mẫu khi nghe.' }],
  ...authored('languages/en/src/content/ielts/i2.ts', 'unit', 'i2'),
};
export const lessons: readonly Lesson[] = [];
export const quests: readonly Quest[] = [];
export const assessments: readonly Question[] = [];
export const days: readonly Day[] = [];
export const tests: readonly Test[] = [];
export default { unit, lessons, quests, assessments, days, tests } satisfies UnitContent;
