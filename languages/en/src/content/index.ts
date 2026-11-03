import type { ContentPack } from '@solo/content-schema';
import { stages } from './stages.ts';
import { vocab } from './vocab.ts';
import { lessons } from './lessons.ts';
import { quests } from './quests.ts';
import { placementQuestions } from './placement.ts';
import { assessments } from './assessments.ts';
import { onboarding } from './onboarding.ts';
import * as general from './general/index.ts';
import * as ielts from './ielts/index.ts';

const pack: ContentPack = {
  schemaVersion: 1,
  language: 'en',
  stages,
  vocab,
  lessons,
  quests,
  units: [...general.units, ...ielts.units],
  days: [...general.days, ...ielts.days],
  tests: [...general.tests, ...ielts.tests],
  placement: placementQuestions,
  assessments,
  extensions: { 'en:onboarding': onboarding },
};

export default pack;
