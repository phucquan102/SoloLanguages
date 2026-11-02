import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { run } from '../src/cli.mjs';
import { loadConfig } from '../src/config.mjs';
import { scanText } from '../src/scanner.mjs';
import { analyzeSource } from '../src/ts-adapter.mjs';

const config = loadConfig();
const scan = (text: string, path = 'source.ts') => scanText(text, config, path);
const rules = (source: string) => scan(source).map((finding) => finding.rule);
const ruleMatches = (text: string, rule: string) => scan(text).filter((finding) => finding.rule === rule);

describe('import and export name semantics', () => {
  it.each(['import { x as es } from "module";', 'export { en as local };'])(
    'ignores the local name in %s', (source) => expect(scan(source)).toEqual([]),
  );

  it.each([
    ['import { es } from "module";', 'es'],
    ['import { es as x } from "module";', 'es'],
    ['export { x as es };', 'es'],
    ['import { vi } from "vitest";', 'vi'],
  ])('reports the public name in %s', (source, match) => {
    expect(ruleMatches(source, 'unquoted-language-code')).toEqual([
      { line: 1, col: source.indexOf(match) + 1, rule: 'unquoted-language-code', match },
    ]);
  });

  it('allows documented test-framework imports with an allow directive', () => {
    // Core source should not import vitest; use the allow directive if ever needed.
    expect(scan('import { vi } from "vitest"; // lang-literal-allow: test framework import')).toEqual([]);
  });
});

describe('static language names at definition and use sites', () => {
  it.each([
    ["const { en } = input;", "en:"],
    ["value.en;", ".en"],
    ["ready ? obj.zh : fallback", ".zh"],
    ["messages.en;", ".en"],
    ["messages.zh;", ".zh"],
    ["messages?.en;", ".en"],
    ["class A { en() {} }", "en"],
    ["const value = { en() {} };", "en"],
    ["interface A { en(): void }", "en"],
    ["type A = { en(): void };", "en"],
    ["class A { get en() { return 1; } }", "en"],
    ["class A { set en(value: number) {} }", "en"],
    ["const value = { get en() { return 1; } };", "en"],
    ["const value = { set en(value) {} };", "en"],
    ["enum L { en }", "en"],
    ["enum L { zh = 1 }", "zh"],
    ["import { en } from \"module\";", "en"],
    ["import { en as local } from \"module\";", "en"],
    ["import type { en } from \"module\";", "en"],
    ["export { x as en };", "en"],
    ["export { en };", "en"],
    ["export type { en } from \"module\";", "en"],
    ["const { en = 1 } = input;", "en:"],
    ["function f({ en }: Input) {}", "en:"],
    ["const { outer: { en } } = input;", "en:"],
    ["class A { [\"en\"]() {} }", "en"],
    ["interface A { \"en\"(): void }", "en"],
  ])('flags static language name in %s', (source, match) => {
    const found = ruleMatches(source, 'unquoted-language-code');
    expect(found).toHaveLength(1);
    const nameAt = source.lastIndexOf(source.includes('zh') ? 'zh' : 'en');
    expect(found[0]).toMatchObject({ line: 1, col: nameAt + (source[nameAt - 1] === '"' ? 0 : 1), match });
  });

  it.each([
    'const de = 1;', 'let a: number, en: string;', 'function f(a, en: string) {}',
    'cond ? en : b;', 'const [en] = input;', 'const { value: en } = input;',
    'class A { [en]() {} }', 'object[en];', 'const { ...en } = input;',
  ])('keeps plain bindings and dynamic expressions clear in %s', (source) => {
    expect(scan(source)).toEqual([]);
  });
});

describe('iterative AST traversal', () => {
  it('visits a 4000-term addition chain without recursive traversal', () => {
    const source = Array(4000).fill("'a'").join(' + ') + "; messages.en;";
    expect(analyzeSource('deep.ts', source).segments.filter(({ kind }) => kind === 'literal')).toHaveLength(4000);
    expect(ruleMatches(source, 'unquoted-language-code')).toEqual([
      { line: 1, col: source.lastIndexOf('en') + 1, rule: 'unquoted-language-code', match: '.en' },
    ]);
  });

  it('visits a 100,000-item comma list without recursive traversal', () => {
    const source = Array(100000).fill('a').join(',') + ', messages.zh;';
    expect(ruleMatches(source, 'unquoted-language-code')).toEqual([
      { line: 1, col: source.lastIndexOf('zh') + 1, rule: 'unquoted-language-code', match: '.zh' },
    ]);
  });
});

