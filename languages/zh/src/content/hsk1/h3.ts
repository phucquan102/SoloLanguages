import type { Day, Lesson, Question, Quest, Test, Unit } from '@solo/content-schema';
import { authored } from '../provenance.ts';
import type { UnitContent } from '../unit-content.ts';

/** Authoring stub: edit this unit only; the barrel already includes it in curriculum order. */
export const unit: Unit = {
  id: 'zh:unit:h3', stageId: 'zh:stage:hsk1', order: 3,
  titles: { vi: 'Gia đình', en: 'Family' },
  canDo: [{ vi: 'Nói về gia đình, nơi ở và công việc bằng câu đơn.' }],
  ...authored('languages/zh/src/content/hsk1/h3.ts', 'unit', 'h3'),
};
export const lessons: readonly Lesson[] = [];
export const quests: readonly Quest[] = [];
export const assessments: readonly Question[] = [];
export const days: readonly Day[] = [];
export const tests: readonly Test[] = [];
export default { unit, lessons, quests, assessments, days, tests } satisfies UnitContent;
