import type { CurriculumChoice, CurriculumOptions } from '@solo/content-schema/testing';
import type { ContentPack } from '@solo/content-schema';
import { phoneDigits, spellingLetters } from '../grading.ts';
import { compareAnswer, normalize } from '../text-tools.ts';
import { generalVocabManifest } from './manifest/general.ts';

/** Editorial workflow markers belong to this module, never to shared schema source. */
export const vietnameseMetaMarkers = [
  'Giả thuyết', 'sẽ được bổ sung', 'giáo viên xác nhận', 'Cần giáo viên',
  'giáo viên nghe và chỉnh trực tiếp', 'khoảng cách ôn sẽ tăng',
] as const;

/** Schema v1 options are text; infer manifest ids in EVERY option.
 * Single letters are alphabet symbols. `to` in Nice to meet you is a taught
 * formula part, distinct from the later time/direction sense of that headword.
 * Modules with option metadata can return those ids from their extensions.
 */
export function optionVocabIds(question: CurriculumChoice, index: number): string[] {
  const option = question.options[index];
  if (typeof option !== 'string') return [];
  const text = normalize(option);
  if (/^[a-z](?:[\s,./\-–—]+[a-z])*[.!?]?$/u.test(text)) return [];
  const lexical = text.replace(/\bnice to meet you\b/gu, 'nice meet you');
  return generalVocabManifest.filter(({ headword, americanVariant }) =>
    [headword, americanVariant].some((word) => {
      if (!word) return false;
      const escaped = normalize(word).replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'u').test(lexical);
    })).map(({ id }) => id);
}

/** Course membership automatically brings newly authored general stages into scope. */
export function generalCurriculumOptions(pack: ContentPack): CurriculumOptions {
  return {
    normalize, compareAnswer, nativeLocales: ['vi'],
    answerKey: (question) => {
      const answer = question.kind === 'typed' ? question.acceptedAnswers[0]! : question.options[question.correctIndex]!;
      const text = typeof answer === 'string' ? answer : Object.values(answer)[0]!;
      const mode = question.extensions?.['en:answer-mode'];
      if (mode === 'phone') return phoneDigits(text) ?? normalize(text);
      if (mode === 'spelling') return spellingLetters(text) ?? normalize(text);
      return normalize(text.replace(/[\p{P}\p{S}]+/gu, ' ')).replace(/\s+/gu, ' ').trim();
    },
    scopeStageIds: pack.stages.filter(({ courseCode }) => courseCode === 'general').map(({ id }) => id),
    // Remove once the general course schedule is complete.
    truncateAtScheduleEnd: true,
    testNovelty: true, taughtVocabulary: true, forbiddenPhrases: vietnameseMetaMarkers,
    optionParity: true, optionVocabIds,
  };
}
