/** Owner decision O1: self-authored content is proprietary. */
export const LICENSE = 'LicenseRef-SoloLanguages-Proprietary';
export const ATTRIBUTION = '© SoloLanguages. All rights reserved.';

/** One authoring run: every curriculum record in the Chinese pack shares this timestamp. Never computed at load. */
export const AUTHORED_AT = '2026-11-03T09:00:00.000Z';

/** Legacy mockup extraction (records kept from commit bc95722 carry these literally in their data files). */
export const LEGACY_VERSION = 'bc95722';
export const LEGACY_RETRIEVED_AT = '2026-11-02T08:40:09.589Z';

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
