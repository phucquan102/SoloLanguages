import type { ChoiceQuestion, ContentPack, ContentValidationContext, ContentValidationOptions, Provenance } from '../../src/index.ts';

export const context = {
  language: 'qaa',
  skills: ['reading', 'qaa:practice'],
  levels: { rubric: ['L1', 'L2'], alternate: ['X1'] },
  courses: { general: { framework: 'rubric', levels: ['L1', 'L2'] }, other: { framework: 'alternate', levels: ['X1'] } },
} satisfies ContentValidationContext;

export const validationOptions = { extensions: { 'qaa:dataset': () => [] } } satisfies ContentValidationOptions;

export const provenance = {
  source: { file: 'source.txt', declaration: 'sample', line: 1, item: 0 },
  license: 'UNDECIDED',
  attribution: 'Owner confirmation pending',
  version: 'source-revision',
  retrievedAt: '2026-11-02T00:00:00Z',
} satisfies Provenance;

export function question(id = 'question-1'): ChoiceQuestion {
  return {
    id, provenance,
    prompt: { vi: 'Choose the matching word' },
    passage: 'A sample passage',
    options: ['one', 'two'], correctIndex: 0,
    explanations: { vi: 'Explanation' },
    group: 'group-1', category: 'category-1', kind: 'choice', vocabIds: ['word-1'],
  };
}

export function validPack() {
  return {
    schemaVersion: 1,
    language: 'qaa',
    stages: [
      { id: 'foundation', provenance, courseCode: 'general', order: 0, levelCode: null, labels: { vi: 'Foundation' } },
      { id: 'stage-1', provenance, courseCode: 'general', order: 1, frameworkCode: 'rubric', levelCode: 'L1', labels: { vi: 'First' } },
    ],
    vocab: [{
      id: 'word-1', provenance, headword: 'sample', glosses: { vi: 'Gloss' },
      examples: [{ text: 'A sample', translations: { vi: 'Translation' } }],
      fields: { reading: 'sample' }, collocations: ['a sample'],
      notes: { vi: 'A note' }, mistakes: [{ vi: 'A mistake' }], topic: 'topic-1',
      stageId: 'stage-1', levelCode: 'L1',
    }],
    lessons: [{
      id: 'lesson-1', provenance, stageId: 'stage-1', skill: 'reading',
      blocks: [
        { kind: 'text', text: { vi: 'Instruction' } },
        { kind: 'example', text: 'Sample', translations: { vi: 'Translation' } },
      ],
      questions: [question()], vocabIds: ['word-1'],
    }],
    quests: [{
      id: 'quest-1', provenance, stageId: 'stage-1', titles: { vi: 'Practice' }, skill: 'qaa:practice',
      minutes: 5, xp: 10, lessonIds: ['lesson-1'], optional: false,
    }],
    placement: [question('placement-1')],
    assessments: [question('assessment-1')],
    extensions: { 'qaa:dataset': { nested: [null, true, 1, 'sample'] } },
  } satisfies ContentPack;
}
