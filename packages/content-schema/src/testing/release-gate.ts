import { locateQuestions } from './curriculum-tests.ts';
import { readPack } from './pack-data.ts';
import type { ContentIssuePath, ContentValidationIssue, Review } from '../types.ts';

function copyStageIds(stageIds: unknown): string[] | undefined {
  try {
    if (!Array.isArray(stageIds)) return undefined;
    const ids: unknown[] = [...stageIds];
    return ids.every((id) => typeof id === 'string' && id.length > 0) ? ids as string[] : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Release gate: reports every record of the given stages whose `review.status` is not `approved`.
 * Covers the stages, their units, lessons, lesson questions, quests, days and tests, the vocabulary
 * of the stages or introduced by their lessons, and any question their tests reference. Never throws.
 */
export function checkReleaseGate(pack: unknown, stageIds: readonly string[]): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  try {
    const ids = copyStageIds(stageIds);
    if (ids === undefined) return [{ path: ['stageIds'], message: 'Expected a list of stage ids' }];
    const read = readPack(pack);
    if ('issues' in read) return read.issues;
    const data = read.pack;
    const wanted = new Set(ids);
    const known = new Set(data.stages.map((stage) => stage.id));
    ids.forEach((id, index) => {
      if (!known.has(id)) issues.push({ path: ['stageIds', index], message: `Stage "${id}" does not exist in the pack` });
    });

    const seen = new Set<object>();
    const gate = (record: { readonly id: string; readonly review?: Review | undefined }, path: ContentIssuePath) => {
      if (seen.has(record)) return;
      seen.add(record);
      if (record.review === undefined) {
        issues.push({ path: [...path, 'review'], message: `Record "${record.id}" has no review; release needs "approved"` });
      } else if (record.review.status !== 'approved') {
        issues.push({
          path: [...path, 'review', 'status'], message: `Record "${record.id}" is "${record.review.status}"; release needs "approved"`,
        });
      }
    };
    const inStage = (stageId: string | undefined) => stageId !== undefined && wanted.has(stageId);

    data.stages.forEach((stage, index) => { if (inStage(stage.id)) gate(stage, ['stages', index]); });
    (data.units ?? []).forEach((unit, index) => { if (inStage(unit.stageId)) gate(unit, ['units', index]); });
    const introduced = new Set<string>();
    data.lessons.forEach((lesson, index) => {
      if (!inStage(lesson.stageId)) return;
      gate(lesson, ['lessons', index]);
      lesson.questions.forEach((question, position) => gate(question, ['lessons', index, 'questions', position]));
      for (const id of lesson.vocabIds ?? []) introduced.add(id);
    });
    data.vocab.forEach((vocab, index) => { if (inStage(vocab.stageId) || introduced.has(vocab.id)) gate(vocab, ['vocab', index]); });
    data.quests.forEach((quest, index) => { if (inStage(quest.stageId)) gate(quest, ['quests', index]); });

    const tests = new Map((data.tests ?? []).map((test, index) => [test.id, { test, index }]));
    const questions = locateQuestions(data);
    (data.days ?? []).forEach((day, index) => {
      if (!inStage(day.stageId)) return;
      gate(day, ['days', index]);
      const entry = tests.get(day.testId);
      if (entry === undefined) return;
      gate(entry.test, ['tests', entry.index]);
      for (const id of entry.test.questionIds) {
        const found = questions.get(id);
        if (found !== undefined) gate(found.question, found.path);
      }
    });
    return issues;
  } catch {
    // Never inspect a thrown value: even its properties may be hostile getters.
    return issues.length ? issues : [{ path: [], message: 'Unable to check the release gate' }];
  }
}
