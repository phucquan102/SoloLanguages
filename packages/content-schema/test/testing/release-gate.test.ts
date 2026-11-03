import { describe, expect, it } from 'vitest';
import { checkReleaseGate } from '@solo/content-schema/testing';
import { provenance } from '../fixtures/pack.ts';
import { curriculumPack, STAGE, withReview } from '../fixtures/curriculum.ts';
import type { MutablePack } from '../fixtures/curriculum.ts';

const draft = { status: 'ai-draft' as const, reviewerRoles: [] as string[], date: '2026-11-02' };

const approvedPack = () => withReview(curriculumPack());

describe('checkReleaseGate', () => {
  it('accepts a stage whose every record is approved', () => {
    expect(checkReleaseGate(approvedPack(), [STAGE])).toEqual([]);
  });

  it('accepts an empty stage list', () => {
    expect(checkReleaseGate(curriculumPack(), [])).toEqual([]);
  });

  it.each(['ai-draft', 'dev-checked', 'native-reviewed', 'vi-reviewed'] as const)('rejects a record that is only %s', (status) => {
    const pack = approvedPack();
    pack.lessons[0]!.review = { status, reviewerRoles: ['dev'], date: '2026-11-02' };
    expect(checkReleaseGate(pack, [STAGE])).toEqual([
      { path: ['lessons', 0, 'review', 'status'], message: expect.stringContaining(`"${status}"`) },
    ]);
  });

  it('rejects a record that has no review at all', () => {
    const pack = approvedPack();
    Reflect.deleteProperty(pack.lessons[0]!, 'review');
    expect(checkReleaseGate(pack, [STAGE])).toEqual([
      { path: ['lessons', 0, 'review'], message: expect.stringContaining('no review') },
    ]);
  });

  it.each<[string, (pack: MutablePack) => { review?: unknown }, (string | number)[]]>([
    ['stage', (pack) => pack.stages[0]!, ['stages', 0]],
    ['unit', (pack) => pack.units![0]!, ['units', 0]],
    ['lesson', (pack) => pack.lessons[1]!, ['lessons', 1]],
    ['lesson question', (pack) => pack.lessons[1]!.questions[2]!, ['lessons', 1, 'questions', 2]],
    ['vocabulary', (pack) => pack.vocab[2]!, ['vocab', 2]],
    ['quest', (pack) => pack.quests[3]!, ['quests', 3]],
    ['day', (pack) => pack.days![4]!, ['days', 4]],
    ['test', (pack) => pack.tests![2]!, ['tests', 2]],
    ['test question', (pack) => pack.assessments[12]!, ['assessments', 12]],
  ])('covers the %s records of the stage', (_name, pick, path) => {
    const pack = approvedPack();
    pick(pack).review = draft;
    expect(checkReleaseGate(pack, [STAGE])).toEqual([{ path: [...path, 'review', 'status'], message: expect.any(String) }]);
  });

  it('covers placement questions only through a test that uses them', () => {
    const pack = approvedPack();
    pack.placement.push({ ...pack.assessments[0]!, id: 'placement-1', review: draft } as never);
    expect(checkReleaseGate(pack, [STAGE])).toEqual([]);
    pack.tests![0]!.questionIds[0] = 'placement-1';
    expect(checkReleaseGate(pack, [STAGE])).toEqual([
      { path: ['placement', 0, 'review', 'status'], message: expect.any(String) },
    ]);
  });

  it('covers vocabulary introduced by a lesson of the stage even when the vocabulary names no stage', () => {
    const pack = approvedPack();
    Reflect.deleteProperty(pack.vocab[0]!, 'stageId');
    pack.vocab[0]!.review = draft;
    expect(checkReleaseGate(pack, [STAGE])).toEqual([{ path: ['vocab', 0, 'review', 'status'], message: expect.any(String) }]);
  });

  it('ignores records of other stages', () => {
    const pack = approvedPack();
    pack.stages.push({ id: 'stage-bad', provenance, courseCode: 'general', order: 1, levelCode: null, labels: { vi: 'Bad' }, review: draft });
    pack.lessons.push({ id: 'lesson-bad', provenance, stageId: 'stage-bad', skill: 'reading', blocks: [], questions: [], review: draft });
    expect(checkReleaseGate(pack, [STAGE])).toEqual([]);
    const issues = checkReleaseGate(pack, ['stage-bad']);
    expect(issues.map((issue) => issue.path)).toEqual([['stages', 1, 'review', 'status'], ['lessons', 5, 'review', 'status']]);
  });

  it('reports a record once even when several records reach it', () => {
    const pack = approvedPack();
    pack.lessons[0]!.questions[0]!.review = draft;
    pack.tests![0]!.questionIds[0] = 'l1-c1';
    expect(checkReleaseGate(pack, [STAGE])).toHaveLength(1);
  });

  it('reports stage ids that the pack does not contain', () => {
    expect(checkReleaseGate(approvedPack(), ['missing'])).toEqual([
      { path: ['stageIds', 0], message: expect.stringContaining('does not exist') },
    ]);
  });

  it.each([[null], [undefined], ['stage-c'], [[1]], [['']], [new Proxy([], { get: () => { throw null; } })]])(
    'returns issues for malformed stage ids %#', (stageIds) => {
      const run = () => checkReleaseGate(approvedPack(), stageIds as never);
      expect(run).not.toThrow();
      expect(run()).toEqual([{ path: ['stageIds'], message: expect.any(String) }]);
    },
  );

  it.each([null, undefined, [], 'pack', 1, {}, { schemaVersion: 2 }, new Proxy({}, { ownKeys: () => { throw null; } })])(
    'returns issues without throwing on garbage input %#', (pack) => {
      expect(() => checkReleaseGate(pack, [STAGE])).not.toThrow();
      expect(checkReleaseGate(pack, [STAGE]).length).toBeGreaterThan(0);
    },
  );

  it('does not mutate the input', () => {
    const pack = approvedPack();
    const before = JSON.stringify(pack);
    checkReleaseGate(pack, [STAGE]);
    expect(JSON.stringify(pack)).toBe(before);
  });
});
