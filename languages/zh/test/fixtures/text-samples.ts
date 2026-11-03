export const equivalent = [
  ['你 好', '你好'], ['ＮǏ　ＨǍＯ', 'nǐhǎo'], ['u\u0308', 'ü'],
  ['nǐ\u200b hǎo\ufeff', 'nǐhǎo'], ['xi’an', "xi'an"], ['u\u200b\u0308', 'ü'],
] as const;

export const nonEquivalent = [
  ['mā', 'má'], ['mǎ', 'ma'], ['nǐ hǎo', 'ni3 hao3'],
  ['lü', 'lu'], ['妈妈', '媽媽'], ['', '你好'], ['\u200b', '你好'],
] as const;
