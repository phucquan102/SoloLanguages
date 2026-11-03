import type { Skill } from '@solo/language-sdk';

export const skills = [
  { id: 'vocabulary' }, { id: 'grammar' }, { id: 'reading' },
  { id: 'listening' }, { id: 'speaking' }, { id: 'writing' },
  { id: 'en:pronunciation' },
] satisfies readonly Skill[];
