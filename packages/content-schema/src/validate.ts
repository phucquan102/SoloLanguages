import { contentPackSchema, contentValidationContextSchema, extensionKeySchema } from './schemas.ts';
import { jsonSnapshot } from './json.ts';
import type {
  ContentExtensionKey, ContentIssuePath, ContentValidationContext, ContentValidationIssue, ContentValidationOptions, JsonValue,
} from './types.ts';

/** Checks context first, then structure, references, pack-wide IDs and owned extensions. Never throws. */
export function validateContentPack(
  pack: unknown, context: ContentValidationContext, options: ContentValidationOptions = {},
): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  let failurePath: ContentIssuePath = ['context'];
  const add = (path: ContentIssuePath, message: string) => { issues.push({ path, message }); };
  try {
    const checkedContext = contentValidationContextSchema.safeParse(jsonSnapshot(context, ['context'], new Set(), issues));
    if (!checkedContext.success) {
      return checkedContext.error.issues.map((issue) => ({
        path: ['context', ...issue.path.map((key) => typeof key === 'symbol' ? String(key) : key)], message: issue.message,
      }));
    }
    failurePath = [];
    const parsed = contentPackSchema.safeParse(jsonSnapshot(pack, [], new Set(), issues));
    if (!parsed.success) {
      return parsed.error.issues.map((issue) => ({
        path: issue.path.map((key) => typeof key === 'symbol' ? String(key) : key), message: issue.message,
      }));
    }
    const data = parsed.data;
    const { skills, levels, courses, language } = checkedContext.data;
    if (data.language !== language) add(['language'], 'Pack language must equal context language');
    const stageMap = new Map(data.stages.map((stage) => [stage.id, stage]));
    const lessonIds = new Set(data.lessons.map((lesson) => lesson.id));
    const vocabIds = new Set(data.vocab.map((vocab) => vocab.id));
    const questIds = new Set(data.quests.map((quest) => quest.id));
    const units = data.units ?? [];
    const days = data.days ?? [];
    const tests = data.tests ?? [];
    const unitIds = new Set(units.map((unit) => unit.id));
    const testIds = new Set(tests.map((test) => test.id));
    // Tests may reuse questions from lessons, placement or assessments.
    const questionIds = new Set([
      ...data.lessons.flatMap((lesson) => lesson.questions.map((question) => question.id)),
      ...data.placement.map((question) => question.id),
      ...data.assessments.map((question) => question.id),
    ]);
    const allLevels = new Set(Object.values(levels).flat());
    const refs = (ids: readonly string[] | undefined, known: Set<string>, path: ContentIssuePath) => {
      ids?.forEach((id, index) => {
        if (!known.has(id)) add([...path, index], `Unresolved reference "${id}"`);
      });
    };
    const ref = (id: string | undefined, known: Set<string>, path: ContentIssuePath) => {
      if (id !== undefined && !known.has(id)) add(path, `Unresolved reference "${id}"`);
    };
    const stageRef = (id: string | undefined, path: ContentIssuePath) => {
      if (id !== undefined && !stageMap.has(id)) add(path, `Unknown stage "${id}"`);
    };
    const skillRef = (id: string, path: ContentIssuePath) => {
      if (!skills.includes(id)) add(path, `Unknown skill "${id}"`);
    };
    const seenIds = new Set<string>();
    // Include records within module-owned JSON datasets as well as schema collections.
    const visit = (value: unknown, path: ContentIssuePath): void => {
      if (value === null || typeof value !== 'object') return;
      if (Array.isArray(value)) { value.forEach((child, index) => visit(child, [...path, index])); return; }
      const object = value as Record<string, unknown>;
      const isRecord = Object.hasOwn(object, 'provenance') || (path.includes('extensions') && Object.hasOwn(object, 'id'));
      if (isRecord && typeof object['id'] === 'string') {
        if (object['id'].length === 0 || object['id'].trim() !== object['id']) add([...path, 'id'], 'Expected non-empty trimmed id');
        if (seenIds.has(object['id'])) add([...path, 'id'], `Duplicate id "${object['id']}"`);
        seenIds.add(object['id']);
      }
      if ((isRecord || path.length === 0) && Object.hasOwn(object, 'extensions')) {
        const extensions = object['extensions'];
        if (extensions === null || typeof extensions !== 'object' || Array.isArray(extensions)) {
          add([...path, 'extensions'], 'Expected an extension record');
        } else {
          for (const [key, value] of Object.entries(extensions)) {
            const extensionPath = [...path, 'extensions', key];
            if (!extensionKeySchema.safeParse(key).success) add(extensionPath, 'Expected <code>:<name>');
            if (key.split(':')[0] !== language) add(extensionPath, 'Extension must belong to context language');
            try {
              const hooks = options.extensions;
              const hook = hooks !== undefined && Object.hasOwn(hooks, key) ? hooks[key as ContentExtensionKey] : undefined;
              if (typeof hook !== 'function') { add(extensionPath, 'Unknown extension key: no validator supplied'); continue; }
              // Isolate the audited data from accidental mutations in module hooks.
              const hookValue = jsonSnapshot(value, extensionPath, new Set(), issues) as JsonValue;
              const hookIssues = jsonSnapshot(hook(hookValue), extensionPath, new Set(), issues);
              if (!Array.isArray(hookIssues)) { add(extensionPath, 'Extension validator must return issues'); continue; }
              for (const issue of hookIssues as unknown[]) {
                if (issue === null || typeof issue !== 'object') { add(extensionPath, 'Malformed extension issue'); continue; }
                const result = issue as Record<string, unknown>;
                if (!Array.isArray(result['path']) || !result['path'].every((part: unknown) => typeof part === 'string' || (typeof part === 'number' && Number.isInteger(part))) || typeof result['message'] !== 'string') {
                  add(extensionPath, 'Malformed extension issue'); continue;
                }
                add([...extensionPath, ...result['path'] as ContentIssuePath], result['message']);
              }
            } catch { add(extensionPath, 'Unable to validate extension'); }
          }
        }
      }
      for (const [key, child] of Object.entries(object)) visit(child, [...path, key]);
    };
    visit(data, []);
    const stageOrders = new Map<string, Set<number>>();
    data.stages.forEach((stage, index) => {
      const course = Object.hasOwn(courses, stage.courseCode) ? courses[stage.courseCode] : undefined;
      if (!course) add(['stages', index, 'courseCode'], `Unknown course "${stage.courseCode}"`);
      if (stage.frameworkCode !== undefined && stage.frameworkCode !== course?.framework) {
        add(['stages', index, 'frameworkCode'], 'Unknown framework or framework differs from course');
      }
      if (stage.levelCode !== null && !course?.levels.includes(stage.levelCode)) {
        add(['stages', index, 'levelCode'], `Unknown level code "${stage.levelCode}" for course`);
      }
      const orders = stageOrders.get(stage.courseCode) ?? new Set<number>();
      if (orders.has(stage.order)) add(['stages', index, 'order'], 'Duplicate stage order within course');
      orders.add(stage.order); stageOrders.set(stage.courseCode, orders);
    });
    data.vocab.forEach((vocab, index) => {
      stageRef(vocab.stageId, ['vocab', index, 'stageId']);
      const stage = vocab.stageId === undefined ? undefined : stageMap.get(vocab.stageId);
      const course = stage !== undefined && Object.hasOwn(courses, stage.courseCode) ? courses[stage.courseCode] : undefined;
      if (vocab.levelCode !== undefined) {
        if (!(course ? course.levels.includes(vocab.levelCode) : allLevels.has(vocab.levelCode))) {
          add(['vocab', index, 'levelCode'], `Unknown level code "${vocab.levelCode}"`);
        }
        if (stage && stage.levelCode !== null && vocab.levelCode !== stage.levelCode) {
          add(['vocab', index, 'levelCode'], 'Vocabulary level must equal its stage level');
        }
      }
    });
    const questions = (records: readonly { vocabIds?: readonly string[] | undefined }[], path: ContentIssuePath) => {
      records.forEach((question, index) => refs(question.vocabIds, vocabIds, [...path, index, 'vocabIds']));
    };
    data.lessons.forEach((lesson, index) => {
      stageRef(lesson.stageId, ['lessons', index, 'stageId']);
      skillRef(lesson.skill, ['lessons', index, 'skill']);
      ref(lesson.unitId, unitIds, ['lessons', index, 'unitId']);
      refs(lesson.vocabIds, vocabIds, ['lessons', index, 'vocabIds']);
      refs(lesson.reviewVocabIds, vocabIds, ['lessons', index, 'reviewVocabIds']);
      lesson.blocks.forEach((block, blockIndex) => {
        if (block.kind === 'example') refs(block.vocabIds, vocabIds, ['lessons', index, 'blocks', blockIndex, 'vocabIds']);
      });
      questions(lesson.questions, ['lessons', index, 'questions']);
    });
    data.quests.forEach((quest, index) => {
      stageRef(quest.stageId, ['quests', index, 'stageId']);
      skillRef(quest.skill, ['quests', index, 'skill']);
      refs(quest.lessonIds, lessonIds, ['quests', index, 'lessonIds']);
    });
    const unitOrders = new Map<string, Set<number>>();
    units.forEach((unit, index) => {
      stageRef(unit.stageId, ['units', index, 'stageId']);
      const orders = unitOrders.get(unit.stageId) ?? new Set<number>();
      if (orders.has(unit.order)) add(['units', index, 'order'], 'Duplicate unit order within stage');
      orders.add(unit.order); unitOrders.set(unit.stageId, orders);
    });
    const dayNumbers = new Map<string, Set<number>>();
    days.forEach((day, index) => {
      stageRef(day.stageId, ['days', index, 'stageId']);
      ref(day.unitId, unitIds, ['days', index, 'unitId']);
      refs(day.mainQuestIds, questIds, ['days', index, 'mainQuestIds']);
      refs(day.sideQuestIds, questIds, ['days', index, 'sideQuestIds']);
      ref(day.testId, testIds, ['days', index, 'testId']);
      const numbers = dayNumbers.get(day.stageId) ?? new Set<number>();
      if (numbers.has(day.day)) add(['days', index, 'day'], 'Duplicate day number within stage');
      numbers.add(day.day); dayNumbers.set(day.stageId, numbers);
    });
    tests.forEach((test, index) => {
      refs(test.questionIds, questionIds, ['tests', index, 'questionIds']);
      refs(test.reviewVocabIds, vocabIds, ['tests', index, 'reviewVocabIds']);
    });
    questions(data.placement, ['placement']);
    questions(data.assessments, ['assessments']);
    return issues;
  } catch {
    // Never inspect a thrown value: even its properties may be hostile getters.
    return issues.length ? issues : [{ path: failurePath, message: 'Unable to validate input as lossless JSON data' }];
  }
}
