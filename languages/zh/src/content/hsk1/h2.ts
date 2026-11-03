import type { Day, Lesson, Question, Quest, Test, Unit } from '@solo/content-schema';
import { authored } from '../provenance.ts';
import type { UnitContent } from '../unit-content.ts';

/** Authoring stub: edit this unit only; the barrel already includes it in curriculum order. */
export const unit: Unit = {
  id: 'zh:unit:h2', stageId: 'zh:stage:hsk1', order: 2,
  titles: { vi: 'Số và giờ', en: 'Numbers and time' },
  canDo: [{ vi: 'Nói số, tuổi, ngày tháng và giờ.' }],
  ...authored('languages/zh/src/content/hsk1/h2.ts', 'unit', 'h2'),
};
export const lessons: readonly Lesson[] = [];
export const quests: readonly Quest[] = [];
export const assessments: readonly Question[] = [];
export const days: readonly Day[] = [];
export const tests: readonly Test[] = [];
export default { unit, lessons, quests, assessments, days, tests } satisfies UnitContent;
