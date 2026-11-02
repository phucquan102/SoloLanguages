import { CUSTOM_SKILL_PATTERN, isCoreSkill } from './skills.ts';
import type { LanguageModule, LevelFramework } from './types.ts';

export type IssuePath = (string | number)[];

export interface ValidationIssue {
  readonly path: IssuePath;
  readonly message: string;
}

function duplicates<T>(items: readonly T[], key: (item: T) => string): [index: number, value: string][] {
  const seen = new Set<string>();
  const out: [number, string][] = [];
  items.forEach((item, i) => {
    const k = key(item);
    if (seen.has(k)) out.push([i, k]);
    seen.add(k);
  });
  return out;
}

function validateFramework(fw: LevelFramework, base: IssuePath, issues: ValidationIssue[]): void {
  for (const [i, code] of duplicates(fw.levels, (l) => l.code)) {
    issues.push({ path: [...base, 'levels', i, 'code'], message: `Duplicate level code "${code}"` });
  }
  fw.levels.forEach((level, i) => {
    const path = [...base, 'levels', i];
    const prev = fw.levels[i - 1];
    if (prev && level.order <= prev.order) issues.push({ path: [...path, 'order'], message: 'Level order must be strictly increasing' });
    const { minScore, maxScore } = level;
    if (fw.kind === 'ordinal') {
      if (minScore !== undefined || maxScore !== undefined) issues.push({ path, message: 'Ordinal levels must not define minScore/maxScore' });
      return;
    }
    if (minScore === undefined || maxScore === undefined) {
      issues.push({ path, message: 'Band levels require minScore and maxScore' });
      return;
    }
    if (minScore > maxScore) issues.push({ path, message: 'minScore must be <= maxScore' });
    if (prev?.maxScore !== undefined && minScore <= prev.maxScore) {
      issues.push({ path: [...path, 'minScore'], message: 'Band ranges must be ascending and non-overlapping' });
    }
  });
}

/** Cross-reference and invariant checks for a schema-valid module. Returns [] when valid. */
export function validateLanguageModule(mod: LanguageModule): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const frameworks = new Map<string, LevelFramework>();
  for (const fw of mod.levelFrameworks) if (!frameworks.has(fw.code)) frameworks.set(fw.code, fw);

  for (const [i, code] of duplicates(mod.levelFrameworks, (fw) => fw.code)) {
    issues.push({ path: ['levelFrameworks', i, 'code'], message: `Duplicate framework code "${code}"` });
  }
  mod.levelFrameworks.forEach((fw, i) => validateFramework(fw, ['levelFrameworks', i], issues));

  for (const [i, code] of duplicates(mod.courses, (c) => c.code)) {
    issues.push({ path: ['courses', i, 'code'], message: `Duplicate course code "${code}"` });
  }
  mod.courses.forEach((course, i) => {
    const fw = frameworks.get(course.framework);
    if (!fw) {
      issues.push({ path: ['courses', i, 'framework'], message: `Unknown framework "${course.framework}"` });
      return;
    }
    const orders = new Map(fw.levels.map((l) => [l.code, l.order]));
    let last = -Infinity;
    course.levels.forEach((code, j) => {
      const order = orders.get(code);
      if (order === undefined) {
        issues.push({ path: ['courses', i, 'levels', j], message: `Unknown level "${code}" in framework "${fw.code}"` });
      } else if (order <= last) {
        issues.push({ path: ['courses', i, 'levels', j], message: 'Course levels must be unique and ascending' });
      } else {
        last = order;
      }
    });
  });

  for (const [i, id] of duplicates(mod.skills, (s) => s.id)) {
    issues.push({ path: ['skills', i, 'id'], message: `Duplicate skill "${id}"` });
  }
  mod.skills.forEach((skill, i) => {
    if (isCoreSkill(skill.id)) return;
    const m = CUSTOM_SKILL_PATTERN.exec(skill.id);
    if (!m || m[1] !== mod.manifest.code) {
      issues.push({ path: ['skills', i, 'id'], message: `Skill "${skill.id}" is neither a core skill nor "${mod.manifest.code}:<id>"` });
    }
  });

  const placement = mod.placement;
  if (placement) {
    const course = mod.courses.find((c) => c.code === placement.course);
    if (!course) {
      issues.push({ path: ['placement', 'course'], message: `Unknown course "${placement.course}"` });
    } else {
      placement.levels.forEach((code, i) => {
        if (!course.levels.includes(code)) issues.push({ path: ['placement', 'levels', i], message: `Level "${code}" is not in course "${course.code}"` });
      });
    }
  }

  return issues;
}
