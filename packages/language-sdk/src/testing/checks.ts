import { satisfies } from '../contract/compat.ts';
import { errorMessage } from '../registry/errors.ts';
import { createRegistry } from '../registry/registry.ts';
import { snapshotMessages } from '../registry/messages.ts';
import { languageModuleSchema } from '../contract/schemas.ts';
import { createMemoryStateProvider } from '../registry/state.ts';
import { withTimeout } from '../registry/timeout.ts';
import type { AnswerResult, LanguageModule, Locale, SpeechVoice } from '../contract/types.ts';
import { validateLanguageModule } from '../contract/validate.ts';
import type { ValidationIssue } from '../contract/validate.ts';
import { SDK_VERSION } from '../contract/version.ts';

export type SamplePair = readonly [input: string, accepted: string];

export interface ContractSamples {
  /** Required (at least one pair): `compareAnswer(a, [b])` must reject each pair. */
  readonly nonEquivalent: readonly [SamplePair, ...SamplePair[]];
  /** Pairs that `compareAnswer(a, [b])` must accept. */
  readonly equivalent?: readonly SamplePair[];
  /** Extra inputs (e.g. the language's own script) for normalize/tokenize/compareAnswer robustness checks. */
  readonly text?: readonly string[];
}

export interface ContractOptions {
  readonly expectedCode: string;
  /** Interface locales every module must name itself in. */
  readonly requiredLocales: readonly Locale[];
  /** Interface locales the app supports; `i18n` keys must be a subset. */
  readonly supportedLocales: readonly Locale[];
  readonly samples: ContractSamples;
  /** Per lazy loader. Default 5000. */
  readonly timeoutMs?: number;
  readonly sdkVersion?: string;
}

export interface CheckResult {
  readonly id: number;
  readonly name: string;
  readonly ok: boolean;
  readonly message?: string;
  /** Informational notes (e.g. skipped assertions), present on passing checks too. */
  readonly detail?: string;
}

type Failures = string[];
interface CheckContext {
  /** The module exactly as given (checks 18-20); checks 2-17 receive the validated snapshot. */
  readonly raw: unknown;
  readonly notes: string[];
}
type Check = (mod: LanguageModule, opts: ContractOptions, issues: ValidationIssue[], ctx: CheckContext) => Failures | Promise<Failures>;

interface CheckDef {
  readonly id: number;
  readonly name: string;
  /** Schema paths owned by this check: when check 1 fails on them, this check fails with those messages. */
  readonly schema?: readonly string[];
  /** Absent when the schema fully covers the check. */
  readonly run?: Check;
}

const UNICODE_SAMPLES = ['\u00e9', 'e\u0301', '\u00df', '\u0130', '\u{1F44D}', '\u00a0x\u3000', '\u0645\u0631\u062d\u0628\u0627', 'A\u200bB'];
const BASE_SAMPLES = ['', ' ', '\t\n ', 'a', '  Mixed   Case  ', ...UNICODE_SAMPLES];
const MOCK_VOICE_NAME = 'contract-mock-voice';

const fmt = (i: ValidationIssue) => `${i.path.join('.')}: ${i.message}`;
const show = (s: string) => JSON.stringify(s);

function samplesOf(opts: ContractOptions): string[] {
  const s = opts.samples;
  return [...BASE_SAMPLES, ...(s?.text ?? []), ...[...(s?.equivalent ?? []), ...(s?.nonEquivalent ?? [])].flat()];
}

function isCanonicalTag(tag: string): boolean {
  try {
    return Intl.getCanonicalLocales(tag)[0] === tag;
  } catch {
    return false;
  }
}

