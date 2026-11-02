export interface RegistrySource {
  readonly id: string;
  load(): Promise<unknown>;
}

export interface DiscoverFromRecordOptions {
  /** Include paths with a `_`-prefixed segment (fixtures, templates). Never enable in production. */
  readonly includeUnderscored?: boolean;
}

/** Adapts `import.meta.glob(...)` output (path -> loader) into registry sources, sorted by id. */
export function discoverFromRecord(
  record: Readonly<Record<string, () => Promise<unknown>>>,
  { includeUnderscored = false }: DiscoverFromRecordOptions = {},
): RegistrySource[] {
  return Object.entries(record)
    .filter(([path]) => includeUnderscored || !path.split(/[\\/]/).some((seg) => seg.startsWith('_')))
    .map(([id, load]) => ({ id, load }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
