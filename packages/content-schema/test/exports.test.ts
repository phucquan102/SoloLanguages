import { describe, expect, it } from 'vitest';
import * as api from '../src/index.ts';
import * as testing from '@solo/content-schema/testing';

describe('public API', () => {
  it('exports the validator and public schemas', () => {
    expect(Object.keys(api).sort()).toEqual([
      'contentPackSchema', 'contentValidationContextSchema', 'daySchema', 'extensionKeySchema',
      'lessonBlockSchema', 'lessonSchema', 'localizedTextSchema', 'provenanceSchema',
      'questionSchema', 'questSchema', 'reviewSchema', 'reviewStatusSchema', 'stageSchema', 'testSchema',
      'unitSchema', 'validateContentPack', 'vocabExampleSchema', 'vocabSchema',
    ].sort());
  });

  it('exports only the content checks from the testing subpath', () => {
    expect(Object.keys(testing).sort()).toEqual(['checkContentHygiene', 'checkCurriculum', 'checkReleaseGate']);
    for (const name of Object.keys(testing)) expect(api).not.toHaveProperty(name);
  });
});
