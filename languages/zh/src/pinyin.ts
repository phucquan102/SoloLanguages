/**
 * Pinyin reading and canonicalisation used by grading and curriculum checks.
 *
 * Policy (docs/curriculum/authoring-guide.md section C):
 * - tone marks and tone numbers are the same answer; `ü`, `v` and `u:` are the same letter;
 * - an unmarked syllable is the neutral tone (0); a digit 5 is the same as 0;
 * - a syllable with a tone mark must carry it on the correct vowel (a, e, o of ou, else the last of i/u/ü);
 * - syllable spacing is optional, an apostrophe or a tone digit forces a boundary;
 * - after j, q, x, y the letter ü is the same answer as u (the spelling rule); l and n keep u and ü apart.
 */

export type Tone = 0 | 1 | 2 | 3 | 4;

export interface PinyinSyllable {
  /** Toneless letters, lowercase, `ü` written as ü. */
  readonly base: string;
  readonly tone: Tone;
}

/** Standard Mandarin syllable inventory (without er-hua and interjection-only forms). */
export const SYLLABLES: ReadonlySet<string> = new Set(`
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

/** Finals that name a letter sound only; they are not syllables of their own. */
const BARE_FINALS: ReadonlySet<string> = new Set(['i', 'u', 'ü']);

const TONE_VOWELS: Readonly<Record<string, string>> = {
  a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ',
};
const MARK_TONE: Readonly<Record<string, Tone>> = { '\u0304': 1, '\u0301': 2, '\u030c': 3, '\u0300': 4 };
const SEPARATORS = /[\s'\u2018\u2019\u02bc\u2032`\-·]+/u;
const INVISIBLE = /[\u200b-\u200d\ufeff\u00ad]/gu;

/** Index of the vowel that carries the tone mark: a, then e, then the o of ou, otherwise the last of i/o/u/ü. */
export function markIndex(base: string): number {
  if (base.includes('a')) return base.indexOf('a');
  if (base.includes('e')) return base.indexOf('e');
  if (base.includes('ou')) return base.indexOf('o');
  let index = -1;
  [...base].forEach((letter, at) => { if ('iouü'.includes(letter)) index = at; });
  return index;
}

/** Toneless syllable plus tone to marked pinyin, e.g. (liu, 4) gives liù and (xie, 0) gives xie. */
export function markSyllable(base: string, tone: Tone): string {
  if (tone === 0) return base;
  const at = markIndex(base);
  const vowel = base[at];
  const marked = vowel === undefined ? undefined : TONE_VOWELS[vowel]?.[tone - 1];
  if (marked === undefined) throw new Error(`Cannot mark tone ${tone} on "${base}"`);
  return (base.slice(0, at) + marked + base.slice(at + 1)).normalize('NFC');
}

interface Item {
  /** a-z or ü. */
  readonly letter: string;
  readonly mark: Tone | undefined;
  /** Tone digit typed directly after this letter; it ends the syllable. */
  readonly digit: Tone | undefined;
}

function items(chunk: string): Item[] | undefined {
  const list: { letter: string; mark: Tone | undefined; digit: Tone | undefined }[] = [];
  for (const char of chunk.normalize('NFD')) {
    const last = list[list.length - 1];
    if (/^[a-z]$/u.test(char)) { list.push({ letter: char, mark: undefined, digit: undefined }); continue; }
    if (/^[0-5]$/u.test(char)) {
      if (last === undefined || last.digit !== undefined) return undefined;
      last.digit = (char === '5' ? 0 : Number(char)) as Tone;
      continue;
    }
    if (last === undefined || last.digit !== undefined) return undefined;
    if (char === '\u0308') {
      if (last.letter !== 'u' || last.mark !== undefined) return undefined;
      last.letter = 'ü';
    } else if (MARK_TONE[char] !== undefined) {
      if (last.mark !== undefined) return undefined;
      last.mark = MARK_TONE[char];
    } else return undefined;
  }
  return list.length > 0 ? list : undefined;
}

interface Options {
  /** Keep tones (default true). Without tones marks and digits are read but dropped. */
  readonly tones?: boolean;
  /** Accept i, u, ü as letter sounds, for answers that name a final rather than a syllable. */
  readonly bareFinals?: boolean;
}

