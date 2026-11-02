import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { describe, expect, it } from 'vitest';
import { run } from '../src/cli.mjs';
import { loadConfig } from '../src/config.mjs';
import { scanText } from '../src/scanner.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string) => readFileSync(join(here, 'fixtures', name), 'utf8');
const config = loadConfig();
const scan = (text: string, path = 'source.ts') => scanText(text, config, path);
const rules = (source: string) => scan(source).map((finding) => finding.rule);
const ruleMatches = (text: string, rule: string) => scan(text).filter((finding) => finding.rule === rule);

describe('encoding markers and editor columns', () => {
  it('strips a leading BOM before computing line-one columns', () => {
    expect(scan('\ufeffconst code = "en";')).toEqual(scan('const code = "en";'));
    expect(scan('\ufeff"en";')).toEqual([
      { line: 1, col: 1, rule: 'quoted-language-code', match: '"en"' },
    ]);
  });

  it('keeps BOM-prefixed comment directives and later line positions', () => {
    expect(scan('\ufeff// lang-literal-allow: example\n"en";\n"zh";')).toEqual([
      { line: 3, col: 1, rule: 'quoted-language-code', match: '"zh"' },
    ]);
  });
});

describe('rule selection by scope', () => {
  it('applies renamed rules by scope without depending on their IDs', () => {
    const renamed = { ...config, rules: config.rules.map((rule) => ({ ...rule, id: `custom-${rule.id}` })) };
    expect(scanText('messages.en; "zh";', renamed).map(({ rule }) => rule)).toEqual([
      'custom-quoted-language-code', 'custom-unquoted-language-code',
    ]);
  });

  it('treats the former special IDs as general rules when scope is absent', () => {
    expect(scanText('// en: and "zh"', {
      ...config,
      rules: [
        { id: 'unquoted-language-code', regex: /en:/g },
        { id: 'quoted-language-code', regex: /"zh"/g },
      ],
    }).map(({ rule, match }) => ({ rule, match }))).toEqual([
      { rule: 'unquoted-language-code', match: 'en:' },
      { rule: 'quoted-language-code', match: '"zh"' },
    ]);
  });

  it('honours changed scopes even with the former special IDs', () => {
    expect(scanText('messages.en; "zh";', {
      ...config,
      rules: [
        { id: 'quoted-language-code', scope: 'code', regex: /en:/g },
        { id: 'unquoted-language-code', scope: 'literal', regex: /"zh"/g },
      ],
    }).map(({ rule, match }) => ({ rule, match }))).toEqual([
      { rule: 'quoted-language-code', match: '.en' },
      { rule: 'unquoted-language-code', match: '"zh"' },
    ]);
  });
});

