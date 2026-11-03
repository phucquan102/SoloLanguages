import { describe, expect, it } from 'vitest';
import type { Messages } from '@solo/language-sdk';
import language from '../../src/index.ts';
import pack from '../../src/content/index.ts';

const messages: Messages = await language.i18n!['vi']!();
const keys = Object.keys(messages);

describe('Vietnamese module messages', () => {
  it('have a label for every declared skill, course, framework and level', () => {
    for (const skill of language.skills) expect(messages, `skill.${skill.id}`).toHaveProperty([`skill.${skill.id}`]);
    for (const course of language.courses) expect(messages, `course.${course.code}`).toHaveProperty([`course.${course.code}`]);
    for (const framework of language.levelFrameworks) {
      expect(messages, `framework.${framework.code}`).toHaveProperty([`framework.${framework.code}`]);
      for (const level of framework.levels) {
        expect(messages, `level.${framework.code}.${level.code}`).toHaveProperty([`level.${framework.code}.${level.code}`]);
      }
    }
  });

  it('hold module UI strings only, under the agreed key namespaces', () => {
    expect(keys.filter((key) => !/^(skill\.|course\.|framework\.|level\.|feature\.[a-z0-9-]+\.)/u.test(key))).toEqual([]);
    for (const key of keys) expect(messages[key]!.trim(), key).toBe(messages[key]);
    for (const key of keys) expect(messages[key]!.length, key).toBeGreaterThan(0);
  });

  it('declare each key exactly once for what the module declares', () => {
    const declared = [
      ...language.skills.map((skill) => `skill.${skill.id}`),
      ...language.courses.map((course) => `course.${course.code}`),
      ...language.levelFrameworks.flatMap((framework) => [
        `framework.${framework.code}`, ...framework.levels.map((level) => `level.${framework.code}.${level.code}`),
      ]),
    ];
    expect([...keys].sort()).toEqual([...declared].sort());
  });

  it('do not repeat content labels, which live in the content pack', () => {
    expect(keys.filter((key) => /^(stage|quest|placement|roadmap|language)\./u.test(key))).toEqual([]);
    for (const stage of pack.stages) expect(messages, stage.id).not.toHaveProperty([`stage.${stage.id}`]);
  });

  it('use the mockup wording for skills, course, framework and levels', () => {
    expect(messages).toEqual({
      'skill.vocabulary': 'Từ vựng',
      'skill.grammar': 'Ngữ pháp',
      'skill.reading': 'Đọc',
      'skill.listening': 'Nghe',
      'skill.speaking': 'Nói',
      'skill.writing': 'Chữ viết',
      'skill.zh:pinyin': 'Pinyin',
      'skill.zh:tones': 'Thanh điệu',
      'skill.zh:characters': 'Chữ Hán',
      'skill.zh:radicals': 'Bộ thủ',
      'skill.zh:stroke-order': 'Thứ tự nét',
      'skill.zh:translation': 'Dịch',
      'course.hsk': 'Khóa HSK',
      'framework.hsk-3.0': 'HSK 3.0',
      'level.hsk-3.0.HSK1': 'HSK 1',
      'level.hsk-3.0.HSK2': 'HSK 2',
      'level.hsk-3.0.HSK3': 'HSK 3',
      'level.hsk-3.0.HSK4': 'HSK 4',
      'level.hsk-3.0.HSK5': 'HSK 5',
      'level.hsk-3.0.HSK6': 'HSK 6',
      'level.hsk-3.0.HSK7-9': 'HSK 7–9',
    });
  });
});
