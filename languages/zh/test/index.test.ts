import { describe, expect, it } from 'vitest';
import language from '../src/index.ts';

// Expected values are written out, not derived from the source declarations.
describe('Chinese language module declaration', () => {
  it('declares the manifest', () => {
    expect(language.sdk).toBe('^0.1.0');
    expect(language.manifest).toEqual({
      code: 'zh',
      bcp47: 'zh-Hans',
      nativeName: '中文',
      glyph: '中',
      names: { vi: 'Tiếng Trung' },
      scripts: ['Hani', 'Latn'],
      direction: 'ltr',
      version: '0.1.0',
    });
  });

  it('declares the core skills and the Chinese skills', () => {
    expect(language.skills.map((skill) => skill.id)).toEqual([
      'vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing',
      'zh:pinyin', 'zh:tones', 'zh:characters', 'zh:radicals', 'zh:stroke-order', 'zh:translation',
    ]);
  });

  it('declares the HSK 3.0 level framework as an ordinal certification without scores', () => {
    expect(language.levelFrameworks).toEqual([{
      code: 'hsk-3.0',
      kind: 'ordinal',
      certification: true,
      levels: [
        { code: 'HSK1', order: 1 }, { code: 'HSK2', order: 2 }, { code: 'HSK3', order: 3 }, { code: 'HSK4', order: 4 },
        { code: 'HSK5', order: 5 }, { code: 'HSK6', order: 6 }, { code: 'HSK7-9', order: 7 },
      ],
    }]);
  });

  it('requires pinyin on vocabulary and allows pinyin for the example sentence', () => {
    expect(language.vocabFields).toEqual([{ id: 'pinyin', required: true }, { id: 'examplePinyin' }]);
  });

  it('uses mainland Mandarin speech', () => {
    expect(language.speech).toEqual({ tags: ['zh-CN'] });
  });

  it('places learners into the HSK course at the levels the mockup recommends', () => {
    expect(language.placement).toEqual({ course: 'hsk', levels: ['HSK1', 'HSK2', 'HSK4', 'HSK5'] });
    const course = language.courses.find((item) => item.code === language.placement!.course)!;
    for (const level of language.placement!.levels) expect(course.levels).toContain(level);
  });

  it('provides lazy content and Vietnamese messages only', () => {
    expect(typeof language.content).toBe('function');
    expect(Object.keys(language.i18n!)).toEqual(['vi']);
  });
});
