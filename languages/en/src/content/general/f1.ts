import type { Day, Lesson, LessonBlock, LocalizedText, Question, Quest, Test, Unit } from '@solo/content-schema';
import { authored } from '../provenance.ts';
import { generalVocabManifest } from '../manifest/general.ts';
import { acceptedForms } from '../answer-forms.ts';
import { XP } from '../unit-content.ts';
import type { UnitContent } from '../unit-content.ts';
import type { AnswerMode } from '../../grading.ts';

const FILE = 'languages/en/src/content/general/f1.ts';
const STAGE = 'en:stage:foundation';
const meta = ({ declaration, item }: { declaration: string; item: string }) => authored(FILE, declaration, item);
const ids = ({ slugs }: { slugs: string[] }) => slugs.map((slug) => `en:vocab:${slug}`);
const introduced = ({ lessonSlug }: { lessonSlug: string }) => generalVocabManifest
  .filter((row) => row.lessonSlug === lessonSlug).map((row) => row.id);
const alphabetFirstHalf = 'f1-alphabet-a-m';
const alphabetSecondHalf = 'f1-alphabet-n-z';
const greetings = 'f1-greetings';
const introductions = 'f1-my-name';
const smallNumbers = 'f1-numbers-0-20';
const phoneNumbers = 'f1-numbers-phone';
// Pilot cold start: day 2 can only retrieve day 1. Extend to >=2-day spacing once
// later units are scheduled; never describe this authoring exception in learning copy.
const dayOneWords = [...introduced({ lessonSlug: alphabetFirstHalf }), ...introduced({ lessonSlug: alphabetSecondHalf })];
const dayTwoWords = [...introduced({ lessonSlug: greetings }), ...introduced({ lessonSlug: introductions })];

function choice({ key, prompt, options, correctIndex, explanation, vocabIds }: {
  key: string; prompt: string; options: (string | LocalizedText)[];
  correctIndex: number; explanation: string; vocabIds: string[];
}): Question {
  return { id: `en:question:${key}`, kind: 'choice', prompt: { vi: prompt }, options, correctIndex,
    explanations: { vi: explanation }, vocabIds, ...meta({ declaration: 'practice', item: key }) };
}
function typed({ key, prompt, answers, explanation, vocabIds, mode }: {
  key: string; prompt: string; answers: string[]; explanation: string;
  vocabIds: string[]; mode?: AnswerMode;
}): Question {
  return { id: `en:question:${key}`, kind: 'typed', prompt: { vi: prompt }, acceptedAnswers: acceptedForms(...answers),
    ...(mode ? { extensions: { 'en:answer-mode': mode } } : {}),
    explanations: { vi: explanation }, vocabIds, ...meta({ declaration: 'practice', item: key }) };
}
function example({ text, translation, vocabIds, transcription }: {
  text: string; translation: string; vocabIds: string[]; transcription?: string;
}): LessonBlock {
  return { kind: 'example', text, translations: { vi: translation }, vocabIds,
    ...(transcription === undefined ? {} : { transcription }) };
}
const objective = ({ vi }: { vi: string }): LessonBlock => ({ kind: 'objective', text: { vi } });
const explain = ({ vi, pattern }: { vi: string; pattern?: string }): LessonBlock =>
  ({ kind: 'explanation', text: { vi }, ...(pattern ? { pattern } : {}) });
const tip = ({ vi }: { vi: string }): LessonBlock => ({ kind: 'tip', text: { vi } });
// Source: independent f1-review.md findings 10–11 (2026-11-03) suggested these teaching targets.
// Contrastive teaching examples, not claims about observed error frequency. Teacher review pending
// under review.status=ai-draft. E/I and G/J: English names differ from Vietnamese letter names;
// /θ/ and final consonants: explicit articulatory targets. Do not present invented prevalence as data.
const mistake = ({ wrong, right, vi }: { wrong: string; right: string; vi: string }): LessonBlock =>
  ({ kind: 'mistake', wrong, right, note: { vi } });

export const unit: Unit = {
  id: 'en:unit:f1', stageId: STAGE, order: 1,
  titles: { vi: 'Âm và chào hỏi', en: 'Sounds and greetings' },
  canDo: [
    { vi: 'Đọc tên 26 chữ cái và đánh vần tên mình.' },
    { vi: 'Chào hỏi, giới thiệu tên và dùng lời lịch sự trong tình huống đơn giản.' },
    { vi: 'Đọc, viết số 0–20 và đọc từng chữ số của số điện thoại.' },
  ], ...meta({ declaration: 'unit', item: 'f1' }),
};

