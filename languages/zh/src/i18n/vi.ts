import type { Messages } from '@solo/language-sdk';

// Module UI strings only. Content labels (stages, quests, placement categories, ...) live in the content pack.
// Skill, course, framework and level labels are taken from the mockup wording: quest skill labels in language.js,
// the five skill names in language.js, the HSK 3.0 skills and column names in hsk-roadmap.js.
const messages = {
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
} as const satisfies Messages;

export default messages;
