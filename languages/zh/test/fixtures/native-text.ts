// Letters that Vietnamese uses and pinyin does not. Pinyin shares a/e/i/o/u with the four tone marks, so those
// letters alone cannot tell the two apart; the list covers the Vietnamese-only vowels, đ, tilde and dotted forms.
const VIETNAMESE_ONLY = /[đĐăĂâÂêÊôÔơƠưƯãÃĩĨũŨõÕ\u1ea0-\u1ef9]/u;

/** Module-local heuristic: does this string look like Vietnamese rather than Chinese, pinyin, or digits? */
export const isNativeText = (text: string): boolean => VIETNAMESE_ONLY.test(text.normalize('NFC'));