export const lessons: readonly Lesson[] = [
  {
    id: `en:lesson:${alphabetFirstHalf}`, stageId: STAGE, unitId: unit.id, order: 1, skill: 'en:pronunciation',
    titles: { vi: 'Chữ cái A–M', en: 'Letters A–M' }, vocabIds: introduced({ lessonSlug: alphabetFirstHalf }),
    blocks: [
      objective({
        vi: "Nhận diện chữ hoa/chữ thường A–M và đọc tên từng chữ; phân biệt tên chữ với âm trong " +
          "từ.",
      }),
      explain({
        vi: "Alphabet là bảng chữ cái; letter là một chữ cái; English là tiếng Anh; learn là học. " +
          "“Learn English” nghĩa là “Học tiếng Anh”. Tiếng Anh có 26 chữ cái. Tên chữ dùng khi " +
          "đánh vần, không phải lúc nào cũng là âm của chữ trong từ. Tên A là /eɪ/. " +
          "Tên chữ trong ngoặc được viết lại bằng chữ thường để gợi cách đọc: ay, bee, " +
          "see. Đây là cách gợi đọc tiếng Anh, không đọc theo tiếng Việt. IPA trong dấu / / chỉ " +
          "là hỗ trợ.",
      }),
      example({
        text: 'English alphabet: A a (ay), B b (bee), C c (see).',
        translation: 'Bảng chữ cái tiếng Anh: A/a, B/b, C/c.',
        vocabIds: ids({ slugs: ['english', 'alphabet'] }),
        transcription: '/eɪ, biː, siː/',
      }),
      example({
        text: 'D d (dee), E e (ee), F f (ef), G g (jee).',
        translation: 'Các chữ D/d, E/e, F/f, G/g.',
        vocabIds: [],
        transcription: '/diː, iː, ef, dʒiː/',
      }),
      example({
        text: 'H h (aitch), I i (eye), J j (jay), K k (kay).',
        translation: 'Các chữ H/h, I/i, J/j, K/k.',
        vocabIds: [],
        transcription: '/eɪtʃ, aɪ, dʒeɪ, keɪ/',
      }),
      example({
        text: 'L l (el), M m (em).',
        translation: 'Các chữ L/l, M/m.',
        vocabIds: [],
        transcription: '/el, em/',
      }),
      example({
        text: 'letter: A; letter: M.',
        translation: 'Chữ cái: A; chữ cái: M.',
        vocabIds: ids({ slugs: ['letter'] }),
      }),
      example({
        text: 'Learn English.',
        translation: 'Học tiếng Anh.',
        vocabIds: ids({ slugs: ['learn', 'english'] }),
      }),
      mistake({
        wrong: 'E: eye; G: jay',
        right: 'E: ee; G: jee',
        vi: "Phân biệt E (ee) với I (eye) và G (jee) với J (jay); ee kéo dài, eye có hai phần liền " +
          "nhau. Không dùng tên chữ tiếng Việt để đánh vần tiếng Anh.",
      }),
      tip({
        vi: "Tên chữ tiếng Việt và tiếng Anh khác nhau. Đọc từng nhóm A–C, D–G, H–K, L–M; dùng bảng " +
          "chữ làm điểm tựa, không cần thuộc ký hiệu IPA để làm bài.",
      }),
    ],
    questions: [
      choice({
        key: `${alphabetFirstHalf}-jee-g`,
        prompt: "Trong bảng chữ cái tiếng Anh (English alphabet), tên chữ “jee” chỉ chữ nào?",
        options: ['j', 'g', 'c'],
        correctIndex: 1,
        explanation: "Jee là G/g; jay là J/j, see là C/c.",
        vocabIds: ids({ slugs: ['english', 'alphabet'] }),
      }),
      choice({
        key: `${alphabetFirstHalf}-learn-english-meaning`,
        prompt: "Thẻ học ghi “Learn English”. Chọn nghĩa của lời hướng dẫn.",
        options: [{ vi: 'Bảng chữ cái tiếng Anh' }, { vi: 'Chữ cái tiếng Anh' }, { vi: 'Học tiếng Anh' }],
        correctIndex: 2,
        explanation: "Learn là học; English là tiếng Anh.",
        vocabIds: ids({ slugs: ["learn", "english"] }),
      }),
      typed({
        key: `${alphabetFirstHalf}-english`,
        prompt: 'Sửa chữ hoa trong tên ngôn ngữ “english”. Gõ lại cả từ.',
        answers: ['English'],
        explanation: 'Tên ngôn ngữ viết hoa chữ đầu: English.',
        vocabIds: ids({ slugs: ["english"] }),
        mode: 'case-sensitive',
      }),
      typed({
        key: `${alphabetFirstHalf}-learn`,
        prompt: 'Gõ từ vừa học có nghĩa “học”, bắt đầu bằng l: ___ English.',
        answers: ['Learn'],
        explanation: 'Learn English nghĩa là học tiếng Anh.',
        vocabIds: ids({ slugs: ['learn', 'english'] }),
      }),
      choice({
        key: `${alphabetFirstHalf}-e-i`,
        prompt: "Hai tên chữ cái (letter) “ee, eye” tương ứng với cặp nào, theo thứ tự?",
        options: ["E / I","I / E","G / J"],
        correctIndex: 0,
        explanation: "Ee là E, eye là I; jee là G, jay là J.",
        vocabIds: ids({ slugs: ["letter"] }),
      }),
      typed({
        key: `${alphabetFirstHalf}-alphabet`,
        prompt: "Giải mã tên chữ trong bảng chữ cái (alphabet): ay, bee, see, dee, ee, ef, jee, aitch, " +
          "eye, jay, kay, el, em. Gõ các chữ, có dấu phân cách.",
        answers: ['A-B-C-D-E-F-G-H-I-J-K-L-M'],
        explanation: 'Nhóm A–M có 13 chữ. Giữ đúng thứ tự và tách từng chữ.',
        vocabIds: ids({ slugs: ['alphabet'] }),
        mode: 'spelling',
      }),
      choice({
        key: `${alphabetFirstHalf}-h`,
        prompt: "Tên chữ cái (letter) “aitch” chỉ chữ nào?",
        options: ['F', 'H', 'K'],
        correctIndex: 1,
        explanation: "Aitch là tên chữ H.",
        vocabIds: ids({ slugs: ['letter'] }),
      }),
      typed({
        key: `${alphabetFirstHalf}-em-m`,
        prompt: "Tên chữ “em” chỉ chữ nào? Gõ một chữ.",
        answers: ['M'],
        explanation: "Em là tên chữ M.",
        vocabIds: ids({ slugs: ["letter"] }),
        mode: "spelling",
      }),
    ], ...meta({ declaration: 'lessons', item: alphabetFirstHalf }),
  },
  {
    id: `en:lesson:${alphabetSecondHalf}`, stageId: STAGE, unitId: unit.id, order: 2, skill: 'en:pronunciation',
    titles: { vi: 'Chữ cái N–Z và đánh vần tên', en: 'Letters N–Z and spelling names' },
    vocabIds: introduced({ lessonSlug: alphabetSecondHalf }),
    blocks: [
      objective({ vi: 'Đọc tên N–Z; dùng tên chữ để đánh vần tên gọi và họ của mình.' }),
      explain({
        vi: "Spell nghĩa là đánh vần, name là tên, surname là họ, how là như thế nào. First name là " +
          "tên gọi trên biểu mẫu. “How do you spell ...?” = “Bạn đánh vần ... như thế nào?”; học " +
          "cả mẫu với do you. Với Lê Nam, điền First name: Nam; Surname: Le. Khi biểu mẫu yêu cầu " +
          "bỏ dấu, Nguyễn → Nguyen, Phạm → Pham, Trương → Truong; đánh vần từng chữ: N-G-U-Y-E-N, " +
          "P-H-A-M, T-R-U-O-N-G. Giữ dấu tiếng Việt nếu biểu mẫu cho phép. Anh-Anh dùng Z /zed/; " +
          "cách đọc Mỹ là /ziː/.",
      }),
      example({
        text: 'N n (en), O o (oh), P p (pee), Q q (cue).',
        translation: 'Các chữ N/n, O/o, P/p, Q/q.',
        vocabIds: [],
        transcription: '/en, əʊ, piː, kjuː/',
      }),
      example({
        text: 'R r (ar), S s (es), T t (tee), U u (you).',
        translation: 'Các chữ R/r, S/s, T/t, U/u.',
        vocabIds: [],
        transcription: '/ɑː, es, tiː, juː/',
      }),
      example({
        text: 'V v (vee), W w (double-you), X x (eks), Y y (why), Z z (zed).',
        translation: 'Các chữ V/v, W/w, X/x, Y/y, Z/z.',
        vocabIds: [],
        transcription: '/viː, ˈdʌbljuː, eks, waɪ, zed/',
      }),
      example({
        text: 'How do you spell Nam? — N-A-M.',
        translation: 'Bạn đánh vần Nam như thế nào? — N-A-M.',
        vocabIds: ids({ slugs: ['how', 'spell'] }),
      }),
      example({
        text: 'First name: Nam. Surname: Nguyen.',
        translation: 'Tên gọi: Nam. Họ: Nguyễn (viết không dấu trên biểu mẫu này).',
        vocabIds: ids({ slugs: ['name', 'surname'] }),
      }),
      example({
        text: 'Spell PHAM. — P-H-A-M.',
        translation: 'Đánh vần PHAM: P-H-A-M (họ Phạm viết không dấu).',
        vocabIds: ids({ slugs: ['spell'] }),
      }),
      mistake({
        wrong: 'G: gờ; R: rờ',
        right: 'G: jee; R: ar',
        vi: "Khi đánh vần tiếng Anh, dùng tên chữ tiếng Anh thay cho tên chữ tiếng Việt. Đọc đủ " +
          "từng chữ, không đọc cả tên như một từ.",
      }),
      tip({
        vi: "N-G-U-Y-E-N là sáu chữ riêng. Có thể tách chữ bằng khoảng trắng, gạch nối, dấu phẩy " +
          "hoặc dấu chấm. Tách chữ giúp người nhận ghi đúng tên.",
      }),
    ],
    questions: [
      choice({
        key: `${alphabetSecondHalf}-spell-name`,
        prompt: "Tên gọi (name) được đánh vần “en, ay, em”. Với câu hỏi “How do you spell ...?”, chọn " +
          "cách ghi tách từng chữ.",
        options: ['Nam.', 'M-A-N.', 'N-A-M.'],
        correctIndex: 2,
        explanation: 'How do you spell hỏi cách đánh vần; giữ đúng thứ tự N-A-M.',
        vocabIds: ids({ slugs: ['how', 'spell', 'name'] }),
      }),
      choice({
        key: `${alphabetSecondHalf}-surname`,
        prompt: 'Trên thẻ “First name: Nam; Surname: Le”, nhãn nào chỉ họ?',
        options: ['surname', 'first name', 'spell'],
        correctIndex: 0,
        explanation: 'Surname là họ; first name là tên gọi.',
        vocabIds: ids({ slugs: ['name', 'surname', 'spell'] }),
      }),
      typed({
        key: `${alphabetSecondHalf}-nguyen`,
        prompt: "Một người trả lời “How do you spell ...?” bằng tên chữ “en, jee, you, why, ee, en”. Gõ " +
          "từng chữ của họ, có dấu phân cách.",
        answers: ['N-G-U-Y-E-N'],
        explanation: 'Nguyễn → Nguyen → N-G-U-Y-E-N.',
        vocabIds: ids({ slugs: ['how', 'spell', 'name'] }),
        mode: 'spelling',
      }),
      typed({
        key: `${alphabetSecondHalf}-pham`,
        prompt: "Họ (surname) được đánh vần “pee, aitch, ay, em”. Gõ các chữ, tách từng chữ.",
        answers: ['P-H-A-M'],
        explanation: 'Pham gồm P-H-A-M.',
        vocabIds: ids({ slugs: ['surname', 'spell'] }),
        mode: 'spelling',
      }),
      choice({
        key: `${alphabetSecondHalf}-z`,
        prompt: "Trong bảng chữ cái (alphabet), các tên chữ “eks, why, zed” chỉ nhóm nào?",
        options: ['X-Y-Z', 'Y-X-Z', 'X-Z-Y'],
        correctIndex: 0,
        explanation: 'Thứ tự cuối bảng là X, Y, Z.',
        vocabIds: ids({ slugs: ['alphabet'] }),
      }),
      typed({
        key: `${alphabetSecondHalf}-truong`,
        prompt: "Với câu hỏi “How do you spell ...?”, bạn nhận được tên chữ “tee, ar, you, oh, en, " +
          "jee”. Gõ các chữ, có dấu phân cách.",
        answers: ['T-R-U-O-N-G'],
        explanation: 'Trương → Truong → T-R-U-O-N-G.',
        vocabIds: ids({ slugs: ['how', 'spell'] }),
        mode: 'spelling',
      }),
      choice({
        key: `${alphabetSecondHalf}-v-w`,
        prompt: "Tên chữ cái (letter) “double-you” chỉ chữ nào?",
        options: ['V', 'W', 'U'],
        correctIndex: 1,
        explanation: "Double-you là W; vee là V, you là U.",
        vocabIds: ids({ slugs: ['letter'] }),
      }),
      typed({
        key: `${alphabetSecondHalf}-code`,
        prompt: "Đánh vần mã từ tên chữ: cue, es, vee, double-you, eks, why, zed. Gõ các chữ, có dấu " +
          "phân cách.",
        answers: ['Q-S-V-W-X-Y-Z'],
        explanation: 'Mã gồm Q, S, V, W, X, Y, Z.',
        vocabIds: ids({ slugs: ['letter', 'spell'] }),
        mode: 'spelling',
      }),
    ], ...meta({ declaration: 'lessons', item: alphabetSecondHalf }),
  },
  {
    id: `en:lesson:${greetings}`, stageId: STAGE, unitId: unit.id, order: 3, skill: 'speaking',
    titles: { vi: 'Chào hỏi và lời lịch sự', en: 'Greetings and polite words' },
    vocabIds: introduced({ lessonSlug: greetings }),
    blocks: [
      objective({
        vi: "Chọn lời chào, tạm biệt, cảm ơn, xin lỗi và đáp lại lời đề nghị trong tình huống đơn " +
          "giản.",
      }),
      explain({
        vi: "Hello là lời chào thông dụng; hi thân mật hơn; goodbye dùng khi chia tay. Please làm " +
          "lời yêu cầu lịch sự hơn, không thay cho thank you (cảm ơn). Sorry dùng để xin lỗi. Yes " +
          "là có/vâng, no là không. “Nice to meet you” = “Rất vui được gặp bạn” khi làm quen: " +
          "nice là vui/tốt trong ngữ cảnh này, meet là gặp; học cả cụm với to và you. “Yes, " +
          "please” nhận lời đề nghị; “No, thank you” từ chối lịch sự.",
      }),
      example({
        text: 'Hello, Nam! — Hi, Mai!',
        translation: 'Chào Nam! — Chào Mai!',
        vocabIds: ids({ slugs: ['hello', 'hi'] }),
      }),
      example({
        text: 'Nice to meet you.',
        translation: 'Rất vui được gặp bạn.',
        vocabIds: ids({ slugs: ['nice', 'meet'] }),
      }),
      example({
        text: 'Yes, please.',
        translation: 'Vâng, cảm ơn. (Nhận lời đề nghị.)',
        vocabIds: ids({ slugs: ['yes', 'please'] }),
      }),
      example({
        text: 'No, thank you.',
        translation: 'Không, cảm ơn. (Từ chối lịch sự.)',
        vocabIds: ids({ slugs: ['no', 'thank-you'] }),
      }),
      example({ text: 'Sorry, Nam.', translation: 'Xin lỗi Nam.', vocabIds: ids({ slugs: ['sorry'] }) }),
      example({ text: 'Goodbye, Mai!', translation: 'Tạm biệt Mai!', vocabIds: ids({ slugs: ['goodbye'] }) }),
      mistake({
        wrong: 'meet: bỏ âm t cuối; please: bỏ âm z cuối',
        right: 'meet: kết thúc bằng t; please: kết thúc bằng z',
        vi: "Giữ phụ âm cuối /t/ trong meet và /z/ trong please. Kết thúc từ nhẹ nhưng không " +
          "bỏ âm tiết cuối.",
      }),
    ],
    questions: [
      choice({
        key: `${greetings}-hello-hi`,
        prompt: 'Gặp bạn Nam ở đầu buổi học. Cặp lời chào nào phù hợp?',
        options: ['Hello! — Hi!', 'Hi! — Goodbye!', 'Goodbye! — Hello!'],
        correctIndex: 0,
        explanation: 'Hello và hi đều dùng để chào khi gặp nhau; hi thân mật hơn.',
        vocabIds: ids({ slugs: ['hello', 'hi'] }),
      }),
      choice({
        key: `${greetings}-yes-please`,
        prompt: 'Bạn muốn nhận lời đề nghị giúp đỡ. Chọn lời đáp lịch sự.',
        options: ['No, thank you.', 'Yes, please.', 'Goodbye.'],
        correctIndex: 1,
        explanation: 'Yes, please nhận lời đề nghị; no, thank you từ chối.',
        vocabIds: ids({ slugs: ['yes', 'please', 'no', 'thank-you'] }),
      }),
      choice({
        key: `${greetings}-sorry-goodbye`,
        prompt: "Bạn vừa vô ý chạm phải Nam ở cửa lớp rồi chuẩn bị rời đi. Chọn hai lời nói theo thứ tự " +
          "xin lỗi → tạm biệt.",
        options: ['Hello. — Hi.', 'Goodbye. — Sorry.', 'Sorry. — Goodbye.'],
        correctIndex: 2,
        explanation: 'Sorry dùng xin lỗi; goodbye dùng khi chia tay.',
        vocabIds: ids({ slugs: ['sorry', 'goodbye'] }),
      }),
      typed({
        key: `${greetings}-nice-meet`,
        prompt: 'Gõ lời làm quen “Rất vui được gặp bạn”, dùng Nice ở đầu câu.',
        answers: ['Nice to meet you.'],
        explanation: 'Nice to meet you là cụm dùng khi mới làm quen.',
        vocabIds: ids({ slugs: ['nice', 'meet'] }),
      }),
      typed({
        key: `${greetings}-hello`,
        prompt: "Gõ lời chào trung tính đã học, dùng khi gặp người lạ.",
        answers: ['Hello!'],
        explanation: 'Hello là lời chào thông dụng.',
        vocabIds: ids({ slugs: ['hello'] }),
      }),
      typed({
        key: `${greetings}-hi`,
        prompt: "Gõ lời chào thân mật đã học, dùng khi gặp bạn thân.",
        answers: ['Hi!'],
        explanation: 'Hi là lời chào thân mật.',
        vocabIds: ids({ slugs: ['hi'] }),
      }),
      typed({
        key: `${greetings}-decline`,
        prompt: 'Gõ lời từ chối lịch sự “Không, cảm ơn”.',
        answers: ["No, thank you."],
        explanation: 'No thể hiện từ chối; thank you giữ lời đáp lịch sự.',
        vocabIds: ids({ slugs: ['no', 'thank-you'] }),
      }),
      typed({
        key: `${greetings}-accept`,
        prompt: 'Gõ lời nhận đề nghị “Vâng, cảm ơn”, dùng please.',
        answers: ["Yes, please."],
        explanation: 'Yes, please dùng khi nhận một lời đề nghị.',
        vocabIds: ids({ slugs: ['yes', 'please'] }),
      }),
      typed({
        key: `${greetings}-apology`,
        prompt: 'Bạn viết lời xin lỗi ngắn cho Nam. Chỉ gõ từ “xin lỗi”.',
        answers: ['Sorry.'],
        explanation: 'Sorry dùng để xin lỗi.',
        vocabIds: ids({ slugs: ['sorry'] }),
      }),
      choice({
        key: `${greetings}-meet-goodbye`,
        prompt: 'Chọn cặp câu theo thứ tự làm quen → chia tay.',
        options: ['Goodbye. — Nice to meet you.', 'Nice to meet you. — Goodbye.', 'Sorry. — Yes, please.'],
        correctIndex: 1,
        explanation: 'Nice to meet you dùng lúc làm quen; goodbye dùng lúc chia tay.',
        vocabIds: ids({ slugs: ['nice', 'meet', 'goodbye'] }),
      }),
    ], ...meta({ declaration: 'lessons', item: greetings }),
  },
  {
    id: `en:lesson:${introductions}`, stageId: STAGE, unitId: unit.id, order: 4, skill: 'speaking',
    titles: { vi: 'Tên tôi là…', en: 'My name is…' },
    vocabIds: introduced({ lessonSlug: introductions }), reviewVocabIds: dayOneWords,
    blocks: [
      objective({ vi: 'Hỏi tên và tự giới thiệu bằng My name is… hoặc I am / I’m…; ôn đánh vần tên.' }),
      explain({
        vi: "My là của tôi, your là của bạn, what là gì, I là tôi, you là bạn. Dùng “My name is + " +
          "tên” hoặc “I am + tên”; I’m là dạng viết tắt của I am; my name’s là dạng viết tắt của " +
          "my name is. I luôn viết hoa. Hỏi “What is your name?” hoặc “What’s your name?”. Is đi " +
          "với my name/your name; am đi với I. Trong “Nice to meet you”, you chỉ người đối diện. " +
          "Ôn lại mẫu đánh vần và các từ ngày 1.",
      }),
      example({
        text: 'My name is Nam.',
        translation: 'Tên tôi là Nam.',
        vocabIds: ids({ slugs: ['my', 'name', 'is'] }),
      }),
      example({
        text: 'I am Mai. — I’m Mai.',
        translation: 'Tôi là Mai. — Tôi là Mai. (Dạng viết tắt.)',
        vocabIds: ids({ slugs: ['i', 'am'] }),
      }),
      example({
        text: 'What is your name? — My name is Mai.',
        translation: 'Tên bạn là gì? — Tên tôi là Mai.',
        vocabIds: ids({ slugs: ['what', 'your', 'is', 'my', 'name'] }),
      }),
      example({
        text: 'Nice to meet you, Mai.',
        translation: 'Rất vui được gặp bạn, Mai.',
        vocabIds: ids({ slugs: ['you', 'nice', 'meet'] }),
      }),
      example({
        text: 'How do you spell your surname? — L-E.',
        translation: 'Bạn đánh vần họ của bạn như thế nào? — L-E.',
        vocabIds: ids({ slugs: ['how', 'spell', 'your', 'surname', 'you'] }),
      }),
      example({
        text: 'Learn English. Spell your name.',
        translation: 'Học tiếng Anh. Đánh vần tên của bạn.',
        vocabIds: ids({ slugs: ['learn', 'english', 'spell', 'your', 'name'] }),
      }),
      mistake({
        wrong: 'I is Nam. My name am Nam.',
        right: 'I am Nam. My name is Nam.',
        vi: "Có thể bỏ hoặc chọn nhầm am/is khi chuyển từ câu tiếng Việt. I đi với am; my name đi " +
          "với is.",
      }),
      tip({
        vi: "I’m và I am cùng nghĩa. Dấu nháy nằm giữa I và m, không viết Im khi muốn dùng dạng " +
          "viết tắt.",
      }),
    ],
    questions: [
      choice({
        key: `${introductions}-am`,
        prompt: 'Chọn cặp đúng để tự giới thiệu: “I ___ Mai. My name ___ Mai.”',
        options: ['is / am', 'am / is', 'am / am'],
        correctIndex: 1,
        explanation: 'I đi với am; my name đi với is.',
        vocabIds: ids({ slugs: ['i', 'am', 'my', 'is', 'name'] }),
      }),
      choice({
        key: `${introductions}-ask`,
        prompt: 'Bạn muốn hỏi tên người đối diện. Chọn câu đúng.',
        options: ['What is my name?', 'My name is Mai.', 'What is your name?'],
        correctIndex: 2,
        explanation: 'What is your name? hỏi tên bạn; my name là tên tôi.',
        vocabIds: ids({ slugs: ['what', 'your', 'is', 'my', 'name'] }),
      }),
      typed({
        key: `${introductions}-introduce`,
        prompt: 'Dịch “Tôi là Nam”, bắt đầu bằng I; dùng dạng đầy đủ hoặc viết tắt.',
        answers: ['I am Nam.', "I'm Nam."],
        explanation: 'I am Nam và I’m Nam đều đúng.',
        vocabIds: ids({ slugs: ['i', 'am'] }),
      }),
      typed({
        key: `${introductions}-my-name`,
        prompt: 'Giới thiệu “Tên tôi là Mai”, bắt đầu bằng My.',
        answers: ['My name is Mai.'],
        explanation: 'My name is + tên là mẫu tự giới thiệu.',
        vocabIds: ids({ slugs: ['my', 'is', 'name'] }),
      }),
      typed({
        key: `${introductions}-question`,
        prompt: 'Gõ câu hỏi “Tên bạn là gì?”, dùng What hoặc What’s.',
        answers: ['What is your name?', "What's your name?"],
        explanation: 'What’s là dạng viết tắt của what is.',
        vocabIds: ids({ slugs: ['what', 'your', 'is', 'name'] }),
      }),
      typed({
        key: `${introductions}-capitals`,
        prompt: "Sửa chữ hoa trong “i am mai”. Gõ lại cả câu; chú ý I và tên Mai.",
        answers: ['I am Mai.'],
        explanation: 'I luôn viết hoa; tên riêng Mai viết hoa chữ đầu.',
        vocabIds: ids({ slugs: ["i", "am"] }),
        mode: 'case-sensitive',
      }),
      choice({
        key: `${introductions}-listener`,
        prompt: 'Trong cuộc trò chuyện, từ nào chỉ người đang nghe?',
        options: ['my', 'you', 'I'],
        correctIndex: 1,
        explanation: 'You chỉ người nghe; I chỉ người nói, my là của tôi.',
        vocabIds: ids({ slugs: ['you', 'i', 'my'] }),
      }),
      choice({
        key: `${introductions}-pronouns`,
        prompt: 'Bạn muốn nói “tôi” rồi “bạn”. Chọn hai từ theo thứ tự.',
        options: ['you / my', 'my / you', 'I / you'],
        correctIndex: 2,
        explanation: 'I là tôi, you là bạn; my là của tôi.',
        vocabIds: ids({ slugs: ['i', 'you', 'my'] }),
      }),
      choice({
        key: `${introductions}-review-learning`,
        prompt: "Ôn ngày 1: chọn cách hiểu đúng “Learn English” và “letter / alphabet”.",
        options: [
          { vi: 'Học tiếng Anh; chữ cái / bảng chữ cái' },
          { vi: 'Học chữ cái; tiếng Anh / bảng chữ cái' },
          { vi: 'Học bảng chữ cái; chữ cái / tiếng Anh' },
        ],
        correctIndex: 0,
        explanation: "Learn English là học tiếng Anh; letter là chữ cái, alphabet là bảng chữ cái.",
        vocabIds: ids({ slugs: ['learn', 'english', 'alphabet', 'letter'] }),
      }),
      typed({
        key: `${introductions}-review-spelling`,
        prompt: "Ôn ngày 1: trên biểu mẫu, Surname được đánh vần “el, ee”. Với câu hỏi “How do you " +
          "spell ...?”, gõ từng chữ của họ.",
        answers: ['L-E'],
        explanation: 'First name chỉ tên gọi, surname chỉ họ; Le đánh vần L-E.',
        vocabIds: ids({ slugs: ["name", "surname", "how", "spell"] }),
        mode: 'spelling',
      }),
    ], ...meta({ declaration: 'lessons', item: introductions }),
  },
  {
    id: `en:lesson:${smallNumbers}`, stageId: STAGE, unitId: unit.id, order: 5, skill: 'vocabulary',
    titles: { vi: 'Số 0–20', en: 'Numbers 0–20' },
    vocabIds: introduced({ lessonSlug: smallNumbers }), reviewVocabIds: dayOneWords,
    blocks: [
      objective({ vi: 'Ghép chữ số 0–20 với từ tiếng Anh và viết đúng các nhóm số ngắn.' }),
      explain({
        vi: "Học theo nhóm nhỏ: 0–4, 5–8, 9–12, 13–16, 17–20. Zero là 0; không đọc theo tên chữ O " +
          "trong bài đếm số này. Chú ý two có w không đọc, eight có gh không đọc, twelve kết thúc " +
          "bằng /v/. Các số 13–19 thường nhấn mạnh đuôi -teen khi đọc riêng; twenty thường nhấn " +
          "âm tiết đầu. Ôn lại bảng chữ cái và đánh vần tên từ ngày 1.",
      }),
      example({
        text: '0 zero; 1 one; 2 two; 3 three; 4 four.',
        translation: '0 không; 1 một; 2 hai; 3 ba; 4 bốn.',
        vocabIds: ids({ slugs: ['zero', 'one', 'two', 'three', 'four'] }),
      }),
      example({
        text: '5 five; 6 six; 7 seven; 8 eight.',
        translation: '5 năm; 6 sáu; 7 bảy; 8 tám.',
        vocabIds: ids({ slugs: ['five', 'six', 'seven', 'eight'] }),
      }),
      example({
        text: '9 nine; 10 ten; 11 eleven; 12 twelve.',
        translation: '9 chín; 10 mười; 11 mười một; 12 mười hai.',
        vocabIds: ids({ slugs: ['nine', 'ten', 'eleven', 'twelve'] }),
      }),
      example({
        text: '13 thirteen; 14 fourteen; 15 fifteen; 16 sixteen.',
        translation: '13 mười ba; 14 mười bốn; 15 mười lăm; 16 mười sáu.',
        vocabIds: ids({ slugs: ['thirteen', 'fourteen', 'fifteen', 'sixteen'] }),
      }),
      example({
        text: '17 seventeen; 18 eighteen; 19 nineteen; 20 twenty.',
        translation: '17 mười bảy; 18 mười tám; 19 mười chín; 20 hai mươi.',
        vocabIds: ids({ slugs: ['seventeen', 'eighteen', 'nineteen', 'twenty'] }),
      }),
      example({
        text: 'First name: Mai. Spell MAI: M-A-I.',
        translation: 'Tên gọi: Mai. Đánh vần MAI: M-A-I.',
        vocabIds: ids({ slugs: ['name', 'spell'] }),
      }),
      mistake({
        wrong: 'three: bật t đầu; twelve: bỏ v cuối',
        right: 'three: thổi hơi qua đầu lưỡi; twelve: giữ v cuối',
        vi: "Với three, đặt đầu lưỡi nhẹ giữa hai hàm răng và thổi hơi cho /θ/, tránh thay bằng /t/ " +
          "hoặc /s/. Giữ /v/ cuối twelve.",
      }),
      tip({
        vi: "Three có /θ/: đầu lưỡi chạm nhẹ hoặc hơi đưa ra giữa hai hàm răng, thổi hơi; không tạo " +
          "âm t bật mạnh. Giữ luồng hơi liên tục trước khi chuyển sang phần còn lại của từ.",
      }),
    ],
    questions: [
      choice({
        key: `${smallNumbers}-zero-four`,
        prompt: 'Chọn dãy từ khớp 0, 1, 2, 3, 4 theo thứ tự.',
        options: ['zero, one, two, three, four', 'one, zero, two, three, four', 'zero, one, three, two, four'],
        correctIndex: 0,
        explanation: '0 zero; 1 one; 2 two; 3 three; 4 four.',
        vocabIds: ids({ slugs: ['zero', 'one', 'two', 'three', 'four'] }),
      }),
      typed({
        key: `${smallNumbers}-small-digits`,
        prompt: "Đổi “four, three, two, one, zero” thành chữ số; có thể gõ liền hoặc tách bằng khoảng " +
          "trắng, dấu phẩy, gạch nối.",
        answers: ['4 3 2 1 0'],
        explanation: 'Four = 4; three = 3; two = 2; one = 1; zero = 0. Giữ đúng thứ tự.',
        vocabIds: ids({ slugs: ['four', 'three', 'two', 'one', 'zero'] }),
        mode: 'sequence',
      }),
      choice({
        key: `${smallNumbers}-five-eight`,
        prompt: 'Dãy 8, 7, 6, 5 đang giảm dần. Chọn cách viết đúng.',
        options: ['eight, six, seven, five', 'eight, seven, six, five', 'eight, seven, five, six'],
        correctIndex: 1,
        explanation: 'Đọc từ 8 về 5: eight, seven, six, five.',
        vocabIds: ids({ slugs: ['five', 'six', 'seven', 'eight'] }),
      }),
      typed({
        key: `${smallNumbers}-five-eight-words`,
        prompt: 'Thẻ ghi 6, 8, 5, 7. Viết từng số bằng từ tiếng Anh, giữ thứ tự.',
        answers: ['six eight five seven'],
        explanation: 'Six = 6, eight = 8, five = 5, seven = 7.',
        vocabIds: ids({ slugs: ['five', 'six', 'seven', 'eight'] }),
        mode: 'sequence',
      }),
      choice({
        key: `${smallNumbers}-nine-twelve`,
        prompt: 'Thẻ ghi 9 / 10 / 11 / 12. Chọn dãy từ đúng thứ tự.',
        options: [
          'nine ten twelve eleven',
          'ten nine eleven twelve',
          'nine ten eleven twelve',
        ],
        correctIndex: 2,
        explanation: 'Nine là 9, ten là 10, eleven là 11, twelve là 12. Giữ thứ tự trên thẻ.',
        vocabIds: ids({ slugs: ['nine', 'ten', 'eleven', 'twelve'] }),
      }),
      typed({
        key: `${smallNumbers}-nine-twelve-words`,
        prompt: 'Viết các số trên thẻ 12 / 9 / 11 / 10 bằng từ tiếng Anh.',
        answers: ['twelve nine eleven ten'],
        explanation: 'Giữ thứ tự trên thẻ, không sắp xếp lại.',
        vocabIds: ids({ slugs: ['nine', 'ten', 'eleven', 'twelve'] }),
        mode: 'sequence',
      }),
      choice({
        key: `${smallNumbers}-teens`,
        prompt: 'Chọn dãy khớp 13, 14, 15, 16, 17, 18, 19, 20.',
        options: [
          'thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty',
          'thirteen, fifteen, fourteen, sixteen, seventeen, eighteen, nineteen, twenty',
          'thirteen, fourteen, sixteen, fifteen, seventeen, eighteen, nineteen, twenty',
        ],
        correctIndex: 0,
        explanation: 'Phân biệt fifteen (15) với sixteen (16); 20 là twenty.',
        vocabIds: ids({ slugs: [
          'thirteen',
          'fourteen',
          'fifteen',
          'sixteen',
          'seventeen',
          'eighteen',
          'nineteen',
          'twenty',
        ] }),
      }),
      typed({
        key: `${smallNumbers}-teen-digits`,
        prompt: "Đổi “twenty nineteen eighteen seventeen sixteen fifteen fourteen thirteen” thành chữ " +
          "số cách nhau bằng khoảng trắng.",
        answers: ['20 19 18 17 16 15 14 13'],
        explanation: 'Dãy giảm từ twenty (20) đến thirteen (13). Giữ đủ tám số theo thứ tự.',
        vocabIds: ids({ slugs: [
          'twenty',
          'nineteen',
          'eighteen',
          'seventeen',
          'sixteen',
          'fifteen',
          'fourteen',
          'thirteen',
        ] }),
        mode: 'sequence',
      }),
      choice({
        key: `${smallNumbers}-review-alphabet`,
        prompt: "Ôn ngày 1: ghép learn → English → letter → alphabet với nghĩa theo thứ tự.",
        options: [
          { vi: 'Tiếng Anh / học / bảng chữ cái / chữ cái' },
          { vi: 'Học / bảng chữ cái / tiếng Anh / chữ cái' },
          { vi: 'Học / tiếng Anh / chữ cái / bảng chữ cái' },
        ],
        correctIndex: 2,
        explanation: "Learn: học; English: tiếng Anh; letter: chữ cái; alphabet: bảng chữ cái.",
        vocabIds: ids({ slugs: ['learn', 'english', 'alphabet', 'letter'] }),
      }),
      typed({
        key: `${smallNumbers}-review-name`,
        prompt: "Ôn ngày 1: tên gọi (First name) được đánh vần “em, ay, eye”. Với câu hỏi “How do you " +
          "spell ...?”, gõ từng chữ của tên gọi.",
        answers: ['M-A-I'],
        explanation: 'Mai gồm M-A-I; câu hỏi yêu cầu tên gọi Mai.',
        vocabIds: ids({ slugs: ['name', 'surname', 'how', 'spell'] }),
        mode: 'spelling',
      }),
    ], ...meta({ declaration: 'lessons', item: smallNumbers }),
  },
  {
    id: `en:lesson:${phoneNumbers}`, stageId: STAGE, unitId: unit.id, order: 6, skill: 'vocabulary',
    titles: { vi: 'Số điện thoại và các chục', en: 'Phone numbers and tens' },
    vocabIds: introduced({ lessonSlug: phoneNumbers }), reviewVocabIds: dayTwoWords,
    blocks: [
      objective({
        vi: "Đọc từng chữ số của một số điện thoại; phân biệt số chục với số đuôi -teen và nhận " +
          "diện hundred.",
      }),
      explain({
        vi: "Phone là điện thoại, number là số; hỏi “What is your phone number?”. Trong Anh-Anh, 0 " +
          "trong số điện thoại thường đọc oh /əʊ/; zero cũng đúng. Đọc từng chữ số và nghỉ giữa " +
          "các nhóm: 07700 / 900 / 123. Double nghĩa là đọc hai chữ số giống nhau: double seven = " +
          "77, double oh = 00. Cách đọc: oh double seven double oh / nine double oh / one two " +
          "three. Triple nghĩa là lặp ba chữ số: triple zero = 000.",
      }),
      explain({
        vi: 'Các số chục: thirty 30, forty 40 (không có u), fifty 50, sixty 60, seventy 70, ' +
          'eighty 80, ninety 90. Hundred là trăm: one hundred = 100, two hundred = 200. ' +
          'Không thêm s sau hundred khi có số cụ thể.',
      }),
      explain({
        vi: 'Khi đọc riêng: thir-TEEN / THIR-ty, four-TEEN / FOR-ty, fif-TEEN / FIF-ty. ' +
          'Phần in hoa là âm tiết nhấn chính: số đuôi -teen thường nhấn âm tiết cuối, ' +
          'số chục nhấn âm tiết đầu.',
      }),
      example({
        text: "What is your phone number? — 07700 900123: oh double seven double oh / nine double oh " +
          "/ one two three.",
        translation: "Số điện thoại của bạn là gì? — Số minh hoạ 07700 / 900 / 123: không bảy bảy không " +
          "không / chín không không / một hai ba.",
        vocabIds: ids({ slugs: ['phone', 'number', 'what', 'is', 'your', 'zero', 'seven', 'two'] }),
      }),
      example({
        text: '30 thirty; 40 forty; 50 fifty.',
        translation: '30 ba mươi; 40 bốn mươi; 50 năm mươi.',
        vocabIds: ids({ slugs: ['thirty', 'forty', 'fifty'] }),
      }),
      example({
        text: '60 sixty; 70 seventy; 80 eighty; 90 ninety.',
        translation: '60 sáu mươi; 70 bảy mươi; 80 tám mươi; 90 chín mươi.',
        vocabIds: ids({ slugs: ['sixty', 'seventy', 'eighty', 'ninety'] }),
      }),
      example({
        text: '100: one hundred; 200: two hundred.',
        translation: '100: một trăm; 200: hai trăm.',
        vocabIds: ids({ slugs: ['hundred', 'one', 'two'] }),
      }),
      example({
        text: 'Hello! My name is Mai. — Hi! I am Nam. Nice to meet you.',
        translation: 'Xin chào! Tên tôi là Mai. — Chào bạn! Tôi là Nam. Rất vui được gặp bạn.',
        vocabIds: ids({ slugs: ['hello', 'my', 'name', 'is', 'hi', 'i', 'am', 'nice', 'meet', 'you'] }),
      }),
      example({
        text: 'Yes, please. No, thank you. Sorry. Goodbye!',
        translation: 'Vâng, cảm ơn. Không, cảm ơn. Xin lỗi. Tạm biệt!',
        vocabIds: ids({ slugs: ['yes', 'please', 'no', 'thank-you', 'sorry', 'goodbye'] }),
      }),
      mistake({
        wrong: '072: seventy-two',
        right: '072: oh seven two',
        vi: "Đọc cả đoạn số điện thoại thành số đếm sẽ làm mất số 0 đầu. Đọc từng chữ số: oh seven " +
          "two; zero seven two cũng đúng.",
      }),
      tip({
        vi: "Chia số điện thoại thành nhóm rồi đọc từng chữ số; double chỉ lặp chữ số ngay sau nó. " +
          "Tự đọc lại để kiểm tra có giữ số 0 đầu hay không.",
      }),
    ],
    questions: [
      choice({
        key: `${phoneNumbers}-phone`,
        prompt: "Số điện thoại minh hoạ 07700 900123 có nhóm đầu 07700. Chọn cách đọc từng chữ số đúng; " +
          "oh là 0.",
        options: ['oh seven seven oh oh', 'oh seven oh seven oh', 'seven seven oh oh'],
        correctIndex: 0,
        explanation: 'Đọc đủ 0-7-7-0-0. Có thể dùng double seven cho 77 và double oh cho 00.',
        vocabIds: ids({ slugs: ['phone', 'number', 'what', 'is', 'your', 'seven', 'zero'] }),
      }),
      typed({
        key: `${phoneNumbers}-phone-digits`,
        prompt: "Đọc số điện thoại minh hoạ: oh double seven double oh / nine double oh / one two " +
          "three. Gõ dãy chữ số, có thể chia nhóm bằng khoảng trắng.",
        answers: ['0 7 7 0 0 9 0 0 1 2 3'],
        explanation: 'Ghép 07700 / 900 / 123 → 07700900123. Double lặp lại chữ số ngay sau nó.',
        vocabIds: ids({ slugs: ['phone', 'number', 'zero', 'seven', 'nine', 'one', 'two', 'three'] }),
        mode: 'sequence',
      }),
      choice({
        key: `${phoneNumbers}-stress`,
        prompt: "Khi đọc riêng 13 và 30, chọn vị trí nhấn chính.",
        options: [
          { vi: '13: âm tiết đầu; 30: âm tiết cuối' },
          { vi: '13: âm tiết cuối; 30: âm tiết đầu' },
          { vi: '13: âm tiết đầu; 30: âm tiết đầu' },
        ],
        correctIndex: 1,
        explanation: "Thirteen thường nhấn -TEEN; thirty nhấn THIR-. Tương tự: four-TEEN / FOR-ty và " +
          "fif-TEEN / FIF-ty.",
        vocabIds: ids({ slugs: ['thirteen', 'thirty', 'forty', 'fifty'] }),
      }),
      typed({
        key: `${phoneNumbers}-thirty-fifty-words`,
        prompt: 'Thẻ ghi 90 / 30 / 80 / 40 / 70 / 50 / 60. Viết bằng từ tiếng Anh, giữ thứ tự.',
        answers: ['ninety thirty eighty forty seventy fifty sixty'],
        explanation: 'Giữ thứ tự thẻ; chú ý forty không có u.',
        vocabIds: ids({ slugs: ['thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'] }),
        mode: 'sequence',
      }),
      choice({
        key: `${phoneNumbers}-sixty-ninety`,
        prompt: 'Chọn dãy từ khớp 60, 70, 80, 90.',
        options: [
          'sixty, seventy, eighty, ninety',
          'sixteen, seventeen, eighteen, nineteen',
          'sixty, eighty, seventy, ninety',
        ],
        correctIndex: 0,
        explanation: '60 sixty; 70 seventy; 80 eighty; 90 ninety.',
        vocabIds: ids({ slugs: ['sixty', 'seventy', 'eighty', 'ninety'] }),
      }),
      typed({
        key: `${phoneNumbers}-phone-words`,
        prompt: "Đổi số điện thoại minh hoạ 07700 / 900 / 123 thành cách đọc từng chữ số. Dùng oh hoặc " +
          "zero cho 0; có thể dùng double hoặc triple.",
        answers: ['oh seven seven oh oh nine oh oh one two three'],
        explanation: "Cách đọc gọn: oh double seven double oh / nine double oh / one two three. Zero cũng " +
          "đúng cho 0.",
        vocabIds: ids({ slugs: ['phone', 'number', 'zero', 'seven', 'nine', 'one', 'two', 'three'] }),
        mode: "phone",
      }),
      choice({
        key: `${phoneNumbers}-hundred`,
        prompt: 'Chọn cách viết 200 bằng từ tiếng Anh.',
        options: ['two hundreds', 'two hundred', 'twenty hundred'],
        correctIndex: 1,
        explanation: 'Two hundred = 200. Không thêm s sau hundred khi có số cụ thể.',
        vocabIds: ids({ slugs: ['hundred'] }),
      }),
      typed({
        key: `${phoneNumbers}-one-hundred`,
        prompt: 'Viết số 100 bằng từ tiếng Anh, bắt đầu bằng one.',
        answers: ['one hundred'],
        explanation: 'One hundred nghĩa là một trăm.',
        vocabIds: ids({ slugs: ['hundred', 'one'] }),
      }),
      choice({
        key: `${phoneNumbers}-review-dialogue`,
        prompt: "Ôn ngày 2: điền lời hỏi còn thiếu. A: Hello! B: Hi! ___ A: My name is Mai. B: I am " +
          "Nam. Nice to meet you.",
        options: ["What is my name?","My name is Mai.","What is your name?"],
        correctIndex: 2,
        explanation: "What is your name? hỏi tên người đối diện trước khi họ tự giới thiệu.",
        vocabIds: ids({ slugs: ['hello', 'hi', 'my', 'is', 'i', 'am', 'nice', 'meet', 'you', 'what', 'your'] }),
      }),
      choice({
        key: `${phoneNumbers}-review-politeness`,
        prompt: 'Ôn ngày 2: chọn dãy đúng theo tình huống nhận lời → từ chối → xin lỗi → chia tay.',
        options: [
          'Yes, please. / No, thank you. / Sorry. / Goodbye.',
          'No, thank you. / Yes, please. / Goodbye. / Sorry.',
          'Sorry. / Goodbye. / Yes, please. / No, thank you.',
        ],
        correctIndex: 0,
        explanation: 'Yes, please nhận lời; no, thank you từ chối lịch sự; sorry xin lỗi; goodbye tạm biệt.',
        vocabIds: ids({ slugs: ['yes', 'please', 'no', 'thank-you', 'sorry', 'goodbye'] }),
      }),
    ], ...meta({ declaration: 'lessons', item: phoneNumbers }),
  },
];

