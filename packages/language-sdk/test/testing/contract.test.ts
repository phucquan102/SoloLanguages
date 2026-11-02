import { defineLanguage } from '../../src/index.ts';
import { runLanguageModuleContract } from '../../src/testing/index.ts';
import type { ContractOptions } from '../../src/testing/index.ts';
import { makeModule } from '../fixtures/valid.ts';

const opts: ContractOptions = {
  expectedCode: 'qtv',
  requiredLocales: ['vi'],
  supportedLocales: ['vi', 'en'],
  samples: { equivalent: [[' Hello ', 'hello']], nonEquivalent: [['hello', 'world']] },
  timeoutMs: 50,
};

runLanguageModuleContract(() => defineLanguage(makeModule()), opts);
