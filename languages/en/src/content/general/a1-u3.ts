import type { Day, Lesson, Question, Quest, Test, Unit } from '@solo/content-schema';
import { authored } from '../provenance.ts';
import type { UnitContent } from '../unit-content.ts';

/** Authoring stub: edit this unit only; the barrel already includes it in curriculum order. */
export const unit: Unit = {
  id: 'en:unit:a1-u3', stageId: 'en:stage:english-foundation', order: 3,
  titles: { vi: 'Một ngày', en: 'A day' },
  canDo: [{ vi: 'Nói về thói quen, giờ giấc và tần suất.' }],
  ...authored('languages/en/src/content/general/a1-u3.ts', 'unit', 'a1-u3'),
};
export const lessons: readonly Lesson[] = [];
export const quests: readonly Quest[] = [];
export const assessments: readonly Question[] = [];
export const days: readonly Day[] = [];
export const tests: readonly Test[] = [];
export default { unit, lessons, quests, assessments, days, tests } satisfies UnitContent;
