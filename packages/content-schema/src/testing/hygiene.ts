import { localeTagSchema } from '@solo/language-sdk';
import { z } from 'zod';
import { jsonSnapshot } from '../json.ts';
import { contentPackSchema, provenanceSchema } from '../schemas.ts';
import type { ContentIssuePath, ContentValidationIssue } from '../types.ts';

export interface ContentHygieneOptions {
  readonly nativeLocales: readonly string[];
  /** Module-owned heuristic; omitted means no native-text heuristic is applied. */
  readonly isNativeText?: (text: string) => boolean;
}

const optionsSchema = z.strictObject({ nativeLocales: z.array(localeTagSchema) });

/** Audits JSON content independently of module context and extension validators. Never throws. */
export function checkContentHygiene(pack: unknown, options: ContentHygieneOptions): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const add = (path: ContentIssuePath, message: string) => { issues.push({ path, message }); };
  try {
    const locales = optionsSchema.safeParse({ nativeLocales: options.nativeLocales });
    if (!locales.success || (options.isNativeText !== undefined && typeof options.isNativeText !== 'function')) {
      return [{ path: ['options'], message: 'Expected canonical nativeLocales and optional isNativeText predicate' }];
    }
    const data = jsonSnapshot(pack, [], new Set(), issues);
    const parsed = contentPackSchema.safeParse(data);
    if (!parsed.success) {
      return parsed.error.issues.map((issue) => ({
        path: issue.path.map((key) => typeof key === 'symbol' ? String(key) : key), message: issue.message,
      }));
    }
    const seen = new Set<string>();
    const visit = (value: unknown, path: ContentIssuePath, target = false, localized = false, metadata = false): void => {
      if (typeof value === 'string') {
        if (/<[a-z/][^>]*>/i.test(value)) add(path, 'HTML tags are not allowed');
        if (value.includes('${')) add(path, 'Unresolved template interpolation');
        if (!target && !localized && !metadata && options.isNativeText) {
          try { if (options.isNativeText(value)) add(path, 'Possible native-language text in a plain-string field'); }
          catch { add(path, 'Native-text predicate failed'); }
        }
        return;
      }
      if (value === null || typeof value !== 'object') return;
      if (Array.isArray(value)) {
        value.forEach((child, index) => visit(child, [...path, index], target, localized, metadata)); return;
      }
      const object = value as Record<string, unknown>;
      const isRecord = Object.hasOwn(object, 'provenance') || (path.includes('extensions') && Object.hasOwn(object, 'id'));
      if (isRecord) {
        if (typeof object['id'] === 'string') {
          if (object['id'].length === 0 || object['id'].trim() !== object['id']) add([...path, 'id'], 'Expected non-empty trimmed id');
          if (seen.has(object['id'])) add([...path, 'id'], `Duplicate id "${object['id']}"`);
          seen.add(object['id']);
        } else add([...path, 'id'], 'Expected record id');
        const provenance = provenanceSchema.safeParse(object['provenance']);
        if (!provenance.success) {
          provenance.error.issues.forEach((issue) => add(
            [...path, 'provenance', ...issue.path.map((key) => typeof key === 'symbol' ? String(key) : key)], issue.message,
          ));
        }
      }
      const keys = Object.keys(object);
      // Recognize locale maps, including module-owned extension text, using SDK locale rules.
      const localeMap = keys.length > 0 && keys.every((key) => localeTagSchema.safeParse(key).success)
        && Object.values(object).every((child) => typeof child === 'string');
      for (const [key, child] of Object.entries(object)) {
        const inVocab = path[0] === 'vocab';
        const question = object['kind'] === 'choice' || object['kind'] === 'typed';
        const declaredTarget = target
          || (inVocab && ['headword', 'collocations', 'fields'].includes(key))
          || (inVocab && path.includes('examples') && key === 'text')
          || (object['kind'] === 'example' && (key === 'text' || key === 'transcription'))
          || (object['kind'] === 'mistake' && (key === 'wrong' || key === 'right'))
          || (object['kind'] === 'explanation' && key === 'pattern')
          || (question && ['prompt', 'passage', 'options', 'acceptedAnswers'].includes(key));
        visit(child, [...path, key], declaredTarget, localized || localeMap,
          metadata || key === 'provenance' || key === 'review' || key === 'id');
      }
    };
    visit(data, []);
    return issues;
  } catch {
    return issues.length ? issues : [{ path: [], message: 'Unable to check content hygiene' }];
  }
}
