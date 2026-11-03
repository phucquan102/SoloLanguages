import type { Day, Lesson, Question, Quest, Test, Unit } from '@solo/content-schema';
import { authored } from '../provenance.ts';
import type { UnitContent } from '../unit-content.ts';

/**
 * Authoring stub for the eight side lessons (strokes-basic, strokes-turning, stroke-order-rules,
 * radicals-1 ... radicals-5). Side quests are optional, graded by canvas, trace or self-check rather than typed
 * answers (guide C9), and are attached to the N1 days through that table's `sideQuests`. Edit this unit only.
 */
export const unit: Unit = {
  id: 'zh:unit:n1-side', stageId: 'zh:stage:foundation', order: 2,
  titles: { vi: 'Viết chữ và bộ thủ', en: 'Writing and radicals' },
  canDo: [{ vi: 'Viết các nét cơ bản theo thứ tự nét và nhận ra các bộ thủ thông dụng.' }],
  ...authored('languages/zh/src/content/foundation/side.ts', 'unit', 'n1-side'),
};
export const lessons: readonly Lesson[] = [];
export const quests: readonly Quest[] = [];
export const assessments: readonly Question[] = [];
export const days: readonly Day[] = [];
export const tests: readonly Test[] = [];
export default { unit, lessons, quests, assessments, days, tests } satisfies UnitContent;
