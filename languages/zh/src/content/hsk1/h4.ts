import type { Day, Lesson, Question, Quest, Test, Unit } from '@solo/content-schema';
import { authored } from '../provenance.ts';
import type { UnitContent } from '../unit-content.ts';

/** Authoring stub: edit this unit only; the barrel already includes it in curriculum order. */
export const unit: Unit = {
  id: 'zh:unit:h4', stageId: 'zh:stage:hsk1', order: 4,
  titles: { vi: 'Ăn và mua', en: 'Food and shopping' },
  canDo: [{ vi: 'Gọi món, hỏi giá và nói mình muốn gì.' }],
  ...authored('languages/zh/src/content/hsk1/h4.ts', 'unit', 'h4'),
};
export const lessons: readonly Lesson[] = [];
export const quests: readonly Quest[] = [];
export const assessments: readonly Question[] = [];
export const days: readonly Day[] = [];
export const tests: readonly Test[] = [];
export default { unit, lessons, quests, assessments, days, tests } satisfies UnitContent;