function isValidTag(tag: string): boolean {
  try {
    return Intl.getCanonicalLocales(tag).length === 1;
  } catch {
    return false;
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b) || Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => Object.hasOwn(b, k) && deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

function unfrozenPaths(value: unknown, path: string, out: string[], seen = new WeakSet<object>()): string[] {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function') || seen.has(value)) return out;
  seen.add(value);
  if (!Object.isFrozen(value)) out.push(path || '<root>');
  // Like deepFreeze, skip function internals (registry snapshots leave functions unfrozen).
  // Check 19 inspects data descriptors only and never reads accessor values.
  // deepFreeze reads property values, so it runs getters and freezes their results.
  if (typeof value === 'function') return out;
  for (const key of Reflect.ownKeys(value)) {
    const childPath = path ? `${path}.${String(key)}` : String(key);
    try {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (descriptor && Object.hasOwn(descriptor, 'value')) unfrozenPaths(descriptor.value, childPath, out, seen);
    } catch (error) {
      out.push(`${childPath} (inspection failed: ${errorMessage(error)})`);
    }
  }
  return out;
}

function answerShape(r: unknown): string | null {
  const a = r as AnswerResult | null;
  if (typeof a !== 'object' || a === null || typeof a.correct !== 'boolean') return 'must return { correct: boolean }';
  if (a.score !== undefined && !(typeof a.score === 'number' && a.score >= 0 && a.score <= 1)) return 'score must be within 0..1';
  return null;
}

function attempt(failures: Failures, label: string, run: () => void): void {
  try {
    run();
  } catch (error) {
    failures.push(`${label} threw: ${errorMessage(error)}`);
  }
}

const byArea = (issues: ValidationIssue[], area: string) => issues.filter((i) => i.path[0] === area);
const isOrderOrCode = (i: ValidationIssue) => ['code', 'order'].includes(String(i.path.at(-1)));

/**
 * Checks 6 and 7 are fully enforced by the schema (check 1); parts of 2, 3, 5, 8, 10-17 are too.
 * Schema failures are attributed to the owning check via `schema` paths.
 */
const CHECKS: readonly CheckDef[] = [
  { id: 1, name: 'matches languageModuleSchema' },
  {
    id: 2,
    name: 'sdk range is satisfied by the SDK version',
    schema: ['sdk'],
    run: (m, o) => {
      const v = o.sdkVersion ?? SDK_VERSION;
      return satisfies(v, m.sdk) ? [] : [`sdk "${m.sdk}" is not satisfied by ${v}`];
    },
  },
  {
    id: 3,
    name: 'manifest.code is ISO 639 and matches expectedCode',
    schema: ['manifest.code'],
    run: (m, o) => (m.manifest.code === o.expectedCode ? [] : [`code ${show(m.manifest.code)} !== expected ${show(o.expectedCode)}`]),
  },
  {
    id: 4,
    name: 'manifest.bcp47 is canonical',
    schema: ['manifest.bcp47'],
    run: (m) => (isCanonicalTag(m.manifest.bcp47) ? [] : [`bcp47 ${show(m.manifest.bcp47)} is not canonical`]),
  },
  {
    id: 5,
    name: 'manifest.names cover required locales',
    schema: ['manifest.names'],
    run: (m, o) => o.requiredLocales.filter((l) => !Object.hasOwn(m.manifest.names, l)).map((l) => `missing name for locale ${show(l)}`),
  },
  { id: 6, name: 'direction and scripts are valid', schema: ['manifest.direction', 'manifest.scripts'] },
  { id: 7, name: 'manifest.version is semver', schema: ['manifest.version'] },
  {
    id: 8,
    name: 'level frameworks: unique codes, strictly increasing order',
    schema: ['levelFrameworks'],
    run: (_m, _o, issues) => byArea(issues, 'levelFrameworks').filter(isOrderOrCode).map(fmt),
  },
  {
    id: 9,
    name: 'level scores: band ranges ascending, ordinal without scores',
    run: (_m, _o, issues) => byArea(issues, 'levelFrameworks').filter((i) => !isOrderOrCode(i)).map(fmt),
  },
  {
    id: 10,
    name: 'courses: unique codes, known framework, ascending levels',
    schema: ['courses'],
    run: (_m, _o, issues) => byArea(issues, 'courses').map(fmt),
  },
  { id: 11, name: 'skills: unique, core or <code>:<id>', schema: ['skills'], run: (_m, _o, issues) => byArea(issues, 'skills').map(fmt) },
  {
    id: 12,
    name: 'textTools.normalize returns strings, is idempotent, never throws',
    schema: ['textTools.normalize'],
    run: (m, o) => {
      const failures: Failures = [];
      for (const s of samplesOf(o)) {
        attempt(failures, `normalize(${show(s)})`, () => {
          const once = m.textTools.normalize(s);
          if (typeof once !== 'string') failures.push(`normalize(${show(s)}) did not return a string`);
          else if (m.textTools.normalize(once) !== once) failures.push(`normalize is not idempotent for ${show(s)}`);
        });
      }
      return failures;
    },
  },
  {
    id: 13,
    name: 'textTools.compareAnswer shape and samples',
    schema: ['textTools.compareAnswer'],
    run: (m, o, _issues, ctx) => {
      const failures: Failures = [];
      const compare = (input: string, accepted: string[], expect?: boolean) =>
        attempt(failures, `compareAnswer(${show(input)}, ${JSON.stringify(accepted)})`, () => {
          const r = m.textTools.compareAnswer(input, accepted);
          const bad = answerShape(r);
          if (bad) failures.push(`compareAnswer(${show(input)}) ${bad}`);
          else if (expect !== undefined && r.correct !== expect) failures.push(`compareAnswer(${show(input)}, ${JSON.stringify(accepted)}) expected correct=${expect}`);
        });
      const nonEquivalent = o.samples?.nonEquivalent ?? [];
      if (!nonEquivalent.length) failures.push('samples.nonEquivalent must contain at least one pair');
      compare('', [], false);
      const blank = new Set<string>();
      for (const s of samplesOf(o)) {
        if (!s.trim()) continue;
        compare(s, [], false);
        let normalized: unknown;
        try {
          normalized = m.textTools.normalize(s);
        } catch {
          normalized = undefined;
        }
        if (normalized === '') {
          blank.add(s);
          continue;
        }
        compare(s, [s], true);
        compare('', [s], false);
      }
      if (blank.size) ctx.notes.push(`normalize() is empty for ${[...blank].map(show).join(', ')}; skipped (s, [s]) and ('', [s]) for those samples`);
      for (const [a, b] of o.samples?.equivalent ?? []) compare(a, [b], true);
      for (const [a, b] of nonEquivalent) compare(a, [b], false);
      return failures;
    },
  },
  {
    id: 14,
    name: 'textTools.tokenize is deterministic without empty tokens',
    schema: ['textTools.tokenize'],
    run: (m, o) => {
      const tokenize = m.textTools.tokenize?.bind(m.textTools);
      if (!tokenize) return [];
      const failures: Failures = [];
      for (const s of samplesOf(o)) {
        attempt(failures, `tokenize(${show(s)})`, () => {
          const a = tokenize(s);
          if (!Array.isArray(a) || a.some((t) => typeof t !== 'string' || t.length === 0)) failures.push(`tokenize(${show(s)}) must return non-empty string tokens`);
          else if (!deepEqual(a, tokenize(s))) failures.push(`tokenize(${show(s)}) is not deterministic`);
        });
      }
      return failures;
    },
  },
  {
    id: 15,
    name: 'speech tags are valid BCP 47, voiceFilter returns boolean',
    schema: ['speech'],
    run: (m) => {
      if (!m.speech) return [];
      const failures = m.speech.tags.filter((t) => !isValidTag(t)).map((t) => `invalid speech tag ${show(t)}`);
      const filter = m.speech.voiceFilter?.bind(m.speech);
      if (filter) {
        const voice: SpeechVoice = { name: MOCK_VOICE_NAME, lang: m.speech.tags[0] ?? m.manifest.bcp47, localService: true, default: false };
        attempt(failures, 'voiceFilter', () => {
          if (typeof filter(voice) !== 'boolean') failures.push('voiceFilter must return a boolean');
        });
      }
      return failures;
    },
  },
  { id: 16, name: 'placement references exist', schema: ['placement'], run: (_m, _o, issues) => byArea(issues, 'placement').map(fmt) },
  {
    id: 17,
    name: 'lazy content and i18n loaders resolve in time to valid values; locales supported',
    schema: ['content', 'i18n'],
    run: async (m, o, _issues, ctx) => {
      const failures: Failures = [];
      const ms = o.timeoutMs ?? 5000;
      const raw = ctx.raw as { i18n?: unknown };
      const run = async (label: string, load: () => Promise<unknown>): Promise<{ ok: true; value: unknown } | { ok: false }> => {
        try {
          return { ok: true, value: await withTimeout(load, ms) };
        } catch (error) {
          failures.push(`${label} failed: ${errorMessage(error)}`);
          return { ok: false };
        }
      };
      const content = m.content;
      if (content) {
        const r = await run('content()', () => Reflect.apply(content, raw, []));
        if (r.ok && r.value === undefined) failures.push('content() must resolve to a defined value');
      }
      const rawI18n = m.i18n ? raw.i18n : undefined;
      for (const [locale, load] of Object.entries(m.i18n ?? {})) {
        if (!o.supportedLocales.includes(locale)) failures.push(`i18n locale ${show(locale)} is not supported`);
        const r = await run(`i18n.${locale}()`, () => Reflect.apply(load, rawI18n, []));
        if (r.ok && !snapshotMessages(r.value)) {
          failures.push(`i18n.${locale}() must resolve to a plain object of strings`);
        }
      }
      return failures;
    },
  },
  {
    id: 18,
    name: 'manifest, levelFrameworks and courses survive JSON round-trip',
    run: (_m, _o, _issues, { raw }) =>
      (['manifest', 'levelFrameworks', 'courses'] as const)
        .map((k) => [k, (raw as LanguageModule)[k]] as const)
        .filter(([, v]) => !deepEqual(v, JSON.parse(JSON.stringify(v))))
        .map(([k]) => k)
        .map((k) => `${k} changes after JSON round-trip`),
  },
  {
    id: 19,
    name: 'module is deeply frozen',
    run: (_m, _o, _issues, { raw }) => {
      const paths = unfrozenPaths(raw, '', []);
      return paths.length ? [`not frozen: ${paths.slice(0, 5).join(', ')}${paths.length > 5 ? ', ...' : ''}`] : [];
    },
  },
  {
    id: 20,
    name: 'registers in a fresh registry with zero issues',
    run: async (m, o, _issues, { raw }) => {
      const registry = createRegistry({ stateProvider: createMemoryStateProvider(), ...(o.sdkVersion ? { sdkVersion: o.sdkVersion } : {}) });
      const r = await registry.discover([{ id: 'contract', load: async () => raw }]);
      return [...r.issues.map((i) => `${i.code}: ${i.message}`), ...(r.registered.includes(m.manifest.code) ? [] : ['module was not registered'])];
    },
  },
];

export const CONTRACT_CHECKS: readonly { readonly id: number; readonly name: string }[] = CHECKS.map(({ id, name }) => ({ id, name }));

const owns = (prefixes: readonly string[] | undefined, path: string) => !!prefixes?.some((p) => path === p || path.startsWith(`${p}.`));

/** Runs every contract check. Never throws or rejects; framework-agnostic; never mutates `mod`. */
export async function checkLanguageModule(mod: unknown, opts: ContractOptions): Promise<CheckResult[]> {
  let schemaIssues: { path: string; message: string }[];
  let snapshot: LanguageModule | undefined;
  try {
    const parsed = languageModuleSchema.safeParse(mod);
    if (parsed.success) snapshot = parsed.data as LanguageModule;
    schemaIssues = parsed.success ? [] : parsed.error.issues.map((i) => ({ path: i.path.map(String).join('.'), message: i.message }));
  } catch (error) {
    const message = `schema validation threw: ${errorMessage(error)}`;
    return CHECKS.map(({ id, name }) => ({ id, name, ok: false, message: id === 1 ? message : 'skipped: schema invalid' }));
  }

  if (schemaIssues.length || !snapshot) {
    const text = (list: typeof schemaIssues) => list.map((i) => `${i.path || '<root>'}: ${i.message}`).join('; ');
    return CHECKS.map(({ id, name, schema }) => {
      if (id === 1) return { id, name, ok: false, message: text(schemaIssues) };
      const own = schemaIssues.filter((i) => owns(schema, i.path));
      return { id, name, ok: false, message: own.length ? text(own) : 'skipped: schema invalid' };
    });
  }

  const m = snapshot;
  let issues: ValidationIssue[] = [];
  let validateError: string | undefined;
  try {
    issues = validateLanguageModule(m);
  } catch (error) {
    validateError = `validateLanguageModule threw: ${errorMessage(error)}`;
  }

  const results: CheckResult[] = [];
  for (const { id, name, run } of CHECKS) {
    let failures: Failures;
    const ctx: CheckContext = { raw: mod, notes: [] };
    try {
      failures = !run ? [] : validateError && [8, 9, 10, 11, 16].includes(id) ? [validateError] : await run(m, opts, issues, ctx);
    } catch (error) {
      failures = [`check threw: ${errorMessage(error)}`];
    }
    const detail = ctx.notes.length ? { detail: ctx.notes.join('; ') } : {};
    results.push(failures.length ? { id, name, ok: false, message: failures.join('; '), ...detail } : { id, name, ok: true, ...detail });
  }
  return results;
}
