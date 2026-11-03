import type { Day, Lesson, Question, Quest, Test, Unit } from '@solo/content-schema';
import { authored } from '../provenance.ts';
import type { UnitContent } from '../unit-content.ts';

/** Authoring stub: edit this unit only; the barrel already includes it in curriculum order. */
export const unit: Unit = {
  id: 'zh:unit:h1', stageId: 'zh:stage:hsk1', order: 1,
  titles: { vi: 'Chào hỏi', en: 'Greetings' },
  canDo: [{ vi: 'Giới thiệu tên, quốc tịch và nghề của mình bằng câu đơn.' }],
  ...authored('languages/zh/src/content/hsk1/h1.ts', 'unit', 'h1'),
};
export const lessons: readonly Lesson[] = [];
export const quests: readonly Quest[] = [];
export const assessments: readonly Question[] = [];
export const days: readonly Day[] = [];
export const tests: readonly Test[] = [];
export default { unit, lessons, quests, assessments, days, tests } satisfies UnitContent;
