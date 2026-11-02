import { satisfies } from '../contract/compat.ts';
import { deepFreeze } from '../contract/define.ts';
import type { RegistrySource } from './discover.ts';
import { errorMessage, fail, ok } from './errors.ts';
import type { RegistryIssue, RegistryIssueCode, Result } from './errors.ts';
import { snapshotMessages } from './messages.ts';
import { languageModuleSchema } from '../contract/schemas.ts';
import type { LanguageStateProvider } from './state.ts';
import { withTimeout } from './timeout.ts';
import type { LanguageModule, Locale, Messages } from '../contract/types.ts';
import { validateLanguageModule } from '../contract/validate.ts';
import { SDK_VERSION } from '../contract/version.ts';

export interface RegistryLogger {
  warn(message: string, issue: RegistryIssue): void;
}

export const MAX_LOAD_TIMEOUT_MS = 2 ** 31 - 1;

export interface RegistryOptions {
  readonly stateProvider: LanguageStateProvider;
  readonly sdkVersion?: string;
  /** Integer in [1, 2^31-1]; applies to module loaders, lazy loaders and state provider calls. Default 10000. */
  readonly loadTimeoutMs?: number;
  /** Logger failures are swallowed. */
  readonly logger?: RegistryLogger;
}

export interface DiscoverResult {
  /** Registered language codes (enabled or not). */
  readonly registered: string[];
  readonly issues: RegistryIssue[];
  /** Set when a newer `discover()` started meanwhile; this call changed nothing and reports no issues. */
  readonly superseded?: true;
}

export interface ListOptions {
  readonly includeDisabled?: boolean;
}

/**
 * Isolation targets bugs in first-party modules (throws, rejections, async hangs, bad data).
 * Synchronous infinite loops cannot be interrupted in-process.
 */
export interface LanguageRegistry {
  /**
   * Loads, validates and snapshots every source. Never rejects. Replaces previously registered modules,
   * unless a newer `discover()` started meanwhile (then it resolves `{ registered: [], issues: [], superseded: true }`).
   */
  discover(sources: Iterable<RegistrySource>): Promise<DiscoverResult>;
  /** Re-reads enable/disable state. Fails closed (all disabled) on provider errors. Never rejects. */
  refresh(): Promise<RegistryIssue[]>;
  list(options?: ListOptions): LanguageModule[];
  get(code: string, options?: ListOptions): LanguageModule | undefined;
  isEnabled(code: string): boolean;
  /** Persists, then re-reads state; succeeds only if the re-read state reflects the change. */
  enable(code: string): Promise<Result<void>>;
  disable(code: string): Promise<Result<void>>;
  /**
   * Works for disabled modules too; enable-state policy for content is enforced by the app layer.
   * Resolves `undefined` when there is no loader; a loader resolving `undefined` is LOAD_FAILED.
   */
  getContent(code: string): Promise<Result<unknown>>;
  /**
   * Own-property locale keys only. Resolves `undefined` when the module has no messages for `locale`.
   * The loader must resolve to a plain object of strings, else LOAD_FAILED.
   * Returns a null-prototype snapshot; use `Object.hasOwn(messages, key)`, not `messages.hasOwnProperty(key)`.
   */
  getMessages(code: string, locale: Locale): Promise<Result<Messages | undefined>>;
}

interface Entry {
  readonly mod: LanguageModule;
  readonly original: unknown;
  readonly i18nReceiver: unknown;
}

interface StateRead {
  readonly gen: number;
  readonly state: Map<string, boolean>;
  readonly available: boolean;
  readonly issues: RegistryIssue[];
}

class StepError extends Error {
  readonly issues: RegistryIssue[];
  constructor(issues: RegistryIssue[]) {
    super('registry step failed');
    this.issues = issues;
  }
}

const byId = (a: { id: string }, b: { id: string }) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

function unwrap(value: unknown): unknown {
  if (value && typeof value === 'object' && !('manifest' in value) && 'default' in value) return value.default;
  return value;
}

function codeOf(raw: unknown): string | undefined {
  try {
    const code = (raw as { manifest?: { code?: unknown } } | null)?.manifest?.code;
    return typeof code === 'string' ? code : undefined;
  } catch {
    return undefined;
  }
}

