import { describe, expect, it } from 'vitest';
import language from '../../src/index.ts';
import content from '../../src/content/index.ts';
import messages from '../../src/i18n/vi.ts';

const keys = Object.keys(messages);
const frameworks = language.levelFrameworks;

describe('English Vietnamese messages', () => {
  it('resolves through the lazy loader to the same flat object of non-empty strings', async () => {
    expect(await language.i18n!['vi']!()).toEqual(messages);
    expect(Object.values(messages).every((value) => typeof value === 'string' && value.length > 0)).toBe(true);
  });
  it.each(language.skills.map(({ id }) => id))('names skill %s', (id) => {
    expect(messages).toHaveProperty([`skill.${id}`]);
  });
  it.each(language.courses.map(({ code }) => code))('names course %s', (code) => {
    expect(messages).toHaveProperty([`course.${code}`]);
  });
  it.each(frameworks.map(({ code }) => code))('names framework %s', (code) => {
    expect(messages).toHaveProperty([`framework.${code}`]);
  });
  it.each(frameworks.flatMap(({ code, levels }) => levels.map((level) => [code, level.code] as const)))(
    'names level %s %s', (framework, level) => {
      expect(messages).toHaveProperty([`level.${framework}.${level}`]);
    },
  );
  it('has no key for anything the module does not declare', () => {
    const declared = new Set([
      ...language.skills.map(({ id }) => `skill.${id}`),
      ...language.courses.map(({ code }) => `course.${code}`),
      ...frameworks.map(({ code }) => `framework.${code}`),
      ...frameworks.flatMap(({ code, levels }) => levels.map((level) => `level.${code}.${level.code}`)),
    ]);
    // Feature strings are namespaced feature.<name>.*; no feature ships UI strings yet.
    expect(keys.filter((key) => !declared.has(key) && !/^feature\.[a-z0-9-]+\./.test(key))).toEqual([]);
  });
  it('does not duplicate content labels, which live only in the content pack', () => {
    const labels = new Set<string>([
      ...content.stages.flatMap(({ labels: text }) => Object.values(text)),
      ...content.quests.flatMap(({ titles }) => Object.values(titles)),
    ]);
    expect(keys.filter((key) => /^(stage|onboarding|quest)\./.test(key))).toEqual([]);
    expect(Object.values(messages).filter((value) => labels.has(value))).toEqual([]);
  });
});
