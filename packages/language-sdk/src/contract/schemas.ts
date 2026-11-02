import { z } from 'zod';
import { isSemver } from './compat.ts';
import { CORE_SKILLS } from './skills.ts';
import type {
  Course,
  JsonValue,
  LanguageManifest,
  LanguageModule,
  LevelFramework,
  Messages,
  Placement,
  SpeechConfig,
  TextTools,
} from './types.ts';

const fn = <F>() => z.custom<F>((v) => typeof v === 'function', { message: 'Expected function' });

const nonEmpty = z.string().min(1);

function isCanonicalLocale(tag: string): boolean {
  try {
    return Intl.getCanonicalLocales(tag)[0] === tag;
  } catch {
    return false;
  }
}

/** Canonical BCP 47 tag; also rejects keys such as `__proto__`. */
export const localeTagSchema = z.string().refine(isCanonicalLocale, { message: 'Expected canonical BCP 47 tag' });

/** Record keys that cannot collide with Object.prototype members. */
const safeKey = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/, 'Expected identifier key');

/** z.record silently drops own `__proto__` keys; reject them explicitly. */
const record = <K extends z.ZodType<string, string>, V extends z.ZodType>(key: K, value: V) =>
  z
    .custom<unknown>((v) => !(v !== null && typeof v === 'object' && Object.hasOwn(v, '__proto__')), {
      message: 'Key "__proto__" is not allowed',
      path: ['__proto__'],
    })
    .pipe(z.record(key, value));

const semver = z.string().refine(isSemver, 'Expected SemVer 2.0.0');

export const manifestSchema = z.object({
  code: z.string().regex(/^[a-z]{2,3}$/, 'Expected ISO 639 code'),
  bcp47: nonEmpty,
  nativeName: nonEmpty,
  glyph: nonEmpty,
  names: record(localeTagSchema, nonEmpty),
  scripts: z.array(z.string().regex(/^[A-Z][a-z]{3}$/, 'Expected ISO 15924 code')).min(1),
  direction: z.enum(['ltr', 'rtl']),
  version: semver,
});

export const levelSchema = z.object({
  code: nonEmpty,
  order: z.number().int(),
  minScore: z.number().finite().optional(),
  maxScore: z.number().finite().optional(),
});

export const levelFrameworkSchema = z.object({
  code: nonEmpty,
  kind: z.enum(['ordinal', 'band']),
  certification: z.boolean(),
  levels: z.array(levelSchema).min(1),
});

export const courseSchema = z.object({
  code: nonEmpty,
  framework: nonEmpty,
  levels: z.array(nonEmpty).min(1),
});

export const skillSchema = z.object({
  id: z.union([z.enum(CORE_SKILLS), z.templateLiteral([z.string().min(1), ':', z.string().min(1)])]),
});

export const textToolsSchema = z.object({
  normalize: fn<TextTools['normalize']>(),
  compareAnswer: fn<TextTools['compareAnswer']>(),
  tokenize: fn<NonNullable<TextTools['tokenize']>>().optional(),
});

export const speechSchema = z.object({
  tags: z.array(nonEmpty).min(1),
  voiceFilter: fn<NonNullable<SpeechConfig['voiceFilter']>>().optional(),
});

export const placementSchema = z.object({
  course: nonEmpty,
  levels: z.array(nonEmpty).min(1),
});

const jsonRecord = record(safeKey, z.json());

/**
 * Structural validation. Cross-references are checked by `validateLanguageModule`.
 * Parsing yields an own, plain copy (unknown keys dropped; functions kept by reference) that the registry freezes.
 */
export const languageModuleSchema = z.object({
  sdk: z.string().refine((s) => s.startsWith('^') && isSemver(s.slice(1)), 'Expected ^MAJOR.MINOR.PATCH'),
  manifest: manifestSchema,
  levelFrameworks: z.array(levelFrameworkSchema).min(1),
  courses: z.array(courseSchema).min(1),
  skills: z.array(skillSchema),
  vocabFields: z.array(z.object({ id: nonEmpty, required: z.boolean().optional() })).optional(),
  textTools: textToolsSchema,
  speech: speechSchema.optional(),
  exerciseTypes: z.array(nonEmpty).optional(),
  features: record(safeKey, z.boolean()).optional(),
  placement: placementSchema.optional(),
  content: fn<NonNullable<LanguageModule['content']>>().optional(),
  i18n: record(localeTagSchema, fn<() => Promise<Messages>>()).optional(),
  tutor: jsonRecord.optional(),
  dictionary: jsonRecord.optional(),
});

// Compile-time guard: the schema output and the hand-written types must describe the same shape.
type Normalize<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer E)[]
    ? readonly Normalize<E>[]
    : T extends object
      ? { readonly [K in keyof T]: Normalize<Exclude<T[K], undefined>> }
      : T;
type Same<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;
type Parsed = z.output<typeof languageModuleSchema>;
type Opaque = 'tutor' | 'dictionary';

export type SchemaTypeSync = [
  Assert<Same<Normalize<Omit<Parsed, Opaque>>, Normalize<Omit<LanguageModule, Opaque>>>>,
  Assert<Same<keyof Parsed, keyof LanguageModule>>,
  Assert<Same<Normalize<z.output<typeof manifestSchema>>, Normalize<LanguageManifest>>>,
  Assert<Same<Normalize<z.output<typeof levelFrameworkSchema>>, Normalize<LevelFramework>>>,
  Assert<Same<Normalize<z.output<typeof courseSchema>>, Normalize<Course>>>,
  Assert<Same<Normalize<z.output<typeof placementSchema>>, Normalize<Placement>>>,
  Assert<[NonNullable<Parsed['tutor']>[string]] extends [JsonValue] ? true : false>,
];