describe('escape decoding and source mapping', () => {
  it.each([
    [String.raw`'\u0065n'`, 'quoted-language-code'],
    [String.raw`'\u{65}\u{6e}'`, 'quoted-language-code'],
    [String.raw`'\x65\x6E-US'`, 'quoted-language-code'],
    [String.raw`'\u4e2d'`, 'cjk-or-hangul-char'],
    [String.raw`'\u{20000}'`, 'cjk-or-hangul-char'],
    [String.raw`'\ud840\udc00'`, 'cjk-or-hangul-char'],
    [String.raw`'\x48SK1'`, 'framework-or-script-term'],
  ])('decodes %s', (source, rule) => expect(rules(source)).toContain(rule));
  it('decodes template chunks and nested substitution literals', () => {
    expect(rules('`\\u007ah-${r}`')).toContain('quoted-language-code');
    expect(rules('`outer ${"\\x65n"} ${`\\u4e2d`}`')).toEqual(['quoted-language-code', 'cjk-or-hangul-char']);
  });
  it.each([
    String.raw`'\\u0065n'`, String.raw`'\\x65n'`, String.raw`'\\u{4e2d}'`,
    String.raw`'\u{110000}'`, String.raw`'\uZZZZ'`, String.raw`'\xZZ'`,
    String.raw`// '\u4e2d'`, String.raw`/* '\x65n' */`, String.raw`/\u4e2d/`,
    String.raw`const x = \u4e2d;`,
  ])('does not decode non-literals, invalid or escaped escapes: %s', (source) => expect(scan(source)).toEqual([]));
  it('reports original columns after decoded escapes', () => {
    expect(scan(String.raw`const x = '\u4e2d\u6587';`)).toEqual([
      { line: 1, col: 12, rule: 'cjk-or-hangul-char', match: '中' },
      { line: 1, col: 18, rule: 'cjk-or-hangul-char', match: '文' },
    ]);
  });
  it('preserves line numbers after escaped newlines', () => {
    expect(scan("'\\u000a'; const code = 'en';")[0]).toMatchObject({ line: 1, col: 24 });
  });
});


describe('JSX closing tags in .tsx sources', () => {
  let dir: string;
  beforeAll(() => { dir = mkdtempSync(join(tmpdir(), 'lang-literals-tsx-')); });
  afterAll(() => { rmSync(dir, { recursive: true, force: true }); });

  it.each([
    "<div>{x}</div>; const k = 'vi';",
    '<a href="/x">t</a>; const k = \'vi\';',
  ])('finds the literal following JSX in %s', (source) => {
    writeFileSync(join(dir, 'component.tsx'), source);
    expect(run({ roots: ['.'], cwd: dir, config, log: () => {} })).toEqual({
      scanned: 1,
      missing: [],
      findings: [
        { file: 'component.tsx', line: 1, col: source.indexOf("'vi'") + 1,
          rule: 'quoted-language-code', match: "'vi'" },
      ],
    });
  });
});

describe('compiler script kinds and file paths', () => {
  let dir: string;
  beforeAll(() => { dir = mkdtempSync(join(tmpdir(), 'lang-literals-compiler-')); });
  afterAll(() => { rmSync(dir, { recursive: true, force: true }); });

  it.each(['.ts', '.mts', '.cts', '.tsx', '.js', '.mjs', '.cjs', '.jsx'])(
    'parses and checks %s files through run()', (extension) => {
      const jsx = extension === '.tsx' || extension === '.jsx';
      const source = jsx ? "<p>Don't panic</p>;\nconst k = 'vi';" : "const k = '\\x76i';";
      writeFileSync(join(dir, `source${extension}`), source);
      const result = run({ roots: ['.'], cwd: dir, config, log: () => {} });
      expect(result.findings.filter((finding) => finding.file === `source${extension}`)).toEqual([
        { file: `source${extension}`, line: jsx ? 2 : 1, col: 11, rule: 'quoted-language-code', match: "'vi'" },
      ]);
    },
  );
});


