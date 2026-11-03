import { describe, expect, it } from 'vitest';
import { checkContentHygiene, checkCurriculum, checkReleaseGate } from '@solo/content-schema/testing';
import { validateContentPack } from '@solo/content-schema';
import type { ContentPack, ContentRecord, Question } from '@solo/content-schema';
import language from '../../src/index.ts';
import pack from '../../src/content/index.ts';
import { zhCurriculumOptions, vocabIdsInText } from '../../src/content/authoring-checks.ts';
import { extensionSchemas, extensionValidators } from '../../src/content/extension-schemas.ts';
import { hskVocabManifest } from '../../src/content/manifest/hsk.ts';
import { XP } from '../../src/content/unit-content.ts';
import { schedule } from '../../src/content/foundation/n1.ts';
import n1 from '../../src/content/foundation/n1.ts';
import side from '../../src/content/foundation/side.ts';
import h1 from '../../src/content/hsk1/h1.ts';
import h2 from '../../src/content/hsk1/h2.ts';
import h3 from '../../src/content/hsk1/h3.ts';
import h4 from '../../src/content/hsk1/h4.ts';
import { answerKeyFor, gradeAnswer } from '../../src/grading.ts';
import type { AnswerMode } from '../../src/grading.ts';
import { parsePinyin, pinyinKey } from '../../src/pinyin.ts';
import { normalize } from '../../src/text-tools.ts';
import { isNativeText } from '../fixtures/native-text.ts';

const options = zhCurriculumOptions(pack);
const clone = (): ContentPack => structuredClone(pack) as ContentPack;
const context = {
  language: language.manifest.code,
  skills: language.skills.map((skill) => skill.id),
  levels: Object.fromEntries(language.levelFrameworks.map((framework) => [framework.code, framework.levels.map((level) => level.code)])),
  courses: Object.fromEntries(language.courses.map((course) => [course.code, { framework: course.framework, levels: course.levels }])),
};
const slugs = [
  'pinyin', 'tone', 'initials-bpmf-dtnl', 'initials-gkh-jqx', 'initials-zcs-zhchshr', 'finals-compound',
  'finals-nasal', 'neutral-tone', 'sandhi-third', 'sandhi-bu-yi', 'spelling-rules', 'vocab',
];
const promptOf = (question: Question): string => typeof question.prompt === 'string' ? question.prompt : question.prompt['vi']!;
const questionById = new Map([...pack.lessons.flatMap(({ questions }) => questions), ...pack.assessments]
  .map((question) => [question.id, question]));
const modeOf = (question: Question): AnswerMode | undefined =>
  question.extensions?.['zh:answer-mode'] as AnswerMode | undefined;
const typedQuestions = [...pack.lessons.flatMap(({ questions }) => questions), ...pack.assessments]
  .filter((question): question is Question & { kind: 'typed' } => question.kind === 'typed');

