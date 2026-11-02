import { describe, expectTypeOf, it } from 'vitest';
import type { z } from 'zod';
import type { LanguageModule, languageModuleSchema } from '../../src/index.ts';
import type { SchemaTypeSync } from '../../src/contract/schemas.ts';

// Type-level tests: enforced by `npm run typecheck`.
describe('schema/type sync', () => {
  it('compile-time assertions hold', () => {
    expectTypeOf<SchemaTypeSync>().toEqualTypeOf<[true, true, true, true, true, true, true]>();
  });

  it('schema output keys match LanguageModule keys', () => {
    expectTypeOf<keyof z.output<typeof languageModuleSchema>>().toEqualTypeOf<keyof LanguageModule>();
  });
});
