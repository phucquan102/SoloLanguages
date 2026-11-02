export interface LanguageState {
  readonly enabled: boolean;
}

/** Persists enable/disable per language code. Implementations may throw; the registry fails closed. */
export interface LanguageStateProvider {
  getAll(): Promise<Record<string, LanguageState>>;
  set(code: string, enabled: boolean): Promise<void>;
  /** Applied to codes missing from `getAll()`. Defaults to false. */
  readonly defaultEnabled?: boolean;
}

export function createMemoryStateProvider(
  initial: Record<string, LanguageState> = {},
  { defaultEnabled = false }: { defaultEnabled?: boolean } = {},
): LanguageStateProvider {
  const state = new Map(Object.entries(initial).map(([code, s]) => [code, { enabled: s.enabled }]));
  return {
    defaultEnabled,
    async getAll() {
      return Object.fromEntries([...state].map(([code, s]) => [code, { ...s }]));
    },
    async set(code, enabled) {
      state.set(code, { enabled });
    },
  };
}
