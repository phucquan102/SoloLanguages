import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('../config/', import.meta.url));
export const DEFAULT_CONFIG_PATH = join(here, 'language-literals.config.json');

/**
 * @typedef {{ id: string, regex: RegExp, scope?: 'literal' | 'code', camelWords?: boolean, knownScript?: boolean }} Rule
 * @typedef {{ roots: string[], extensions: string[], ignoreDirs: string[], allowDirective: string, scriptCodes: Set<string>, rules: Rule[] }} Config
 * @typedef {{ line: number, col: number, rule: string, match: string }} Finding
 * @typedef {Finding & { file: string }} FileFinding
 */

/** @param {string} [path] @returns {Config} */
export function loadConfig(path = DEFAULT_CONFIG_PATH) {
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  return {
    roots: raw.roots ?? [],
    extensions: raw.extensions ?? ['.ts'],
    ignoreDirs: raw.ignoreDirs ?? ['node_modules'],
    allowDirective: raw.allowDirective ?? 'lang-literal-allow:',
    scriptCodes: new Set(JSON.parse(readFileSync(join(here, 'iso15924-script-codes.json'), 'utf8')).codes
      .map((/** @type {string} */ code) => code.toLowerCase())),
    rules: raw.rules.map((/** @type {{ id: string, pattern: string, flags?: string, scope?: 'literal' | 'code', camelWords?: boolean, knownScript?: boolean }} */ r) => ({
      ...r,
      regex: new RegExp(r.pattern, r.flags?.includes('g') ? r.flags : `${r.flags ?? ''}g`),
    })),
  };
}

