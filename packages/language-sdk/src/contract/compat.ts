/** Strict SemVer 2.0.0 (https://semver.org), shared with the manifest schema. */
export const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export interface SemVer {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  /** Numeric identifiers are numbers, others strings. Empty for releases. */
  readonly prerelease: readonly (string | number)[];
}

export function parseVersion(version: string): SemVer | null {
  const m = typeof version === 'string' ? SEMVER_PATTERN.exec(version) : null;
  if (!m) return null;
  const prerelease = m[4] ? m[4].split('.').map((id) => (/^\d+$/.test(id) ? Number(id) : id)) : [];
  const major = Number(m[1]);
  const minor = Number(m[2]);
  const patch = Number(m[3]);
  if (![major, minor, patch, ...prerelease.filter((id) => typeof id === 'number')].every(Number.isSafeInteger)) return null;
  return { major, minor, patch, prerelease };
}

export function isSemver(version: string): boolean {
  return parseVersion(version) !== null;
}

function comparePrerelease(a: readonly (string | number)[], b: readonly (string | number)[]): number {
  if (!a.length || !b.length) return b.length - a.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i];
    const y = b[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    if (x === y) continue;
    if (typeof x === 'number' && typeof y === 'number') return x - y;
    if (typeof x === 'number') return -1;
    if (typeof y === 'number') return 1;
    return x < y ? -1 : 1;
  }
  return 0;
}

/** SemVer precedence; build metadata ignored. */
export function compareVersions(a: SemVer, b: SemVer): number {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch || comparePrerelease(a.prerelease, b.prerelease);
}

const sameCore = (a: SemVer, b: SemVer) => a.major === b.major && a.minor === b.minor && a.patch === b.patch;

/**
 * Exact `x.y.z` or caret `^x.y.z` ranges with npm semantics. A prerelease `version` only satisfies a caret
 * range whose own version carries a prerelease on the same major.minor.patch.
 */
export function satisfies(version: string, range: string): boolean {
  if (typeof range !== 'string') return false;
  const v = parseVersion(version);
  const caret = range.startsWith('^');
  const r = parseVersion(caret ? range.slice(1) : range);
  if (!v || !r) return false;
  if (!caret) return compareVersions(v, r) === 0;
  if (v.prerelease.length && !(r.prerelease.length && sameCore(v, r))) return false;
  if (compareVersions(v, r) < 0) return false;
  if (r.major > 0) return v.major === r.major;
  if (r.minor > 0) return v.major === 0 && v.minor === r.minor;
  return v.major === 0 && v.minor === 0 && v.patch === r.patch;
}
