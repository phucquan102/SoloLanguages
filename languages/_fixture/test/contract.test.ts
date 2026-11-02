import { runLanguageModuleContract } from '@solo/language-sdk/testing';

runLanguageModuleContract(() => import('../src/index.ts'), {
  expectedCode: 'qaa',
  requiredLocales: ['vi'],
  supportedLocales: ['vi'],
  samples: {
    equivalent: [['  Alpha ', 'alpha'], ['ALPHA', 'alpha']],
    nonEquivalent: [['alpha', 'beta'], ['', 'alpha']],
  },
});