function readSyllable(group: readonly Item[], options: Options): PinyinSyllable | undefined {
  const tones = options.tones !== false;
  const marks = group.filter((item) => item.mark !== undefined);
  const digit = group[group.length - 1]!.digit;
  if (group.slice(0, -1).some((item) => item.digit !== undefined)) return undefined;
  if (marks.length > 1) return undefined;
  if (marks.length === 1 && digit !== undefined) return undefined;
  let base = group.map((item) => item.letter).join('');
  // After j, q, x, y the letter ü is spelled u: the same answer, so ü, v and u: all read as u there.
  const spelled = /^[jqxy]ü/u.test(base) ? base.replace('ü', 'u') : base;
  if (!SYLLABLES.has(spelled) && !(options.bareFinals === true && BARE_FINALS.has(spelled))) return undefined;
  base = spelled;
  const tone = (marks[0]?.mark ?? digit ?? 0) as Tone;
  if (tones && marks.length === 1) {
    // The mark must stand on the vowel the spelling rules choose.
    if (group.findIndex((item) => item.mark !== undefined) !== markIndex(base)) return undefined;
    if (base === 'i' || base === 'u' || base === 'ü') return undefined;
  }
  return { base, tone: tones ? tone : 0 };
}

function readChunk(chunk: readonly Item[], options: Options): PinyinSyllable[] | undefined {
  // best[i]: fewest syllables for chunk[i..]; fewest first, so xian is one syllable and xi'an needs its apostrophe.
  const best: (PinyinSyllable[] | undefined)[] = new Array(chunk.length + 1).fill(undefined);
  best[chunk.length] = [];
  for (let start = chunk.length - 1; start >= 0; start--) {
    for (let end = start + 1; end <= chunk.length; end++) {
      const rest = best[end];
      if (rest === undefined) continue;
      const syllable = readSyllable(chunk.slice(start, end), options);
      if (syllable === undefined) continue;
      const total = [syllable, ...rest];
      const current = best[start];
      if (current === undefined || total.length < current.length) best[start] = total;
    }
  }
  return best[0];
}

/**
 * Reads pinyin typed with marks, digits, spaces, apostrophes, ü/v/u:. Undefined when the text is not
 * valid pinyin (bad syllable, bad mark position, two tones on one syllable, stray characters).
 */
export function parsePinyin(text: unknown, options: Options = {}): PinyinSyllable[] | undefined {
  if (typeof text !== 'string') return undefined;
  const prepared = text.normalize('NFKC').toLowerCase().replace(INVISIBLE, '').replace(/u:/gu, 'ü').replace(/v/gu, 'ü');
  const syllables: PinyinSyllable[] = [];
  for (const piece of prepared.split(SEPARATORS)) {
    const chunk = piece.replace(/[\p{P}\p{S}]/gu, '');
    if (chunk === '') continue;
    const read = items(chunk);
    const parsed = read === undefined ? undefined : readChunk(read, options);
    if (parsed === undefined) return undefined;
    syllables.push(...parsed);
  }
  return syllables.length > 0 ? syllables : undefined;
}

/** Canonical form for comparing answers with tones: `ni3 hao3`, neutral written 0. */
export function pinyinKey(text: unknown): string | undefined {
  return parsePinyin(text, { tones: true })?.map(({ base, tone }) => `${base}${tone}`).join(' ');
}

/** Canonical form for answers whose objective is not tones: `ni hao`. */
export function pinyinBaseKey(text: unknown): string | undefined {
  return parsePinyin(text, { tones: false, bareFinals: true })?.map(({ base }) => base).join(' ');
}

/** Marked pinyin of a parsed answer, syllables joined directly. */
export function markedPinyin(syllables: readonly PinyinSyllable[]): string {
  return syllables.map(({ base, tone }) => markSyllable(base, tone)).join('');
}

/**
 * Accepted-answer forms for a typed pinyin question: the authored form, the same without spaces, and the
 * numbered forms with the neutral tone written 5 or 0. `gradeAnswer` canonicalises anyway; the forms keep
 * the stored answer list honest for consumers that only compare text.
 */
export function pinyinForms(...answers: string[]): string[] {
  const forms = new Set<string>();
  for (const answer of answers) {
    const syllables = parsePinyin(answer, { tones: true });
    if (syllables === undefined) throw new Error(`Invalid pinyin answer: ${answer}`);
    forms.add(answer);
    forms.add(answer.replace(/ /gu, ''));
    for (const neutral of [5, 0]) {
      const numbered = syllables.map(({ base, tone }) => `${base}${tone === 0 ? neutral : tone}`);
      forms.add(numbered.join(' '));
      forms.add(numbered.join(''));
    }
  }
  return [...forms];
}
