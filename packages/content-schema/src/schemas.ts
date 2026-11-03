import { localeTagSchema } from '@solo/language-sdk';
import { z } from 'zod';
import type { ContentExtensionKey } from './types.ts';

const nonEmpty = z.string().min(1).refine((value) => value.trim() === value, 'Expected non-empty trimmed text');

// Record parsing must not silently discard this own property.
const record = <K extends z.ZodType<string, string>, V extends z.ZodType>(key: K, value: V) =>
  z.custom<unknown>((value) => !(value !== null && typeof value === 'object' && Object.hasOwn(value, '__proto__')), {
    message: 'Key "__proto__" is not allowed',
    path: ['__proto__'],
  }).pipe(z.record(key, value));

export const localizedTextSchema = record(localeTagSchema, nonEmpty)
  .refine((value) => Object.keys(value).length > 0, 'Expected at least one locale');

export const extensionKeySchema = z.string()
  .regex(/^[a-z]{2,3}:[a-zA-Z0-9][a-zA-Z0-9._-]*$/, 'Expected <code>:<name>')
  .transform((key) => key as ContentExtensionKey);
const extensionsSchema = record(extensionKeySchema, z.json());

export const provenanceSchema = z.strictObject({
  source: z.strictObject({
    file: nonEmpty,
    declaration: nonEmpty,
    line: z.number().int().positive().optional(),
    item: z.union([nonEmpty, z.number().int().nonnegative()]).optional(),
  }),
  license: nonEmpty,
  attribution: nonEmpty,
  version: nonEmpty,
  retrievedAt: z.iso.datetime({ offset: true }),
});

export const reviewStatusSchema = z.enum(['ai-draft', 'dev-checked', 'native-reviewed', 'vi-reviewed', 'approved']);

export const reviewSchema = z.strictObject({
  status: reviewStatusSchema,
  reviewerRoles: z.array(nonEmpty),
  date: z.union([z.iso.date(), z.iso.datetime({ offset: true })]),
});

const contentRecord = {
  id: nonEmpty, provenance: provenanceSchema, review: reviewSchema.optional(), extensions: extensionsSchema.optional(),
};

export const stageSchema = z.strictObject({
  ...contentRecord,
  courseCode: nonEmpty,
  order: z.number().int().nonnegative(),
  frameworkCode: nonEmpty.optional(),
  levelCode: nonEmpty.nullable(),
  labels: localizedTextSchema,
});

export const vocabExampleSchema = z.strictObject({
  text: z.string(),
  translations: localizedTextSchema,
});

export const vocabSchema = z.strictObject({
  ...contentRecord,
  headword: nonEmpty,
  glosses: localizedTextSchema,
  examples: z.array(vocabExampleSchema),
  fields: record(nonEmpty, z.string()),
  collocations: z.array(z.string()).optional(),
  notes: localizedTextSchema.optional(),
  mistakes: z.array(localizedTextSchema).optional(),
  topic: nonEmpty.optional(),
  stageId: nonEmpty.optional(),
  levelCode: nonEmpty.optional(),
});

export const lessonBlockSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('text'), text: z.union([localizedTextSchema, z.string()]) }),
  z.strictObject({
    kind: z.literal('example'),
    text: z.string(),
    translations: localizedTextSchema.optional(),
    transcription: nonEmpty.optional(),
    vocabIds: z.array(nonEmpty).optional(),
  }),
  z.strictObject({ kind: z.literal('objective'), text: localizedTextSchema }),
  z.strictObject({ kind: z.literal('explanation'), text: localizedTextSchema, pattern: nonEmpty.optional() }),
  z.strictObject({ kind: z.literal('mistake'), wrong: nonEmpty, right: nonEmpty, note: localizedTextSchema }),
  z.strictObject({ kind: z.literal('tip'), text: localizedTextSchema }),
]);

