import type { Lesson, Vocab } from '@solo/content-schema';
import type { VocabManifestRow } from './manifest/hsk.ts';
import { hskVocabManifest } from './manifest/hsk.ts';
import { lessons } from './lessons.ts';
import { authored } from './provenance.ts';

/**
 * Instantiate each manifest id once. Entries whose unit has no lessons yet keep their dictionary data but no
 * examples or stage claim. Examples come from authored lesson blocks that show the word with a translation;
 * `exampleHint` is a planning hint, not a translated example ready for publication.
 */
export function buildVocab(rows: readonly VocabManifestRow[], authoredLessons: readonly Lesson[], file: string): Vocab[] {
  return rows.map((row) => {
    const owner = authoredLessons.find((lesson) => lesson.id === `zh:lesson:${row.lessonSlug}` && lesson.unitId === row.unitId);
    return {
      id: row.id, headword: row.hanzi, glosses: row.glosses, fields: { pinyin: row.pinyin },
      examples: owner?.blocks.flatMap((block) => block.kind === 'example' && block.vocabIds?.includes(row.id)
        && block.translations ? [{ text: block.text, translations: block.translations }] : []) ?? [],
      ...(owner?.stageId === undefined ? {} : { stageId: owner.stageId }),
      ...(row.note === undefined ? {} : { notes: { vi: row.note } }),
      ...authored(file, 'hskVocabManifest', row.id),
    };
  });
}

export const vocab: readonly Vocab[] = buildVocab(hskVocabManifest, lessons, 'languages/zh/src/content/manifest/hsk.ts');
export default vocab;
