import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('project entry points', () => {
  it('keeps the executable as a thin entry to the source CLI', () => {
    const entry = readFileSync(new URL('../bin/check-no-language-literals.mjs', import.meta.url), 'utf8');
    expect(entry).toContain("import { main } from '../src/cli.mjs'");
    expect(entry).toContain('process.exitCode = main(process.argv.slice(2))');
    expect(entry).not.toMatch(/(?:function|export)\s/);
  });

  it('discovers app projects with a glob that tolerates an absent apps directory', async () => {
    const path = new URL('../../../vitest.config.ts', import.meta.url).href;
    const { default: config } = await import(/* @vite-ignore */ path);
    expect(config.test.projects).toContain('apps/*');
    expect(config.test.projects).not.toContain('apps');
    expect(config.test.projects).not.toContain('apps/');
  });
});
