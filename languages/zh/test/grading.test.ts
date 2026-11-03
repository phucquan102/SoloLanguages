import { describe, expect, it } from 'vitest';
import type { Question } from '@solo/content-schema';
import language, { gradeAnswer } from '../src/index.ts';
import type { AnswerMode } from '../src/grading.ts';
import { hanziKey, toneNumberKey } from '../src/grading.ts';
import { markSyllable, parsePinyin, pinyinBaseKey, pinyinForms, pinyinKey } from '../src/pinyin.ts';
import { compareAnswer } from '../src/text-tools.ts';
import { lessons } from '../src/content/foundation/n1.ts';
import { hskVocabManifest } from '../src/content/manifest/hsk.ts';

const provenance = lessons[0]!.provenance;
const typed = (answers: string[], mode?: AnswerMode): Question => ({
  id: 'zh:question:probe', kind: 'typed', prompt: { vi: 'Câu thử.' }, acceptedAnswers: answers, provenance,
  ...(mode ? { extensions: { 'zh:answer-mode': mode } } : {}),
});
const grade = (input: unknown, answers: string[], mode?: AnswerMode) => gradeAnswer(input, typed(answers, mode)).correct;

describe('module grading API', () => {
  it('is exported from the module entry point', () => {
    expect(typeof gradeAnswer).toBe('function');
    expect(language.manifest.code).toBe('zh');
  });
  it('grades choice questions by numeric option index only', () => {
    const choice = lessons[0]!.questions[0]!;
    if (choice.kind !== 'choice') throw new Error('Fixture needs a choice');
    expect(gradeAnswer(choice.correctIndex, choice)).toEqual({ correct: true, score: 1 });
    expect(gradeAnswer(String(choice.correctIndex), choice).correct).toBe(false);
    expect(gradeAnswer((choice.correctIndex + 1) % choice.options.length, choice).correct).toBe(false);
  });
  it('fails closed for unknown modes and non-text typed input, and uses the plain comparison without a mode', () => {
    expect(grade('nǐ hǎo', ['nǐ hǎo'], 'pinyin-v2' as AnswerMode)).toBe(false);
    for (const input of [null, undefined, 3, {}, []]) expect(grade(input, ['nǐ hǎo'], 'pinyin')).toBe(false);
    expect(grade('NǏ HǍO', ['nǐ hǎo'])).toBe(true);
    expect(grade('ni3 hao3', ['nǐ hǎo'])).toBe(false);
  });
});

