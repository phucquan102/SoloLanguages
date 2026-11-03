import { describe, expect, it } from 'vitest';
import { checkContentHygiene } from '@solo/content-schema/testing';
import type { ContentHygieneOptions } from '@solo/content-schema/testing';
import { curriculumPack, withReview } from '../fixtures/curriculum.ts';
import { validPack } from '../fixtures/pack.ts';

const options = { nativeLocales: ['vi'], isNativeText: (text: string) => text.includes('ệ') };

describe('checkContentHygiene', () => {
  it('accepts complete provenance, clean strings and globally unique ids', () => {
    expect(checkContentHygiene(validPack(), options)).toEqual([]);
    expect(checkContentHygiene(validPack(), { nativeLocales: [] })).toEqual([]);
  });

  it('does not interpret locale maps or vocabulary field names as records', () => {
    const pack = validPack();
    Object.assign(pack.stages[0]!.labels, { id: 'same' });
    Object.assign(pack.vocab[0]!.glosses, { id: 'same' });
    Object.assign(pack.vocab[0]!.fields, { id: 'stage-1', extensions: 'field value' });
    expect(checkContentHygiene(pack, options)).toEqual([]);
  });

  it.each(['license', 'attribution', 'version', 'retrievedAt'] as const)(
    'rejects missing, empty or malformed provenance %s', (field) => {
      for (const value of [undefined, '', ' ']) {
        const pack = structuredClone(validPack());
        if (value === undefined) Reflect.deleteProperty(pack.vocab[0]!.provenance, field);
        else pack.vocab[0]!.provenance[field] = value;
        expect(checkContentHygiene(pack, options)).toContainEqual(expect.objectContaining({ path: ['vocab', 0, 'provenance', field] }));
      }
    },
  );

  it.each(['yesterday', '2026-11-02', '2026-02-30T00:00:00Z'])(
    'rejects invalid provenance ISO timestamp %s', (retrievedAt) => {
      const pack = structuredClone(validPack()); Object.assign(pack.placement[0]!.provenance, { retrievedAt });
      expect(checkContentHygiene(pack, options)).toContainEqual(expect.objectContaining({ path: ['placement', 0, 'provenance', 'retrievedAt'] }));
    },
  );

  it('checks provenance completeness in extension records', () => {
    const pack = { ...validPack(), extensions: { 'qaa:dataset': [{ id: 'extension-record' }] } };
    expect(checkContentHygiene(pack, options)).toContainEqual(expect.objectContaining({ path: ['extensions', 'qaa:dataset', 0, 'provenance'] }));
  });

  it.each(['<b>text</b>', '</div>', '<BR />', 'before ${value} after'])(
    'rejects HTML and unresolved templates in localized and target text %#', (text) => {
      const pack = validPack(); pack.vocab[0]!.headword = text; pack.vocab[0]!.glosses.vi = text;
      const issues = checkContentHygiene(pack, options);
      expect(issues).toContainEqual(expect.objectContaining({ path: ['vocab', 0, 'headword'] }));
      expect(issues).toContainEqual(expect.objectContaining({ path: ['vocab', 0, 'glosses', 'vi'] }));
    },
  );

  it('allows literal comparison operators and resolved text', () => {
    const pack = validPack(); pack.vocab[0]!.headword = '2 < 3 and 5 > 4; $value';
    expect(checkContentHygiene(pack, options)).toEqual([]);
  });

  it('rejects collisions across collections, nested questions and extensions', () => {
    const pack = validPack(); Object.assign(pack.placement[0]!, { id: pack.lessons[0]!.questions[0]!.id });
    pack.extensions = { 'qaa:dataset': { nested: [{ id: 'stage-1', provenance: pack.stages[1]!.provenance }] } } as never;
    const issues = checkContentHygiene(pack, options);
    expect(issues).toContainEqual(expect.objectContaining({ path: ['placement', 0, 'id'] }));
    expect(issues).toContainEqual(expect.objectContaining({ path: ['extensions', 'qaa:dataset', 'nested', 0, 'id'] }));
  });

  it('flags module-detected native text in plain instruction and extension fields', () => {
    const pack = validPack();
    pack.lessons[0]!.blocks[0] = { kind: 'text', text: 'hệ' } as never;
    pack.extensions = { 'qaa:dataset': { nested: [null, true, 1, 'hệ'] } };
    const issues = checkContentHygiene(pack, options);
    expect(issues).toContainEqual(expect.objectContaining({ path: ['lessons', 0, 'blocks', 0, 'text'] }));
    expect(issues).toContainEqual(expect.objectContaining({ path: ['extensions', 'qaa:dataset', 'nested', 3] }));
  });

  it('exempts localized text and declared target-language fields from the native-text heuristic', () => {
    const pack = validPack();
    pack.vocab[0]!.headword = 'hệ'; pack.vocab[0]!.glosses.vi = 'hệ';
    pack.vocab[0]!.examples[0]!.text = 'hệ'; pack.vocab[0]!.fields.reading = 'hệ';
    pack.vocab[0]!.collocations = ['hệ'];
    pack.lessons[0]!.blocks[1] = { kind: 'example', text: 'hệ', translations: { vi: 'hệ' } };
    pack.placement[0] = { ...pack.placement[0]!, prompt: 'hệ', passage: 'hệ', options: ['hệ', { vi: 'hệ' }] };
    expect(checkContentHygiene(pack, options)).toEqual([]);
    const { options: _options, correctIndex: _index, ...base } = pack.placement[0]!;
    const typedPack = { ...pack, placement: [{ ...base, kind: 'typed', acceptedAnswers: ['hệ'] }] };
    expect(checkContentHygiene(typedPack, options)).toEqual([]);
  });

  it('accepts a complete curriculum pack with every new block kind, review and collection', () => {
    expect(checkContentHygiene(withReview(curriculumPack()), options)).toEqual([]);
  });

  it('exempts target-language fields of the new blocks and review metadata from the native-text heuristic', () => {
    const pack = withReview(curriculumPack());
    const lesson = pack.lessons[0]!;
    for (const block of lesson.blocks) {
      if (block.kind === 'example') Object.assign(block, { transcription: 'hệ' });
      if (block.kind === 'mistake') Object.assign(block, { wrong: 'hệ', right: 'hệ' });
      if (block.kind === 'explanation') Object.assign(block, { pattern: 'hệ' });
    }
    pack.lessons[0]!.review = { status: 'approved', reviewerRoles: ['hệ'], date: '2026-11-02' };
    expect(checkContentHygiene(pack, options)).toEqual([]);
  });

  it('still flags native text in plain test and day identifiers that are not metadata', () => {
    const pack = curriculumPack();
    pack.tests![0]!.questionIds[0] = 'hệ';
    expect(checkContentHygiene(pack, options)).toContainEqual(expect.objectContaining({ path: ['tests', 0, 'questionIds', 0] }));
  });

  it.each(['<b>text</b>', 'before ${value} after'])('rejects HTML and templates in the new blocks %#', (text) => {
    const pack = curriculumPack();
    for (const block of pack.lessons[0]!.blocks) {
      if (block.kind === 'objective') block.text = { vi: text };
      if (block.kind === 'mistake') block.wrong = text;
    }
    const paths = checkContentHygiene(pack, options).map((issue) => issue.path.join('.'));
    expect(paths).toEqual(expect.arrayContaining(['lessons.0.blocks.0.text.vi']));
    expect(paths.some((path) => path.endsWith('.wrong'))).toBe(true);
  });

  it('supports different module predicates without embedding locale-specific heuristics', () => {
    const pack = validPack(); pack.lessons[0]!.blocks[0] = { kind: 'text', text: 'marker' } as never;
    expect(checkContentHygiene(pack, { nativeLocales: ['qaa'], isNativeText: (text) => text === 'marker' }))
      .toContainEqual(expect.objectContaining({ path: ['lessons', 0, 'blocks', 0, 'text'] }));
    expect(checkContentHygiene(pack, { nativeLocales: ['qaa'], isNativeText: () => false })).toEqual([]);
  });

  it('reports throwing native-text predicates', () => {
    expect(checkContentHygiene(validPack(), { nativeLocales: ['qaa'], isNativeText: () => { throw null; } }).length).toBeGreaterThan(0);
  });

  it.each([null, undefined, [], 'pack', 1, {}, new Proxy({}, { ownKeys: () => { throw null; } })])(
    'returns issues without throwing on garbage input %#', (pack) => {
      expect(() => checkContentHygiene(pack, options)).not.toThrow();
      expect(checkContentHygiene(pack, options).length).toBeGreaterThan(0);
    },
  );

  it('does not invoke input accessors or serialization hooks', () => {
    let invoked = false;
    const pack = { ...validPack(), get language() { invoked = true; throw null; } };
    expect(checkContentHygiene(pack, options).length).toBeGreaterThan(0);
    expect(invoked).toBe(false);
  });

  it.each([null, {}, { nativeLocales: ['VI'] }, { nativeLocales: [], isNativeText: 1 },
    new Proxy({}, { get: () => { throw null; } })])('returns issues for malformed hygiene options %#', (badOptions) => {
    expect(() => checkContentHygiene(validPack(), badOptions as ContentHygieneOptions)).not.toThrow();
    expect(checkContentHygiene(validPack(), badOptions as ContentHygieneOptions).length).toBeGreaterThan(0);
  });
});
