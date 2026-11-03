export const equivalent: [string, string][] = [
  [' ＨＥＬＬＯ　world ', 'hello world'],
  ['I’m', "i'm"], ['“Hello”', '"hello"'], ['e\u0301', 'é'],
];
export const nonEquivalent: [[string, string], ...[string, string][]] = [
  ['hello', 'goodbye'], ['cant', "can't"], ['cafe', 'café'], ['', 'hello'],
];
/** English-specific inputs for the contract's normalize/compareAnswer robustness checks. */
export const text: string[] = [
  'Hello, world!', 'café', 'naïve résumé', "don't", '“Quoted” ‘text’', 'ａｂｃ１２３', 'ﬁne',
  'soft\u00adhyphen', 'zero\u200bwidth', '\ufeffbom', 'İstanbul', 'ǅ', 'tab\tand\nnewline', ' \t\n ',
];
