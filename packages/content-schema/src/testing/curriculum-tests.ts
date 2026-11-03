import { checkQuestionAnswers, textVariants } from './curriculum-questions.ts';
import type { AddIssue, CurriculumConfig } from './curriculum-questions.ts';
import type { PackData, PackQuestion } from './pack-data.ts';
import type { ContentIssuePath } from '../types.ts';

export const DAILY_TEST_MIN_QUESTIONS = 10;
export const DAILY_TEST_MIN_TYPED = 3;

export interface Located { readonly path: ContentIssuePath; readonly question: PackQuestion }

/** Every question in the pack by id; the first record wins when ids collide. */
export function locateQuestions(data: PackData): Map<string, Located> {
  const located = new Map<string, Located>();
  const put = (path: ContentIssuePath, question: PackQuestion) => { if (!located.has(question.id)) located.set(question.id, { path, question }); };
  data.lessons.forEach((lesson, index) => lesson.questions.forEach((question, position) => put(['lessons', index, 'questions', position], question)));
  data.placement.forEach((question, index) => put(['placement', index], question));
  data.assessments.forEach((question, index) => put(['assessments', index], question));
  return located;
}

/**
 * Day and test rules. `checked` holds ids of questions whose answer key was already checked,
 * and receives the test questions checked here.
 */
export function checkDaysAndTests(data: PackData, config: CurriculumConfig, checked: Set<string>, add: AddIssue): void {
  const days = data.days ?? [];
  const tests = data.tests ?? [];
  const testIndexes = new Map(tests.map((test, index) => [test.id, index]));
  // A test belongs to a stage through the days that close with it; with no scope every test is checked.
  const scopedTests = new Set<number>(config.scope === undefined ? tests.map((_test, index) => index) : []);
  days.forEach((day, index) => {
    if (config.scope !== undefined && !config.scope.has(day.stageId)) return;
    if (day.mainQuestIds.length === 0) add(['days', index, 'mainQuestIds'], 'Day needs at least one main quest');
    const test = testIndexes.get(day.testId);
    if (test === undefined) add(['days', index, 'testId'], `Day test "${day.testId}" does not exist`);
    else scopedTests.add(test);
  });

  const located = locateQuestions(data);
  const practice = new Set(data.lessons.flatMap((lesson) => lesson.questions.flatMap((question) => textVariants(question.prompt, config))));
  tests.forEach((test, index) => {
    if (!scopedTests.has(index)) return;
    const path = ['tests', index, 'questionIds'];
    const resolved: { readonly found: Located; readonly position: number }[] = [];
    const seen = new Set<string>();
    test.questionIds.forEach((id, position) => {
      const found = located.get(id);
      if (found === undefined) { add([...path, position], `Test question "${id}" does not exist`); return; }
      if (!seen.has(id)) { seen.add(id); resolved.push({ found, position }); }
    });
    if (test.kind === 'daily') {
      const typed = resolved.filter(({ found }) => found.question.kind === 'typed').length;
      if (resolved.length < DAILY_TEST_MIN_QUESTIONS) {
        add(path, `Daily test needs at least ${DAILY_TEST_MIN_QUESTIONS} questions, found ${resolved.length}`);
      }
      if (typed < DAILY_TEST_MIN_TYPED) add(path, `Daily test needs at least ${DAILY_TEST_MIN_TYPED} typed questions, found ${typed}`);
    }
    for (const { found: { path: questionPath, question }, position } of resolved) {
      if (!checked.has(question.id)) { checked.add(question.id); checkQuestionAnswers(question, questionPath, config, add); }
      if (textVariants(question.prompt, config).some((variant) => variant !== '' && practice.has(variant))) {
        add([...path, position], 'Test question repeats the prompt of a practice question');
      }
    }
  });
}
