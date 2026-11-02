import type { IssuePath } from '../contract/validate.ts';

export type RegistryIssueCode =
  | 'LOAD_FAILED'
  | 'SCHEMA_INVALID'
  | 'SDK_INCOMPATIBLE'
  | 'SEMANTIC_INVALID'
  | 'DUPLICATE_CODE'
  | 'NOT_REGISTERED'
  | 'STATE_UNAVAILABLE';

export interface RegistryIssue {
  readonly code: RegistryIssueCode;
  readonly message: string;
  /** Source id that produced the issue, when applicable. */
  readonly sourceId?: string;
  /** Language code (manifest.code), when known. */
  readonly language?: string;
  /** Path inside the module, for schema/semantic issues. */
  readonly path?: IssuePath;
}

export type Result<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly issue: RegistryIssue };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const fail = <T = never>(issue: RegistryIssue): Result<T> => ({ ok: false, issue });

export const UNPRINTABLE_ERROR = 'Unknown error (value could not be converted to a string)';

/** Never throws, even for values whose `message`/`toString` throw. */
export function errorMessage(error: unknown): string {
  try {
    const message = error instanceof Error ? error.message : error;
    const text = typeof message === 'string' ? message : String(message);
    return typeof text === 'string' ? text : UNPRINTABLE_ERROR;
  } catch {
    return UNPRINTABLE_ERROR;
  }
}
