import { describe, expect, it } from 'vitest';
import { checkContentHygiene, checkCurriculum, checkReleaseGate } from '@solo/content-schema/testing';
import type { ContentPack, ContentRecord, Question } from '@solo/content-schema';
import pack from '../../src/content/index.ts';
import { generalCurriculumOptions } from '../../src/content/authoring-checks.ts';
import { gradeAnswer } from '../../src/grading.ts';
import { compareAnswer, normalize } from '../../src/text-tools.ts';
import { acceptedForms } from '../../src/content/answer-forms.ts';
import { generalVocabManifest } from '../../src/content/manifest/general.ts';
import { XP } from '../../src/content/unit-content.ts';
import { extensionSchemas } from '../../src/content/extension-schemas.ts';
import { isNativeText } from '../native-text.ts';
import f1 from '../../src/content/general/f1.ts';
import { ieltsVocabManifest } from '../../src/content/manifest/ielts.ts';
import { authoredUnits, unitFiles } from './unit-files.ts';

const options = generalCurriculumOptions(pack);
const slugs = ['f1-alphabet-a-m', 'f1-alphabet-n-z', 'f1-greetings', 'f1-my-name', 'f1-numbers-0-20', 'f1-numbers-phone'];
const clone = (): ContentPack => JSON.parse(JSON.stringify(pack)) as ContentPack;
const questionById = new Map(pack.assessments.map((question) => [question.id, question]));

