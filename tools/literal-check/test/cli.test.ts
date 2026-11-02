import * as fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { main, run } from '../src/cli.mjs';
import { DEFAULT_CONFIG_PATH, loadConfig } from '../src/config.mjs';
import * as adapter from '../src/ts-adapter.mjs';

vi.mock('node:fs', async (importOriginal) => ({ ...await importOriginal<typeof import('node:fs')>() }));

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, '..', 'bin', 'check-no-language-literals.mjs');
const config = loadConfig();

describe('root listing failures', () => {
  it.each(['file root', 'unreadable root', 'dangling source symlink', 'missing roots', 'empty root'])(
    'returns exit 2 with a clear diagnostic for %s', (kind) => {
      const dir = mkdtempSync(join(tmpdir(), 'lang-literals-listing-'));
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      let failure: ReturnType<typeof vi.spyOn> | undefined;
      try {
        let root = dir;
        if (kind === 'file root') {
          root = join(dir, 'source.ts');
          writeFileSync(root, 'const value = 1;');
        } else if (kind === 'unreadable root') {
          failure = vi.spyOn(fs, 'readdirSync').mockImplementationOnce(() => { throw new Error('EACCES: listing denied'); });
        } else if (kind === 'dangling source symlink') {
          writeFileSync(join(dir, 'gone.ts'), '');
          failure = vi.spyOn(fs, 'statSync').mockImplementationOnce(() => undefined);
        } else if (kind === 'missing roots') {
          root = join(dir, 'absent');
        }
        expect(main([root])).toBe(2);
        const diagnostics = error.mock.calls.flat().join('\n');
        expect(diagnostics).toContain('No source files were scanned');
        if (kind === 'file root') expect(diagnostics).toContain('ENOTDIR');
        if (kind === 'unreadable root') expect(diagnostics).toContain('EACCES: listing denied');
        if (kind === 'dangling source symlink') expect(diagnostics).toContain('Cannot stat listed file:');
        if (kind === 'missing roots') expect(log.mock.calls.flat().join('\n')).toContain('skip missing root:');
      } finally {
        failure?.mockRestore(); log.mockRestore(); error.mockRestore();
        rmSync(dir, { recursive: true, force: true });
      }
    },
  );

  it('continues after failed and missing roots when another root can be scanned', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lang-literals-roots-'));
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const file = join(dir, 'clean.ts');
      writeFileSync(file, 'const value = 1;');
      const missing = join(dir, 'absent');
      expect(main([file, missing, dir])).toBe(2);
      expect(error.mock.calls.flat().join('\n')).toContain('ENOTDIR');
      expect(error.mock.calls.flat().join('\n')).not.toContain('No source files were scanned');
      error.mockClear();
      expect(main([missing, dir])).toBe(0);
      expect(log.mock.calls.flat().join('\n')).toContain('No language literals found (1 files scanned).');
    } finally {
      log.mockRestore(); error.mockRestore();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('per-file scan errors', () => {
  it.each(['4000-term addition chain', '100,000-item comma list'] as const)(
    'handles a %s without an uncaught RangeError', (kind) => {
      const dir = mkdtempSync(join(tmpdir(), 'lang-literals-deep-'));
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        const expression = kind === '4000-term addition chain' ? Array(4000).fill("'a'").join(' + ') : Array(100000).fill('a').join(',');
        writeFileSync(join(dir, 'deep.ts'), `${expression}; messages.en;`);
        const status = main([dir]);
        expect([1, 2]).toContain(status);
        const diagnostics = error.mock.calls.flat().join('\n');
        expect(diagnostics).toContain(status === 1 ? 'unquoted-language-code' : 'deep.ts: scan error:');
        expect(diagnostics).not.toContain('RangeError:');
      } finally {
        log.mockRestore(); error.mockRestore();
        rmSync(dir, { recursive: true, force: true });
      }
    },
  );

  it('records a scan error and continues checking later files', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lang-literals-errors-'));
    const analyze = vi.spyOn(adapter, 'analyzeSource').mockImplementationOnce(() => {
      throw new RangeError('forced parser overflow');
    });
    try {
      writeFileSync(join(dir, 'a.ts'), 'const value = 1;');
      writeFileSync(join(dir, 'b.ts'), 'messages.en;');
      const result = run({ roots: ['.'], cwd: dir, config, log: () => {} });
      expect(result.errors).toEqual([{ file: 'a.ts', message: 'forced parser overflow' }]);
      expect(result.scanned).toBe(2);
      expect(result.findings).toEqual([
        { file: 'b.ts', line: 1, col: 10, rule: 'unquoted-language-code', match: '.en' },
      ]);
    } finally {
      analyze.mockRestore();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it.each([false, true])('returns exit 2 for a scan error with findings=%s', (withFindings) => {
    const dir = mkdtempSync(join(tmpdir(), 'lang-literals-exit-'));
    const analyze = vi.spyOn(adapter, 'analyzeSource').mockImplementationOnce(() => {
      throw new Error('forced scan failure');
    });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(dir);
    try {
      writeFileSync(join(dir, 'a.ts'), 'const value = 1;');
      if (withFindings) writeFileSync(join(dir, 'b.ts'), 'messages.en;');
      expect(main(['.'])).toBe(2);
      expect(error.mock.calls[0]).toEqual(['a.ts: scan error: forced scan failure']);
      expect(log).not.toHaveBeenCalled();
      if (withFindings) expect(error.mock.calls.flat().join('\n')).toContain('1 language literal(s) found');
    } finally {
      analyze.mockRestore(); cwd.mockRestore(); log.mockRestore(); error.mockRestore();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('uses editor columns for BOM-prefixed files through the CLI', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lang-literals-bom-'));
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      writeFileSync(join(dir, 'bom.ts'), '\ufeffmessages.en;');
      expect(main([dir])).toBe(1);
      expect(error.mock.calls[0]?.[0]).toMatch(/bom\.ts:1:10  unquoted-language-code  ".en"$/);
    } finally {
      log.mockRestore(); error.mockRestore();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('CLI', () => {
  let dir: string;

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'lang-literals-'));
    for (const name of ['clean', 'dirty']) {
      mkdirSync(join(dir, name, 'nested'), { recursive: true });
      copyFileSync(join(here, 'fixtures', `${name}.ts.txt`), join(dir, name, 'nested', `${name}.ts`));
    }
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  const cli = (...args: string[]) => spawnSync(process.execPath, [script, ...args], { cwd: dir, encoding: 'utf8' });

  it.each([
    ['clean', 0, 'No language literals found (1 files scanned).'],
    ['dirty', 1, '10 language literal(s) found'],
    ['does-not-exist', 2, 'skip missing root: does-not-exist'],
  ] as const)('checks %s through the in-process CLI entry point', (root, status, message) => {
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(dir);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(main([root])).toBe(status);
      const output = [...log.mock.calls, ...error.mock.calls].flat().join('\n');
      expect(output).toContain(message);
      if (status === 1) expect(output).toContain('dirty/nested/dirty.ts:1:22');
    } finally {
      cwd.mockRestore(); log.mockRestore(); error.mockRestore();
    }
  });

  it('exits 0 for a clean root', () => {
    const r = cli('clean');
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('1 files scanned');
  });

  it('exits 1 and prints file:line:col for a dirty root', () => {
    const r = cli('clean', 'dirty');
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('dirty/nested/dirty.ts:1:22  framework-or-script-term  "IELTS"');
    expect(r.stderr).toContain('10 language literal(s) found');
  });

  it('skips missing roots and says so', () => {
    const r = cli('does-not-exist', 'clean');
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('skip missing root: does-not-exist');
  });

  it('run() ignores non-source extensions', () => {
    const r = run({ roots: ['.'], cwd: join(here, 'fixtures'), config, log: () => {} });
    expect(r).toEqual({ findings: [], scanned: 0, missing: [] });
  });
});

describe('CLI configuration and diagnostics', () => {
  it('preserves --config, exit code and diagnostic formatting without subprocesses', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lang-literals-custom-'));
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const raw = JSON.parse(readFileSync(DEFAULT_CONFIG_PATH, 'utf8'));
      raw.allowDirective = 'custom-allow:';
      writeFileSync(join(dir, 'custom.json'), JSON.stringify(raw));
      writeFileSync(join(dir, 'source.ts'), "'vi'; // custom-allow: example\n'ja';");
      expect(main(['--config', join(dir, 'custom.json'), dir])).toBe(1);
      expect(error.mock.calls[0]?.[0]).toMatch(/source\.ts:2:1  quoted-language-code  "'ja'"$/);
      expect(error.mock.calls[1]?.[0]).toContain('1 language literal(s) found');
      expect(error.mock.calls[1]?.[0]).toContain('// custom-allow: <reason>');
    } finally {
      log.mockRestore();
      error.mockRestore();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

