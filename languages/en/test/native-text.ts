/**
 * Module-local heuristic for Vietnamese (the module's native locale) in a plain-string field.
 * It looks for letters Vietnamese uses and English words do not; the accented vowels é and è are
 * left out because English loanwords such as "café" contain them.
 */
const VIETNAMESE = /[ăâđêôơưĂÂĐÊÔƠƯàáãìíòóõùúýÀÁÃÌÍÒÓÕÙÚÝ\u1ea0-\u1ef9]/u;

export const isNativeText = (text: string): boolean => VIETNAMESE.test(text.normalize('NFC'));
