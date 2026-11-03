import { generalVocabManifest } from './manifest/general.ts';
import { ieltsVocabManifest } from './manifest/ielts.ts';

// Do not expand arbitrary possessive 's or ambiguous 'd.
const pairs = [
  ["I'm", 'I am'], ["you're", 'you are'], ["we're", 'we are'], ["they're", 'they are'],
  ["he's", 'he is'], ["she's", 'she is'], ["it's", 'it is'], ["what's", 'what is'],
  ["name's", 'name is'], ["that's", 'that is'], ["there's", 'there is'],
  ["don't", 'do not'], ["doesn't", 'does not'], ["didn't", 'did not'],
  ["isn't", 'is not'], ["aren't", 'are not'], ["wasn't", 'was not'], ["weren't", 'were not'],
  ["can't", 'cannot'], ["won't", 'will not'], ["couldn't", 'could not'], ["shouldn't", 'should not'],
  ["haven't", 'have not'], ["hasn't", 'has not'],
] as const;
const caseLike = (replacement: string, original: string): string =>
  original === original.toUpperCase() ? replacement.toUpperCase() :
    /^[A-Z]/u.test(original) ? replacement[0]!.toUpperCase() + replacement.slice(1) : replacement.toLowerCase();

/** Standard bidirectional contractions, optional final punctuation and manifest US spellings. */
export function acceptedForms(...answers: string[]): string[] {
  const variants = [...generalVocabManifest, ...ieltsVocabManifest].filter((row) => row.americanVariant);
  return [...new Set(answers.flatMap((answer) => {
    let full = answer.replace(/[’‘ʼ′`]/gu, "'");
    for (const [short, long] of pairs) {
      full = full.replace(new RegExp(`\\b${short}\\b`, 'gi'), (match) => caseLike(long, match));
    }
    let combinations = [full];
    for (const [short, long] of pairs) {
      combinations = combinations.flatMap((form) => {
        const matches = [...form.matchAll(new RegExp(`\\b${long}\\b`, 'gi'))];
        let branches = [''];
        let offset = 0;
        for (const match of matches) {
          const prefix = form.slice(offset, match.index);
          branches = branches.flatMap((branch) => [branch + prefix + match[0], branch + prefix + caseLike(short, match[0])]);
          offset = match.index + match[0].length;
        }
        return branches.map((branch) => branch + form.slice(offset));
      });
    }
    return combinations.flatMap((form) => {
      let american = form;
      for (const row of variants) american = american.replace(new RegExp(`\\b${row.headword}\\b`, 'gi'), row.americanVariant!);
      return [form, american].flatMap((spelling) => {
        const bare = spelling.replace(/[.!?]+$/u, '').trim();
        return [bare, `${bare}.`, `${bare}!`, `${bare}?`];
      });
    });
  }))];
}