describe('AST rule scopes', () => {
  it.each([
    'const value = { en: 1 };', 'const value = { en };',
    'const { en: alias } = input;', 'function f({ en: alias }: Input) {}',
    'interface A { en: string }', 'type T = { en?: string }',
    'class A { de: number }', 'class A { static en = 1 }',
    "const value = { 'zh': 1 };", 'const value = { ["zh"]: 1 };',
    'const value = { [`zh`]: 1 };', 'const { ["zh"]: alias } = input;',
  ])('flags static property names in %s', (source) => {
    expect(ruleMatches(source, 'unquoted-language-code')).toHaveLength(1);
  });

  it.each([
    'let a: number, en: string;', 'let en: string;', 'const en = 1;',
    'function f(en: string, de: number) {}', 'const f = (a: number, en: string) => en;',
    'en: while (ready) { break en; }', 'vi:', '{\n  Zh: 1\n}', '{ /* key */ ja: 1 }',
    'const [en] = input;', 'const value = { [en]: 1 };',
    'const value = { [getKey()]: 1 };', 'condition ? en : other;',
  ])('does not flag variables, parameters, labels or dynamic expressions in %s', (source) => {
    expect(scan(source)).toEqual([]);
  });

  it('checks decoded strings, complete templates and template head prefixes', () => {
    expect(scan("'\\x65n'; `ja`; `zh-${region}`;").map(({ rule, match }) => ({ rule, match }))).toEqual([
      { rule: 'quoted-language-code', match: "'en'" },
      { rule: 'quoted-language-code', match: '`ja`' },
      { rule: 'quoted-language-code', match: '`zh-' },
    ]);
  });

  it('checks quoted JSX attributes as literals', () => {
    expect(scan('<p lang="vi" />', 'source.tsx')).toEqual([
      { line: 1, col: 9, rule: 'quoted-language-code', match: '"vi"' },
    ]);
  });

  it('checks quoted and computed keys with both applicable rules', () => {
    expect(scan('({ "zh": 1, ["ja"]: 2 })').map(({ rule, match }) => ({ rule, match }))).toEqual([
      { rule: 'quoted-language-code', match: '"zh"' },
      { rule: 'quoted-language-code', match: '"ja"' },
      { rule: 'unquoted-language-code', match: 'zh:' },
      { rule: 'unquoted-language-code', match: 'ja:' },
    ]);
  });

  it.each([
    'const getHSKScore = 1;', 'const value = "HSK";', '`outer ${x} HSK ${y} HSK`;',
    '// HSK', '/* HSK */',
  ])('checks framework terms in identifiers, string/template text and comments: %s', (source) => {
    expect(ruleMatches(source, 'framework-or-script-term').length).toBeGreaterThan(0);
  });

  it.each(['const 中 = 1;', '"中";', '`outer ${x} 中 ${y} 中`;', '// 中', '/* 中 */'])(
    'checks CJK in identifiers, string/template text and comments: %s', (source) => {
      expect(ruleMatches(source, 'cjk-or-hangul-char').length).toBeGreaterThan(0);
    },
  );

  it('does not treat quoted codes or keys in comments as code', () => {
    expect(scan('// "vi", en:\n/* `zh`, de: */')).toEqual([]);
  });

  it('retains original UTF-16 columns through escapes and template newlines', () => {
    const source = '`a\r\n\\u4e2d${value}\\u6587`;';
    expect(scan(source)).toEqual([
      { line: 2, col: 1, rule: 'cjk-or-hangul-char', match: '中' },
      { line: 2, col: 15, rule: 'cjk-or-hangul-char', match: '文' },
    ]);
  });
});


describe('compiler comment trivia and allow directives', () => {
  it.each([
    "'vi'; // explanation; lang-literal-allow: documented example",
    "// explanation; lang-literal-allow: documented example\n'vi';",
    "function f() { /* HSK */ } // lang-literal-allow: example",
    "<p>Don't panic</p>; const k = 'vi'; // lang-literal-allow: example",
    "<p>{/* HSK */}</p>; // lang-literal-allow: example",
  ])('honours a reason anywhere in a real line comment: %s', (source) => {
    expect(scan(source, 'source.tsx')).toEqual([]);
  });

  it.each([
    "<p>// lang-literal-allow: fake</p>; const k = 'vi';",
    "<p title=\"// lang-literal-allow: fake\" />; const k = 'vi';",
    "<p>Don't // lang-literal-allow: fake</p>; const k = 'vi';",
    "`outer ${value} // lang-literal-allow: fake`; const k = 'vi';",
    "`outer ${value} middle ${other} // lang-literal-allow: fake`; const k = 'vi';",
    "/* lang-literal-allow: fake */ const k = 'vi';",
    "// lang-literal-allow:  \nconst k = 'vi';",
  ])('rejects fake or empty directives in %s', (source) => {
    expect(scan(source, 'source.tsx').map(({ rule }) => rule)).toContain('quoted-language-code');
  });

  it('scans comments inside empty blocks and JSX expressions', () => {
    expect(ruleMatches('function f() { /* HSK 中 */ }', 'framework-or-script-term')).toHaveLength(1);
    expect(scan('<p>{/* HSK 中 */}</p>', 'source.tsx').map(({ rule }) => rule)).toEqual([
      'framework-or-script-term', 'cjk-or-hangul-char',
    ]);
  });
});


describe('JSX text', () => {
  it.each(['.tsx', '.jsx'])('handles apostrophes followed by quoted codes in %s', (extension) => {
    expect(scan("<p>Don't panic</p>;\nconst k = 'vi';", `component${extension}`)).toEqual([
      { line: 2, col: 11, rule: 'quoted-language-code', match: "'vi'" },
    ]);
  });

  it('checks framework terms and CJK in JSX text', () => {
    expect(scan("<p>Don't panic: HSK 中</p>", 'source.tsx')).toEqual([
      { line: 1, col: 17, rule: 'framework-or-script-term', match: 'HSK' },
      { line: 1, col: 21, rule: 'cjk-or-hangul-char', match: '中' },
    ]);
  });
});

