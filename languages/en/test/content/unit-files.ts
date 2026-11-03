import type { UnitContent } from '../../src/content/unit-content.ts';
import * as f1 from '../../src/content/general/f1.ts';
import * as f2 from '../../src/content/general/f2.ts';
import * as a1u1 from '../../src/content/general/a1-u1.ts';
import * as a1u2 from '../../src/content/general/a1-u2.ts';
import * as a1u3 from '../../src/content/general/a1-u3.ts';
import * as a1u4 from '../../src/content/general/a1-u4.ts';
import * as i1 from '../../src/content/ielts/i1.ts';
import * as i2 from '../../src/content/ielts/i2.ts';
import * as i3 from '../../src/content/ielts/i3.ts';
import * as i4 from '../../src/content/ielts/i4.ts';

interface ScheduleDay {
  readonly day: number;
  readonly mainLessons: Readonly<Record<string, string>>;
  readonly sideQuests: readonly { readonly slug: string }[];
  readonly test: { readonly slug: string; readonly kind: string };
}
interface UnitModule {
  readonly default: UnitContent;
  readonly schedule?: readonly ScheduleDay[];
}

// Include every unit, including stubs, so authoring a unit needs no test edits.
const modules: readonly UnitModule[] = [f1, f2, a1u1, a1u2, a1u3, a1u4, i1, i2, i3, i4];
export const unitFiles = modules.map((module) => ({
  content: module.default,
  schedule: module.schedule ?? [],
  file: `languages/en/src/content/${module.default.unit.id.startsWith('en:unit:i') ? 'ielts' : 'general'}/${module.default.unit.id.replace('en:unit:', '')}.ts`,
}));
export const authoredUnits = unitFiles.filter(({ content }) => content.lessons.length > 0);