/** Explicit unit schedule: no assumption about lesson count or checkpoint placement.
 * Estimates include the test: 26 minutes core, 29 with the optional activity.
 * Timing is an author estimate; observe beginners before approving this pilot.
 */
export const schedule = [
  {
    day: 1,
    mainLessons: { 'lesson-a': alphabetFirstHalf, 'lesson-b': alphabetSecondHalf },
    sideQuests: [
      { slug: 'f1-day1-shadowing', lessonSlugs: [alphabetFirstHalf, alphabetSecondHalf],
      activity: "Đọc tên chữ theo từng nhóm rồi đánh vần tên của bạn. Nếu có giọng mẫu trình duyệt, " +
        "nghe một nhóm, dừng và đọc nhại." },
    ],
    test: { slug: 'f1-day1', kind: 'daily', reviewVocabIds: [], warmUp: true },
  },
  {
    day: 2,
    mainLessons: { 'lesson-a': greetings, 'lesson-b': introductions },
    sideQuests: [
      { slug: 'f1-day2-shadowing', lessonSlugs: [greetings],
      activity: "Đọc Hello! My name is Nam. Nice to meet you. Thay Nam bằng tên của bạn, rồi đọc What " +
        "is your name? Nếu có giọng mẫu trình duyệt, nghe rồi đọc nhại từng câu." },
    ],
    test: { slug: 'f1-day2', kind: 'daily', reviewVocabIds: dayOneWords, warmUp: false },
  },
  {
    day: 3,
    mainLessons: { 'lesson-a': smallNumbers, 'lesson-b': phoneNumbers },
    sideQuests: [
      { slug: 'f1-day3-shadowing', lessonSlugs: [phoneNumbers],
      activity: "Đọc số minh hoạ 07700 / 900 / 123, nghỉ giữa các nhóm; thử dùng oh và double. Tự ghi " +
        "âm rồi kiểm tra lại thứ tự các chữ số." },
    ],
    test: { slug: 'f1-day3', kind: 'daily',
      reviewVocabIds: [...introduced({ lessonSlug: alphabetSecondHalf }), ...dayTwoWords], warmUp: false },
  },
] as const;