describe('pinyin mode (citation form)', () => {
  it.each(['ni3 hao3', 'nǐhǎo', 'nǐ hǎo', 'NI3HAO3', 'ni3hao3', 'Nǐ Hǎo.', 'nǐ  hǎo'])('accepts %s for nǐ hǎo', (input) => {
    expect(grade(input, ['nǐ hǎo'], 'pinyin')).toBe(true);
  });
  it.each(['nihao', 'ni hao', 'ni3 hao', 'ni2 hao3', 'nǐ hǎ', 'nì hǎo', 'ni3 hao4', ''])('rejects %j for nǐ hǎo', (input) => {
    expect(grade(input, ['nǐ hǎo'], 'pinyin')).toBe(false);
  });
  it('treats ü, v and u: as one letter while keeping u and ü apart', () => {
    for (const input of ['lv4', 'lǜ', 'lü4', 'lu:4', 'LV4']) expect(grade(input, ['lǜ'], 'pinyin')).toBe(true);
    for (const input of ['lu4', 'lù', 'lü3', 'lv3', 'lü']) expect(grade(input, ['lǜ'], 'pinyin')).toBe(false);
    expect(grade('nv3', ['nǚ'], 'pinyin')).toBe(true);
    expect(grade('nu3', ['nǚ'], 'pinyin')).toBe(false);
    expect(grade('nǔ', ['nǚ'], 'pinyin')).toBe(false);
    expect(grade('lve4', ['lüè'], 'pinyin')).toBe(true);
    expect(grade('lue4', ['lüè'], 'pinyin')).toBe(false);
    // After j, q, x, y the letter ü is spelled u, so ü/v typed there is the same answer.
    for (const input of ['qù', 'qu4', 'qü4', 'qv4', 'qu:4']) expect(grade(input, ['qù'], 'pinyin')).toBe(true);
  });
  it('reads syllable spacing flexibly, with the neutral tone as 0, 5 or no mark on the light syllable only', () => {
    for (const input of ['xièxie', 'xie4 xie5', 'xie4 xie0', 'xie4xie5', 'xie4 xie', 'xiè xie']) expect(grade(input, ['xièxie'], 'pinyin')).toBe(true);
    for (const input of ['xie xie', 'xièxiè', 'xie4 xie4', 'xie5 xie4', 'xiexie5']) expect(grade(input, ['xièxie'], 'pinyin')).toBe(false);
    expect(grade('dui4 bu5 qi3', ['duìbuqǐ'], 'pinyin')).toBe(true);
    expect(grade('duì bù qǐ', ['duìbuqǐ'], 'pinyin')).toBe(false);
  });
  it('keeps the apostrophe meaningful and accepts curly apostrophes', () => {
    expect(grade("xī'ān", ["xī'ān"], 'pinyin')).toBe(true);
    expect(grade('xī’ān', ["xī'ān"], 'pinyin')).toBe(true);
    expect(grade('xi1an1', ["xī'ān"], 'pinyin')).toBe(true);
    expect(grade('xiān', ["xī'ān"], 'pinyin')).toBe(false);
    expect(grade("xī'ān", ['xiān'], 'pinyin')).toBe(false);
    expect(pinyinKey("xī'ān")).toBe('xi1 an1');
    expect(pinyinKey('xiān')).toBe('xian1');
  });
  it('requires tone marks on the vowel the spelling rules choose', () => {
    for (const wrong of ['lìu', 'gùi', 'liǜ']) expect(pinyinKey(wrong), wrong).toBeUndefined();
    expect(pinyinKey('liù')).toBe('liu4');
    expect(pinyinKey('guì')).toBe('gui4');
    expect(pinyinKey('shuǐ')).toBe('shui3');
    expect(pinyinKey('xiě')).toBe('xie3');
    expect(pinyinKey('lüè')).toBe('lüe4');
    expect(pinyinKey('hǎo')).toBe('hao3');
    expect(pinyinKey('zhōng')).toBe('zhong1');
    expect(pinyinKey('gǒu')).toBe('gou3');
    expect(grade('lìu', ['liù'], 'pinyin')).toBe(false);
  });
  it('rejects invalid syllables, two tones on one syllable, stray characters and empty input', () => {
    for (const input of ['bong3', 'jü3x', 'ni33', 'nǐ3', 'x', '你好', '??', '  ', 'a b c d e f g']) {
      expect(pinyinKey(input), input).toBeUndefined();
    }
  });
  it('uses one canonical form for equal answers and different forms for different tones', () => {
    expect(pinyinKey('Ni3Hao3')).toBe(pinyinKey('nǐhǎo'));
    expect(pinyinKey('mā')).not.toBe(pinyinKey('má'));
    expect(pinyinKey('ma')).toBe('ma0');
    expect(pinyinKey('ma5')).toBe('ma0');
    expect(markSyllable('liu', 4)).toBe('liù');
    expect(markSyllable('lü', 4)).toBe('lǜ');
    expect(markSyllable('gou', 3)).toBe('gǒu');
  });
  it('builds stored answer forms that stay valid for text-only comparators', () => {
    const forms = pinyinForms('xièxie');
    expect(forms).toEqual(expect.arrayContaining(['xièxie', 'xie4 xie5', 'xie4 xie0', 'xie4xie5']));
    for (const form of forms) expect(grade(form, forms, 'pinyin')).toBe(true);
    for (const form of forms) expect(compareAnswer(form, forms).correct).toBe(true);
    expect(() => pinyinForms('nihao.3.x')).toThrow();
  });
});

describe('pinyin-sandhi mode ("ghi thanh khi đọc")', () => {
  it('accepts the pronounced form in every notation and rejects the citation form', () => {
    for (const input of ['ní hǎo', 'ni2 hao3', 'níhǎo', 'ni2hao3']) expect(grade(input, ['ní hǎo'], 'pinyin-sandhi')).toBe(true);
    for (const input of ['nǐ hǎo', 'ni3 hao3', 'ni hao']) expect(grade(input, ['ní hǎo'], 'pinyin-sandhi')).toBe(false);
    for (const input of ['bú shì', 'bu2 shi4', 'búshì']) expect(grade(input, ['bú shì'], 'pinyin-sandhi')).toBe(true);
    expect(grade('bù shì', ['bú shì'], 'pinyin-sandhi')).toBe(false);
  });
  it('does not accept a sandhi form where the citation form is asked, and the reverse', () => {
    expect(grade('ní hǎo', ['nǐ hǎo'], 'pinyin')).toBe(false);
    expect(grade('bú shì', ['bù shì'], 'pinyin')).toBe(false);
    expect(grade('yí gè', ['yī gè'], 'pinyin')).toBe(false);
    expect(grade('yī gè', ['yī gè'], 'pinyin')).toBe(true);
    expect(grade('yi1 ge4', ['yī gè'], 'pinyin')).toBe(true);
  });
  it('lets one question list several sandhi renderings explicitly when the course teaches them', () => {
    const answers = ['yì qǐ', 'yìqǐ'];
    expect(grade('yi4 qi3', answers, 'pinyin-sandhi')).toBe(true);
    expect(grade('yī qǐ', answers, 'pinyin-sandhi')).toBe(false);
  });
});

