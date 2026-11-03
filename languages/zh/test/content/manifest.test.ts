import { describe, expect, it } from 'vitest';
import { hskVocabManifest } from '../../src/content/manifest/hsk.ts';

/** Hardcoded from plan-foundation-level1.md sections 2c/2d; no derived allowlist. */
const LESSONS: Readonly<Record<string, readonly string[]>> = {
  'zh:unit:n1': [
    'pinyin', 'tone', 'initials-bpmf-dtnl', 'initials-gkh-jqx', 'initials-zcs-zhchshr',
    'finals-compound', 'finals-nasal', 'neutral-tone', 'sandhi-third', 'sandhi-bu-yi',
    'spelling-rules', 'vocab', 'strokes-basic', 'strokes-turning', 'stroke-order-rules',
    'radicals-1', 'radicals-2', 'radicals-3', 'radicals-4', 'radicals-5',
  ],
  'zh:unit:h1': ['h1-shi', 'h1-name', 'h1-ma-ne', 'h1-nationality', 'h1-de', 'h1-read-dialogue'],
  'zh:unit:h2': ['h2-numbers', 'h2-age', 'h2-dates', 'h2-clock', 'h2-time-order', 'h2-review'],
  'zh:unit:h3': ['h3-family', 'h3-you-meiyou', 'h3-measure', 'h3-work-zai', 'h3-dou-ye', 'h3-review'],
  'zh:unit:h4': ['h4-food', 'h4-xiang-yao', 'h4-money', 'h4-tai-le', 'h4-ordering', 'h4-review'],
};

/** Every sample word in the Chinese plan tables, with its owning unit. */
const SAMPLES: Readonly<Record<string, readonly string[]>> = {
  'zh:unit:n1': ['你好', '谢谢', '不客气', '再见', '对不起', '没关系'],
  'zh:unit:h1': ['我', '你', '他', '她', '老师', '学生', '中国', '越南', '朋友'],
  'zh:unit:h2': ['今天', '明天', '昨天', '现在', '上午', '下午'],
  'zh:unit:h3': ['爸爸', '妈妈', '哥哥', '家', '医生', '工作', '学校'],
  'zh:unit:h4': ['吃', '喝', '米饭', '茶', '苹果', '钱', '块', '买', '贵'],
};

const GRAMMAR_WORDS = [
  '是', '不', '吗', '呢', '很', '的', '叫', '什么', '几', '多少', '个', '本', '口',
  '在', '都', '也', '想', '要', '太', '了', '请', '给', '杯',
  '哪', '国', '人', '有', '没有', '没', '岁', '年', '月', '号', '星期', '点', '分',
];

/** Exact legacy ids from vocab.ts; no import of the extracted pack/provenance. */
const LEGACY_IDS: Readonly<Record<string, string>> = {
  '你好': 'zh:vocab:ni-hao', '谢谢': 'zh:vocab:xiexie', '再见': 'zh:vocab:zaijian',
  '人': 'zh:vocab:ren', '学生': 'zh:vocab:xuesheng', '朋友': 'zh:vocab:pengyou',
  '水': 'zh:vocab:shui', '书': 'zh:vocab:shu',
};

/** Sense suffixes only where the toneless pinyin collides (including tone pairs). */
const SENSE_SUFFIXES: Readonly<Record<string, string>> = {
  '是': 'be', '十': 'ten', '他': 'he', '她': 'she', '好': 'good', '号': 'date',
  '哪': '', '那': 'that', '姓': 'surname', '行': 'ok', '没': 'not', '每': 'every',
  '和': '', '喝': 'drink', '买': 'buy', '卖': 'sell',
};

/** Compact standard Mandarin syllable inventory, grouped by written initial.
 * Includes ü explicitly (nü/lü), contracted iu/ui/un, and the y/w spellings.
 * It is independent of this manifest: nonexistent initial/final pairs are absent.
 */