/** Categories name schedule lesson slots; review/checkpoint categories group by unit. */
function daily({ question, day, category }: {
  question: Question; day: number; category: string;
}): Question {
  const key = question.id.replace('en:question:', '');
  const entry = schedule.find((entry) => entry.day === day)!;
  const lesson = (entry.mainLessons as Readonly<Record<string, string>>)[category];
  return { ...question, id: `en:assessment:${key}`, category,
    group: lesson === undefined ? unit.id : `en:lesson:${lesson}`,
    ...meta({ declaration: 'assessments', item: key }) };
}

export const assessments: readonly Question[] = [
  daily({
    question: choice({
      key: 'f1-day1-a-order',
      prompt: "Ngày 1: trong English alphabet, các tên chữ “bee, see, dee” tạo nhóm nào?",
      options: ['B-C-D', 'B-D-C', 'C-B-D'],
      correctIndex: 0,
      explanation: 'C nằm giữa B và D.',
      vocabIds: ids({ slugs: ['english', 'alphabet'] }),
    }),
    day: 1,
    category: 'lesson-a',
  }),
  daily({
    question: typed({
      key: 'f1-day1-a-case',
      prompt: 'Ngày 1: sửa chữ hoa trong nhãn “english alphabet”. Gõ lại cả nhãn.',
      answers: ['English alphabet'],
      explanation: 'Tên ngôn ngữ English viết hoa; alphabet là danh từ thường.',
      vocabIds: ids({ slugs: ['english', 'alphabet'] }),
      mode: 'case-sensitive',
    }),
    day: 1,
    category: 'lesson-a',
  }),
  daily({
    question: choice({
      key: 'f1-day1-a-learn',
      prompt: "Ngày 1: chọn nghĩa đúng của learn / letter theo thứ tự.",
      options: [{ vi: 'Chữ cái / học' }, { vi: 'Học / chữ cái' }, { vi: 'Học / bảng chữ cái' }],
      correctIndex: 1,
      explanation: "Learn là học, letter là chữ cái.",
      vocabIds: ids({ slugs: ['learn', 'letter'] }),
    }),
    day: 1,
    category: 'lesson-a',
  }),
  daily({
    question: typed({
      key: 'f1-day1-a-code',
      prompt: "Ngày 1: mã được đọc bằng tên chữ “kay, eye, dee”. Gõ từng chữ, có dấu phân cách.",
      answers: ['K-I-D'],
      explanation: 'KID có ba chữ K, I, D. Đây là mã trên thẻ.',
      vocabIds: ids({ slugs: ['letter'] }),
      mode: 'spelling',
    }),
    day: 1,
    category: 'lesson-a',
  }),
  daily({
    question: choice({
      key: 'f1-day1-b-spelling',
      prompt: "Ngày 1: với câu hỏi “How do you spell ...?”, tên gọi được đánh vần “kay, aitch, ay, " +
        "en, aitch”. Chọn cách ghi tách chữ.",
      options: ['K-H-A-N-H', 'K-H-N-A-H', 'K-A-H-N-H'],
      correctIndex: 0,
      explanation: 'Khanh có thứ tự K-H-A-N-H.',
      vocabIds: ids({ slugs: ['how', 'spell', 'name'] }),
    }),
    day: 1,
    category: 'lesson-b',
  }),
  daily({
    question: typed({
      key: 'f1-day1-b-surname',
      prompt: "Ngày 1: trên biểu mẫu, Surname được đọc bằng tên chữ “tee, ar, ay, en”. Gõ từng chữ " +
        "của họ.",
      answers: ['T-R-A-N'],
      explanation: 'Surname là họ; Tran đánh vần T-R-A-N.',
      vocabIds: ids({ slugs: ['name', 'surname', 'spell'] }),
      mode: 'spelling',
    }),
    day: 1,
    category: 'lesson-b',
  }),
  daily({
    question: choice({
      key: 'f1-day1-b-order',
      prompt: "Ngày 1: chọn nhóm chữ từ tên chữ “pee, cue, ar, es”, giữ thứ tự.",
      options: ['P-R-Q-S', 'Q-P-R-S', 'P-Q-R-S'],
      correctIndex: 2,
      explanation: 'Thứ tự là P, Q, R, S.',
      vocabIds: ids({ slugs: ['alphabet', 'letter'] }),
    }),
    day: 1,
    category: 'lesson-b',
  }),
  daily({
    question: typed({
      key: 'f1-day1-review-code',
      prompt: "Khởi động ngày 1: mã được đọc “bee, ee, jee”. Gõ từng chữ, dùng dấu phân cách.",
      answers: ['B-E-G'],
      explanation: 'Giữ thứ tự B, E, G.',
      vocabIds: ids({ slugs: ['alphabet', 'letter'] }),
      mode: 'spelling',
    }),
    day: 1,
    category: 'review',
  }),
  daily({
    question: choice({
      key: 'f1-day1-review-name',
      prompt: "Khởi động ngày 1: với câu hỏi “How do you spell ...?”, tên gọi được đọc “oh, ay, en, " +
        "aitch”. Chọn dãy chữ đúng.",
      options: ['O-N-A-H', 'O-A-N-H', 'O-A-H-N'],
      correctIndex: 1,
      explanation: 'Oanh đánh vần O-A-N-H.',
      vocabIds: ids({ slugs: ['how', 'spell', 'name'] }),
    }),
    day: 1,
    category: 'review',
  }),
  daily({
    question: typed({
      key: 'f1-day1-review-h',
      prompt: "Khởi động ngày 1: mã được đọc “aitch, jay, el”. Gõ từng chữ, có dấu phân cách.",
      answers: ['H-J-L'],
      explanation: 'Ba chữ trên thẻ là H, J, L.',
      vocabIds: ids({ slugs: ['alphabet', 'letter'] }),
      mode: 'spelling',
    }),
    day: 1,
    category: 'review',
  }),
  daily({
    question: choice({
      key: 'f1-day2-a-greeting',
      prompt: 'Ngày 2: mới gặp Quynh. Chọn lời chào có tên Quynh.',
      options: ['Goodbye, Quynh!', 'Hello, Quynh!', 'Sorry, Quynh.'],
      correctIndex: 1,
      explanation: 'Hello mở đầu lời chào khi gặp mặt.',
      vocabIds: ids({ slugs: ["hello"] }),
    }),
    day: 2,
    category: 'lesson-a',
  }),
  daily({
    question: typed({
      key: 'f1-day2-a-thanks',
      prompt: "Ngày 2: Quynh giúp bạn điền biểu mẫu. Gõ lời cảm ơn đã học.",
      answers: ['Thank you.'],
      explanation: 'Dùng Thank you để cảm ơn.',
      vocabIds: ids({ slugs: ['thank-you'] }),
    }),
    day: 2,
    category: 'lesson-a',
  }),
  daily({
    question: choice({
      key: 'f1-day2-a-leaving',
      prompt: 'Ngày 2: sắp rời đi, bạn muốn chào Dung bằng tên. Chọn lời phù hợp.',
      options: ['Hi, Dung!', 'Sorry, Dung.', 'Goodbye, Dung!'],
      correctIndex: 2,
      explanation: 'Goodbye dùng khi chia tay.',
      vocabIds: ids({ slugs: ['hi', 'sorry', 'goodbye'] }),
    }),
    day: 2,
    category: 'lesson-a',
  }),
  daily({
    question: typed({
      key: 'f1-day2-a-meet',
      prompt: 'Ngày 2: làm quen với Bao. Gõ cả câu “Rất vui được gặp bạn, Bao”, bắt đầu bằng Nice.',
      answers: ['Nice to meet you, Bao.'],
      explanation: 'Dùng cả câu Nice to meet you, Bao.',
      vocabIds: ids({ slugs: ['nice', 'meet'] }),
    }),
    day: 2,
    category: 'lesson-a',
  }),
  daily({
    question: choice({
      key: 'f1-day2-b-intro',
      prompt: 'Ngày 2: Linh muốn tự giới thiệu tên mình. Chọn câu phù hợp.',
      options: ['What is your name, Linh?', 'My name is Linh.', 'My name is Quynh.'],
      correctIndex: 1,
      explanation: 'My name is Linh giới thiệu tên người nói là Linh.',
      vocabIds: ids({ slugs: ['what', 'your', 'my', 'name', 'is'] }),
    }),
    day: 2,
    category: 'lesson-b',
  }),
  daily({
    question: typed({
      key: 'f1-day2-b-name',
      prompt: 'Ngày 2: giới thiệu “Tôi là Hanh”, bắt đầu bằng I.',
      answers: ['I am Hanh.'],
      explanation: 'I am Hanh hoặc I’m Hanh đều đúng.',
      vocabIds: ids({ slugs: ['i', 'am'] }),
    }),
    day: 2,
    category: 'lesson-b',
  }),
  daily({
    question: typed({
      key: 'f1-day2-b-capitals',
      prompt: 'Ngày 2: sửa chữ hoa trong “my name is vy”. Gõ lại cả câu.',
      answers: ['My name is Vy.'],
      explanation: 'Viết hoa đầu câu My và tên riêng Vy.',
      vocabIds: ids({ slugs: ['my', 'name', 'is'] }),
      mode: 'case-sensitive',
    }),
    day: 2,
    category: 'lesson-b',
  }),
  daily({
    question: choice({
      key: 'f1-day2-review-letters',
      prompt: "Ôn ngày 1: ghép learn → letter → alphabet → English với nghĩa theo thứ tự.",
      options: [
        { vi: 'Chữ cái / học / tiếng Anh / bảng chữ cái' },
        { vi: 'Học / bảng chữ cái / chữ cái / tiếng Anh' },
        { vi: 'Học / chữ cái / bảng chữ cái / tiếng Anh' },
      ],
      correctIndex: 2,
      explanation: "Learn: học; letter: chữ cái; alphabet: bảng chữ cái; English: tiếng Anh.",
      vocabIds: ids({ slugs: ['learn', 'english', 'alphabet', 'letter'] }),
    }),
    day: 2,
    category: 'review',
  }),
  daily({
    question: typed({
      key: 'f1-day2-review-surname',
      prompt: "Ôn ngày 1: trên biểu mẫu, Surname được đọc “bee, you, eye”. Với câu hỏi “How do you " +
        "spell ...?”, gõ từng chữ của họ.",
      answers: ['B-U-I'],
      explanation: 'Họ Bùi được viết không dấu là Bui: B-U-I.',
      vocabIds: ids({ slugs: ['name', 'surname', 'how', 'spell'] }),
      mode: 'spelling',
    }),
    day: 2,
    category: 'review',
  }),
  daily({
    question: typed({
      key: 'f1-day2-review-code',
      prompt: "Ôn ngày 1: mã được đọc “jay, ay, zed, zed”. Gõ từng chữ; có thể dùng double cho hai " +
        "chữ giống nhau.",
      answers: ['J-A-Z-Z'],
      explanation: 'Mã có bốn chữ J, A, Z, Z.',
      vocabIds: ids({ slugs: ['letter', 'alphabet'] }),
      mode: 'spelling',
    }),
    day: 2,
    category: 'review',
  }),
  daily({
    question: choice({
      key: 'f1-day3-a-count',
      prompt: 'Ngày 3: chọn dãy từ ứng với 2, 4, 6, 8.',
      options: ['two, four, eight, six', 'two, four, six, eight', 'four, two, six, eight'],
      correctIndex: 1,
      explanation: 'Dãy là two, four, six, eight.',
      vocabIds: ids({ slugs: ['two', 'four', 'six', 'eight'] }),
    }),
    day: 3,
    category: 'lesson-a',
  }),
  daily({
    question: typed({
      key: 'f1-day3-a-words',
      prompt: 'Ngày 3: thẻ ghi 14 / 16 / 18. Viết ba số bằng từ tiếng Anh, giữ thứ tự.',
      answers: ['fourteen sixteen eighteen'],
      explanation: 'Fourteen = 14, sixteen = 16, eighteen = 18.',
      vocabIds: ids({ slugs: ['fourteen', 'sixteen', 'eighteen'] }),
      mode: 'sequence',
    }),
    day: 3,
    category: 'lesson-a',
  }),
  daily({
    question: choice({
      key: 'f1-day3-a-order',
      prompt: 'Ngày 3: chọn dãy tăng dần từ 10 đến 13.',
      options: ['ten, twelve, eleven, thirteen', 'eleven, ten, twelve, thirteen', 'ten, eleven, twelve, thirteen'],
      correctIndex: 2,
      explanation: 'Sau ten là eleven, twelve, thirteen.',
      vocabIds: ids({ slugs: ['ten', 'eleven', 'twelve', 'thirteen'] }),
    }),
    day: 3,
    category: 'lesson-a',
  }),
  daily({
    question: typed({
      key: 'f1-day3-a-digits',
      prompt: 'Ngày 3: thẻ ghi “seventeen, five, nineteen”. Đổi thành ba số.',
      answers: ['17 5 19'],
      explanation: 'Giữ thứ tự 17, 5, 19; tách các số để tránh nhầm.',
      vocabIds: ids({ slugs: ['seventeen', 'five', 'nineteen'] }),
      mode: 'sequence',
    }),
    day: 3,
    category: 'lesson-a',
  }),
  daily({
    question: typed({
      key: 'f1-day3-b-phone',
      prompt: "Ngày 3: số điện thoại minh hoạ được đọc oh double seven double oh / nine oh one / four " +
        "double two. Gõ đủ các chữ số.",
      answers: ['0 7 7 0 0 9 0 1 4 2 2'],
      explanation: 'Ghép 07700 / 901 / 422 → 07700901422.',
      vocabIds: ids({ slugs: ['phone', 'number', 'zero', 'seven', 'nine', 'one', 'four', 'two'] }),
      mode: 'sequence',
    }),
    day: 3,
    category: 'lesson-b',
  }),
  daily({
    question: choice({
      key: 'f1-day3-b-stress',
      prompt: "Ngày 3: chọn vị trí nhấn chính khi đọc riêng 15 và 50.",
      options: [
        { vi: '15: âm tiết đầu; 50: âm tiết cuối' },
        { vi: '15: âm tiết đầu; 50: âm tiết đầu' },
        { vi: '15: âm tiết cuối; 50: âm tiết đầu' },
      ],
      correctIndex: 2,
      explanation: '15 nhấn -TEEN; 50 nhấn FIF-.',
      vocabIds: ids({ slugs: ['fifteen', 'fifty'] }),
    }),
    day: 3,
    category: 'lesson-b',
  }),
  daily({
    question: typed({
      key: 'f1-day3-b-hundred',
      prompt: 'Ngày 3: viết 300 bằng từ tiếng Anh.',
      answers: ['three hundred'],
      explanation: 'Dùng three hundred, không thêm s sau hundred.',
      vocabIds: ids({ slugs: ['three', 'hundred'] }),
    }),
    day: 3,
    category: 'lesson-b',
  }),
  daily({
    question: choice({
      key: 'f1-day3-review-dialogue',
      prompt: "Ôn ngày 2: Kien và Yen mới làm quen. “Hello!” — “Hi! Nice to meet you.” Kien muốn hỏi " +
        "tên Yen. Chọn lời hỏi và lời tự giới thiệu phù hợp.",
      options: [
        "What is my name? / My name is Yen.",
        "What is your name? / I am Yen.",
        "My name is Kien. / What is my name?",
      ],
      correctIndex: 1,
      explanation: 'What is your name? hỏi tên người đối diện; my chỉ người nói.',
      vocabIds: ids({ slugs: ['hello', 'hi', 'my', 'name', 'is', 'i', 'am', 'nice', 'meet', 'you', 'what', 'your'] }),
    }),
    day: 3,
    category: 'review',
  }),
  daily({
    question: choice({
      key: 'f1-day3-review-polite',
      prompt: "Ôn ngày 2: Kien nhận lời giúp đỡ, Yen từ chối; rồi Kien xin lỗi vì làm rơi thẻ và cả " +
        "hai chia tay. Chọn bốn lời theo thứ tự.",
      options: [
        "No, thank you, Yen. / Yes, please, Kien. / Goodbye, Yen. / Sorry, Kien.",
        "Yes, please, Yen. / No, thank you, Kien. / Sorry, Yen. / Goodbye, Kien.",
        "Sorry, Yen. / Goodbye, Kien. / Yes, please, Yen. / No, thank you, Kien.",
      ],
      correctIndex: 1,
      explanation: 'Yes, please nhận lời; no, thank you từ chối. Sorry xin lỗi; goodbye chia tay.',
      vocabIds: ids({ slugs: ['yes', 'please', 'no', 'thank-you', 'sorry', 'goodbye'] }),
    }),
    day: 3,
    category: 'review',
  }),
  daily({
    question: typed({
      key: 'f1-day3-review-name',
      prompt: "Ôn ngày 1: First name được đọc “pee, aitch, you, see”; Surname: Do. Với câu hỏi “How " +
        "do you spell ...?”, gõ từng chữ của tên gọi.",
      answers: ['P-H-U-C'],
      explanation: 'Tên gọi Phuc có bốn chữ P-H-U-C; Do là họ.',
      vocabIds: ids({ slugs: ['name', 'surname', 'how', 'spell'] }),
      mode: 'spelling',
    }),
    day: 3,
    category: 'review',
  }),
];

