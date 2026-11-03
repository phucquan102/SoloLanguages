/** Mockup files that supply English content; paths are relative to the repository's mockup directory. */
export type MockupFile = 'index.html' | 'onboarding.js' | 'course-workspace.js';

/**
 * Plain-data provenance. A type alias (not the shared interface) keeps records that embed it
 * assignable to JSON extension values; it is structurally identical to the shared Provenance.
 */
export type SourceProvenance = {
  readonly source: {
    readonly file: string;
    readonly declaration: string;
    readonly line: number;
    readonly item: string | number;
  };
  readonly license: string;
  readonly attribution: string;
  readonly version: string;
  readonly retrievedAt: string;
};

/** One extraction run: every record in the English pack shares this timestamp. */
export const RETRIEVED_AT = '2026-11-02T07:57:27.174Z';

/** Source commit of the mockup the content was extracted from. */
export const SOURCE_VERSION = 'bc95722';

/** Owner decision O1: self-authored content is proprietary. */
export const LICENSE = 'LicenseRef-SoloLanguages-Proprietary';
export const ATTRIBUTION = '© SoloLanguages. All rights reserved.';

/** Fixed authoring run, never computed at module load time. Legacy extraction dates stay intact. */
export const AUTHORED_AT = '2026-11-03T09:00:00.000Z';

/** Owner decision O1; pass the repository-relative file that actually authors the record. */
export function authored(file: string, declaration: string, item: string) {
  return {
    provenance: {
      source: { file, declaration, item },
      license: LICENSE,
      attribution: ATTRIBUTION,
      version: 'curriculum-v1',
      retrievedAt: AUTHORED_AT,
    },
    review: { status: 'ai-draft' as const, reviewerRoles: [], date: AUTHORED_AT.slice(0, 10) },
  };
}

export function provenance(
  file: MockupFile, declaration: string, line: number, item: string | number,
): SourceProvenance {
  return {
    source: { file: `mockup/${file}`, declaration, line, item },
    license: LICENSE,
    attribution: ATTRIBUTION,
    version: SOURCE_VERSION,
    retrievedAt: RETRIEVED_AT,
  };
}