describe('pinyin-toneless mode', () => {
  it('ignores marks and numbers but keeps letters, ü and syllable boundaries', () => {
    for (const input of ['nü', 'nv', 'nu:', 'nǚ', 'nv3', 'NÜ']) expect(grade(input, ['nü'], 'pinyin-toneless')).toBe(true);
    for (const input of ['nu', 'ni', 'nüe', '']) expect(grade(input, ['nü'], 'pinyin-toneless')).toBe(false);
    expect(grade('ni hao', ['nǐ hǎo'], 'pinyin-toneless')).toBe(true);
    expect(grade('nihao', ['nǐ hǎo'], 'pinyin-toneless')).toBe(true);
    expect(grade("xi'an", ["xī'ān"], 'pinyin-toneless')).toBe(true);
    expect(grade('xian', ["xi'an"], 'pinyin-toneless')).toBe(false);
  });
  it('accepts a bare final only in toneless mode', () => {
    expect(grade('ü', ['ü'], 'pinyin-toneless')).toBe(true);
    expect(grade('i', ['i'], 'pinyin-toneless')).toBe(true);
    expect(pinyinBaseKey('u')).toBe('u');
    expect(pinyinKey('ü')).toBeUndefined();
    expect(parsePinyin('i')).toBeUndefined();
  });
  it('is not a fallback for tone questions: a toneless answer fails in pinyin mode', () => {
    expect(grade('ma', ['má'], 'pinyin')).toBe(false);
    expect(grade('ma', ['má'], 'pinyin-toneless')).toBe(true);
  });
});

describe('hanzi mode', () => {
  it('accepts the simplified answer with optional full-width or half-width punctuation', () => {
    for (const input of ['你好', '你好。', '你好！', '你好.', '你好!', '你好？', ' 你 好 ', '你好 。']) expect(grade(input, ['你好'], 'hanzi')).toBe(true);
    expect(grade('你好', ['你好。'], 'hanzi')).toBe(true);
    expect(grade('你好，老师', ['你好老师'], 'hanzi')).toBe(true);
    expect(grade('你好,老师！', ['你好，老师。'], 'hanzi')).toBe(true);
    expect(grade('谢谢。', ['谢谢'], 'hanzi')).toBe(true);
  });
  it('rejects traditional characters, pinyin, other words and empty input', () => {
    for (const input of ['謝謝', '谢謝', 'xièxie', '谢', '你好吗', '。', '']) expect(grade(input, ['谢谢'], 'hanzi')).toBe(false);
    expect(grade('學', ['学'], 'hanzi')).toBe(false);
    expect(grade('學生', ['学生'], 'hanzi')).toBe(false);
    expect(grade('再見', ['再见'], 'hanzi')).toBe(false);
    expect(grade('国', ['国'], 'hanzi')).toBe(true);
    expect(grade('人', ['人'], 'hanzi')).toBe(true);
  });
  it('does not turn 。 into . by NFKC alone, and keeps keys comparable', () => {
    expect('你好。'.normalize('NFKC')).toBe('你好。');
    expect(hanziKey('你好。')).toBe(hanziKey('你好.'));
    expect(hanziKey('')).toBeUndefined();
    expect(hanziKey(3)).toBeUndefined();
  });
});

describe('tone-number mode', () => {
  it('accepts one digit, reading 5 as the neutral tone 0', () => {
    for (const input of ['3', ' 3 ', '３', '3.']) expect(grade(input, ['3'], 'tone-number')).toBe(true);
    for (const input of ['0', '5', '０']) expect(grade(input, ['0'], 'tone-number')).toBe(true);
    for (const input of ['5', '0']) expect(grade(input, ['5'], 'tone-number')).toBe(true);
  });
  it('rejects other digits, words, several digits and marks', () => {
    for (const input of ['2', '4', '33', '6', '-1', 'ba', 'thanh 3', 'ˇ', '', '3 3']) expect(grade(input, ['3'], 'tone-number')).toBe(false);
    expect(toneNumberKey('7')).toBeUndefined();
    expect(toneNumberKey('5')).toBe('0');
  });
});

describe('authored questions through the real grader', () => {
  const all = [...lessons.flatMap(({ questions }) => questions)];
  it('grades every authored typed answer in n1 correct, and rejects every other tone of a one-syllable answer', () => {
    for (const question of all) {
      if (question.kind !== 'typed' || question.extensions?.['zh:answer-mode'] !== 'pinyin') continue;
      const syllables = parsePinyin(question.acceptedAnswers[0]);
      if (syllables === undefined || syllables.length !== 1 || syllables[0]!.tone === 0) continue;
      const { base, tone } = syllables[0]!;
      for (const other of [1, 2, 3, 4] as const) {
        if (other === tone) continue;
        expect(gradeAnswer(markSyllable(base, other), question).correct, `${question.id}: ${markSyllable(base, other)}`).toBe(false);
        expect(gradeAnswer(`${base}${other}`, question).correct).toBe(false);
      }
      expect(gradeAnswer(base, question).correct).toBe(false);
    }
  });
  it('knows every manifest pinyin as valid, with its numbered form as the same answer', () => {
    for (const row of hskVocabManifest) {
      expect(pinyinKey(row.pinyin), row.id).toBeDefined();
      expect(pinyinKey(row.pinyinNumbered), row.id).toBe(pinyinKey(row.pinyin));
      expect(grade(row.pinyinNumbered, [row.pinyin], 'pinyin'), row.id).toBe(true);
      expect(grade(row.hanzi, [row.hanzi], 'hanzi'), row.id).toBe(true);
    }
  });
});
