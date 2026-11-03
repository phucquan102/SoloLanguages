import { expectTypeOf, it } from 'vitest';
import type { z } from 'zod';
import type {
  ContentExtensionKey, ContentExtensions, ContentExtensionValidator, ContentPack, ContentValidationContext,
  ContentValidationOptions, Day, JsonValue, Lesson, LessonBlock, LocalizedText,
  Provenance, Question, Quest, Review, Stage, Test, Unit, Vocab, VocabExample,
} from '../src/index.ts';
import type {
  contentPackSchema, contentValidationContextSchema, daySchema, lessonBlockSchema, lessonSchema,
  localizedTextSchema, provenanceSchema, questionSchema, questSchema, reviewSchema, stageSchema,
  testSchema, unitSchema, vocabExampleSchema, vocabSchema,
} from '../src/index.ts';

// Schemas infer explicit undefined for optional keys; pack validation rejects
// present undefined values. Normalize that difference and readonly containers.
type Normalize<T> = T extends readonly (infer E)[]
  ? readonly Normalize<E>[]
  : T extends object ? { readonly [K in keyof T]: Normalize<Exclude<T[K], undefined>> } : T;

it('keeps public record types synchronized with schema output', () => {
  expectTypeOf<Normalize<z.output<typeof provenanceSchema>>>().toEqualTypeOf<Normalize<Provenance>>();
  expectTypeOf<Normalize<z.output<typeof localizedTextSchema>>>().toEqualTypeOf<Normalize<LocalizedText>>();
  expectTypeOf<Normalize<z.output<typeof stageSchema>>>().toEqualTypeOf<Normalize<Stage>>();
  expectTypeOf<Normalize<z.output<typeof vocabSchema>>>().toEqualTypeOf<Normalize<Vocab>>();
  expectTypeOf<Normalize<z.output<typeof vocabExampleSchema>>>().toEqualTypeOf<Normalize<VocabExample>>();
  expectTypeOf<Normalize<z.output<typeof lessonBlockSchema>>>().toEqualTypeOf<Normalize<LessonBlock>>();
  expectTypeOf<Normalize<z.output<typeof questionSchema>>>().toEqualTypeOf<Normalize<Question>>();
  expectTypeOf<Normalize<z.output<typeof lessonSchema>>>().toEqualTypeOf<Normalize<Lesson>>();
  expectTypeOf<Normalize<z.output<typeof questSchema>>>().toEqualTypeOf<Normalize<Quest>>();
  expectTypeOf<Normalize<z.output<typeof reviewSchema>>>().toEqualTypeOf<Normalize<Review>>();
  expectTypeOf<Normalize<z.output<typeof unitSchema>>>().toEqualTypeOf<Normalize<Unit>>();
  expectTypeOf<Normalize<z.output<typeof daySchema>>>().toEqualTypeOf<Normalize<Day>>();
  expectTypeOf<Normalize<z.output<typeof testSchema>>>().toEqualTypeOf<Normalize<Test>>();
  expectTypeOf<Normalize<z.output<typeof contentValidationContextSchema>>>().toEqualTypeOf<Normalize<ContentValidationContext>>();
  expectTypeOf<Normalize<Omit<z.output<typeof contentPackSchema>, 'extensions'>>>().toEqualTypeOf<Normalize<Omit<ContentPack, 'extensions'>>>();
  expectTypeOf<NonNullable<ContentPack['extensions']>[ContentExtensionKey]>().toEqualTypeOf<JsonValue>();
  expectTypeOf<z.output<typeof contentPackSchema>['extensions']>().toExtend<ContentPack['extensions']>();
});

it('exposes namespaced extension data and typed validators', () => {
  expectTypeOf<'qaa:details'>().toExtend<ContentExtensionKey>();
  expectTypeOf<'details'>().not.toExtend<ContentExtensionKey>();
  expectTypeOf<NonNullable<ContentValidationOptions['extensions']>[ContentExtensionKey]>().toEqualTypeOf<ContentExtensionValidator>();
  expectTypeOf<ContentExtensions[ContentExtensionKey]>().toEqualTypeOf<JsonValue>();
});
