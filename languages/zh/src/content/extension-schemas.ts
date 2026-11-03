import { localizedTextSchema, provenanceSchema } from '@solo/content-schema';
import type { ContentExtensionValidator, ContentValidationIssue, JsonValue } from '@solo/content-schema';
import { z } from 'zod';

const text = z.string().min(1);
const record = { id: text, provenance: provenanceSchema };
const toneNumber = z.number().int().min(0).max(4); // 0 is the neutral tone.
const curve = text.regex(/^\d+,\d+(?: \d+,\d+)+$/u);
const count = z.number().int().nonnegative();

// Pack-level datasets.
const toneVariantSchema = z.strictObject({
  ...record, pinyin: text, character: text, glosses: localizedTextSchema,
  number: toneNumber, descriptions: localizedTextSchema, curve,
});
export const tonesSchema = z.array(z.strictObject({
  ...record, number: toneNumber, pinyin: text, vowel: text, mark: text,
  names: localizedTextSchema, direction: localizedTextSchema, hints: localizedTextSchema,
  curve, character: text, glosses: localizedTextSchema, variants: z.array(toneVariantSchema).min(1),
}));

const gridSize = z.number().positive();
export const charactersSchema = z.array(z.strictObject({
  ...record, character: text, pinyin: text, glosses: localizedTextSchema,
  strokeNames: z.array(localizedTextSchema).min(1),
  strokes: z.array(z.array(z.tuple([z.number().min(0), z.number().min(0)])).min(2)).min(1),
  gridSize: z.tuple([gridSize, gridSize]),
  simplifiedMockData: z.boolean(), verified: z.boolean(), vocabIds: z.array(text),
}).superRefine((value, ctx) => {
  if (value.strokeNames.length !== value.strokes.length) {
    ctx.addIssue({ code: 'custom', path: ['strokeNames'], message: 'Each stroke needs its source name' });
  }
  const [width, height] = value.gridSize;
  value.strokes.forEach((stroke, strokeIndex) => stroke.forEach(([x, y], pointIndex) => {
    if (x > width || y > height) {
      ctx.addIssue({ code: 'custom', path: ['strokes', strokeIndex, pointIndex], message: 'Stroke point lies outside the source grid' });
    }
  }));
}));

export const toneExercisesSchema = z.array(z.strictObject({
  ...record, mode: z.enum(['guided', 'check']), pinyin: text, toneId: text, tone: toneNumber,
  choices: z.array(toneNumber).min(2).optional(),
}).superRefine((value, ctx) => {
  if (value.toneId !== `zh:tone:${value.tone}`) {
    ctx.addIssue({ code: 'custom', path: ['toneId'], message: 'Tone reference must match the answer' });
  }
  if (value.mode === 'guided' && (!value.choices?.includes(value.tone) || new Set(value.choices).size !== value.choices.length)) {
    ctx.addIssue({ code: 'custom', path: ['choices'], message: 'Guided choices must be distinct and include the answer' });
  }
}));

export const roadmapSchema = z.strictObject({
  ...record, standard: text, countsVerified: z.boolean(), hoursAreEstimates: z.boolean(),
  groups: z.array(z.strictObject({ ...record, labels: localizedTextSchema, scope: localizedTextSchema })),
});

export const placementRoutingSchema = z.strictObject({
  ...record, orientationOnly: z.boolean(), foundationStageId: text, routeStageIds: z.array(text),
});

// Per-record extensions: each lives on the record it describes, so nothing is joined by id.
export const roadmapBandSchema = z.strictObject({
  ...record, short: text, groupId: text, hours: z.number().positive(),
  counts: z.strictObject({
    syllables: count, characters: count, words: count, grammarPoints: count,
    handwrittenCharacters: count, verified: z.boolean(),
  }).optional(),
  goals: localizedTextSchema, can: z.array(localizedTextSchema), units: z.array(localizedTextSchema),
  methods: z.array(localizedTextSchema), skills: z.array(localizedTextSchema),
});
export const onboardingBandSchema = z.strictObject({
  ...record, categories: localizedTextSchema, descriptions: localizedTextSchema,
});
export const variantsSchema = z.array(z.strictObject({
  ...record, headword: text, pinyin: text, glosses: localizedTextSchema,
})).min(1);
export const writingSamplesSchema = z.array(z.strictObject({
  ...record, text, reading: text, kind: z.enum(['latin', 'hanzi']),
  vocabIds: z.array(text), characterIds: z.array(text),
})).min(1);

/** Question extension: how a typed answer is graded; read by `gradeAnswer`. */
export const answerModeSchema = z.enum(['pinyin', 'pinyin-sandhi', 'pinyin-toneless', 'hanzi', 'tone-number']);
/** Test quest extension: prerequisites and first-pass reward policy; references are checked by module tests. */
export const testPolicySchema = z.strictObject({
  testId: text, afterQuestIds: z.array(text).min(1), repeatXp: z.literal(0), reward: z.literal('first-pass-per-day'),
});
/**
 * Listening question extension: the simplified text the browser voice (zh-CN) reads aloud. It is the
 * spoken stimulus, never shown before the answer is submitted; it is not recorded native audio.
 */
export const listeningSchema = z.strictObject({ speak: text.regex(/^\p{Script=Han}+$/u), voice: z.literal('browser-tts') });

/** Every extension key this module may use, with the schema of its value. */
export const extensionSchemas = {
  'zh:tones': tonesSchema,
  'zh:characters': charactersSchema,
  'zh:tone-exercises': toneExercisesSchema,
  'zh:roadmap': roadmapSchema,
  'zh:placement-routing': placementRoutingSchema,
  'zh:roadmap-band': roadmapBandSchema,
  'zh:onboarding-band': onboardingBandSchema,
  'zh:topic': localizedTextSchema,
  'zh:collocation-translations': z.array(localizedTextSchema).min(1),
  'zh:variants': variantsSchema,
  'zh:icon': text,
  'zh:reason': localizedTextSchema,
  'zh:character-ids': z.array(text).min(1),
  'zh:writing-samples': writingSamplesSchema,
  'zh:category-label': localizedTextSchema,
  'zh:answer-mode': answerModeSchema,
  'zh:test-policy': testPolicySchema,
  /** Instructions for a side activity (writing, radicals); owned by the side quest, not a main lesson. */
  'zh:activity': localizedTextSchema,
  'zh:listening': listeningSchema,
} as const;

export type ExtensionKey = keyof typeof extensionSchemas;

function toIssues(error: z.ZodError): ContentValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.map((key) => (typeof key === 'symbol' ? String(key) : key)),
    message: issue.message,
  }));
}

function validatorOf(schema: z.ZodType): ContentExtensionValidator {
  return (value: JsonValue) => {
    const parsed = schema.safeParse(value);
    return parsed.success ? [] : toIssues(parsed.error);
  };
}

/** Hooks for the single `validateContentPack(pack, context, { extensions })` call; issue paths are relative to each value. */
export const extensionValidators = Object.fromEntries(
  Object.entries(extensionSchemas).map(([key, schema]) => [key, validatorOf(schema)]),
) as Record<ExtensionKey, ContentExtensionValidator>;
