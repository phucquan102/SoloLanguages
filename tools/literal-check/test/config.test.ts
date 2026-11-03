import { describe, expect, it, vi } from 'vitest';
import { loadConfig } from '../src/config.mjs';
import { scanText } from '../src/scanner.mjs';

const config = loadConfig();
const scan = (text: string, path = 'source.ts') => scanText(text, config, path);

describe('static ISO 15924 script codes', () => {
  it.each(['Latn', 'Cyrl', 'Hans', 'Hant', 'Berf', 'Hntl', 'Seal', 'Qaaa', 'Qaam', 'Qabx', 'Zinh', 'Zzzz'])(
    'recognizes registered or reserved script %s independently of ICU', (script) => {
      expect(scan(`'sr-${script}'`)).toHaveLength(1);
    },
  );

  it.each(['Dupe', 'Rout', 'Tail', 'Qaby', 'Abcd'])(
    'rejects unregistered script-shaped word %s', (script) => {
      expect(scan(`'de-${script}'`)).toEqual([]);
    },
  );

  it('loads the checker and config with Intl.DisplayNames unavailable', async () => {
    const displayNames = vi.spyOn(Intl, 'DisplayNames').mockImplementation(() => { throw new Error('ICU unavailable'); });
    try {
      const modulePath = '../src/cli.mjs?without-intl';
      const checker = await import(modulePath);
      expect(checker.scanText("'sr-Latn'", checker.loadConfig())).toHaveLength(1);
    } finally {
      displayNames.mockRestore();
    }
  });
});


describe('default configuration', () => {
  it('preserves default roots, extensions and rule order', () => {
    expect(config.roots).toEqual([
      'packages/core/src', 'packages/language-sdk/src', 'packages/content-schema/src',
    ]);
    expect(config.extensions).toEqual(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']);
    expect(config.rules.map(({ id }) => id)).toEqual([
      'framework-or-script-term', 'quoted-language-code', 'unquoted-language-code', 'cjk-or-hangul-char',
    ]);
  });

});