/** Throws RangeError for an invalid `loadTimeoutMs` (programmer error at construction). */
export function createRegistry(options: RegistryOptions): LanguageRegistry {
  const { stateProvider, sdkVersion = SDK_VERSION, loadTimeoutMs = 10_000, logger } = options;
  if (!Number.isInteger(loadTimeoutMs) || loadTimeoutMs < 1 || loadTimeoutMs > MAX_LOAD_TIMEOUT_MS) {
    throw new RangeError(`loadTimeoutMs must be an integer in [1, ${MAX_LOAD_TIMEOUT_MS}]`);
  }
  const ms = loadTimeoutMs;

  let entries = new Map<string, Entry>();
  let state = new Map<string, boolean>();
  let stateAvailable = true;
  let stateIssues: RegistryIssue[] = [];
  let discoverGen = 0;
  let stateGen = 0;
  let appliedGen = 0;
  const pending: RegistryIssue[] = [];

  let defaultEnabled = false;
  try {
    defaultEnabled = stateProvider.defaultEnabled === true;
  } catch (error) {
    pending.push({ code: 'STATE_UNAVAILABLE', message: `Reading defaultEnabled failed, using false: ${errorMessage(error)}` });
  }

  const report = (issues: RegistryIssue[]): RegistryIssue[] => {
    for (const issue of issues) {
      try {
        logger?.warn(`[language-registry] ${issue.code}: ${issue.message}`, issue);
      } catch {
        // logger failures must not break the registry
      }
    }
    return issues;
  };
  const failWith = <T>(issue: RegistryIssue): Result<T> => fail(report([issue])[0] ?? issue);
  const notRegistered = (code: string): RegistryIssue => ({ code: 'NOT_REGISTERED', language: String(code), message: `Language "${String(code)}" is not registered` });

  async function step<T>(code: RegistryIssueCode, sourceId: string, language: string | undefined, run: () => Promise<T> | T): Promise<T> {
    try {
      return await run();
    } catch (error) {
      if (error instanceof StepError) throw error;
      throw new StepError([{ code, sourceId, ...(language ? { language } : {}), message: errorMessage(error) }]);
    }
  }

  async function processSource(source: RegistrySource, load: () => Promise<unknown>, id: string, winners: Map<string, string>): Promise<Entry> {
    const raw = await step('LOAD_FAILED', id, undefined, async () => unwrap(await withTimeout(() => Reflect.apply(load, source, []), ms)));

    const mod = await step('SCHEMA_INVALID', id, undefined, () => {
      const parsed = languageModuleSchema.safeParse(raw);
      if (parsed.success) return parsed.data as LanguageModule;
      const language = codeOf(raw);
      throw new StepError(
        parsed.error.issues.map((i) => ({
          code: 'SCHEMA_INVALID' as const,
          sourceId: id,
          ...(language ? { language } : {}),
          path: i.path.map((p) => (typeof p === 'number' ? p : String(p))),
          message: `${i.path.map(String).join('.') || '<root>'}: ${i.message}`,
        })),
      );
    });
    const code = mod.manifest.code;

    await step('SDK_INCOMPATIBLE', id, code, () => {
      if (!satisfies(sdkVersion, mod.sdk)) throw new Error(`Module requires SDK ${mod.sdk}, runtime is ${sdkVersion}`);
    });

    await step('SEMANTIC_INVALID', id, code, () => {
      const issues = validateLanguageModule(mod);
      if (issues.length) {
        throw new StepError(
          issues.map((i) => ({ code: 'SEMANTIC_INVALID' as const, sourceId: id, language: code, path: i.path, message: `${i.path.join('.')}: ${i.message}` })),
        );
      }
    });

    await step('DUPLICATE_CODE', id, code, () => {
      const winner = winners.get(code);
      if (winner !== undefined) throw new Error(`Language "${code}" already registered by source "${winner}"`);
    });

    let i18nReceiver: unknown;
    try {
      i18nReceiver = (raw as { i18n?: unknown }).i18n;
    } catch {
      i18nReceiver = undefined;
    }
    return { mod: deepFreeze(mod, { functions: false }), original: raw, i18nReceiver };
  }

  function readSources(sources: unknown, issues: RegistryIssue[]): { id: string; load: () => Promise<unknown>; source: RegistrySource }[] {
    let list: unknown[];
    try {
      list = [...(sources as Iterable<unknown>)];
    } catch (error) {
      issues.push({ code: 'LOAD_FAILED', message: `sources is not iterable: ${errorMessage(error)}` });
      return [];
    }
    const out: { id: string; load: () => Promise<unknown>; source: RegistrySource }[] = [];
    list.forEach((source, index) => {
      const fallbackId = `#${index}`;
      try {
        if (source === null || typeof source !== 'object') throw new Error('source must be an object');
        const { id, load } = source as RegistrySource;
        if (typeof id !== 'string' || !id) throw new Error('source id must be a non-empty string');
        if (typeof load !== 'function') {
          issues.push({ code: 'LOAD_FAILED', sourceId: id, message: 'source load must be a function' });
          return;
        }
        out.push({ id, load, source: source as RegistrySource });
      } catch (error) {
        issues.push({ code: 'LOAD_FAILED', sourceId: fallbackId, message: `Invalid source: ${errorMessage(error)}` });
      }
    });
    return out.sort(byId);
  }

  async function readState(): Promise<StateRead> {
    const gen = ++stateGen;
    try {
      const raw: unknown = await withTimeout(() => stateProvider.getAll(), ms);
      if (raw === null || typeof raw !== 'object') throw new Error('getAll() must resolve to an object');
      const map = new Map<string, boolean>();
      for (const [code, value] of Object.entries(raw)) {
        const enabled: unknown = value !== null && typeof value === 'object' ? (value as { enabled?: unknown }).enabled : undefined;
        map.set(code, enabled === true);
      }
      return { gen, state: map, available: true, issues: [] };
    } catch (error) {
      const message = `State provider failed, all languages disabled: ${errorMessage(error)}`;
      return { gen, state: new Map(), available: false, issues: [{ code: 'STATE_UNAVAILABLE', message }] };
    }
  }

  function applyState(read: StateRead): void {
    if (read.gen <= appliedGen) return;
    state = read.state;
    stateAvailable = read.available;
    stateIssues = read.issues;
    appliedGen = read.gen;
  }

  function isEnabled(code: string): boolean {
    if (!entries.has(code) || !stateAvailable) return false;
    return state.get(code) ?? defaultEnabled;
  }

  async function setEnabled(code: string, enabled: boolean): Promise<Result<void>> {
    try {
      if (!entries.has(code)) return failWith(notRegistered(code));
      try {
        await withTimeout(() => stateProvider.set(code, enabled), ms);
      } catch (error) {
        return failWith({ code: 'STATE_UNAVAILABLE', language: code, message: `Failed to persist state: ${errorMessage(error)}` });
      }
      const read = await readState();
      applyState(read);
      if (!entries.has(code)) return failWith(notRegistered(code));
      if (!stateAvailable) return failWith({ ...stateIssues[0]!, language: code });
      if (isEnabled(code) !== enabled) {
        return failWith({ code: 'STATE_UNAVAILABLE', language: code, message: `State provider did not reflect ${enabled ? 'enable' : 'disable'}` });
      }
      return ok(undefined);
    } catch (error) {
      return failWith({ code: 'STATE_UNAVAILABLE', language: String(code), message: errorMessage(error) });
    }
  }

  async function lazy<T>(
    code: string,
    what: string,
    pick: (entry: Entry) => { fn: () => Promise<unknown>; receiver: unknown } | undefined,
    accept: (value: unknown) => T | undefined,
    expected: string,
  ): Promise<Result<T | undefined>> {
    const entry = entries.get(code);
    if (!entry) return failWith(notRegistered(code));
    try {
      const picked = pick(entry);
      if (!picked) return ok(undefined);
      const value = await withTimeout(() => Reflect.apply(picked.fn, picked.receiver, []), ms);
      const accepted = accept(value);
      if (accepted === undefined) throw new Error(`expected ${expected}`);
      return ok(accepted);
    } catch (error) {
      return failWith({ code: 'LOAD_FAILED', language: code, message: `Failed to load ${what}: ${errorMessage(error)}` });
    }
  }

  return {
    async discover(sources) {
      const gen = ++discoverGen;
      const issues: RegistryIssue[] = [];
      try {
        const next = new Map<string, Entry>();
        const winners = new Map<string, string>();
        for (const { id, load, source } of readSources(sources, issues)) {
          try {
            const entry = await processSource(source, load, id, winners);
            next.set(entry.mod.manifest.code, entry);
            winners.set(entry.mod.manifest.code, id);
          } catch (error) {
            issues.push(...(error instanceof StepError ? error.issues : [{ code: 'LOAD_FAILED' as const, sourceId: id, message: errorMessage(error) }]));
          }
        }
        if (gen !== discoverGen) return { registered: [], issues: [], superseded: true };
        const read = await readState();
        if (gen !== discoverGen) return { registered: [], issues: [], superseded: true };
        issues.unshift(...pending.splice(0));
        entries = next;
        applyState(read);
        issues.push(...read.issues);
        return { registered: [...entries.keys()], issues: report(issues) };
      } catch (error) {
        issues.push({ code: 'LOAD_FAILED', message: `discover() failed: ${errorMessage(error)}` });
        return { registered: [], issues: report(issues) };
      }
    },
    async refresh() {
      const issues = pending.splice(0);
      const read = await readState();
      applyState(read);
      return report([...issues, ...(stateAvailable ? [] : stateIssues)]);
    },
    list({ includeDisabled = false } = {}) {
      return [...entries.values()].map((e) => e.mod).filter((m) => includeDisabled || isEnabled(m.manifest.code));
    },
    get(code, { includeDisabled = false } = {}) {
      return includeDisabled || isEnabled(code) ? entries.get(code)?.mod : undefined;
    },
    isEnabled,
    enable: (code) => setEnabled(code, true),
    disable: (code) => setEnabled(code, false),
    getContent: (code) =>
      lazy(code, 'content', (e) => (e.mod.content ? { fn: e.mod.content, receiver: e.original } : undefined), (value) => value, 'a defined value'),
    getMessages: (code, locale) =>
      lazy(code, `messages "${String(locale)}"`, (e) => {
        const i18n = e.mod.i18n;
        const fn = typeof locale === 'string' && i18n && Object.hasOwn(i18n, locale) ? i18n[locale] : undefined;
        return fn ? { fn, receiver: e.i18nReceiver } : undefined;
      }, snapshotMessages, 'a plain object of strings'),
  };
}