describe('authored curriculum', () => {
  it('passes the full curriculum gate on every general stage with schedule truncation', () => {
    expect(checkCurriculum(pack, options)).toEqual([]);
  });
  it('passes hygiene across the entire pack', () => {
    expect(checkContentHygiene(pack, { nativeLocales: ['vi'], isNativeText })).toEqual([]);
  });
  it('wires the release gate and reports scoped drafts and missing reviews', () => {
    const issues = checkReleaseGate(pack, options.scopeStageIds!);
    const scopedLessons = pack.lessons.filter(({ stageId }) => options.scopeStageIds!.includes(stageId ?? ''));
    const introduced = new Set(scopedLessons.flatMap(({ vocabIds }) => vocabIds ?? []));
    const scopedDays = pack.days!.filter(({ stageId }) => options.scopeStageIds!.includes(stageId ?? ''));
    const tested = new Set(scopedDays.map(({ testId }) => testId));
    const questionIds = new Set(pack.tests!.filter(({ id }) => tested.has(id)).flatMap(({ questionIds }) => questionIds));
    const scopedRecords: ContentRecord[] = [
      ...pack.stages.filter(({ id }) => options.scopeStageIds!.includes(id)),
      ...pack.units!.filter(({ stageId }) => options.scopeStageIds!.includes(stageId ?? '')),
      ...scopedLessons, ...scopedLessons.flatMap(({ questions }) => questions),
      ...pack.vocab.filter(({ id, stageId }) => introduced.has(id) || options.scopeStageIds!.includes(stageId ?? '')),
      ...pack.quests.filter(({ stageId }) => options.scopeStageIds!.includes(stageId ?? '')),
      ...scopedDays, ...pack.tests!.filter(({ id }) => tested.has(id)),
      ...[...pack.assessments, ...pack.placement].filter(({ id }) => questionIds.has(id)),
    ];
    const pending = [...new Map(scopedRecords.map((record) => [record.id, record])).values()]
      .filter(({ review }) => review?.status !== 'approved');
    expect(issues).toHaveLength(pending.length);
    expect(issues.map(({ message }) => message.match(/Record "([^"]+)"/)?.[1]).sort())
      .toEqual(pending.map(({ id }) => id).sort());
    expect(issues.every(({ message }) => message.includes('is "ai-draft"; release needs "approved"')
      || message.includes('has no review; release needs "approved"'))).toBe(true);
    for (const issue of issues) {
      let value: unknown = pack;
      for (const key of issue.path) value = (value as Record<string | number, unknown>)[key];
      expect(value).toBe(issue.path.at(-1) === 'review' ? undefined : 'ai-draft');
    }
    // Demonstrate that approval, rather than dropping the check, is what opens the gate.
    const approved = clone();
    const approve = (value: unknown): void => {
      if (value === null || typeof value !== 'object') return;
      if ('provenance' in value) (value as unknown as { review: ContentRecord['review'] }).review = {
        status: 'approved', reviewerRoles: ['native-en', 'editor-vi'], date: '2026-11-03',
      };
      Object.values(value).forEach(approve);
    };
    approve(approved);
    expect(checkReleaseGate(approved, options.scopeStageIds!)).toEqual([]);
  });
  it('assembles every authored lesson in unit order, with bilingual titles, examples and manifest introductions', () => {
    expect(pack.lessons).toEqual(authoredUnits.flatMap(({ content }) => content.lessons));
    const manifest = [...generalVocabManifest, ...ieltsVocabManifest];
    for (const { content: unit } of authoredUnits) {
      expect(unit.lessons.map(({ order }) => order)).toEqual(unit.lessons.map((_, index) => index + 1));
      for (const lesson of unit.lessons) {
        expect(lesson.unitId).toBe(unit.unit.id);
        expect(lesson.stageId).toBe(unit.unit.stageId);
        expect(lesson.titles?.['vi']?.length).toBeGreaterThan(0);
        expect(lesson.titles?.['en']?.length).toBeGreaterThan(0);
        expect(lesson.vocabIds).toEqual(manifest.filter(({ unitId, lessonSlug }) =>
          unitId === unit.unit.id && 'en:lesson:' + lessonSlug === lesson.id).map(({ id }) => id));
        const examples = lesson.blocks.filter(({ kind }) => kind === 'example');
        expect(examples.length).toBeGreaterThanOrEqual(4);
        expect(examples.length).toBeLessThanOrEqual(6);
        for (const block of lesson.blocks) if (block.kind === 'mistake') expect(block.note['vi']!.length).toBeGreaterThan(0);
        for (const question of lesson.questions) expect(question.vocabIds!.length).toBeGreaterThan(0);
      }
    }
    expect(pack.lessons.flatMap(({ vocabIds }) => vocabIds ?? [])).toHaveLength(
      manifest.filter(({ unitId }) => authoredUnits.some(({ content }) => content.unit.id === unitId)).length);
  });
  it('keeps units without lessons as empty authoring stubs', () => {
    for (const { content } of unitFiles.filter(({ content }) => content.lessons.length === 0)) {
      expect(content.unit.review?.status).toBe('ai-draft');
      for (const name of ['lessons', 'quests', 'assessments', 'days', 'tests'] as const) expect(content[name]).toEqual([]);
      expect(pack.units).toContainEqual(content.unit);
    }
  });
  it('keeps F1 unfamiliar example words within 10%, with only explicitly taught formula support', () => {
    // Letter symbols and the example names are not vocabulary loads. do/you in lesson 2 and
    // to/you in lesson 3 are explicitly glossed as formula parts in those explanations.
    const support: Record<number, string[]> = {
      1: ['ay', 'bee', 'see', 'dee', 'ee', 'ef', 'jee', 'aitch', 'eye', 'jay', 'kay', 'el', 'em'],
      2: ['do', 'you', 'first', 'en', 'oh', 'pee', 'cue', 'ar', 'es', 'tee', 'vee', 'double', 'eks', 'why', 'zed'],
      3: ['to', 'you'], 6: ['oh', 'double', 'triple'],
    };
    const known = new Set(['nam', 'le', 'mai', 'nguyen', 'pham', 'truong']);
    f1.lessons.forEach((lesson, index) => {
      for (const row of generalVocabManifest.filter(({ lessonSlug }) => lessonSlug === slugs[index])) {
        row.headword.toLowerCase().split(' ').forEach((token) => known.add(token));
      }
      support[index + 1]?.forEach((token) => known.add(token));
      const tokens = lesson.blocks.flatMap((block) => block.kind === 'example' ? normalize(block.text).match(/[a-z]+/g) ?? [] : [])
        .filter((token) => token.length > 1);
      const unknown = tokens.filter((token) => !known.has(token));
      expect(unknown.length / Math.max(tokens.length, 1), `${lesson.id}: ${unknown.join(', ')}`).toBeLessThanOrEqual(0.1);
    });
  });
  it('provides at least two actual review questions from each stage?s fourth lesson onwards', () => {
    for (const stage of pack.stages) {
      pack.lessons.filter(({ stageId }) => stageId === stage.id).slice(3).forEach((lesson) => {
        const reviews = new Set(lesson.reviewVocabIds);
        expect(reviews.size).toBeGreaterThan(0);
        const questions = lesson.questions.filter((question) => question.vocabIds?.some((id) => reviews.has(id)));
        expect(questions.length).toBeGreaterThanOrEqual(2);
        for (const id of reviews) expect(questions.some(({ vocabIds }) => vocabIds?.includes(id)), id).toBe(true);
      });
    }
  });
  it('recycles every F1 day 1–2 introduction on a later day, with accurate review metadata', () => {
    const lessonDay = new Map(f1.days.flatMap((day) => day.mainQuestIds.flatMap((questId) => {
      const quest = f1.quests.find(({ id }) => id === questId)!;
      return quest.lessonIds.map((id) => [id, day.day] as const);
    })));
    for (const lesson of f1.lessons) {
      const day = lessonDay.get(lesson.id)!;
      for (const id of lesson.reviewVocabIds ?? []) {
        const original = f1.lessons.find(({ vocabIds }) => vocabIds?.includes(id))!;
        expect(lessonDay.get(original.id)!).toBeLessThan(day);
      }
      if (day === 3) continue;
      for (const id of lesson.vocabIds!) {
        const later = f1.lessons.filter((candidate) => lessonDay.get(candidate.id)! > day && candidate.reviewVocabIds?.includes(id)).length
          + f1.days.filter((candidate) => candidate.day > day && f1.tests.find(({ id: testId }) => testId === candidate.testId)!.reviewVocabIds?.includes(id)).length;
        expect(later, id).toBeGreaterThanOrEqual(Math.min(2, 3 - day));
      }
    }
    for (const day of f1.days) {
      const test = f1.tests.find(({ id }) => id === day.testId)!;
      for (const id of test.reviewVocabIds ?? []) {
        expect(test.questionIds.some((qid) => questionById.get(qid)?.category === 'review' && questionById.get(qid)?.vocabIds?.includes(id)), id).toBe(true);
        const owner = f1.lessons.find(({ vocabIds }) => vocabIds?.includes(id))!;
        expect(lessonDay.get(owner.id)!).toBeLessThan(day.day);
      }
    }
    const scheduled = pack.days!.flatMap((day) => day.mainQuestIds.flatMap((questId) =>
      pack.quests.find(({ id }) => id === questId)!.lessonIds.map((id) => [id, day] as const)));
    const daysByLesson = new Map(scheduled);
    // Course chronology: an earlier stage of the same course, or an earlier day of the same stage.
    const stageById = new Map(pack.stages.map((stage) => [stage.id, stage]));
    const checkEarlier = (id: string, day: NonNullable<typeof pack.days>[number]) => {
      const reviewStage = stageById.get(day.stageId)!;
      const owner = pack.lessons.find((lesson) => lesson.vocabIds?.includes(id));
      expect(owner, id).toBeDefined();
      const ownerDay = daysByLesson.get(owner!.id)!;
      const ownerStage = stageById.get(ownerDay.stageId)!;
      expect(ownerStage.courseCode, id).toBe(reviewStage.courseCode);
      if (ownerStage.id === reviewStage.id) expect(ownerDay.day, id).toBeLessThan(day.day);
      else expect(ownerStage.order, id).toBeLessThan(reviewStage.order);
    };
    for (const lesson of pack.lessons) {
      for (const id of lesson.reviewVocabIds ?? []) checkEarlier(id, daysByLesson.get(lesson.id)!);
    }
    for (const day of pack.days!) {
      const test = pack.tests!.find(({ id }) => id === day.testId)!;
      for (const id of test.reviewVocabIds ?? []) {
        checkEarlier(id, day);
        expect(test.questionIds.some((qid) => questionById.get(qid)?.category === 'review'
          && questionById.get(qid)?.vocabIds?.includes(id)), id).toBe(true);
      }
    }
  });
  it('fails if later recycling is removed even with truncation enabled', () => {
    const mutated = clone();
    const word = 'en:vocab:alphabet';
    const withoutReview = { ...mutated,
      lessons: mutated.lessons.map((lesson) => ({ ...lesson, reviewVocabIds: lesson.reviewVocabIds?.filter((id) => id !== word) ?? [] })),
      tests: mutated.tests!.map((test) => ({ ...test, reviewVocabIds: test.reviewVocabIds?.filter((id) => id !== word) ?? [] })),
    };
    expect(checkCurriculum(withoutReview, options).some(({ message }) => message.includes(word) && message.includes('is recycled 0 times'))).toBe(true);
  });
  it('matches every unit schedule, with contiguous stage days, two main lessons and an unlocked test per day', () => {
    expect(pack.days).toEqual(authoredUnits.flatMap(({ content }) => content.days));
    expect(pack.tests).toEqual(authoredUnits.flatMap(({ content }) => content.tests));
    expect(pack.quests).toEqual(authoredUnits.flatMap(({ content }) => content.quests));
    for (const stage of pack.stages) {
      const days = pack.days!.filter(({ stageId }) => stageId === stage.id);
      expect(days.map(({ day }) => day)).toEqual(days.map((_, index) => index + 1));
    }
    expect(XP).toEqual({ main: 10, daily: 20, side: 10, unit: 30, repeat: 0 });
    for (const { content: unit, schedule } of authoredUnits) {
      expect(unit.days.map(({ day }) => day)).toEqual(schedule.map(({ day }) => day));
      expect(unit.tests).toHaveLength(schedule.length);
      // docs/curriculum/plan-foundation-level1.md section 3 allows three main
      // lessons only for Chinese pronunciation days; English always has two.
      expect(unit.quests).toHaveLength(schedule.reduce((count, entry) =>
        count + Object.keys(entry.mainLessons).length + entry.sideQuests.length + 1, 0));
      unit.days.forEach((day, index) => {
        const entry = schedule[index]!;
        expect(Object.values(entry.mainLessons)).toHaveLength(2);
        expect(day.mainQuestIds).toEqual(Object.values(entry.mainLessons).map((slug) => 'en:quest:' + slug));
        for (const id of day.mainQuestIds) {
          const quest = unit.quests.find((quest) => quest.id === id)!;
          expect(quest).toMatchObject({ xp: XP.main, optional: false, stageId: day.stageId });
          expect(quest.lessonIds).toHaveLength(1);
          const lesson = unit.lessons.find((lesson) => lesson.id === quest.lessonIds[0])!;
          expect(quest.skill).toBe(lesson.skill);
          expect(quest.id).toBe(lesson.id.replace('en:lesson:', 'en:quest:'));
        }
        expect(day.sideQuestIds).toEqual(entry.sideQuests.map(({ slug }) => 'en:quest:' + slug));
        const sides = (day.sideQuestIds ?? []).map((id) => unit.quests.find((quest) => quest.id === id)!);
        for (const side of sides) {
          expect(side).toMatchObject({ xp: XP.side, optional: true, stageId: day.stageId });
          expect(extensionSchemas['en:activity'].parse(side.extensions!['en:activity'])['vi']!.length).toBeGreaterThan(20);
        }
        const test = unit.tests.find(({ id }) => id === day.testId)!;
        expect(test.id).toBe('en:test:' + entry.test.slug);
        expect(test.kind).toBe(entry.test.kind);
        const testQuests = unit.quests.filter(({ extensions }) => extensions?.['en:test-policy'] &&
          extensionSchemas['en:test-policy'].parse(extensions['en:test-policy']).testId === day.testId);
        expect(testQuests).toHaveLength(1);
        const testQuest = testQuests[0]!;
        expect(testQuest).toMatchObject({ xp: test.kind === 'daily' ? XP.daily : XP.unit, optional: false, lessonIds: [] });
        expect(extensionSchemas['en:test-policy'].parse(testQuest.extensions!['en:test-policy'])).toEqual({
          testId: day.testId, afterQuestIds: day.mainQuestIds, repeatXp: 0, reward: 'first-pass-per-day',
        });
        const coreMinutes = [...day.mainQuestIds, testQuest.id].reduce((total, id) =>
          total + unit.quests.find((quest) => quest.id === id)!.minutes, 0);
        if (test.kind === 'daily') expect(coreMinutes).toBe(26);
        expect(coreMinutes + sides.reduce((total, side) => total + side.minutes, 0)).toBeLessThanOrEqual(30);
      });
      expect(unit.days.flatMap(({ mainQuestIds }) => mainQuestIds)
        .flatMap((id) => unit.quests.find((quest) => quest.id === id)!.lessonIds).sort())
        .toEqual(unit.lessons.map(({ id }) => id).sort());
    }
  });
  it('uses exactly 4 lesson A + 3 lesson B + 3 review questions, with 3+ typed and a pass ratio of .85', () => {
    const practice = pack.lessons.flatMap(({ questions }) => questions.map(({ prompt }) => normalize(typeof prompt === 'string' ? prompt : prompt['vi']!)));
    for (const { content: unit, schedule } of authoredUnits) {
      for (const test of unit.tests.filter(({ kind }) => kind === 'daily')) {
        const entry = schedule.find(({ test: scheduled }) => 'en:test:' + scheduled.slug === test.id)!;
        const questions = test.questionIds.map((id) => questionById.get(id)!);
        expect(questions).toHaveLength(10);
        expect(new Set(test.questionIds).size).toBe(10);
        expect(test).toMatchObject({ kind: 'daily', passRatio: 0.85 });
        expect(Math.ceil(test.passRatio * 10)).toBe(9);
        expect(questions.filter(({ kind }) => kind === 'typed').length).toBeGreaterThanOrEqual(3);
        expect(questions.map(({ category }) => category)).toEqual([
          ...Array<string>(4).fill('lesson-a'), ...Array<string>(3).fill('lesson-b'), ...Array<string>(3).fill('review'),
        ]);
        for (const question of questions) {
          expect(question.explanations?.['vi']!.length).toBeGreaterThan(0);
          expect(question.vocabIds!.length).toBeGreaterThan(0);
          expect(practice).not.toContain(normalize(typeof question.prompt === 'string' ? question.prompt : question.prompt['vi']!));
          if (question.category === 'lesson-a' || question.category === 'lesson-b') {
            expect(question.group).toBe(`en:lesson:${entry.mainLessons[question.category]}`);
          }
        }
      }
    }
    const dailyTests = pack.tests!.filter(({ kind }) => kind === 'daily');
    expect(new Set(dailyTests.flatMap(({ questionIds }) => questionIds)).size).toBe(dailyTests.length * 10);
  });
  it('accepts F1 optional final punctuation, contractions and spelling variants without weakening exact grading', () => {
    const typed = f1.lessons.flatMap(({ questions }) => questions).filter((q): q is Question & { kind: 'typed' } => q.kind === 'typed');
    const intro = typed.find(({ id }) => id.endsWith('-introduce'))!;
    for (const answer of ['I am Nam.', 'I am Nam', "I'm Nam.", 'I’m Nam']) expect(gradeAnswer(answer, intro).correct).toBe(true);
    expect(gradeAnswer('I is Nam', intro).correct).toBe(false);
    const phone = typed.find(({ id }) => id.endsWith('-phone-digits'))!;
    expect(gradeAnswer('07700 900123', phone).correct).toBe(true);
    expect(gradeAnswer('7700900123', phone).correct).toBe(false);
    // F1 has no different US spellings. Verify the shared authoring helper for later units.
    for (const [uk, us] of [['colour', 'color'], ['favourite', 'favorite'], ['per cent', 'percent']]) {
      expect(compareAnswer(us, acceptedForms(uk!)).correct).toBe(true);
      expect(compareAnswer(`${us}.`, acceptedForms(`${uk}.`)).correct).toBe(true);
    }
  });
});
