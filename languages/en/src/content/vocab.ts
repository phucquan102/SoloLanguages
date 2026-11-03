import type { Lesson, Vocab } from '@solo/content-schema';
import type { VocabManifestRow } from './manifest/general.ts';
import { generalVocabManifest } from './manifest/general.ts';
import { ieltsVocabManifest } from './manifest/ielts.ts';
import { lessons } from './lessons.ts';
import { authored } from './provenance.ts';

/**
 * Instantiate each manifest id once. Future units keep unassigned dictionary entries, with no
 * examples or stage claim until their lessons exist. Examples come from authored lesson blocks;
 * exampleHint is a planning hint, not a translated example ready for publication.
 */
export function buildVocab(rows: readonly VocabManifestRow[], authoredLessons: readonly Lesson[], file: string): Vocab[] {
  return rows.map((row) => {
    const owner = authoredLessons.find((lesson) => lesson.id === 'en:lesson:' + row.lessonSlug);
    return {
      id: row.id, headword: row.headword, glosses: row.glosses, fields: { ipa: row.ipa },
      examples: owner?.blocks.flatMap((block) => block.kind === 'example' && block.vocabIds?.includes(row.id)
        && block.translations ? [{ text: block.text, translations: block.translations }] : []) ?? [],
      ...(owner?.stageId === undefined ? {} : { stageId: owner.stageId }),
      ...(row.note === undefined ? {} : { notes: { vi: row.note } }),
      ...authored(file, 'vocabManifest', row.id),
    };
  });
}

export const vocab: readonly Vocab[] = [
  ...buildVocab(generalVocabManifest, lessons, 'languages/en/src/content/manifest/general.ts'),
  ...buildVocab(ieltsVocabManifest, lessons, 'languages/en/src/content/manifest/ielts.ts'),
];
