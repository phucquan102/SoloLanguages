import { describe, expect, it } from 'vitest';

describe('public API', () => {
  it('index exports only the documented runtime values (withTimeout/deepFreeze are internal)', async () => {
    const mod = await import('../src/index.ts');
    expect(Object.keys(mod).sort()).toEqual(
      [
        'CORE_SKILLS',
        'CUSTOM_SKILL_PATTERN',
        'SDK_VERSION',
        'courseSchema',
        'createMemoryStateProvider',
        'createRegistry',
        'defineLanguage',
        'defineLevelFramework',
        'discoverFromRecord',
        'isCoreSkill',
        'isSemver',
        'languageModuleSchema',
        'levelFrameworkSchema',
        'localeTagSchema',
        'manifestSchema',
        'parseVersion',
        'satisfies',
        'validateLanguageModule',
      ].sort(),
    );
  });

  it('testing entry exports the contract helpers', async () => {
    const mod = await import('../src/testing/index.ts');
    expect(Object.keys(mod).sort()).toEqual(['CONTRACT_CHECKS', 'checkLanguageModule', 'runLanguageModuleContract']);
  });
});
