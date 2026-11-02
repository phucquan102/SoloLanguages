export const CORE_SKILLS = ['vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing'] as const;

export type CoreSkillId = (typeof CORE_SKILLS)[number];

/** Custom skills are namespaced by language code: `<code>:<id>`. */
export type CustomSkillId = `${string}:${string}`;

export type SkillId = CoreSkillId | CustomSkillId;

export const CUSTOM_SKILL_PATTERN = /^([a-z]{2,3}):([a-z0-9][a-z0-9-]*)$/;

export function isCoreSkill(id: string): id is CoreSkillId {
  return (CORE_SKILLS as readonly string[]).includes(id);
}
