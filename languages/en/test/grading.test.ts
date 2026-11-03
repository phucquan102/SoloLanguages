import { describe, expect, it } from 'vitest';
import type { Question } from '@solo/content-schema';
import { gradeAnswer } from '../src/index.ts';
import type { AnswerMode } from '../src/grading.ts';
import { compareAnswer } from '../src/text-tools.ts';
import { acceptedForms } from '../src/content/answer-forms.ts';
import { lessons, assessments } from '../src/content/general/f1.ts';

const typed = [...lessons.flatMap(({ questions }) => questions), ...assessments]
  .filter((q): q is Question & { kind: 'typed' } => q.kind === 'typed');
const question = (suffix: string) => typed.find(({ id }) => id.endsWith(suffix))!;
const withMode = (answers: string[], mode?: AnswerMode): Question => ({
  ...question('-nguyen'), acceptedAnswers: acceptedForms(...answers),
  extensions: mode ? { 'en:answer-mode': mode } : {},
});

describe('module grading API', () => {
  it('grades every authored typed answer through gradeAnswer', () => {
    for (const q of typed) for (const answer of q.acceptedAnswers) {
      expect(gradeAnswer(answer, q), `${q.id}: ${answer}`).toEqual({ correct: true, score: 1 });
    }
  });
  it.each(['', '.', '!', '?'])('accepts final punctuation %j on both sides of the SDK comparator', (ending) => {
    for (const other of ['', '.', '!', '?']) {
      expect(compareAnswer(`Thank you${ending}`, [`Thank you${other}`]).correct).toBe(true);
      expect(compareAnswer(`Nice to meet you${other}`, [`Nice to meet you${ending}`]).correct).toBe(true);
    }
  });
  it('accepts optional commas but preserves words, apostrophes and other internal punctuation', () => {
    expect(gradeAnswer(' thank you! ', question('-a-thanks')).correct).toBe(true);
    expect(gradeAnswer("My name's Mai", question('-my-name')).correct).toBe(true);
    expect(gradeAnswer('my name mai', question('-my-name')).correct).toBe(false);
    expect(compareAnswer('thirty, forty', ['thirty forty']).correct).toBe(true);
    expect(gradeAnswer('Nice to meet you Bao', question('-a-meet')).correct).toBe(true);
    expect(compareAnswer('Nice to meet you, Bao', ['Nice to meet you Bao']).correct).toBe(true);
    expect(compareAnswer('hel,lo', ['hello']).correct).toBe(false);
    expect(compareAnswer('thirty/forty', ['thirty forty']).correct).toBe(false);
    expect(compareAnswer('dont', ["don't"]).correct).toBe(false);
    for (const value of ['', ' ', '.', '!?', '? ! .']) expect(compareAnswer(value, [value]).correct).toBe(false);
    expect(compareAnswer('Thank you ! ?', ['Thank you.']).correct).toBe(true);
  });
  it.each([
    ["I'm Nam", 'I am Nam'], ["My name's Mai", 'My name is Mai'],
    ["What's your name", 'What is your name'], ["It's a pen", 'It is a pen'],
    ["I don't know", 'I do not know'], ["She doesn't know", 'She does not know'],
    ["We aren't late", 'We are not late'], ["I can't go", 'I cannot go'],
  ])('generates contractions both directions: %s / %s', (short, full) => {
    expect(gradeAnswer(short, withMode([full])).correct).toBe(true);
    expect(gradeAnswer(full, withMode([short])).correct).toBe(true);
  });
  it('allows curly apostrophes and mixed contractions without expanding possessives', () => {
    expect(gradeAnswer('I’m Nam. My name is Nam!', withMode(["I am Nam. My name's Nam."])).correct).toBe(true);
    expect(acceptedForms("Nam's pen")).not.toContain('Nam is pen');
    expect(gradeAnswer('Thank you!', question('-a-thanks')).correct).toBe(true);
    for (const [suffix, input] of [['-nice-meet', 'Nice to meet you!'], ['-apology', 'Sorry!'], ['-accept', 'Yes, please!']]) {
      expect(gradeAnswer(input, question(suffix!)).correct).toBe(true);
    }
  });
  it.each(['Nguyen', 'NGUYEN', 'Pham', 'Truong', 'Le', 'Mai'])('rejects a whole name in spelling mode: %s', (name) => {
    const q = withMode([name.split('').join('-')], 'spelling');
    expect(gradeAnswer(name, q)).toEqual({ correct: false, score: 0 });
  });
  it('covers all 26 letters through typed decoding, including long names without copying them', () => {
    const spelling = typed.filter((q) => q.extensions?.['en:answer-mode'] === 'spelling');
    const letters = new Set(spelling.flatMap((q) => q.acceptedAnswers[0]!.toUpperCase().match(/[A-Z]/gu) ?? []));
    expect([...letters].sort().join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    for (const name of ['Nguyen', 'Pham', 'Truong']) {
      const q = question(`-${name.toLowerCase()}`);
      const prompt = typeof q.prompt === 'string' ? q.prompt : q.prompt['vi']!;
      expect(prompt.toLowerCase()).not.toContain(name.toLowerCase());
      expect(gradeAnswer(name.split('').join('.'), q).correct).toBe(true);
    }
  });
  it.each(['n g u y e n', 'N-G-U-Y-E-N', 'n,g,u,y,e,n', 'N.G.U.Y.E.N.', 'n - g, u.y e-n!'])('accepts separated single letters: %s', (input) => {
    expect(gradeAnswer(input, question('-nguyen')).correct).toBe(true);
  });
  it.each(['L–E', 'L—E', 'l-e'])('accepts spelling dash variants: %s', (input) => {
    expect(gradeAnswer(input, withMode(['L-E'], 'spelling')).correct).toBe(true);
  });
  it('accepts a single letter and double-letter expansion without accepting whole names', () => {
    expect(gradeAnswer('M', withMode(['M'], 'spelling')).correct).toBe(true);
    expect(gradeAnswer('J-A-double Z', withMode(['J-A-Z-Z'], 'spelling')).correct).toBe(true);
    for (const input of ['double', 'double ZZ', 'JAZZ', 'triple Z', 'J-A-double']) {
      expect(gradeAnswer(input, withMode(['J-A-Z-Z'], 'spelling')).correct).toBe(false);
    }
  });
  it.each(['NG-U-Y-E-N', 'N/G/U/Y/E/N', 'N G U Y E', 'N G U Y E N N', 'N G U Y 3 N'])('rejects malformed spelling: %s', (input) => {
    expect(gradeAnswer(input, question('-nguyen')).correct).toBe(false);
  });
  it.each(['ninety, thirty, eighty, forty, seventy, fifty, sixty', 'ninety-thirty/eighty forty, seventy/fifty-sixty'])('accepts equivalent sequence separators: %s', (input) => {
    expect(gradeAnswer(input, question('-thirty-fifty-words')).correct).toBe(true);
    expect(gradeAnswer('thirty, forty, fifty', withMode(['thirty forty fifty'], 'sequence')).correct).toBe(true);
  });
  it('accepts compact and chunked single digits without conflating multi-digit numbers', () => {
    expect(gradeAnswer('43210', question('-small-digits')).correct).toBe(true);
    expect(gradeAnswer('4,3,2,1,0', question('-small-digits')).correct).toBe(true);
    for (const input of ['07700900123', '07700 900123', '07700-900/123']) {
      expect(gradeAnswer(input, question('-phone-digits')).correct).toBe(true);
    }
    for (const input of ['7700900123', '07700900132']) expect(gradeAnswer(input, question('-phone-digits')).correct).toBe(false);
    expect(gradeAnswer('17519', question('-a-digits')).correct).toBe(false);
  });
  it('accepts oh/zero and double in full telephone readings', () => {
    for (const input of [
      'oh double seven double oh / nine double oh / one two three',
      'zero double seven double zero, nine double zero, one two three',
      'oh seven seven zero oh nine zero oh one two three',
    ]) expect(gradeAnswer(input, question('-phone-words')).correct).toBe(true);
    expect(gradeAnswer('oh double seven oh nine double oh one two three', question('-phone-words')).correct).toBe(false);
    expect(gradeAnswer('07700 900123', question('-phone-words')).correct).toBe(false);
  });
  it('enforces capitals only in explicit capitalisation objectives', () => {
    expect(gradeAnswer('English', question('-english')).correct).toBe(true);
    expect(gradeAnswer('english', question('-english')).correct).toBe(false);
    expect(gradeAnswer('I am Mai!', question('-capitals')).correct).toBe(true);
    for (const value of ['i am Mai', 'I am mai', 'I AM MAI']) expect(gradeAnswer(value, question('-capitals')).correct).toBe(false);
    expect(gradeAnswer('my name is mai', question('-my-name')).correct).toBe(true);
  });
  it.each([
    'oh triple seven double zero / nine, one-two-three',
    'zero seven seven seven oh zero nine one two three',
    'oh (triple seven) double oh / nine one two three',
    'oh–triple seven—double oh/nine.one.two.three',
  ])('uses phone semantics on an unseen number: %s', (input) => {
    const canonical = 'oh seven seven seven oh oh nine one two three';
    expect(gradeAnswer(input, withMode([canonical], 'phone')).correct).toBe(true);
    expect(gradeAnswer(canonical, withMode([input], 'phone')).correct).toBe(true);
  });
  it.each(['triple', 'double triple seven', 'double 77', 'seventy seven',
    '777009123', '0777009132', 'oh triple seven double zero nine one two', '', '...'])('rejects malformed or incorrect phone input: %s', (input) => {
    expect(gradeAnswer(input, withMode(['oh seven seven seven oh oh nine one two three'], 'phone')).correct).toBe(false);
  });
  it('fails closed for invalid modes and non-text typed input, and grades numeric choice indices', () => {
    const invalid = { ...question('-nguyen'), extensions: { 'en:answer-mode': 'unknown' } };
    expect(gradeAnswer('N-G-U-Y-E-N', invalid).correct).toBe(false);
    for (const input of [null, undefined, 123, {}]) expect(gradeAnswer(input, question('-nguyen')).correct).toBe(false);
    const choice = lessons[0]!.questions[0]!;
    expect(gradeAnswer(1, choice).correct).toBe(true);
    expect(gradeAnswer('1', choice).correct).toBe(false);
    expect(gradeAnswer(0, choice).correct).toBe(false);
  });
});