describe('N1 pilot curriculum', () => {
  // Remove truncateAtScheduleEnd in zhCurriculumOptions once the HSK1 units supply later recycling.
  it('passes the full curriculum gate on every hsk stage with schedule truncation', () => {
    expect(options.truncateAtScheduleEnd).toBe(true);
    expect(options.scopeStageIds).toHaveLength(8);
    expect(checkCurriculum(pack, options)).toEqual([]);
  });
  it('shows why truncation is still needed: without it the six words lack later recycling', () => {
    const { truncateAtScheduleEnd: _truncate, ...strict } = options;
    const issues = checkCurriculum(pack, strict);
    expect(issues.length).toBe(6);
    expect(issues.every(({ message }) => message.includes('is recycled 0 times'))).toBe(true);
  });
  it('passes structural validation with every extension validator and the shared hygiene audit', () => {
    expect(validateContentPack(pack, context, { extensions: extensionValidators })).toEqual([]);
    expect(checkContentHygiene(pack, { nativeLocales: ['vi'], isNativeText })).toEqual([]);
  });
  it('wires the release gate and reports the ai-draft and unreviewed records', () => {
    const issues = checkReleaseGate(pack, options.scopeStageIds!);
    expect(issues.length).toBeGreaterThan(100);
    expect(issues.every(({ message }) => message.includes('is "ai-draft"; release needs "approved"')
      || message.includes('has no review; release needs "approved"'))).toBe(true);
    for (const issue of issues) {
      let value: unknown = pack;
      for (const key of issue.path) value = (value as Record<string | number, unknown>)[key];
      expect(value).toBe(issue.path.at(-1) === 'review' ? undefined : 'ai-draft');
    }
    // Approval, not dropping the check, opens the gate.
    const approved = clone();
    const approve = (value: unknown): void => {
      if (value === null || typeof value !== 'object') return;
      if ('provenance' in value) (value as unknown as { review: ContentRecord['review'] }).review = {
        status: 'approved', reviewerRoles: ['native-zh', 'editor-vi'], date: '2026-11-03',
      };
      Object.values(value).forEach(approve);
    };
    approve(approved);
    expect(checkReleaseGate(approved, options.scopeStageIds!)).toEqual([]);
  });
  it('contains exactly the twelve ordered main lessons with bilingual titles and manifest introductions', () => {
    expect(pack.lessons.map(({ id }) => id)).toEqual(slugs.map((slug) => `zh:lesson:${slug}`));
    expect(pack.lessons.map(({ order }) => order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    pack.lessons.forEach((lesson, index) => {
      expect(lesson.unitId).toBe('zh:unit:n1');
      expect(lesson.stageId).toBe('zh:stage:foundation');
      expect(lesson.titles?.['vi']?.length).toBeGreaterThan(0);
      expect(lesson.titles?.['en']?.length).toBeGreaterThan(0);
      expect(lesson.vocabIds).toEqual(hskVocabManifest.filter(({ unitId, lessonSlug }) =>
        unitId === 'zh:unit:n1' && lessonSlug === slugs[index]).map(({ id }) => id));
      expect(lesson.blocks.map(({ kind }) => kind).filter((kind) => kind === 'mistake').length).toBeGreaterThanOrEqual(1);
      for (const block of lesson.blocks) {
        if (block.kind === 'mistake') expect(block.note['vi']!.length).toBeGreaterThan(40);
        if (block.kind === 'example') expect(block.translations?.['vi']?.length).toBeGreaterThan(0);
      }
      const choice = lesson.questions.filter(({ kind }) => kind === 'choice').length;
      expect(choice).toBeGreaterThanOrEqual(2);
      expect(lesson.questions.length - choice).toBeGreaterThanOrEqual(2);
      for (const question of lesson.questions) expect(question.explanations?.['vi']?.length).toBeGreaterThan(10);
    });
    expect(pack.lessons.flatMap(({ vocabIds }) => vocabIds ?? [])).toHaveLength(6);
    expect(pack.lessons.at(-1)!.vocabIds).toEqual(hskVocabManifest.filter(({ unitId }) => unitId === 'zh:unit:n1').map(({ id }) => id));
  });
  it('keeps the legacy lesson ids pinyin, tone and vocab and drops the superseded mockup lessons', () => {
    for (const slug of ['pinyin', 'tone', 'vocab']) expect(pack.lessons.some(({ id }) => id === `zh:lesson:${slug}`)).toBe(true);
    expect(pack.lessons.some(({ id }) => id === 'zh:lesson:radical')).toBe(false);
    expect(pack.assessments.every(({ id }) => id.startsWith('zh:assessment:n1-day'))).toBe(true);
    expect(pack.quests.filter(({ id }) => ['pinyin', 'tone', 'vocab'].some((slug) => id === `zh:quest:${slug}`))).toHaveLength(3);
  });
  it('leaves the other units as authoring stubs that are part of the pack', () => {
    for (const content of [side, h1, h2, h3, h4]) {
      expect(content.unit.review?.status).toBe('ai-draft');
      for (const name of ['lessons', 'quests', 'assessments', 'days', 'tests'] as const) expect(content[name]).toEqual([]);
      expect(pack.units!.some(({ id }) => id === content.unit.id)).toBe(true);
    }
    expect(pack.units!.map(({ id }) => id)).toEqual(['zh:unit:n1', 'zh:unit:n1-side', 'zh:unit:h1', 'zh:unit:h2', 'zh:unit:h3', 'zh:unit:h4']);
    expect(n1.unit.canDo.length).toBeGreaterThanOrEqual(3);
  });
  it('recycles earlier sound skills in at least two real review questions per lesson from lesson 4', () => {
    pack.lessons.slice(3, 11).forEach((lesson) => {
      const reviews = lesson.questions.filter(({ id }) => id.includes('-review-'));
      expect(reviews.length, lesson.id).toBeGreaterThanOrEqual(2);
      expect(reviews.some(({ kind }) => kind === 'typed') && reviews.some(({ kind }) => kind === 'choice'), lesson.id).toBe(true);
    });
    // The vocabulary lesson recycles tone, neutral-tone and sandhi skills through its pinyin questions.
    const vocab = pack.lessons.at(-1)!;
    expect(vocab.questions.filter((question) => ['pinyin', 'pinyin-sandhi'].includes(modeOf(question) ?? '')).length).toBeGreaterThanOrEqual(3);
    // Only lesson 12 introduces vocabulary, so there is no earlier vocabulary to list as reviewVocabIds.
    for (const lesson of pack.lessons) expect(lesson.reviewVocabIds ?? []).toEqual([]);
  });
  it('gives each of the six words an example and at least two honest lesson questions', () => {
    const lesson = pack.lessons.at(-1)!;
    for (const id of lesson.vocabIds!) {
      const word = hskVocabManifest.find((row) => row.id === id)!;
      expect(lesson.blocks.some((block) => block.kind === 'example' && block.vocabIds?.includes(id))).toBe(true);
      const using = lesson.questions.filter((question) => question.vocabIds?.includes(id));
      expect(using.length, id).toBeGreaterThanOrEqual(2);
      for (const question of using) {
        const shown = [promptOf(question), ...(question.kind === 'choice' ? question.options.map((option) =>
          typeof option === 'string' ? option : '') : question.acceptedAnswers)].join(' ');
        expect(normalize(shown).includes(normalize(word.hanzi)) || [...(question.kind === 'typed' ? question.acceptedAnswers : [])]
          .some((answer) => pinyinKey(answer) === pinyinKey(word.pinyin)) || normalize(promptOf(question)).includes(normalize(word.pinyin)),
        `${question.id} claims ${id}`).toBe(true);
      }
    }
    // Vocabulary questions never claim a word from a later unit.
    for (const question of pack.lessons.flatMap(({ questions }) => questions)) {
      for (const id of question.vocabIds ?? []) expect(hskVocabManifest.find((row) => row.id === id)!.unitId).toBe('zh:unit:n1');
    }
  });
  it('builds the vocabulary records from the frozen manifest, with examples only from authored lessons', () => {
    expect(pack.vocab.map(({ id }) => id)).toEqual(hskVocabManifest.map(({ id }) => id));
    for (const id of ['ni-hao', 'xiexie', 'zaijian', 'ren', 'xuesheng', 'pengyou', 'shui', 'shu']) {
      expect(pack.vocab.filter((word) => word.id === `zh:vocab:${id}`)).toHaveLength(1);
    }
    for (const word of pack.vocab) {
      const row = hskVocabManifest.find(({ id }) => id === word.id)!;
      expect(word.headword).toBe(row.hanzi);
      expect(word.fields['pinyin']).toBe(row.pinyin);
      expect(word.provenance.source.file).toBe('languages/zh/src/content/manifest/hsk.ts');
      expect(word.examples.length > 0).toBe(row.unitId === 'zh:unit:n1');
      expect(word.stageId === undefined).toBe(row.unitId !== 'zh:unit:n1');
    }
  });
});

describe('N1 schedule, Daily Tests and quests', () => {
  it('schedules two main lessons a day with an unlocked Daily Test, 26 minutes core and XP 10/20/10/30/0', () => {
    expect(XP).toEqual({ main: 10, daily: 20, side: 10, unit: 30, repeat: 0 });
    expect(schedule.map(({ day }) => day)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(pack.days!.map(({ day }) => day)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(pack.tests).toHaveLength(6);
    expect(pack.quests).toHaveLength(12 + 6);
    pack.days!.forEach((day, index) => {
      const row = schedule[index]!;
      expect(day.mainQuestIds).toEqual(Object.values(row.mainLessons).map((slug) => `zh:quest:${slug}`));
      for (const id of day.mainQuestIds) {
        const quest = pack.quests.find((item) => item.id === id)!;
        expect(quest).toMatchObject({ xp: 10, optional: false, stageId: day.stageId, minutes: 10 });
        expect(quest.lessonIds).toHaveLength(1);
        expect(quest.skill).toBe(pack.lessons.find((lesson) => lesson.id === quest.lessonIds[0])!.skill);
        expect(extensionSchemas['zh:icon'].safeParse(quest.extensions?.['zh:icon']).success).toBe(true);
        expect(extensionSchemas['zh:reason'].safeParse(quest.extensions?.['zh:reason']).success).toBe(true);
      }
      const testQuest = pack.quests.find(({ extensions }) => extensions?.['zh:test-policy'] &&
        extensionSchemas['zh:test-policy'].parse(extensions['zh:test-policy']).testId === day.testId)!;
      expect(testQuest).toMatchObject({ xp: 20, optional: false, lessonIds: [], minutes: 6 });
      expect(extensionSchemas['zh:test-policy'].parse(testQuest.extensions!['zh:test-policy'])).toEqual({
        testId: day.testId, afterQuestIds: day.mainQuestIds, repeatXp: 0, reward: 'first-pass-per-day',
      });
      const core = [...day.mainQuestIds, testQuest.id].reduce((total, id) => total + pack.quests.find((quest) => quest.id === id)!.minutes, 0);
      expect(core).toBe(26);
      // Side quests belong to the side unit and are not authored yet.
      expect(day.sideQuestIds).toBeUndefined();
    });
    // Warm-up wording on day 1, in the test quest title and in every review prompt.
    const warmTitle = pack.quests.find(({ id }) => id === 'zh:quest:n1-day1-test')!.titles['vi']!;
    expect(warmTitle).toContain('khởi động / warm-up');
    for (const id of pack.tests![0]!.questionIds) {
      const question = questionById.get(id)!;
      if (question.category === 'review') expect(promptOf(question)).toContain('Khởi động / warm-up');
    }
    expect(pack.quests.find(({ id }) => id === 'zh:quest:n1-day2-test')!.titles['vi']).not.toContain('warm-up');
  });
  it('uses exactly 4 lesson A + 3 lesson B + 3 review questions, with 3+ typed, pass ratio .85 and 9 of 10 to pass', () => {
    const practice = pack.lessons.flatMap(({ questions }) => questions.map((question) => normalize(promptOf(question))));
    for (const [index, test] of pack.tests!.entries()) {
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
        expect(practice).not.toContain(normalize(promptOf(question)));
        if (question.category === 'lesson-a' || question.category === 'lesson-b') {
          expect(question.group).toBe(`zh:lesson:${schedule[index]!.mainLessons[question.category]}`);
        } else expect(question.group).toBe('zh:unit:n1');
      }
    }
    expect(new Set(pack.tests!.flatMap(({ questionIds }) => questionIds)).size).toBe(60);
    expect(pack.assessments).toHaveLength(60);
  });
  it('reviews only earlier days: D-1 and D-3 where they exist, never later material', () => {
    const lessonDay = new Map(schedule.flatMap((row) => Object.values(row.mainLessons).map((slug) => [slug, row.day] as const)));
    const reviewed: Record<number, number[]> = { 1: [1], 2: [1], 3: [2], 4: [3, 1], 5: [4, 2], 6: [5, 3] };
    pack.tests!.forEach((test, index) => {
      const day = index + 1;
      const review = test.questionIds.map((id) => questionById.get(id)!).filter(({ category }) => category === 'review');
      const labels = review.map((question) => /^(?:Ôn ngày (\d)|Khởi động \/ warm-up ngày (\d))/u.exec(promptOf(question)));
      labels.forEach((label) => expect(label, `day ${day}`).not.toBeNull());
      const days = labels.map((label) => Number(label![1] ?? label![2]));
      for (const value of days) expect(reviewed[day], `day ${day}`).toContain(value);
      if (day >= 4) expect(new Set(days)).toEqual(new Set(reviewed[day]));
      expect(lessonDay.get(slugs[day * 2 - 1]!)).toBe(day);
    });
  });
});

describe('N1 answer policy: pinyin, tones, sandhi and no copying', () => {
  it('grades every authored typed answer through the real grader, in its own mode', () => {
    expect(typedQuestions.length).toBeGreaterThan(40);
    for (const question of typedQuestions) {
      expect(modeOf(question), question.id).toBeDefined();
      for (const answer of question.acceptedAnswers) expect(gradeAnswer(answer, question), `${question.id}: ${answer}`).toEqual({ correct: true, score: 1 });
    }
  });
  it('uses the pinyin table: every pinyin answer is a valid syllable sequence with correct mark placement', () => {
    for (const question of typedQuestions) {
      const mode = modeOf(question)!;
      if (mode === 'hanzi' || mode === 'tone-number') continue;
      for (const answer of question.acceptedAnswers) {
        expect(parsePinyin(answer, { tones: mode !== 'pinyin-toneless', bareFinals: mode === 'pinyin-toneless' }), `${question.id}: ${answer}`).toBeDefined();
      }
    }
  });
  it('uses the right answer mode: tones are required except where the prompt says tones are set aside', () => {
    for (const question of typedQuestions) {
      const mode = modeOf(question)!;
      const prompt = promptOf(question);
      // A bare vowel has no tone to set aside; every syllable answer says so.
      if (mode === 'pinyin-toneless') expect(prompt, question.id).toMatch(/bỏ dấu thanh|Gõ nguyên âm/u);
      if (mode === 'pinyin-sandhi') expect(prompt, question.id).toContain('ghi thanh khi đọc');
      if (mode === 'pinyin') expect(prompt, question.id).not.toContain('ghi thanh khi đọc');
      if (mode === 'hanzi') expect(prompt, question.id).toMatch(/chữ Hán/u);
    }
    const sandhi = typedQuestions.filter((question) => modeOf(question) === 'pinyin-sandhi');
    expect(sandhi.length).toBeGreaterThanOrEqual(8);
    // A sandhi question rejects the citation tones; the citation question rejects the sandhi form.
    const spoken = sandhi.find(({ id }) => id.endsWith('spoken-exhibit'))!;
    expect(gradeAnswer('zhán lǎn', spoken).correct).toBe(true);
    expect(gradeAnswer('zhǎn lǎn', spoken).correct).toBe(false);
    const dictionary = typedQuestions.find(({ id }) => id.endsWith('back-to-dictionary'))!;
    expect(gradeAnswer('yǒng gǎn', dictionary).correct).toBe(true);
    expect(gradeAnswer('yóng gǎn', dictionary).correct).toBe(false);
    const neutral = typedQuestions.find(({ id }) => id.endsWith('-pinyin-sorry'))!;
    expect(gradeAnswer('dui4 bu5 qi3', neutral).correct).toBe(true);
    expect(gradeAnswer('dui4 bu0 qi3', neutral).correct).toBe(true);
    expect(gradeAnswer('dui4 bu qi3', neutral).correct).toBe(true);
    expect(gradeAnswer('duì bù qǐ', neutral).correct).toBe(false);
    expect(gradeAnswer('duibuqi', neutral).correct).toBe(false);
  });
  it('requires the target skill: no typed answer can be copied from its own prompt', () => {
    for (const question of typedQuestions) {
      const mode = modeOf(question)!;
      const tokens = promptOf(question).split(/[\s,.;:()“”?!]+/u).filter(Boolean);
      const windows = tokens.flatMap((_token, at) => [1, 2, 3].map((size) => tokens.slice(at, at + size).join(' ')));
      const key = answerKeyFor(mode, question.acceptedAnswers[0]!);
      for (const window of windows) {
        if (mode === 'tone-number' && !/^[0-5]$/u.test(window)) continue;
        expect(answerKeyFor(mode, window) === key && key !== undefined, `${question.id} shows its own answer "${window}"`).toBe(false);
      }
      // Hanzi answers are never shown in the prompt either.
      if (mode === 'hanzi') expect(promptOf(question)).not.toContain(question.acceptedAnswers[0]!);
    }
  });
  it('keeps choice answers out of their own prompts', () => {
    for (const question of [...pack.lessons.flatMap(({ questions }) => questions), ...pack.assessments]) {
      if (question.kind !== 'choice') continue;
      const key = question.options[question.correctIndex]!;
      if (typeof key !== 'string' || key.length < 2) continue;
      expect(promptOf(question), question.id).not.toContain(key);
    }
  });
  it('writes the tone, citation and hanzi conventions as the guide states them', () => {
    // Citation tones in teaching, sandhi only in questions that say so (guide C4/C5).
    const text = pack.lessons.flatMap(({ blocks }) => blocks.flatMap((block) => block.kind === 'example' && block.transcription ? [block.transcription] : []));
    expect(text).toContain('nǐ hǎo');
    expect(text).toContain('bù shì');
    expect(text).toContain('xièxie');
    expect(text).toContain('duìbuqǐ');
    expect(text).not.toContain('ní hǎo');
    expect(text).not.toContain('bú shì');
    // Simplified hanzi only in anything the learner reads or types as a target answer. Explanations may name the
    // traditional form on purpose when they explain the convention (guide C7).
    const traditional = /[謝學見關係對馬媽鳥國們別說話]/u;
    for (const question of [...pack.lessons.flatMap(({ questions }) => questions), ...pack.assessments]) {
      const shown = question.kind === 'typed' ? question.acceptedAnswers : question.options.filter((o): o is string => typeof o === 'string');
      for (const text of shown) expect(text, question.id).not.toMatch(traditional);
    }
    for (const lesson of pack.lessons) for (const block of lesson.blocks) {
      if (block.kind === 'example') expect(block.text).not.toMatch(traditional);
    }
  });
});

// Independent reading table for every hanzi used in examples, double-entered from the characters' standard readings.
const READINGS: Readonly<Record<string, string>> = {
  女: 'nü3', 路: 'lu4', 绿: 'lü4', 鹅: 'e2', 妈: 'ma1', 麻: 'ma2', 马: 'ma3', 骂: 'ma4', 八: 'ba1', 爸: 'ba4',
  趴: 'pa1', 怕: 'pa4', 肚: 'du4', 兔: 'tu4', 法: 'fa3', 拿: 'na2', 辣: 'la4', 旅: 'lü3',
  哥: 'ge1', 渴: 'ke3', 喝: 'he1', 古: 'gu3', 苦: 'ku3', 虎: 'hu3', 鸡: 'ji1', 七: 'qi1', 西: 'xi1',
  句: 'ju4', 去: 'qu4', 序: 'xu4', 字: 'zi4', 词: 'ci2', 四: 'si4', 知: 'zhi1', 吃: 'chi1', 是: 'shi4',
  日: 'ri4', 迟: 'chi2', 擦: 'ca1', 插: 'cha1', 三: 'san1', 山: 'shan1', 白: 'bai2', 来: 'lai2', 杯: 'bei1',
  好: 'hao3', 都: 'dou1', 家: 'jia1', 谢: 'xie4', 小: 'xiao3', 六: 'liu4', 回: 'hui2', 花: 'hua1', 国: 'guo2',
  快: 'kuai4', 学: 'xue2', 略: 'lüe4', 班: 'ban1', 帮: 'bang1', 门: 'men2', 猛: 'meng3', 心: 'xin1', 星: 'xing1',
  林: 'lin2', 零: 'ling2', 东: 'dong1', 中: 'zhong1', 商: 'shang1', 朋: 'peng2', 友: 'you3', 生: 'sheng1',
  我: 'wo3', 们: 'men2', 对: 'dui4', 不: 'bu4', 起: 'qi3', 你: 'ni3', 很: 'hen3', 水: 'shui3', 果: 'guo3',
  手: 'shou3', 表: 'biao3', 洗: 'xi3', 老: 'lao3', 师: 'shi1', 个: 'ge4', 一: 'yi1', 天: 'tian1', 五: 'wu3',
  鱼: 'yu2', 春: 'chun1', 有: 'you3', 为: 'wei4', 问: 'wen4', 贵: 'gui4', 先: 'xian1', 安: 'an1',
  再: 'zai4', 见: 'jian4', 客: 'ke4', 气: 'qi4', 没: 'mei2', 关: 'guan1', 系: 'xi4',
};
const lexicalNeutral = new Set(['妈妈', '谢谢', '朋友', '学生', '我们', '对不起', '客气', '关系', '没关系', '不客气']);

describe('N1 reading checks: examples agree with an independent reading table', () => {
  it('matches hanzi count, syllable count, base syllable and tone (neutral only in the listed words)', () => {
    let checked = 0;
    for (const lesson of pack.lessons) for (const block of lesson.blocks) {
      if (block.kind !== 'example' || block.transcription === undefined) continue;
      const hanzi = [...block.text.matchAll(/\p{Script=Han}/gu)].map(([char]) => char);
      if (hanzi.length === 0) continue;
      const syllables = parsePinyin(block.transcription)!;
      expect(syllables, `${lesson.id}: ${block.transcription}`).toBeDefined();
      expect(syllables.length, `${lesson.id}: ${block.text}`).toBe(hanzi.length);
      const word = hanzi.join('');
      hanzi.forEach((char, at) => {
        const reading = READINGS[char];
        expect(reading, `missing reading for ${char}`).toBeDefined();
        const base = reading!.slice(0, -1);
        const tone = Number(reading!.at(-1));
        expect(syllables[at]!.base, `${lesson.id}: ${char}`).toBe(base);
        if (syllables[at]!.tone !== tone) {
          // Only the tones of lexical neutral-tone words may differ from the single-character reading.
          expect(syllables[at]!.tone, `${lesson.id}: ${char}`).toBe(0);
          expect([...lexicalNeutral].some((entry) => entry.includes(char) && word.includes(entry)), `${lesson.id}: ${word}`).toBe(true);
        }
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(100);
  });
  it('uses a browser voice for listening questions without showing the spoken text', () => {
    const listening = pack.lessons.flatMap(({ questions }) => questions).filter((question) => question.extensions?.['zh:listening'] !== undefined);
    expect(listening.length).toBeGreaterThanOrEqual(4);
    for (const question of listening) {
      expect(question.kind).toBe('choice');
      if (question.kind !== 'choice') continue;
      const { speak, voice } = extensionSchemas['zh:listening'].parse(question.extensions!['zh:listening']);
      expect(voice).toBe('browser-tts');
      expect([...speak]).toHaveLength(1);
      expect(promptOf(question)).not.toContain(speak);
      const reading = READINGS[speak]!;
      const key = question.options[question.correctIndex]!;
      if (typeof key === 'string') expect(pinyinKey(key)).toBe(pinyinKey(reading));
      else expect(key['vi']).toBe(`Thanh ${reading.at(-1)}`);
    }
  });
  it('finds manifest vocabulary in option text by longest match and ignores pinyin and Vietnamese', () => {
    expect(vocabIdsInText('你好')).toEqual(['zh:vocab:ni-hao']);
    expect(vocabIdsInText('不客气')).toEqual(['zh:vocab:bu-ke-qi']);
    expect(vocabIdsInText('我')).toEqual(['zh:vocab:wo']);
    expect(vocabIdsInText('shì sì nǐ hǎo')).toEqual([]);
    expect(vocabIdsInText('xiān')).toEqual([]);
  });
});

const laterHskStages = pack.stages.filter(({ id, courseCode }) => courseCode === 'hsk' && id !== 'zh:stage:foundation').map(({ id }) => id);

/** Move N1's linked lessons, unit, quests and days into another stage without changing the source pack. */
function inStage(stageId: string): ContentPack {
  const copy = clone();
  const move = <T extends { readonly stageId?: string }>(record: T): T =>
    record.stageId === 'zh:stage:foundation' ? { ...record, stageId } : record;
  return { ...copy, lessons: copy.lessons.map(move), units: copy.units!.map(move), quests: copy.quests.map(move), days: copy.days!.map(move) };
}

describe.each(laterHskStages)('hsk scope includes non-foundation stage %s', (stageId) => {
  it('accepts the clean relocated pack and retains schedule truncation', () => {
    const copy = inStage(stageId);
    const config = zhCurriculumOptions(copy);
    expect(config.scopeStageIds).toContain(stageId);
    expect(config.truncateAtScheduleEnd).toBe(true);
    expect(checkCurriculum(copy, config)).toEqual([]);
  });
  it.each(['copied practice', 'untaught distractor', 'meta phrase', 'option parity'])('reports %s in the later stage', (fault) => {
    const copy = inStage(stageId);
    const lesson = copy.lessons[0]!;
    const question = lesson.questions[0]!;
    if (question.kind !== 'choice') throw new Error('Fixture needs a choice');
    const test = copy.tests![0]!;
    const replacement = fault === 'untaught distractor'
      ? { ...question, options: question.options.map((value, index) => index === (question.correctIndex + 1) % question.options.length ? '我' : value) }
      : fault === 'option parity'
        ? { ...question, options: question.options.map((value, index) => index === question.correctIndex ? `${value} (gợi ý)` : value) } : question;
    const changed = { ...copy,
      lessons: [{ ...lesson, questions: [replacement, ...lesson.questions.slice(1)],
        blocks: fault === 'meta phrase'
          ? [...lesson.blocks, { kind: 'tip' as const, text: { vi: 'Cần giáo viên nghe và chỉnh trực tiếp.' } }] : lesson.blocks }, ...copy.lessons.slice(1)],
      assessments: fault === 'copied practice'
        ? copy.assessments.map((assessment) => assessment.id === test.questionIds[0] ? { ...question, id: assessment.id } : assessment) : copy.assessments,
    };
    const issues = checkCurriculum(changed, zhCurriculumOptions(changed));
    const marker = { 'copied practice': 'Test novelty:', 'untaught distractor': 'zh:vocab:wo',
      'meta phrase': 'forbidden phrase', 'option parity': 'Option parity:' }[fault]!;
    expect(issues.some(({ path, message }) => message.includes(marker)
      && (fault === 'copied practice' ? path[0] === 'tests' : path[0] === 'lessons')
      && (fault !== 'untaught distractor' || path.includes('options')))).toBe(true);
  });
});

describe('answer-mode-aware test novelty', () => {
  const typedFixture = (answer: string, mode: AnswerMode, id: string, text: string) => ({
    id, provenance: pack.lessons[0]!.provenance, explanations: { vi: 'Đáp án mẫu.' }, kind: 'typed' as const,
    prompt: { vi: text }, acceptedAnswers: [answer], extensions: { 'zh:answer-mode': mode },
  });
  it.each([
    ['pinyin', 'ni3 hao3', 'nǐhǎo'], ['pinyin', 'lǜ', 'lv4'], ['pinyin', 'xue2 xi2', 'xuéxí'],
    ['pinyin-toneless', 'jü', 'jv'],
  ] as const)('reports a %s practice answer %s copied as %s', (mode, practiceAnswer, testAnswer) => {
    const copy = clone();
    const lesson = copy.lessons[0]!;
    const practice = typedFixture(practiceAnswer, mode, lesson.questions[0]!.id, 'Câu luyện mới.');
    const first = copy.assessments[0]!;
    const assessment = typedFixture(testAnswer, mode, first.id, 'Câu kiểm tra khác.');
    const changed = { ...copy, lessons: [{ ...lesson, questions: [practice, ...lesson.questions.slice(1)] }, ...copy.lessons.slice(1)],
      assessments: [assessment, ...copy.assessments.slice(1)] };
    const config = zhCurriculumOptions(changed);
    const atCopiedAnswer = ({ path, message }: ReturnType<typeof checkCurriculum>[number]) =>
      path[0] === 'tests' && path[1] === 0 && path[2] === 'questionIds' && path[3] === 0 && message.startsWith('Test novelty:');
    const { answerKey: _answerKey, ...defaultConfig } = config;
    expect(checkCurriculum(changed, defaultConfig).some(atCopiedAnswer)).toBe(false);
    expect(checkCurriculum(changed, config).some(atCopiedAnswer)).toBe(true);
  });
  it('does not report a genuinely new pinyin answer', () => {
    const copy = clone();
    const lesson = copy.lessons[0]!;
    const practice = typedFixture('nǐ hǎo', 'pinyin', lesson.questions[0]!.id, 'Câu luyện mới.');
    const first = copy.assessments[0]!;
    const assessment = typedFixture('nǐ men', 'pinyin', first.id, 'Câu kiểm tra khác.');
    const changed = { ...copy, lessons: [{ ...lesson, questions: [practice, ...lesson.questions.slice(1)] }, ...copy.lessons.slice(1)],
      assessments: [assessment, ...copy.assessments.slice(1)] };
    expect(checkCurriculum(changed, zhCurriculumOptions(changed)).some(({ path, message }) =>
      path[0] === 'tests' && path[1] === 0 && path[3] === 0 && message.startsWith('Test novelty:'))).toBe(false);
  });
});

describe('hsk course authoring gate (all current and future units)', () => {
  it('detects a choice answer copied from practice in another surface (marks vs numbers)', () => {
    const mutated = clone();
    const practice = mutated.lessons.flatMap(({ questions }) => questions).find(({ id }) => id.endsWith('-third-mark'))!;
    if (practice.kind !== 'choice') throw new Error('Fixture needs a choice');
    const first = mutated.assessments[0]!;
    const copy = { id: first.id, provenance: first.provenance, kind: 'typed' as const, prompt: first.prompt,
      acceptedAnswers: ['ma3'], extensions: { 'zh:answer-mode': 'pinyin' } };
    expect(checkCurriculum({ ...mutated, assessments: [copy, ...mutated.assessments.slice(1)] }, options)
      .some(({ message }) => message.startsWith('Test novelty:'))).toBe(true);
  });
  it.each([0, 1, 2])('checks untaught vocabulary in EVERY option, including the key (option %i)', (index) => {
    const mutated = clone();
    const lesson = mutated.lessons[0]!;
    const first = lesson.questions[0]!;
    if (first.kind !== 'choice') throw new Error('Fixture needs a choice');
    const replacement = { ...first, options: first.options.map((value, at) => at === index ? '你' : value) };
    const changed = { ...mutated, lessons: [{ ...lesson, questions: [replacement, ...lesson.questions.slice(1)] }, ...mutated.lessons.slice(1)] };
    expect(checkCurriculum(changed, options).some(({ path, message }) => path.includes('options') && message.includes('zh:vocab:ni'))).toBe(true);
  });
  it('detects an untaught id on a question before the vocabulary lesson day', () => {
    const mutated = clone();
    const lesson = mutated.lessons[0]!;
    const first = lesson.questions[0]!;
    const changed = { ...mutated, lessons: [{ ...lesson, questions: [{ ...first, vocabIds: ['zh:vocab:ni-hao'] }, ...lesson.questions.slice(1)] }, ...mutated.lessons.slice(1)] };
    expect(checkCurriculum(changed, options).some(({ message }) => message.includes('zh:vocab:ni-hao') && message.includes('not introduced'))).toBe(true);
  });
  it('detects Vietnamese review markers in a learner tip and in an extension', () => {
    const mutated = clone();
    const lesson = mutated.lessons[0]!;
    const changed = { ...mutated, lessons: [{ ...lesson,
      blocks: [...lesson.blocks, { kind: 'tip' as const, text: { vi: 'Cần giáo viên nghe và chỉnh trực tiếp.' } }] }, ...mutated.lessons.slice(1)] };
    expect(checkCurriculum(changed, options).some(({ message }) => message.includes('forbidden phrase'))).toBe(true);
    const quest = { ...mutated.quests[0]!, extensions: { ...mutated.quests[0]!.extensions, 'zh:reason': { vi: 'Nội dung sẽ được bổ sung.' } } };
    expect(checkCurriculum({ ...mutated, quests: [quest, ...mutated.quests.slice(1)] }, options)
      .some(({ message }) => message.includes('forbidden phrase'))).toBe(true);
  });
  it('detects an answer given away by a unique parenthetical hint and a much longer key', () => {
    const mutated = clone();
    const lesson = mutated.lessons[0]!;
    const first = lesson.questions[0]!;
    if (first.kind !== 'choice') throw new Error('Fixture needs a choice');
    const changed = { ...mutated, lessons: [{ ...lesson, questions: [{ ...first,
      options: first.options.map((value, index) => index === first.correctIndex ? `${value} (hai chấm)` : value),
    }, ...lesson.questions.slice(1)] }, ...mutated.lessons.slice(1)] };
    expect(checkCurriculum(changed, options).some(({ message }) => message.startsWith('Option parity:'))).toBe(true);
  });
  it('detects a lesson that loses its mistake block, a typed answer the grader would not accept, and a short test', () => {
    const mutated = clone();
    const lesson = mutated.lessons[1]!;
    const noMistake = { ...mutated, lessons: [mutated.lessons[0]!, { ...lesson, blocks: lesson.blocks.filter(({ kind }) => kind !== 'mistake') },
      ...mutated.lessons.slice(2)] };
    expect(checkCurriculum(noMistake, options).some(({ message }) => message.includes('at least one mistake block'))).toBe(true);
    const short = { ...mutated, tests: [{ ...mutated.tests![0]!, questionIds: mutated.tests![0]!.questionIds.slice(0, 5) }, ...mutated.tests!.slice(1)] };
    expect(checkCurriculum(short, options).some(({ message }) => message.includes('Daily test needs at least 10'))).toBe(true);
  });
});
