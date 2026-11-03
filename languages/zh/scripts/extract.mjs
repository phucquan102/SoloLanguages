// One-time, reproducible DATA extraction. Never evaluates or imports mockup code.
// Run from the repository root: node languages/zh/scripts/extract.mjs
// Writes only languages/zh/src/content/*.ts (the i18n messages are hand-written module UI strings).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(moduleRoot, '../..');
const retrievedAt = new Date().toISOString();
const sources = new Map();
function source(file) {
  if (!sources.has(file)) {
    const text = fs.readFileSync(path.join(repoRoot, 'mockup', file), 'utf8');
    sources.set(file, ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS));
  }
  return sources.get(file);
}
function find(node, predicate) {
  if (predicate(node)) return node;
  return ts.forEachChild(node, (child) => find(child, predicate));
}
function declaration(file, name) {
  const node = find(source(file), (n) => ts.isVariableDeclaration(n) && n.name.getText() === name);
  if (!node?.initializer) throw new Error(`Missing ${file}:${name}`);
  return node;
}
function literal(node) {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map((p) => {
    if (!ts.isPropertyAssignment(p)) throw new Error('Only literal properties may be extracted');
    return [p.name.text, literal(p.initializer)];
  }));
  throw new Error(`Non-data expression rejected: ${node.getText().slice(0, 60)}`);
}
function data(file, name) {
  let node = declaration(file, name).initializer;
  // Retain the literal bank and discard its browser-specific .map() enrichment.
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) node = node.expression.expression;
  return literal(node);
}
function provenance(file, name, item) {
  const ast = source(file);
  const node = find(ast, (n) => (ts.isVariableDeclaration(n) || ts.isFunctionDeclaration(n)) && n.name?.getText() === name);
  if (!node) throw new Error(`Missing source declaration ${file}:${name}`);
  return {
    source: { file: `mockup/${file}`, declaration: name, line: ast.getLineAndCharacterOfPosition(node.getStart()).line + 1, item },
    license: 'LicenseRef-SoloLanguages-Proprietary',
    attribution: '© SoloLanguages. All rights reserved.',
    version: 'bc95722', retrievedAt,
  };
}

// Stable ids: `zh:<kind>:<slug>` in lowercase ASCII, unique across the whole extraction.
// Slugs come from toneless pinyin (u-umlaut becomes "v", the standard ASCII spelling) or from fixed names.
const idPattern = /^zh:[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const claimed = new Set();
function claim(id) {
  if (!idPattern.test(id)) throw new Error(`Id is not zh:<kind>:<slug> ASCII: ${id}`);
  if (claimed.has(id)) throw new Error(`Duplicate id: ${id}`);
  claimed.add(id);
  return id;
}
const slug = (text) => text.normalize('NFD').replace(/ü/giu, 'v').replace(/\p{M}/gu, '')
  .toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-+|-+$/gu, '');
const vi = (text) => ({ vi: text });
const record = (id, file, name, item, fields) => ({ id: claim(id), ...fields, provenance: provenance(file, name, item) });
function emit(name, value, type) {
  const filename = path.join(moduleRoot, 'src', name);
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  const imported = type ? `import type { ${type.replace(/\[\]$/u, '')} } from '@solo/content-schema';\n\n` : '';
  const satisfies = type ? ` satisfies ${type}` : '';
  fs.writeFileSync(filename, `${imported}// Extracted data; see content/SOURCE.md.\nconst data = ${JSON.stringify(value, null, 2)}${satisfies};\n\nexport default data;\n`, 'utf8');
}
// Choice options: target-language text (Han, pinyin, digits) stays a plain string; Vietnamese is localized.
const targetOptions = new Set(['u', 'ü', 'i', 'nín hāo', 'ní hào', 'nǐ hǎo']);
const options = (list) => list.map((option) => targetOptions.has(option) || /^[\p{Script=Han}\d]+$/u.test(option) ? option : vi(option));
const choice = (question) => ({ kind: 'choice', prompt: vi(question.q), options: options(question.opts ?? question.options), correctIndex: question.ans ?? question.correct ?? question.answer });

