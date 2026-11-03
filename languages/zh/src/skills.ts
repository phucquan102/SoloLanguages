import type { Skill } from '@solo/language-sdk';

export const skills = [
  { id: 'vocabulary' }, { id: 'grammar' }, { id: 'reading' },
  { id: 'listening' }, { id: 'speaking' }, { id: 'writing' },
  { id: 'zh:pinyin' }, { id: 'zh:tones' }, { id: 'zh:characters' },
  { id: 'zh:radicals' }, { id: 'zh:stroke-order' }, { id: 'zh:translation' },
] as const satisfies readonly Skill[];
