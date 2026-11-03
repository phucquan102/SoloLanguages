import { runLanguageModuleContract } from '@solo/language-sdk/testing';
import { equivalent, nonEquivalent } from './fixtures/text-samples.ts';

runLanguageModuleContract(() => import('../src/index.ts'), {
  expectedCode: 'zh', requiredLocales: ['vi'], supportedLocales: ['vi'],
  samples: {
    equivalent, nonEquivalent,
    text: ['中文', 'nǐ hǎo', 'ü', '妈妈', '媽媽', 'xi’an', 'nǐ\u200bhǎo', 'u\u200b\u0308', '\u3000\ufeff'],
  },
});
