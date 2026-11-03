import { localizedTextSchema, provenanceSchema, reviewSchema } from '@solo/content-schema';
import type { ContentExtensionKey, ContentExtensionValidator, ContentIssuePath } from '@solo/content-schema';
import { z } from 'zod';

const text = z.string().min(1);
const record = { id: text, provenance: provenanceSchema, review: reviewSchema.optional() };

/** One source occurrence of a headword; each keeps its own provenance and original enrichment. */
const sourceVariant = z.strictObject({
  ...record,
  exampleIndex: z.number().int().nonnegative(),
  glosses: localizedTextSchema,
  fields: z.record(text, text),
  collocations: z.array(text),
  levelCode: text.optional(),
  synonyms: localizedTextSchema.optional(),
  antonyms: localizedTextSchema.optional(),
  notes: localizedTextSchema.optional(),
  mistakes: z.array(localizedTextSchema).optional(),
});

const tierVocabulary = z.strictObject({ ...record, vocabIds: z.array(text).nullable() });

const tier = z.strictObject({
  ...record,
  legacyCode: text,
  legacyProgressionLevel: z.number().int().nonnegative(),
  legacyPhase: z.number().int().nonnegative(),
  startStageId: text.optional(),
  names: localizedTextSchema,
  descriptions: localizedTextSchema,
  skillLabels: z.array(localizedTextSchema),
  vocabulary: tierVocabulary,
});

const onboarding = z.strictObject({
  ...record,
  course: text,
  foundationStageId: text,
  orientationOnly: z.boolean(),
  tiers: z.array(tier).min(1),
});

/**
 * Shapes of the extensions this module owns. Counts and literal values are asserted in tests
 * (the content reconciliation), not pinned here.
 */
export const extensionSchemas = {
  /** Per-question grading objective; consumed by gradeAnswer. */
  'en:answer-mode': z.enum(['sequence', 'spelling', 'phone', 'case-sensitive']),
  /** Vocab record extension. */
  'en:source-variants': z.array(sourceVariant).min(1),
  /** Quest record extension: the mockup's glyph for the quest. */
  'en:icon': text,
  /** Placement question extension: native-language label of its display category. */
  'en:category-label': localizedTextSchema,
  /** Assessment extension: id of the lesson question the assessment reuses. */
  'en:source-question': text,
  /** Test quest: prerequisites and first-pass reward policy; references checked by module tests. */
  'en:test-policy': z.strictObject({
    testId: text, afterQuestIds: z.array(text).min(1), repeatXp: z.literal(0),
    reward: z.literal('first-pass-per-day'),
  }),
  /** Instructions for a side activity, owned by that quest rather than a seventh main lesson. */
  'en:activity': localizedTextSchema,
  /** Pack extension: onboarding tiers and their vocabulary lists. */
  'en:onboarding': onboarding,
} as const;

const toValidator = (schema: z.ZodType): ContentExtensionValidator => (value) => {
  const result = schema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    path: issue.path.map((part): string | number => (typeof part === 'symbol' ? String(part) : part)) as ContentIssuePath,
    message: issue.message,
  }));
};

/** Hooks for the single validateContentPack call; one per extension key the pack may carry. */
export const extensionValidators = Object.fromEntries(
  Object.entries(extensionSchemas).map(([key, schema]) => [key, toValidator(schema)]),
) as Readonly<Record<keyof typeof extensionSchemas & ContentExtensionKey, ContentExtensionValidator>>;
