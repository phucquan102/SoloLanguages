import type { Day, Lesson, Question, Quest, Test, Unit } from '@solo/content-schema';

/** Every unit owns these collections; vocabulary is assembled once from the frozen manifests. */
export interface UnitContent {
  readonly unit: Unit;
  readonly lessons: readonly Lesson[];
  readonly quests: readonly Quest[];
  readonly assessments: readonly Question[];
  readonly days: readonly Day[];
  readonly tests: readonly Test[];
}

export const XP = { main: 10, daily: 20, side: 10, unit: 30, repeat: 0 } as const;

export function assemble(content: readonly UnitContent[]) {
  return {
    units: content.map(({ unit }) => unit),
    lessons: content.flatMap(({ lessons }) => lessons),
    quests: content.flatMap(({ quests }) => quests),
    assessments: content.flatMap(({ assessments }) => assessments),
    days: content.flatMap(({ days }) => days),
    tests: content.flatMap(({ tests }) => tests),
  };
}
