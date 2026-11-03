import type { ContentPack } from '@solo/content-schema';
import stages from './stages.ts';
import { vocab } from './vocab.ts';
import { lessons } from './lessons.ts';
import { quests } from './quests.ts';
import placement from './placement.ts';
import { assessments } from './assessments.ts';
import tones from './tones.ts';
import characters from './characters.ts';
import roadmap from './roadmap.ts';
import placementRouting from './placement-routing.ts';
import toneExercises from './tone-exercises.ts';
import * as foundation from './foundation/index.ts';
import * as hsk1 from './hsk1/index.ts';

const pack = {
  schemaVersion: 1, language: 'zh', stages, vocab, lessons, quests,
  units: [...foundation.units, ...hsk1.units],
  days: [...foundation.days, ...hsk1.days],
  tests: [...foundation.tests, ...hsk1.tests],
  placement, assessments,
  // Pack-level datasets only; data describing one record is stored in that record's own extensions.
  extensions: {
    'zh:tones': tones,
    'zh:characters': characters,
    'zh:roadmap': roadmap,
    'zh:placement-routing': placementRouting,
    'zh:tone-exercises': toneExercises,
  },
} satisfies ContentPack;

export default pack;
