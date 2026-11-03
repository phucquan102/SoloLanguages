import { runLanguageModuleContract } from '@solo/language-sdk/testing';
import { equivalent, nonEquivalent, text } from './samples.ts';

runLanguageModuleContract(() => import('../src/index.ts'), {
  expectedCode: 'en', requiredLocales: ['vi'], supportedLocales: ['vi'],
  samples: { equivalent, nonEquivalent, text },
});