// Course stages: the first hskNames entry is the foundation stage (no HSK level); the rest are HSK levels.
const names = data('language.js', 'hskNames');
const roadmapBands = data('hsk-roadmap.js', 'bands');
const roadmapGroups = data('hsk-roadmap.js', 'stages');
const onboardingBands = data('onboarding-course.js', 'bands');
const groupSlugs = ['foundation', 'elementary', 'intermediate', 'advanced'];
if (names.length !== roadmapBands.length || names.length !== onboardingBands.length || roadmapGroups.length !== groupSlugs.length) {
  throw new Error('Stage datasets no longer line up; review the mockup before extracting');
}
const levelCodes = names.map((name, i) => (i === 0 ? null : name.replace(/\s+/gu, '').replace(/–/gu, '-')));
const stageSlugs = levelCodes.map((code) => (code === null ? 'foundation' : code.toLowerCase()));
const stageIds = stageSlugs.map((id) => `zh:stage:${id}`);
names.forEach((name, i) => {
  // Band and onboarding names are the stage label; they are not repeated in the extensions.
  if (roadmapBands[i].name !== name || onboardingBands[i][0] !== name) throw new Error(`Stage name differs between datasets at ${i}`);
});
const groupIds = groupSlugs.map((id) => `zh:roadmap-group:${id}`);
const stages = names.map((name, i) => {
  const b = roadmapBands[i];
  const [, category, description] = onboardingBands[i];
  return record(stageIds[i], 'language.js', 'hskNames', i, {
    courseCode: 'hsk', order: i, frameworkCode: 'hsk-3.0', levelCode: levelCodes[i], labels: vi(name),
    extensions: {
      'zh:roadmap-band': record(`zh:roadmap-band:${stageSlugs[i]}`, 'hsk-roadmap.js', 'bands', i, {
        short: b.short, groupId: groupIds[b.stage], hours: b.hours,
        ...(b.c ? { counts: { syllables: b.c[0], characters: b.c[1], words: b.c[2], grammarPoints: b.c[3], handwrittenCharacters: b.c[4], verified: false } } : {}),
        goals: vi(b.goal), can: b.can.map(vi), units: b.units.map(vi), methods: b.methods.map(vi), skills: b.skills.map(vi),
      }),
      'zh:onboarding-band': record(`zh:onboarding-band:${stageSlugs[i]}`, 'onboarding-course.js', 'bands', i, {
        categories: vi(category), descriptions: vi(description),
      }),
    },
  });
});
emit('content/stages.ts', stages, 'Stage[]');

// Vocabulary: the eight zhBank entries; the greetings in zl.vocab.learn are retained as source variants.
const bank = data('course-workspace.js', 'zhBank');
const vocabIds = bank.map((w) => claim(`zh:vocab:${slug(w.pinyin)}`));
const lessonVocab = literal(find(declaration('language.js', 'zl').initializer, (n) =>
  ts.isArrayLiteralExpression(n) && ts.isArrayLiteralExpression(n.elements[0]) && n.elements[0].elements[0]?.text === '你好'));
const vocab = bank.map((w, i) => {
  const [collocation, collocationGloss, ...extra] = w.collocation.split(' · ');
  if (!collocationGloss || extra.length) throw new Error(`Unexpected collocation format for ${w.word}`);
  const variants = lessonVocab.flatMap(([word, pinyin, meaning], n) => word !== w.word ? [] : [
    record(`zh:vocab-variant:${slug(pinyin)}-lesson`, 'language.js', 'zl', `vocab.learn[${n}]`, { headword: word, pinyin, glosses: vi(meaning) }),
  ]);
  return {
    id: vocabIds[i], headword: w.word, glosses: vi(w.meaning),
    examples: [{ text: w.example, translations: vi(w.translation) }],
    fields: { pinyin: w.pinyin, examplePinyin: w.examplePinyin },
    collocations: [collocation], mistakes: [vi(w.mistake)], stageId: stageIds[0],
    extensions: {
      'zh:topic': vi(w.topic),
      'zh:collocation-translations': [vi(collocationGloss)],
      ...(variants.length ? { 'zh:variants': variants } : {}),
    },
    provenance: provenance('course-workspace.js', 'zhBank', i),
  };
});
emit('content/vocab.ts', vocab, 'Vocab[]');

// Tones: the detailed foundation dataset, with the older language.js entries retained as variants.
const languageTones = data('language.js', 'tones');
const foundationTones = data('chinese-foundation.js', 'tones');
const tones = foundationTones.map((t, i) => record(`zh:tone:${t.n}`, 'chinese-foundation.js', 'tones', i, {
  number: t.n, pinyin: t.py, vowel: t.vowel, mark: t.mark,
  names: vi(t.name), direction: vi(t.direction), hints: vi(t.hint),
  curve: t.points, character: t.hanzi, glosses: vi(t.meaning),
  variants: languageTones.filter((v) => v[2] === t.n).map(([pinyin, word, number, description, curve]) =>
    record(`zh:tone-variant:language-${number}`, 'language.js', 'tones', i, {
      pinyin, character: word.split(' ')[0], glosses: vi(word.slice(word.indexOf(' ') + 1)),
      number, descriptions: vi(description), curve,
    })),
}));
emit('content/tones.ts', tones);
const chars = data('language.js', 'chars').map((c, i) => record(`zh:character:${slug(c.py)}`, 'language.js', 'chars', i, {
  character: c.c, pinyin: c.py, glosses: vi(c.vi),
  strokeNames: c.names.map(vi), strokes: c.s, gridSize: [100, 100],
  simplifiedMockData: true, verified: false,
  vocabIds: bank.flatMap((w, n) => w.word === c.c ? [vocabIds[n]] : []),
}));
emit('content/characters.ts', chars);