const SYLLABLES = new Set(`
  a ai an ang ao e ei en eng er o ou
  ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu
  pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu
  ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu
  fa fan fang fei fen feng fo fou fu
  da dai dan dang dao de dei den deng di dia dian diao die ding diu dong dou du duan dui dun duo
  ta tai tan tang tao te teng ti tian tiao tie ting tong tou tu tuan tui tun tuo
  na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nuo nü nüe
  la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu lo long lou lu luan lun luo lü lüe
  ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo
  ka kai kan kang kao ke kei ken keng kong kou ku kua kuai kuan kuang kui kun kuo
  ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo
  ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun
  qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun
  xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun
  zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo
  cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo
  sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo
  ran rang rao re ren reng ri rong rou ru rua ruan rui run ruo
  za zai zan zang zao ze zei zen zeng zi zong zou zu zuan zui zun zuo
  ca cai can cang cao ce cen ceng ci cong cou cu cuan cui cun cuo
  sa sai san sang sao se sen seng si song sou su suan sui sun suo
  ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun
  wa wai wan wang wei wen weng wo wu
`.trim().split(/\s+/u));

const TONE_VOWELS: Readonly<Record<string, string>> = {
  a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ',
};
const TONE_MARKS: Readonly<Record<string, number>> = { '\u0304': 1, '\u0301': 2, '\u030c': 3, '\u0300': 4 };
const numberedSyllables = (value: string): string[] => value.split(' ');
const stripTone = (value: string): string => value.normalize('NFD').replace(/[\u0304\u0301\u030c\u0300]/gu, '').normalize('NFC');
const compact = (value: string): string => value.replace(/[ '’]/gu, '');
const slugBase = (numbered: string): string => numbered.replace(/[1-5]/gu, '').replaceAll('ü', 'v').replaceAll(' ', '-');

/** Standard placement: a, then e, o in ou, otherwise the last vowel. */
function markedSyllable(numbered: string): string {
  const base = numbered.slice(0, -1);
  const tone = Number(numbered.at(-1));
  if (tone === 5) return base;
  const index = base.includes('a') ? base.indexOf('a')
    : base.includes('e') ? base.indexOf('e')
      : base.includes('ou') ? base.indexOf('o')
        : Math.max(...[...base.matchAll(/[iouü]/gu)].map((match) => match.index));
  const vowel = base[index];
  const marked = vowel === undefined ? undefined : TONE_VOWELS[vowel]?.[tone - 1];
  if (marked === undefined) throw new Error(`Invalid numbered syllable: ${numbered}`);
  return base.slice(0, index) + marked + base.slice(index + 1);
}

/** Recover marked syllables using numbered boundaries, retaining all tone marks.
 * Invalid letters, marks, spacing and syllable lengths are checked separately.
 */
function markedSyllables(pinyin: string, numbered: string): string[] {
  const joined = compact(pinyin);
  let offset = 0;
  return numberedSyllables(numbered).map((syllable) => {
    const length = syllable.length - 1;
    const result = joined.slice(offset, offset + length);
    offset += length;
    return result;
  });
}

const duplicates = (values: readonly string[]): string[] => values.filter((value, index) => values.indexOf(value) !== index);
const rowFor = (hanzi: string) => {
  const row = hskVocabManifest.find((item) => item.hanzi === hanzi);
  if (!row) throw new Error(`Missing manifest word: ${hanzi}`);
  return row;
};

describe('Chinese hsk vocab manifest', () => {
  it('has 130–180 rows and unique ids and hanzi+pinyin pairs', () => {
    expect(hskVocabManifest.length).toBeGreaterThanOrEqual(130);
    expect(hskVocabManifest.length).toBeLessThanOrEqual(180);
    expect(duplicates(hskVocabManifest.map((row) => row.id))).toEqual([]);
    expect(duplicates(hskVocabManifest.map((row) => `${row.hanzi}\u0000${row.pinyin}`))).toEqual([]);
  });

  it('covers every plan sample in its unit, grammar words, and individual 一–十/百', () => {
    for (const [unitId, words] of Object.entries(SAMPLES)) {
      for (const word of words) expect(rowFor(word).unitId, word).toBe(unitId);
    }
    for (const word of [...GRAMMAR_WORDS, ...'一二三四五六七八九十百']) rowFor(word);
  });

  it('preserves every existing vocab id', () => {
    for (const [hanzi, id] of Object.entries(LEGACY_IDS)) expect(rowFor(hanzi).id).toBe(id);
  });

  it('uses allowed unit/lesson pairs and 5–7 new words per HSK lesson', () => {
    for (const row of hskVocabManifest) {
      expect(Object.keys(LESSONS), row.id).toContain(row.unitId);
      expect(LESSONS[row.unitId], row.id).toContain(row.lessonSlug);
    }
    const foundation = hskVocabManifest.filter((row) => row.unitId === 'zh:unit:n1');
    expect(foundation).toHaveLength(6);
    expect(foundation.every((row) => row.lessonSlug === 'vocab')).toBe(true);
    for (const [unitId, lessons] of Object.entries(LESSONS)) {
      if (unitId === 'zh:unit:n1') continue;
      for (const lesson of lessons) {
        const count = hskVocabManifest.filter((row) => row.unitId === unitId && row.lessonSlug === lesson).length;
        expect(count, lesson).toBeGreaterThanOrEqual(5);
        expect(count, lesson).toBeLessThanOrEqual(7);
      }
    }
  });

  it.each(hskVocabManifest)('$id has a valid syllable-based ASCII slug', (row) => {
    expect(row.id).toMatch(/^zh:vocab:[a-z]+(?:-[a-z]+)*$/u);
    const suffix = SENSE_SUFFIXES[row.hanzi];
    const expected = LEGACY_IDS[row.hanzi]
      ?? `zh:vocab:${slugBase(row.pinyinNumbered)}${suffix ? `-${suffix}` : ''}`;
    expect(row.id).toBe(expected);
  });

  it.each(hskVocabManifest)('$id uses valid numbered syllables, one per hanzi', (row) => {
    expect(row.hanzi).toMatch(/^\p{Script=Han}+$/u);
    expect(row.pinyinNumbered).toMatch(/^[a-zü]+[1-5](?: [a-zü]+[1-5])*$/u);
    const syllables = numberedSyllables(row.pinyinNumbered);
    expect(syllables.length).toBe([...row.hanzi].length);
    for (const syllable of syllables) {
      expect(SYLLABLES.has(syllable.slice(0, -1)), `${row.id}: ${syllable}`).toBe(true);
    }
  });

  it.each(hskVocabManifest)('$id has correct tone placement and matching marked/numbered pinyin', (row) => {
    expect(row.pinyin).toBe(row.pinyin.normalize('NFC'));
    expect(row.pinyin).toMatch(/^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+(?:[ '’][a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+)*$/u);
    const numbered = numberedSyllables(row.pinyinNumbered);
    const marked = markedSyllables(row.pinyin, row.pinyinNumbered);
    expect(marked.length).toBe([...row.hanzi].length);
    expect(stripTone(compact(row.pinyin))).toBe(numbered.map((s) => s.slice(0, -1)).join(''));
    expect(marked).toEqual(numbered.map(markedSyllable));
    for (const [index, syllable] of marked.entries()) {
      const marks = [...syllable.normalize('NFD')].filter((character) => TONE_MARKS[character] !== undefined);
      const tone = Number(numbered[index]!.at(-1));
      expect(marks.length).toBe(tone === 5 ? 0 : 1);
      if (tone !== 5) expect(TONE_MARKS[marks[0]!]).toBe(tone);
    }
    // Only multi-word phrases use spaces. 女儿 needs an internal syllable separator.
    const spaced: Readonly<Record<string, string>> = {
      '你好': 'nǐ hǎo', '不客气': 'bù kèqi', '没关系': 'méi guānxi',
    };
    if (spaced[row.hanzi]) expect(row.pinyin).toBe(spaced[row.hanzi]);
    else expect(row.pinyin).not.toContain(' ');
    if (row.hanzi === '女儿') expect(row.pinyin).toBe('nǚ’ér');
  });

  it('pins lexical neutral tones, citation 一/不, and selected polyphone senses', () => {
    const readings: Readonly<Record<string, string>> = {
      '学生': 'xue2 sheng5', '东西': 'dong1 xi5', '谢谢': 'xie4 xie5', '妈妈': 'ma1 ma5',
      '朋友': 'peng2 you5', '先生': 'xian1 sheng5', '认识': 'ren4 shi5', '喜欢': 'xi3 huan5',
      '衣服': 'yi1 fu5', '不客气': 'bu4 ke4 qi5', '对不起': 'dui4 bu5 qi3',
      '没关系': 'mei2 guan1 xi5', '多少': 'duo1 shao5', '时候': 'shi2 hou5',
      '了': 'le5', '的': 'de5', '还': 'hai2', '都': 'dou1', '长': 'chang2', '行': 'xing2',
      '没': 'mei2', '便宜': 'pian2 yi5', '一': 'yi1', '不': 'bu4', '一起': 'yi1 qi3',
    };
    for (const [hanzi, numbered] of Object.entries(readings)) expect(rowFor(hanzi).pinyinNumbered, hanzi).toBe(numbered);
  });

  it.each(hskVocabManifest)('$id has Vietnamese glosses and a short example using the headword', (row) => {
    expect(row.glosses.vi.trim().length).toBeGreaterThan(0);
    expect(row.exampleHint).toContain(row.hanzi);
    expect(row.exampleHint).toMatch(/[。！？]$/u);
    expect([...row.exampleHint].length).toBeLessThanOrEqual(24);
    expect(['noun', 'verb', 'modal', 'adjective', 'adverb', 'pronoun', 'determiner', 'numeral',
      'measure', 'particle', 'preposition', 'conjunction', 'phrase']).toContain(row.pos);
    if (row.measureWord) {
      expect(row.pos).toBe('noun');
      expect(row.measureWord).toMatch(/^\p{Script=Han}+(?:\/\p{Script=Han}+)*$/u);
    }
    if (row.note !== undefined) expect(row.note.trim().length).toBeGreaterThan(0);
    if (row.hanViet !== undefined) expect(row.hanViet.trim().length).toBeGreaterThan(0);
  });
});

describe('Pinyin validator reference cases', () => {
  it.each([
    ['hao3', 'hǎo'], ['mei2', 'méi'], ['dou1', 'dōu'], ['liu4', 'liù'],
    ['shui3', 'shuǐ'], ['gui4', 'guì'], ['nü3', 'nǚ'], ['lüe4', 'lüè'],
    ['xue2', 'xué'], ['sheng5', 'sheng'],
  ])('places the tone of %s as %s', (numbered, marked) => {
    expect(markedSyllable(numbered)).toBe(marked);
  });

  it('distinguishes bad placement, bad tone, missing neutral tone, and invalid syllables', () => {
    expect(markedSyllable('liu4')).not.toBe('lìu');
    expect(markedSyllable('shui3')).not.toBe('shǔi');
    expect(markedSyllable('bu4')).not.toBe('bú');
    expect(markedSyllable('xie5')).not.toBe('xiè');
    for (const syllable of ['bong', 'fiong', 'jü', 'qiaong', 'shong']) expect(SYLLABLES.has(syllable)).toBe(false);
    for (const syllable of ['xue', 'sheng', 'nü', 'er', 'shei']) expect(SYLLABLES.has(syllable)).toBe(true);
  });
});