describe('large literal performance', () => {
  it.each(['newline escapes', 'CJK characters'] as const)(
    'checks 1 MiB of %s in under 3 seconds', (kind) => {
      const dir = mkdtempSync(join(tmpdir(), 'lang-literals-perf-'));
      try {
        const payload = kind === 'newline escapes' ? String.raw`\n`.repeat(1024 * 512) : '中'.repeat(Math.floor(1024 * 1024 / 3)) + 'a';
        expect(Buffer.byteLength(payload)).toBe(1024 * 1024);
        const source = `const text = '${payload}'; const k = 'vi';`;
        writeFileSync(join(dir, 'large.ts'), source);
        const start = performance.now();
        const result = run({ roots: ['.'], cwd: dir, config, log: () => {} });
        const elapsed = performance.now() - start;
        expect(result.errors).toBeUndefined();
        expect(result.scanned).toBe(1);
        expect(result.findings.filter(({ rule }) => rule === 'cjk-or-hangul-char')).toHaveLength(
          kind === 'CJK characters' ? Math.floor(1024 * 1024 / 3) : 0,
        );
        expect(result.findings.find(({ rule }) => rule === 'quoted-language-code')).toEqual({
          file: 'large.ts', line: 1, col: source.indexOf("'vi'") + 1, rule: 'quoted-language-code', match: "'vi'",
        });
        console.log(`Performance: 1 MiB ${kind}: ${elapsed.toFixed(1)} ms`);
        expect(elapsed).toBeLessThan(3000);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
  );
});

describe('scanText', () => {
  it('reports nothing for clean source and honours allow directives with a reason', () => {
    expect(scanText(fixture('clean.ts.txt'), config)).toEqual([]);
  });

  it('flags terms, quoted codes and CJK/Hangul characters with line:col', () => {
    const found = scanText(fixture('dirty.ts.txt'), config).map((f) => `${f.line}:${f.col} ${f.rule} ${f.match}`);
    expect(found).toEqual([
      '1:22 framework-or-script-term IELTS',
      '2:29 framework-or-script-term hsk',
      "3:16 quoted-language-code 'vi'",
      '4:13 quoted-language-code `zh-Hans`',
      '5:15 cjk-or-hangul-char 中',
      '5:16 cjk-or-hangul-char 文',
      '6:19 cjk-or-hangul-char 안',
      '6:20 cjk-or-hangul-char 녕',
      "8:18 quoted-language-code 'en'",
      '9:7 framework-or-script-term kana',
    ]);
  });

  it('handles CRLF line endings', () => {
    expect(scanText("const a = 1;\r\nconst b = 'ja';\r\n", config)).toEqual([{ line: 2, col: 11, rule: 'quoted-language-code', match: "'ja'" }]);
  });
});


describe('terms and identifier boundaries', () => {
  it.each(['hskLevel', 'HSK_LEVELS', 'isKana', '"HSK1"', 'getIELTSScore', 'JlPt', 'topik2', 'pinyin_value'])(
    'catches term in %s', (source) => {
      expect(rules(source)).toContain('framework-or-script-term');
    },
  );
  it.each(['hsklevel', 'whsk', 'kanban', 'romajiology', 'ceframing', 'english', 'mykana', 'toefling'])(
    'does not flag embedded letters in %s', (source) => expect(scan(source)).toEqual([]),
  );
  it('keeps source columns after splitting camelCase', () => {
    expect(scan('const isKana = hskLevel;')).toEqual([
      { line: 1, col: 9, rule: 'framework-or-script-term', match: 'Kana' },
      { line: 1, col: 16, rule: 'framework-or-script-term', match: 'hsk' },
    ]);
  });
});


describe('codes, locale tags and keys', () => {
  it.each(["'EN'", '"Zh-Hans-CN"', "'en-US-u-ca-gregory'", "'zh_CN'", "'de_DE'", '`JA-jp`', '`zh-${r}`', '`en-US-${region}`'])(
    'catches literal %s', (source) => expect(rules(source)).toContain('quoted-language-code'),
  );
  it.each(['({ zh: 1 })', '({ EN: 1, vi: 2 })', '({\n  Zh: 1\n})', '({ /* key */ ja: 1 })'])(
    'catches unquoted key in %s', (source) => expect(rules(source)).toContain('unquoted-language-code'),
  );
  it.each(["'eng'", "'enough'", "'zh_Hans_CN_extra_text_longerthan8'", "'x-en-US'", "'en-'", "'en--US'", "'en US'", '`engine-${r}`', 'const viCount = 1;', "'vi: value'", '// vi: example', '/* zh: example */', "\"say 'en'\"", String.raw`'en\'tail'`, '/vi:/', 'ready ? vi : fallback', 'const vi: number = 1;'])(
    'does not flag non-locale or non-key %s', (source) => expect(scan(source)).toEqual([]),
  );
});


describe('Unicode scripts', () => {
  it.each<[string, string]>([
    ['Han Extension B', '\u{20000}'], ['compatibility ideograph', '\uf900'],
    ['Hiragana', 'あ'], ['Katakana', 'カ'], ['half-width Katakana', 'ｶ'],
    ['Hangul syllable', '한'], ['Hangul Jamo', 'ᄀ'], ['compatibility Jamo', 'ㄱ'],
    ['Bopomofo', 'ㄅ'], ['Bopomofo extended', 'ㆠ'],
  ])('catches %s', (_name, char) => {
    expect(scan(`'${char}'`)).toEqual([{ line: 1, col: 2, rule: 'cjk-or-hangul-char', match: char }]);
  });
  it.each(['café', 'Ελληνικά', 'Привет', '🙂', '。', '！', '123', 'العربية'])(
    'does not flag other scripts or common punctuation: %s', (value) => expect(scan(`'${value}'`)).toEqual([]),
  );
  it('uses UTF-16 source columns after astral characters', () => {
    expect(scan("'𠀀中'").map(({ col }) => col)).toEqual([2, 4]);
  });
});


describe('real line-comment allow directives', () => {
  it.each(['\r', '\u2028', '\u2029'])('handles JavaScript line terminator %j', (newline) => {
    expect(scan(`// lang-literal-allow: sample${newline}'en';`)).toEqual([]);
    expect(scan(`// ordinary comment${newline}'en';`)).toEqual([
      { line: 2, col: 1, rule: 'quoted-language-code', match: "'en'" },
    ]);
  });
  it.each([
    "const code = 'en'; // lang-literal-allow: sample",
    "// lang-literal-allow: sample\nconst code = 'en';",
    "  //  lang-literal-allow: sample\r\nconst code = 'en';",
    "const x = 'en'; /* block */ // lang-literal-allow: sample",
    "`outer ${'en' // lang-literal-allow: sample\n}`",
  ])('honours a reason in a real line comment: %s', (source) => expect(scan(source)).toEqual([]));
  it.each([
    "const code = 'en'; // lang-literal-allow:",
    "// lang-literal-allow: \t\nconst code = 'en';",
    "const text = '// lang-literal-allow: fake'; const code = 'en';",
    'const text = "// lang-literal-allow: fake"; const code = "en";',
    "const text = `// lang-literal-allow: fake`; const code = 'en';",
    "const text = `line\n// lang-literal-allow: fake\n`; const code = 'en';",
    "/* // lang-literal-allow: fake */ const code = 'en';",
    "/*\n// lang-literal-allow: fake\n*/ const code = 'en';",
    "// lang-literal-allow: sample\n\nconst code = 'en';",
    "const x = 1; // lang-literal-allow: sample\nconst code = 'en';",
    "const url = 'https://example.test'; const code = 'en';",
    String.raw`const re = /[//] lang-literal-allow: fake/; const code = 'en';`,
    String.raw`const re = /\/\/ lang-literal-allow: fake/; const code = 'en';`,
    String.raw`if (ok) /[//] lang-literal-allow: fake/.test(value); const code = 'en';`,
    String.raw`while (ok) /[//] lang-literal-allow: fake/.test(value); const code = 'en';`,
    String.raw`if (ok) {} /[//] lang-literal-allow: fake/.test(value); const code = 'en';`,
    "const ratio = {} / 2; const code = 'en';",
    "const n = i++ / 2; const code = 'en';",
    "const n = 8 / 2; const code = 'en';",
    "const text = `outer ${`// lang-literal-allow: fake`}`; const code = 'en';",
  ])('keeps findings when a directive is invalid or out of scope: %s', (source) => {
    expect(rules(source)).toContain('quoted-language-code');
  });
  it('recognizes a real directive after division and regex literals', () => {
    expect(scan("const n = 8 / 2; const code = 'en'; // lang-literal-allow: sample")).toEqual([]);
    expect(scan("const re = /[//]/; const code = 'en'; // lang-literal-allow: sample")).toEqual([]);
  });
  it('matches a custom directive literally', () => {
    expect(scanText("'en'; // allow[locale]: sample", { ...config, allowDirective: 'allow[locale]:' })).toEqual([]);
    expect(scanText("'en'; // allowl: sample", { ...config, allowDirective: 'allow[locale]:' })).toHaveLength(1);
  });
});

describe('practical quoted language tags', () => {
  it.each([
    "'zh-CN'", "'zh_CN'", "'zh-Hans-CN'", "'en-US-u-ca-gregory'", "'EN'",
    "'de-DE'", '`zh-${r}`', "'sr-Latn'", "'es-419'",
    "'zh_Hant_TW'", "'en_US_u_ca_gregory'", "'en-x-custom'", "'en-Latn-US-x-custom'",
    '`zh-Hans-${r}`', "'sr-latn'", "'sr-LATN'", "'sr-Cyrl-RS'",
  ])('catches complete locale literal %s', (source) => {
    expect(scan(source)).toEqual([
      { line: 1, col: 1, rule: 'quoted-language-code', match: source.split('${')[0] },
    ]);
  });

  it.each([
    "'es-module-lexer'", "'de-dupe'", "'de-indent'", "'en-route'", "'es-toolkit'",
    "'es2023'", "'en.json'", "'zh-Hans-CN-extra'", "'en-US-u-a'", "'en-x-a'",
    "'en-US-u-ca-gregory-tailtoolong'", '`es-module-${name}`', "'en-US-tail'",
  ])('does not flag non-locale literal %s', (source) => {
    expect(scan(source)).toEqual([]);
  });

  it('accepts the documented ko-fi region-shape ambiguity', () => {
    // 'fi' has a valid two-letter region shape, so 'ko-fi' may be flagged.
    expect(scan("'ko-fi'")).toEqual([
      { line: 1, col: 1, rule: 'quoted-language-code', match: "'ko-fi'" },
    ]);
  });
});


describe('unquoted keys versus parameters and ternaries', () => {
  it.each([
    'function f(a, en: string) {}', 'function f(en: string) {}',
    'function f(\n  en: string\n) {}', 'function f(a,\n  en: string\n) {}',
    'function f(a, /* parameter */ en: string) {}',
    'const f = (a: number, en: string) => en;',
    'type Callback = (a: number, en: string) => void;',
    'const f = ({ value }: Input, en: string) => value;',
    'function f(a = `${x}`, en: string) {}',
    'const f = `outer ${function f(a, en: string) {}}`;',
    'cond ?\n  en : b', 'cond ?\n  /* operand */ en : b',
    'cond ? a : other ?\n  en : b', 'cond ?\n  (other ? en : b) : c',
  ])('does not flag typed parameter or ternary in %s', (source) => {
    expect(scan(source)).toEqual([]);
  });

  it.each([
    'const { de: alias } = x;', 'const { x, de: alias } = source;',
    'function f({ de: alias }: Input) {}',
    'function f({ x, de: alias }: Input) {}',
    'f(a, { x: 1, de: alias });', 'const obj = {\n  de: alias\n};',
    'f(a, { value: `${x}`, de: alias });',
  ])('still catches object or destructuring key in %s', (source) => {
    expect(scan(source)).toEqual([
      { line: source.includes('\n') ? 2 : 1, col: source.includes('\n') ? 3 : source.indexOf('de:') + 1,
        rule: 'unquoted-language-code', match: 'de:' },
    ]);
  });
});


describe('Serbian property keys', () => {
  it.each(['({ sr: 1 })', '({ SR })', 'const { sr: alias } = value;', 'type T = { sr?: string };', 'class A { sr: string }'])(
    'flags %s', (source) => expect(ruleMatches(source, 'unquoted-language-code')).toHaveLength(1),
  );
});


describe('single-line performance', () => {
  it('checks a 1 MiB single-line source file in under 3 seconds', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lang-literals-perf-'));
    try {
      const prefix = "const text = '";
      const suffix = "'; const k = 'vi';";
      const source = prefix + 'a'.repeat(1024 * 1024 - prefix.length - suffix.length) + suffix;
      expect(Buffer.byteLength(source)).toBe(1024 * 1024);
      expect(source).not.toContain('\n');
      writeFileSync(join(dir, 'large.ts'), source);
      const start = performance.now();
      const result = run({ roots: ['.'], cwd: dir, config, log: () => {} });
      const elapsed = performance.now() - start;
      expect(result.findings).toEqual([
        { file: 'large.ts', line: 1, col: source.indexOf("'vi'") + 1, rule: 'quoted-language-code', match: "'vi'" },
      ]);
      expect(result.scanned).toBe(1);
      expect(elapsed).toBeLessThan(3000);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