// Lessons: plain instruction blocks and target-language examples instead of mockup HTML.
const lessonSource = source('language.js').text;
const teaching = (text) => {
  if (!lessonSource.includes(text)) throw new Error(`Not present in lesson source: ${text}`);
  return { kind: 'text', text: vi(text) };
};
// The mockup sentence points at a control "below" the text; keep the teaching content and drop the layout reference.
const neutral = (original, replacement) => {
  if (!lessonSource.includes(original)) throw new Error(`Not present in lesson source: ${original}`);
  return { kind: 'text', text: vi(replacement) };
};
const example = (text, translation) => ({ kind: 'example', text, ...(translation ? { translations: vi(translation) } : {}) });
const blocks = {
  pinyin: [
    teaching('Pinyin dùng các chữ Latin để ghi âm tiếng Trung.'),
    teaching('Bài đầu chỉ làm quen 6 nguyên âm. Chưa cần nhận diện chữ Hán hay nhớ nghĩa từ.'),
    ...['a', 'o', 'e', 'i', 'u', 'ü'].map((v) => example(v)),
    teaching('Có hai chấm · khác u'), teaching('Quan sát hình chữ'),
    neutral(
      'Nhìn kỹ cặp u và ü: hai chấm là một phần của chữ ü, không phải dấu thanh. Bài sau mình mới thêm dấu thanh lên nguyên âm. Bạn có thể viết thử hai chữ ngay bên dưới.',
      'Nhìn kỹ cặp u và ü: hai chấm là một phần của chữ ü, không phải dấu thanh. Bài sau mình mới thêm dấu thanh lên nguyên âm. Bạn có thể viết thử hai chữ u và ü.',
    ),
  ],
  tone: [teaching('Mỗi âm tiết có một thanh. Đổi thanh là đổi nghĩa.'),
    ...languageTones.flatMap(([py, word, , desc]) => [example(`${word.split(' ')[0]} · ${py}`, word.slice(word.indexOf(' ') + 1)), { kind: 'text', text: vi(desc) }])],
  vocab: [...lessonVocab.map(([text, py, meaning]) => example(`${text} · ${py}`, meaning)),
    teaching('你好 đọc thành ní hǎo: hai thanh 3 đi liền nhau thì thanh đầu đổi thành thanh 2.')],
  radical: [teaching('Nhiều chữ Hán ghép từ các thành phần quen thuộc.'),
    ...[['木', 'mù', 'cây'], ['林', 'lín', 'rừng'], ['森', 'sēn', 'rừng rậm'], ['口', 'kǒu', 'miệng'], ['吃', 'chī', 'ăn'], ['喝', 'hē', 'uống']].map(([text, py, meaning]) => {
      if (!lessonSource.includes(`${py} · ${meaning}`)) throw new Error('Missing radical example');
      return example(`${text} · ${py}`, meaning);
    })],
};
const skillByQuest = { pinyin: 'zh:pinyin', tone: 'zh:tones', vocab: 'vocabulary', write: 'writing', radical: 'zh:radicals' };
const samples = data('language.js', 'samples');
const lessonProperties = declaration('language.js', 'zl').initializer.properties;
const lessonKeys = lessonProperties.map((p) => p.name.text);
for (const key of Object.keys(samples)) if (!lessonKeys.includes(key)) throw new Error(`Writing samples for unknown lesson ${key}`);
const lessons = lessonProperties.map((p) => {
  const id = p.name.text;
  const q = Object.fromEntries(p.initializer.properties.filter((prop) => prop.name.text !== 'learn').map((prop) => [prop.name.text, literal(prop.initializer)]));
  const writing = (samples[id] ?? []).map(([text, reading, kind], i) =>
    record(`zh:writing:${id}-${slug(reading)}`, 'language.js', 'samples', `${id}[${i}]`, {
      text, reading, kind,
      vocabIds: bank.flatMap((w, n) => w.word === text ? [vocabIds[n]] : []),
      characterIds: chars.flatMap((c) => c.character === text ? [c.id] : []),
    }));
  return record(`zh:lesson:${id}`, 'language.js', 'zl', id, {
    stageId: stageIds[0], skill: skillByQuest[id], blocks: blocks[id],
    ...(id === 'vocab' ? { vocabIds: vocabIds.slice(0, 3) } : {}),
    questions: [record(`zh:lesson-question:${id}`, 'language.js', 'zl', `${id}.q`, { ...choice(q), explanations: vi(q.why) })],
    ...(writing.length ? { extensions: { 'zh:writing-samples': writing } } : {}),
  });
});
emit('content/lessons.ts', lessons, 'Lesson[]');