export const tests: readonly Test[] = schedule.map(({ test }) => ({
  id: `en:test:${test.slug}`, kind: test.kind, passRatio: 0.85,
  questionIds: assessments.filter((question) => question.id.startsWith(`en:assessment:${test.slug}-`))
    .map(({ id }) => id),
  reviewVocabIds: test.reviewVocabIds,
  ...meta({ declaration: 'tests', item: test.slug }),
}));

export const quests: readonly Quest[] = [
  ...lessons.map((lesson) => ({
    id: lesson.id.replace('en:lesson:', 'en:quest:'), stageId: STAGE, titles: lesson.titles!,
    skill: lesson.skill, minutes: 10, xp: XP.main, lessonIds: [lesson.id], optional: false,
    extensions: { 'en:icon': 'Aa' }, ...meta({ declaration: 'quests', item: lesson.id }),
  })),
  ...schedule.map(({ day, mainLessons, test }) => ({
    id: `en:quest:${test.slug}-test`, stageId: STAGE,
    titles: { vi: test.warmUp ? 'Bài kiểm tra ngày 1 — có phần khởi động' : `Bài kiểm tra ngày ${day}`,
      en: test.warmUp ? 'Day 1 test with warm-up' : `Day ${day} test` },
    skill: 'vocabulary', minutes: 6, xp: XP.daily, lessonIds: [], optional: false,
    extensions: { 'en:test-policy': { testId: `en:test:${test.slug}`,
      afterQuestIds: Object.values(mainLessons).map((slug) => `en:quest:${slug}`),
      repeatXp: XP.repeat, reward: 'first-pass-per-day' } }, ...meta({ declaration: 'quests', item: test.slug }),
  })),
  ...schedule.flatMap(({ day, sideQuests }) => sideQuests.map((side) => ({
    id: `en:quest:${side.slug}`, stageId: STAGE,
    titles: { vi: `Đọc nhại ngày ${day}`, en: `Day ${day} shadowing` },
    skill: 'speaking', minutes: 3, xp: XP.side,
    lessonIds: side.lessonSlugs.map((slug) => `en:lesson:${slug}`), optional: true,
    extensions: { 'en:activity': { vi: side.activity } }, ...meta({ declaration: 'quests', item: side.slug }),
  }))),
];

export const days: readonly Day[] = schedule.map(({ day, mainLessons, sideQuests, test }) => ({
  id: `en:day:${test.slug}`, stageId: STAGE, unitId: unit.id, day,
  mainQuestIds: Object.values(mainLessons).map((slug) => `en:quest:${slug}`),
  sideQuestIds: sideQuests.map((side) => `en:quest:${side.slug}`),
  testId: `en:test:${test.slug}`, ...meta({ declaration: 'days', item: test.slug }),
}));

export default { unit, lessons, quests, assessments, days, tests } satisfies UnitContent;

