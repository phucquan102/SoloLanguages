import type { ContentPack } from '@solo/content-schema';

export interface Occurrence {
  readonly key: string;
  /** Kind of record carrying the extension, or 'pack' for pack-level datasets. */
  readonly location: string;
  readonly value: unknown;
}

type Carrier = { readonly extensions?: Readonly<Record<string, unknown>> };

/** Every extension in the pack together with the record kind that owns it. */
export function extensionOccurrences(pack: ContentPack): Occurrence[] {
  const found: Occurrence[] = [];
  const take = (location: string, owner: Carrier) => {
    for (const [key, value] of Object.entries(owner.extensions ?? {})) found.push({ key, location, value });
  };
  take('pack', pack);
  pack.stages.forEach((stage) => take('stage', stage));
  pack.vocab.forEach((word) => take('vocab', word));
  pack.lessons.forEach((lesson) => {
    take('lesson', lesson);
    lesson.questions.forEach((question) => take('lesson-question', question));
  });
  pack.quests.forEach((quest) => take('quest', quest));
  pack.placement.forEach((question) => take('placement', question));
  pack.assessments.forEach((question) => take('assessment', question));
  return found;
}