const sourceQuests = data('language.js', 'zq');
const quests = sourceQuests.map((q, i) => record(`zh:quest:${q.id}`, 'language.js', 'zq', i, {
  stageId: stageIds[0], titles: vi(q.title), skill: skillByQuest[q.id], minutes: q.min, xp: q.xp,
  lessonIds: q.id === 'write' ? [] : [`zh:lesson:${q.id}`], optional: q.side ?? false,
  extensions: {
    'zh:icon': q.icon,
    ...(q.why ? { 'zh:reason': vi(q.why) } : {}),
    // The writing quest names its characters in the title; the other quests do not reference any.
    ...(q.id === 'write' ? { 'zh:character-ids': chars.filter((c) => q.title.includes(c.character)).map((c) => c.id) } : {}),
  },
}));
emit('content/quests.ts', quests, 'Quest[]');

emit('content/tone-exercises.ts', ['guided', 'checks'].flatMap((name) => data('chinese-foundation.js', name).map((e, i) => {
  const mode = name === 'guided' ? 'guided' : 'check';
  return record(`zh:tone-exercise:${mode}-${slug(e.py)}-${e.tone}`, 'chinese-foundation.js', name, i, {
    mode, pinyin: e.py, toneId: `zh:tone:${e.tone}`, tone: e.tone,
    ...(e.choices ? { choices: e.choices } : {}),
  });
})));

// Placement quiz: `group` keeps the mockup tier, `category` the stable kind, and the label is a per-record extension.
const quiz = data('onboarding-course.js', 'quiz');
const kinds = ['tone-distinction', 'pinyin', 'vocabulary-hsk1', 'simple-sentence', 'comparison', 'conjunction', 'advanced-conjunction', 'vocabulary'];
if (quiz.length !== kinds.length) throw new Error('Placement quiz no longer matches the known kinds');
emit('content/placement.ts', quiz.map((q, i) => record(`zh:placement:${kinds[i]}`, 'onboarding-course.js', 'quiz', i, {
  ...choice(q), group: String(q.g), category: kinds[i],
  extensions: { 'zh:category-label': vi(q.kind) },
})), 'Question[]');

const pool = find(source('course-workspace.js'), (n) => ts.isFunctionDeclaration(n) && n.name?.text === 'pool');
const assessmentRows = literal(find(pool, ts.isArrayLiteralExpression));
const assessmentSlugs = ['umlaut-vowel', 'tone-of-ma3', 'meaning-of-xiexie'];
if (assessmentRows.length !== assessmentSlugs.length) throw new Error('Assessment pool no longer matches the known slugs');
emit('content/assessments.ts', assessmentRows.map((q, i) => record(`zh:assessment:${assessmentSlugs[i]}`, 'course-workspace.js', 'pool', i, {
  ...choice(q), explanations: vi(q.why),
})), 'Question[]');

// HSK roadmap metadata: bands and onboarding descriptions live on the stages; the standard and groups stay here.
emit('content/roadmap.ts', record('zh:roadmap:hsk', 'hsk-roadmap.js', 'bands', 'metadata', {
  standard: 'GF0025-2021', countsVerified: false, hoursAreEstimates: true,
  groups: roadmapGroups.map(([name, scope], i) => record(groupIds[i], 'hsk-roadmap.js', 'stages', i, { labels: vi(name), scope: vi(scope) })),
}));
const propose = find(source('onboarding-course.js'), (n) => ts.isFunctionDeclaration(n) && n.name?.text === 'propose');
const routeIndices = literal(find(propose, ts.isArrayLiteralExpression));
emit('content/placement-routing.ts', record('zh:placement-routing:hsk', 'onboarding-course.js', 'propose', 'orientation', {
  // Routing data only; no scoring/evaluator or claim of calibrated proficiency.
  orientationOnly: true, foundationStageId: stageIds[0], routeStageIds: routeIndices.map((i) => stageIds[i]),
}));
console.log(`Extracted Chinese data at ${retrievedAt}; mockup was read only.`);