const questionBase = {
  ...contentRecord,
  prompt: z.union([localizedTextSchema, z.string()]),
  passage: z.string().optional(),
  explanations: localizedTextSchema.optional(),
  group: nonEmpty.optional(),
  category: nonEmpty.optional(),
  vocabIds: z.array(nonEmpty).optional(),
};

export const questionSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    ...questionBase,
    kind: z.literal('choice'),
    options: z.array(z.union([nonEmpty, localizedTextSchema])).min(2),
    correctIndex: z.number().int().nonnegative(),
  }).refine((question) => question.correctIndex < question.options.length, {
    path: ['correctIndex'], message: 'Answer index must be within options',
  }),
  z.strictObject({
    ...questionBase,
    kind: z.literal('typed'),
    acceptedAnswers: z.array(nonEmpty).min(1),
  }),
]);

export const unitSchema = z.strictObject({
  ...contentRecord,
  stageId: nonEmpty,
  order: z.number().int().nonnegative(),
  titles: localizedTextSchema,
  canDo: z.array(localizedTextSchema),
});

export const lessonSchema = z.strictObject({
  ...contentRecord,
  stageId: nonEmpty.optional(),
  titles: localizedTextSchema.optional(),
  unitId: nonEmpty.optional(),
  order: z.number().int().nonnegative().optional(),
  skill: nonEmpty,
  blocks: z.array(lessonBlockSchema),
  questions: z.array(questionSchema),
  vocabIds: z.array(nonEmpty).optional(),
  reviewVocabIds: z.array(nonEmpty).optional(),
});

export const questSchema = z.strictObject({
  ...contentRecord,
  stageId: nonEmpty.optional(),
  titles: localizedTextSchema,
  skill: nonEmpty,
  minutes: z.number().finite().positive(),
  xp: z.number().int().nonnegative(),
  lessonIds: z.array(nonEmpty),
  optional: z.boolean(),
});

export const daySchema = z.strictObject({
  ...contentRecord,
  stageId: nonEmpty,
  unitId: nonEmpty,
  day: z.number().int().positive(),
  mainQuestIds: z.array(nonEmpty),
  sideQuestIds: z.array(nonEmpty).optional(),
  testId: nonEmpty,
});

export const testSchema = z.strictObject({
  ...contentRecord,
  kind: z.enum(['daily', 'unit']),
  questionIds: z.array(nonEmpty),
  passRatio: z.number().gt(0).lte(1),
  reviewVocabIds: z.array(nonEmpty).optional(),
});

/** Structural schemas; use validateContentPack for references and lossless JSON checks. */
export const contentPackSchema = z.strictObject({
  schemaVersion: z.literal(1),
  language: nonEmpty,
  stages: z.array(stageSchema),
  vocab: z.array(vocabSchema),
  lessons: z.array(lessonSchema),
  quests: z.array(questSchema),
  units: z.array(unitSchema).optional(),
  days: z.array(daySchema).optional(),
  tests: z.array(testSchema).optional(),
  placement: z.array(questionSchema),
  assessments: z.array(questionSchema),
  extensions: extensionsSchema.optional(),
});

export const contentValidationContextSchema = z.strictObject({
  language: z.string().regex(/^[a-z]{2,3}$/, 'Expected module code'),
  skills: z.array(nonEmpty),
  levels: record(nonEmpty, z.array(nonEmpty)),
  courses: record(nonEmpty, z.strictObject({ framework: nonEmpty, levels: z.array(nonEmpty) })),
}).superRefine((context, ctx) => {
  for (const [code, course] of Object.entries(context.courses)) {
    if (!Object.hasOwn(context.levels, course.framework)) {
      ctx.addIssue({ code: 'custom', path: ['courses', code, 'framework'], message: 'Unknown course framework' });
    }
    course.levels.forEach((level, index) => {
      if (!Object.hasOwn(context.levels, course.framework) || !context.levels[course.framework]!.includes(level)) {
        ctx.addIssue({ code: 'custom', path: ['courses', code, 'levels', index], message: 'Unknown course level' });
      }
    });
  }
});
