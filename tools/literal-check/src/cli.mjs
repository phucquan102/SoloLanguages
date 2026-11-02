import { lstatSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { scanText } from './scanner.mjs';
export { scanText };
import { loadConfig } from './config.mjs';
export { loadConfig, DEFAULT_CONFIG_PATH } from './config.mjs';

/** @typedef {import('./config.mjs').Config} Config */
/** @typedef {import('./config.mjs').FileFinding} FileFinding */

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(here, '../../..');

/** @param {string} root @param {Config} config @returns {string[]} */
export function listFiles(root, config) {
  return readdirSync(root, { recursive: true, encoding: 'utf8' })
    .filter((rel) => !rel.split(/[\\/]/).some((seg) => config.ignoreDirs.includes(seg)))
    .filter((rel) => config.extensions.includes(extname(rel)))
    .map((rel) => join(root, rel))
    .filter((file) => {
      const stat = statSync(file, { throwIfNoEntry: false });
      if (!stat) throw new Error(`Cannot stat listed file: ${file}`);
      return stat.isFile();
    })
    .sort();
}

/**
 * @param {{ roots?: string[], cwd?: string, config?: Config, log?: (msg: string) => void }} [options]
 * @returns {{ findings: FileFinding[], scanned: number, missing: string[], errors?: { file: string, message: string }[] }}
 */
export function run({ roots, cwd = REPO_ROOT, config = loadConfig(), log = console.log } = {}) {
  /** @type {FileFinding[]} */
  const findings = [];
  /** @type {string[]} */
  const missing = [];
  /** @type {{ file: string, message: string }[]} */
  const errors = [];
  let scanned = 0;
  for (const root of roots ?? config.roots) {
    const abs = resolve(cwd, root);
    let files;
    try {
      if (!lstatSync(abs, { throwIfNoEntry: false })) {
        missing.push(root);
        log(`skip missing root: ${root}`);
        continue;
      }
      files = listFiles(abs, config);
    } catch (error) {
      errors.push({ file: root, message: error instanceof Error ? error.message : String(error) });
      continue;
    }
    for (const file of files) {
      scanned++;
      const rel = relative(cwd, file).split('\\').join('/');
      try {
        for (const f of scanText(readFileSync(file, 'utf8'), config, file)) findings.push({ file: rel, ...f });
      } catch (error) {
        errors.push({ file: rel, message: error instanceof Error ? error.message : String(error) });
      }
    }
  }
  return { findings, scanned, missing, ...(errors.length ? { errors } : {}) };
}

/** @param {string[]} argv @returns {number} exit code */
export function main(argv) {
  const args = [...argv];
  const at = args.indexOf('--config');
  const config = loadConfig(at === -1 ? undefined : resolve(args.splice(at, 2)[1] ?? ''));
  const { findings, scanned, errors = [] } = run({ ...(args.length ? { roots: args, cwd: process.cwd() } : {}), config });
  for (const error of errors) console.error(`${error.file}: scan error: ${error.message}`);
  for (const f of findings) console.error(`${f.file}:${f.line}:${f.col}  ${f.rule}  ${JSON.stringify(f.match)}`);
  if (scanned === 0) {
    console.error('No source files were scanned. Check that the roots exist and are readable.');
    return 2;
  }
  if (findings.length) {
    console.error(`\n${findings.length} language literal(s) found. Move them into a language module or add "// ${config.allowDirective} <reason>".`);
    return errors.length ? 2 : 1;
  }
  if (errors.length) return 2;
  console.log(`No language literals found (${scanned} files scanned).`);
  return 0;
}

