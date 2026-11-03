import type { CurriculumChoice, CurriculumOptions } from '@solo/content-schema/testing';
import type { ContentPack } from '@solo/content-schema';
import { answerKeyFor, plainKey } from '../grading.ts';
import { pinyinBaseKey, pinyinKey } from '../pinyin.ts';
import { compareAnswer, normalize } from '../text-tools.ts';
import { answerModeSchema } from './extension-schemas.ts';
import { hskVocabManifest } from './manifest/hsk.ts';

/** Editorial workflow markers belong to this module, never to shared schema source. */
export const vietnameseMetaMarkers = [
  'Giả thuyết', 'sẽ được bổ sung', 'sẽ bổ sung', 'giáo viên xác nhận', 'Cần giáo viên',
  'giáo viên nghe và chỉnh trực tiếp', 'khoảng cách ôn sẽ tăng', 'cần người bản ngữ',
  'bản ngữ duyệt', 'chờ duyệt', 'chưa được duyệt', 'chưa kiểm chứng', 'cần kiểm chứng',
  'bản nháp', 'đang soạn', 'ai-draft', 'AI draft', 'Unverified', 'TODO',
] as const;

const idsByHanzi = new Map<string, string[]>();
for (const row of hskVocabManifest) idsByHanzi.set(row.hanzi, [...idsByHanzi.get(row.hanzi) ?? [], row.id]);
const longest = Math.max(...[...idsByHanzi.keys()].map((hanzi) => [...hanzi].length));

/**
 * Manifest vocabulary read in a text, by longest match over hanzi (Chinese has no word spaces), so 你好 is
 * one word and not 你 + 好. Pinyin and Vietnamese options never name vocabulary: a bare syllable such as shì
 * is a sound unit in the pronunciation lessons, not a taught word.
 */
export function vocabIdsInText(text: string): string[] {
  const chars = [...text.normalize('NFKC')];
  const found = new Set<string>();
  for (let at = 0; at < chars.length;) {
    let length = Math.min(longest, chars.length - at);
    for (; length > 0; length--) {
      const ids = idsByHanzi.get(chars.slice(at, at + length).join(''));
      if (ids !== undefined) { ids.forEach((id) => found.add(id)); break; }
    }
    at += Math.max(length, 1);
  }
  return [...found];
}

/** Schema v1 options are text; plain-string options are target-language text, localized ones are Vietnamese. */
export function optionVocabIds(question: CurriculumChoice, index: number): string[] {
  const option = question.options[index];
  return typeof option === 'string' ? vocabIdsInText(option) : [];
}

const hasTone = (text: string): boolean => /[̄́̌̀\d]/u.test(text.normalize('NFD'));

/** Canonical surface of a choice answer; pinyin with tones, pinyin letters, or folded text. */
function choiceKey(text: string): string {
  if (hasTone(text)) return pinyinKey(text) ?? plainKey(text);
  return pinyinBaseKey(text) ?? plainKey(text);
}

/** Canonical answer key: typed answers go through their answer mode, choice answers through their text. */
export function answerKey(question: Parameters<NonNullable<CurriculumOptions['answerKey']>>[0]): string {
  if (question.kind === 'typed') {
    const text = question.acceptedAnswers[0]!;
    const mode = answerModeSchema.safeParse(question.extensions?.['zh:answer-mode']);
    return (mode.success ? answerKeyFor(mode.data, text) : undefined) ?? plainKey(text);
  }
  const answer = question.options[question.correctIndex]!;
  const text = typeof answer === 'string' ? answer : Object.values(answer)[0]!;
  return choiceKey(text);
}

/** Course membership automatically brings newly authored hsk stages into scope. */
export function zhCurriculumOptions(pack: ContentPack): CurriculumOptions {
  return {
    normalize, compareAnswer, nativeLocales: ['vi'], answerKey,
    scopeStageIds: pack.stages.filter(({ courseCode }) => courseCode === 'hsk').map(({ id }) => id),
    // Remove once the hsk course schedule is complete (N1 and HSK1 units): late vocabulary then needs
    // two recycles within 14 days, which later units supply.
    truncateAtScheduleEnd: true,
    testNovelty: true, taughtVocabulary: true, forbiddenPhrases: vietnameseMetaMarkers,
    optionParity: true, optionVocabIds,
  };
}
