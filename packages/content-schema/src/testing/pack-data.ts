import type { z } from 'zod';
import { jsonSnapshot } from '../json.ts';
import { contentPackSchema } from '../schemas.ts';
import type { ContentValidationIssue } from '../types.ts';

/** A pack that passed the structural schema. */
export type PackData = z.output<typeof contentPackSchema>;

/** A question as parsed from the schema, before it is widened to the public Question type. */
export type PackQuestion = PackData['lessons'][number]['questions'][number];

export type PackRead =
  | { readonly pack: PackData }
  | { readonly issues: ContentValidationIssue[] };

/** Copies the input as lossless JSON and parses it. Never throws; failures come back as issues. */
export function readPack(input: unknown): PackRead {
  const issues: ContentValidationIssue[] = [];
  let data: unknown;
  try {
    data = jsonSnapshot(input, [], new Set(), issues);
  } catch {
    // Never inspect a thrown value: even its properties may be hostile getters.
    return { issues: issues.length ? issues : [{ path: [], message: 'Unable to read input as lossless JSON data' }] };
  }
  const parsed = contentPackSchema.safeParse(data);
  if (!parsed.success) {
    return {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.map((key) => typeof key === 'symbol' ? String(key) : key), message: issue.message,
      })),
    };
  }
  return { pack: parsed.data };
}
