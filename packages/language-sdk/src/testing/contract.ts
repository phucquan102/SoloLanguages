import { beforeAll, describe, it } from 'vitest';
import { CONTRACT_CHECKS, checkLanguageModule } from './checks.ts';
import type { CheckResult, ContractOptions } from './checks.ts';

/**
 * Registers one Vitest test per contract check.
 * `source` is the module itself or a (lazy) loader returning it / its namespace with a default export.
 */
export function runLanguageModuleContract(source: unknown, opts: ContractOptions): void {
  describe(`language module contract (${opts.expectedCode})`, () => {
    let results: CheckResult[] = [];

    beforeAll(async () => {
      let mod = typeof source === 'function' ? await (source as () => unknown)() : source;
      if (mod && typeof mod === 'object' && !('manifest' in mod) && 'default' in mod) mod = mod.default;
      results = await checkLanguageModule(mod, opts);
    });

    for (const { id, name } of CONTRACT_CHECKS) {
      it(`${id}. ${name}`, () => {
        const r = results.find((x) => x.id === id);
        if (!r) throw new Error('check did not run');
        if (!r.ok) throw new Error(r.message);
      });
    }
  });
}
