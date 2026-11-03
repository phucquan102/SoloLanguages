import type { Day, Lesson, LessonBlock, LocalizedText, Question, Quest, Test, Unit } from '@solo/content-schema';
import { authored } from '../provenance.ts';
import { hskVocabManifest } from '../manifest/hsk.ts';
import { hanziForms, pinyinForms, toneForms } from '../answer-forms.ts';
import { XP } from '../unit-content.ts';
import type { UnitContent } from '../unit-content.ts';
import type { AnswerMode } from '../../grading.ts';

const FILE = 'languages/zh/src/content/foundation/n1.ts';
const STAGE = 'zh:stage:foundation';
const UNIT = 'zh:unit:n1';
const meta = ({ declaration, item }: { declaration: string; item: string }) => authored(FILE, declaration, item);
const ids = ({ slugs }: { slugs: string[] }) => slugs.map((slug) => `zh:vocab:${slug}`);
const introduced = ({ lessonSlug }: { lessonSlug: string }) => hskVocabManifest
  .filter((row) => row.unitId === UNIT && row.lessonSlug === lessonSlug).map((row) => row.id);

const pinyin = 'pinyin';
const tone = 'tone';
const initialsLabial = 'initials-bpmf-dtnl';
const initialsVelar = 'initials-gkh-jqx';
const initialsSibilant = 'initials-zcs-zhchshr';
const finalsCompound = 'finals-compound';
const finalsNasal = 'finals-nasal';
const neutralTone = 'neutral-tone';
const sandhiThird = 'sandhi-third';
const sandhiBuYi = 'sandhi-bu-yi';
const spellingRules = 'spelling-rules';
const vocabulary = 'vocab';

const vi = (text: string): LocalizedText => ({ vi: text });

function choice({ key, prompt, options, correctIndex, explanation, vocabIds, listen }: {
  key: string; prompt: string; options: (string | LocalizedText)[]; correctIndex: number;
  explanation: string; vocabIds?: string[]; listen?: string;
}): Question {
  return { id: `zh:question:${key}`, kind: 'choice', prompt: vi(prompt), options, correctIndex,
    explanations: vi(explanation), vocabIds: vocabIds ?? [],
    ...(listen === undefined ? {} : { extensions: { 'zh:listening': { speak: listen, voice: 'browser-tts' } } }),
    ...meta({ declaration: 'practice', item: key }) };
}
/** Every typed question names its answer mode; the stored forms follow the mode (pinyin forms, hanzi, digit). */
function typed({ key, prompt, answers, explanation, mode, vocabIds }: {
  key: string; prompt: string; answers: string[]; explanation: string; mode: AnswerMode; vocabIds?: string[];
}): Question {
  const forms = mode === 'pinyin' || mode === 'pinyin-sandhi' ? pinyinForms(...answers)
    : mode === 'hanzi' ? hanziForms(...answers) : mode === 'tone-number' ? toneForms(...answers) : answers;
  return { id: `zh:question:${key}`, kind: 'typed', prompt: vi(prompt), acceptedAnswers: forms,
    extensions: { 'zh:answer-mode': mode }, explanations: vi(explanation), vocabIds: vocabIds ?? [],
    ...meta({ declaration: 'practice', item: key }) };
}
function example({ text, translation, vocabIds, transcription }: {
  text: string; translation: string; vocabIds?: string[]; transcription?: string;
}): LessonBlock {
  return { kind: 'example', text, translations: vi(translation),
    ...(vocabIds === undefined ? {} : { vocabIds }),
    ...(transcription === undefined ? {} : { transcription }) };
}
const objective = ({ text }: { text: string }): LessonBlock => ({ kind: 'objective', text: vi(text) });
const explain = ({ text, pattern }: { text: string; pattern?: string }): LessonBlock =>
  ({ kind: 'explanation', text: vi(text), ...(pattern ? { pattern } : {}) });
const tip = ({ text }: { text: string }): LessonBlock => ({ kind: 'tip', text: vi(text) });
// Mistake blocks are contrastive teaching targets drawn from the Vietnamese-speaker contrasts in the authoring
// guide (aspiration, retroflex, ü, final -n/-ng, Sino-Vietnamese finals, tone sandhi). They are author hypotheses,
// not measured error rates: the learner text only states the contrast and the fix, never a frequency.
const mistake = ({ wrong, right, note }: { wrong: string; right: string; note: string }): LessonBlock =>
  ({ kind: 'mistake', wrong, right, note: vi(note) });

export const unit: Unit = {
  id: UNIT, stageId: STAGE, order: 1,
  titles: { vi: 'Pinyin, thanh điệu và lời chào đầu tiên', en: 'Pinyin, tones and first words' },
  canDo: [
    { vi: 'Đọc và viết pinyin: sáu nguyên âm, 21 phụ âm đầu và các vần ghép, vần mũi.' },
    { vi: 'Phân biệt bốn thanh, thanh nhẹ và biết khi nào thanh 3, 不, 一 đổi thanh lúc đọc liền.' },
    { vi: 'Viết đúng pinyin theo quy tắc y/w, ü sau j q x, iu/ui/un và vị trí dấu thanh.' },
    { vi: 'Chào hỏi, cảm ơn, xin lỗi và tạm biệt bằng sáu từ đầu tiên.' },
  ], ...meta({ declaration: 'unit', item: 'n1' }),
};

export const lessons: readonly Lesson[] = [
  {
    id: `zh:lesson:${pinyin}`, stageId: STAGE, unitId: UNIT, order: 1, skill: 'zh:pinyin',
    titles: { vi: 'Pinyin và sáu nguyên âm đơn', en: 'Pinyin and the six simple vowels' },
    vocabIds: introduced({ lessonSlug: pinyin }),
    blocks: [
      objective({ text: "Hiểu pinyin là hệ ghi âm; đọc, nhận ra sáu nguyên âm đơn a, o, e, i, u, ü và phân biệt u với ü." }),
      explain({
        text: "Pinyin (拼音) là hệ chữ Latin ghi cách đọc tiếng Trung phổ thông; chữ Hán không cho biết âm đọc. " +
          "Bạn đã quen với chữ Latin, nhưng nhiều chữ trong pinyin đọc khác tiếng Việt, nên hãy đọc theo bảng của " +
          "pinyin chứ không theo chính tả tiếng Việt. Bài này chỉ làm quen sáu nguyên âm, chưa có dấu thanh. " +
          "a: miệng mở rộng, gần “a” trong “ba”. o: tròn môi, gần “ô”. e: môi không tròn, lưỡi lùi về phía sau, " +
          "khác “e” tiếng Việt. i: môi dẹt, gần “i”. u: chụm môi tròn, gần “u”. ü: để lưỡi như khi đọc i rồi chu " +
          "môi tròn như khi đọc u. Hai chấm trên ü là một phần của chữ cái, không phải dấu thanh.",
      }),
      example({ text: 'a o e', translation: "Ba nguyên âm: a mở rộng miệng, o tròn môi, e không tròn môi và lưỡi lùi về sau." }),
      example({ text: 'i u ü', translation: "Ba nguyên âm: i môi dẹt, u chụm môi tròn, ü giữ lưỡi như i và chu môi tròn." }),
      example({ text: '女', transcription: 'nǚ', translation: "nữ, con gái; có nguyên âm ü." }),
      example({ text: '路 / 绿', transcription: 'lù / lǜ', translation: "đường / màu xanh lá; hai âm tiết chỉ khác nhau ở u và ü." }),
      example({ text: '鹅', transcription: 'é', translation: "con ngỗng; nguyên âm e đứng một mình." }),
      mistake({
        wrong: 'nǔ (女)', right: 'nǚ (女)',
        note: "Đọc ü thành u làm đổi từ: lù (đường) khác lǜ (xanh lá). Hãy giữ lưỡi như khi đọc i rồi chu môi tròn; hai chấm báo hiệu âm này.",
      }),
      tip({ text: "Đứng trước gương: o, u, ü cần tròn môi; i và e môi dẹt. Với ü, đọc i trước rồi chu môi mà không đổi vị trí lưỡi. Bàn phím thường không có ü: gõ v hoặc u: để thay." }),
    ],
    questions: [
      choice({
        key: `${pinyin}-two-dots`, prompt: "Nguyên âm nào có hai chấm phía trên?",
        options: ['u', 'ü', 'i'], correctIndex: 1,
        explanation: "Hai chấm là một phần của chữ ü; đây là nguyên âm khác u, không phải dấu thanh.",
      }),
      choice({
        key: `${pinyin}-lu-road`,
        prompt: "Hai chữ 路 (đường) và 绿 (màu xanh lá) chỉ khác nhau ở u và ü. Chọn pinyin của 路, tạm bỏ dấu thanh.",
        options: ['lü', 'lu', 'li'], correctIndex: 1,
        explanation: "路 là lù, có u (chụm môi); 绿 là lǜ, có ü.",
      }),
      choice({
        key: `${pinyin}-e-back`,
        prompt: "Nguyên âm nào đọc không tròn môi, lưỡi lùi về phía sau và khác “e” tiếng Việt?",
        options: ['o', 'a', 'e'], correctIndex: 2,
        explanation: "e trong pinyin đọc với môi dẹt và lưỡi lùi sau; o tròn môi, a mở rộng miệng.",
      }),
      choice({
        key: `${pinyin}-no-rounding`, prompt: "Nguyên âm nào KHÔNG cần tròn môi?",
        options: ['o', 'u', 'i'], correctIndex: 2,
        explanation: "i đọc với môi dẹt; o và u đều tròn môi.",
      }),
      typed({
        key: `${pinyin}-umlaut`,
        prompt: "Môi tròn, lưỡi để như khi đọc i. Gõ nguyên âm này (cách gõ nguyên âm này trên bàn phím có trong phần lưu ý của bài).",
        answers: ['ü'], mode: 'pinyin-toneless',
        explanation: "Đó là ü; trên bàn phím có thể gõ v hoặc u: để thay cho ü.",
      }),
      typed({
        key: `${pinyin}-nv`, prompt: "Chữ 女 (nữ, con gái) có nguyên âm ü. Gõ pinyin của chữ này, tạm bỏ dấu thanh.",
        answers: ['nü'], mode: 'pinyin-toneless',
        explanation: "女 là nǚ; bỏ dấu thanh còn nü. Viết nu là âm khác.",
      }),
      typed({
        key: `${pinyin}-lv`, prompt: "Gõ pinyin của 绿 (màu xanh lá), tạm bỏ dấu thanh.",
        answers: ['lü'], mode: 'pinyin-toneless',
        explanation: "绿 là lǜ; bỏ dấu thanh còn lü, không phải lu.",
      }),
      typed({
        key: `${pinyin}-open-a`, prompt: "Gõ nguyên âm đơn mà miệng mở rộng nhất.",
        answers: ['a'], mode: 'pinyin-toneless',
        explanation: "a là nguyên âm mở rộng nhất.",
      }),
    ], ...meta({ declaration: 'lessons', item: pinyin }),
  },
  {
    id: `zh:lesson:${tone}`, stageId: STAGE, unitId: UNIT, order: 2, skill: 'zh:tones',
    titles: { vi: 'Bốn thanh điệu', en: 'The four tones' }, vocabIds: introduced({ lessonSlug: tone }),
    blocks: [
      objective({ text: "Nhận ra và đọc bốn thanh; chọn đúng thanh theo đường nét giọng; viết dấu hoặc số thanh cho một âm tiết." }),
      explain({
        text: "Tiếng Trung phổ thông có bốn thanh chính; cùng một âm tiết, đổi thanh là đổi chữ và đổi nghĩa. " +
          "Hãy hình dung giọng trên thang từ thấp đến cao. Thanh 1 (ā): giữ cao và bằng. Thanh 2 (á): đi lên từ " +
          "mức giữa lên cao. Thanh 3 (ǎ): xuống thấp rồi lên nhẹ. Thanh 4 (à): rơi nhanh từ cao xuống thấp. " +
          "Dấu thanh viết trên nguyên âm; có thể thay dấu bằng số đặt sau âm tiết: mā = ma1, má = ma2, mǎ = ma3, " +
          "mà = ma4. Cả hai cách đều đúng. Dấu và đường nét giọng không hoàn toàn trùng với dấu thanh tiếng Việt, " +
          "vì vậy hãy học theo đường nét giọng.",
      }),
      example({ text: '妈', transcription: 'mā', translation: "mẹ; thanh 1." }),
      example({ text: '麻', transcription: 'má', translation: "cây gai; thanh 2." }),
      example({ text: '马', transcription: 'mǎ', translation: "ngựa; thanh 3." }),
      example({ text: '骂', transcription: 'mà', translation: "mắng; thanh 4." }),
      example({ text: '八 / 爸', transcription: 'bā / bà', translation: "tám / bố; cùng âm ba, thanh 1 và thanh 4." }),
      example({ text: 'mǎ = ma3', translation: "Dấu thanh và số thanh là hai cách viết của cùng một âm tiết." }),
      mistake({
        wrong: 'má (马)', right: 'mǎ (马)',
        note: "Thanh 2 chỉ đi lên; thanh 3 có đoạn xuống thấp rồi mới lên nhẹ. Đọc 马 như má sẽ nghe thành từ khác.",
      }),
      mistake({
        wrong: 'mà (妈)', right: 'mā (妈)',
        note: "Thanh 1 phải giữ cao và đều đến hết âm tiết; nếu giọng tụt xuống ở cuối, bạn đang đọc thanh 4.",
      }),
      tip({ text: "Vẽ đường nét bằng ngón tay khi đọc: ngang cao, lên, xuống rồi lên, rơi. Chuyển động tay giúp giọng đi theo." }),
    ],
    questions: [
      choice({
        key: `${tone}-level`, prompt: "Âm giữ cao và bằng, không lên không xuống. Đó là thanh mấy?",
        options: [vi('Thanh 2'), vi('Thanh 1'), vi('Thanh 4')], correctIndex: 1,
        explanation: "Giữ cao và bằng là thanh 1 (ā).",
      }),
      choice({
        key: `${tone}-rising`, prompt: "Giọng bắt đầu ở mức giữa rồi đi lên cao. Đó là thanh mấy?",
        options: [vi('Thanh 2'), vi('Thanh 3'), vi('Thanh 4')], correctIndex: 0,
        explanation: "Đi lên từ giữa lên cao là thanh 2 (á).",
      }),
      choice({
        key: `${tone}-third-mark`, prompt: "Chọn âm tiết mang thanh 3 (xuống thấp rồi lên nhẹ).",
        options: ['mā', 'mǎ', 'mà'], correctIndex: 1,
        explanation: "Dấu ˇ là thanh 3: mǎ.",
      }),
      choice({
        key: `${tone}-falling`, prompt: "Chọn âm tiết có giọng rơi nhanh từ cao xuống thấp.",
        options: ['bà', 'bá', 'bā'], correctIndex: 0,
        explanation: "Rơi từ cao xuống thấp là thanh 4, dấu `: bà.",
      }),
      choice({
        key: `${tone}-listen-third`, prompt: "Bấm nghe âm tiết rồi chọn thanh của nó.",
        options: [vi('Thanh 1'), vi('Thanh 2'), vi('Thanh 3')], correctIndex: 2, listen: '马',
        explanation: "Âm tiết là mǎ, thanh 3: giọng xuống thấp rồi lên nhẹ.",
      }),
      choice({
        key: `${tone}-listen-fourth`, prompt: "Bấm nghe rồi chọn âm tiết bạn nghe được.",
        options: ['mā', 'má', 'mà'], correctIndex: 2, listen: '骂',
        explanation: "Âm tiết là mà: giọng rơi nhanh từ cao xuống thấp.",
      }),
      typed({
        key: `${tone}-ma-second`,
        prompt: "Âm tiết ma với giọng đi lên từ mức giữa lên cao. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['má'], mode: 'pinyin', explanation: "Đi lên là thanh 2: má (ma2).",
      }),
      typed({
        key: `${tone}-ba-first`,
        prompt: "Chữ 八 (tám) đọc là ba với giọng giữ cao và bằng. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['bā'], mode: 'pinyin', explanation: "Giữ cao và bằng là thanh 1: bā (ba1).",
      }),
      typed({
        key: `${tone}-number-ba-fourth`, prompt: "Âm tiết bà (爸, bố) mang thanh mấy? Gõ một số.",
        answers: ['4'], mode: 'tone-number', explanation: "Dấu ` là thanh 4.",
      }),
      typed({
        key: `${tone}-ba-third`,
        prompt: "Âm tiết ba với giọng xuống thấp rồi lên nhẹ. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['bǎ'], mode: 'pinyin', explanation: "Xuống thấp rồi lên nhẹ là thanh 3: bǎ (ba3).",
      }),
    ], ...meta({ declaration: 'lessons', item: tone }),
  },
  {
    id: `zh:lesson:${initialsLabial}`, stageId: STAGE, unitId: UNIT, order: 3, skill: 'zh:pinyin',
    titles: { vi: 'Phụ âm b p m f d t n l', en: 'Initials b p m f d t n l' },
    vocabIds: introduced({ lessonSlug: initialsLabial }),
    blocks: [
      objective({ text: "Phân biệt b–p và d–t theo luồng hơi, đọc m f n l và ghép phụ âm đầu với nguyên âm thành âm tiết." }),
      explain({
        text: "Phụ âm đầu (声母) đứng trước vần. Bài này học b p m f d t n l. Cặp b–p và d–t khác nhau ở luồng hơi, " +
          "không phải ở việc rung dây thanh: b và d không bật hơi; p và t bật hơi mạnh. Đặt một tờ giấy trước miệng: " +
          "đọc b, d giấy gần như không động; đọc p, t giấy bay. Gần đúng với tiếng Việt: d gần “t” trong “tôi”, t gần " +
          "“th” trong “thôi”, b gần “p” trong “pin”, còn p là âm đó nhưng bật hơi. Vì vậy b trong pinyin không đọc như " +
          "“b” tiếng Việt và d không đọc như “đ”. f gần “ph”; m, n, l như tiếng Việt. Ví dụ ghép: ba, pa, ma, fa, da, ta, " +
          "na, la, nü, lü.",
      }),
      example({ text: '八 / 趴', transcription: 'bā / pā', translation: "tám / nằm sấp; b không bật hơi, p bật hơi." }),
      example({ text: '爸 / 怕', transcription: 'bà / pà', translation: "bố / sợ; chỉ khác nhau ở luồng hơi." }),
      example({ text: '肚 / 兔', transcription: 'dù / tù', translation: "bụng / thỏ; d không bật hơi, t bật hơi." }),
      example({ text: '马 / 法', transcription: 'mǎ / fǎ', translation: "ngựa / pháp (luật, cách); m và f." }),
      example({ text: '拿 / 辣', transcription: 'ná / là', translation: "cầm, lấy / cay; n và l." }),
      example({ text: '女 / 旅', transcription: 'nǚ / lǚ', translation: "nữ, con gái / du lịch; n và l đi với ü." }),
      mistake({
        wrong: 'pà (爸)', right: 'bà (爸)',
        note: "Đọc b như p làm đổi từ: bà là bố, pà là sợ. b không bật hơi, nhẹ như “p” trong “pin”; chỉ p mới có luồng hơi mạnh.",
      }),
      mistake({
        wrong: 'dù (兔)', right: 'tù (兔)',
        note: "Đừng đọc t như “đ” hay “d” tiếng Việt, và đừng bỏ luồng hơi: t bật hơi như “th”, d không bật hơi như “t”.",
      }),
      tip({ text: "Đặt tờ giấy trước miệng khi luyện: đọc b, d giấy đứng yên; đọc p, t giấy bay ra." }),
    ],
    questions: [
      choice({
        key: `${initialsLabial}-aspirated-p`, prompt: "Chọn âm tiết bật hơi mạnh (tờ giấy trước miệng bay ra).",
        options: ['bā', 'pā', 'mā'], correctIndex: 1,
        explanation: "p bật hơi; b không bật hơi và m không phải âm bật.",
      }),
      choice({
        key: `${initialsLabial}-unaspirated-d`, prompt: "Trong 肚 (bụng) và 兔 (thỏ), chữ nào đọc không bật hơi?",
        options: ['兔 tù', '肚 dù', '拿 ná'], correctIndex: 1,
        explanation: "d không bật hơi: dù. t bật hơi: tù. n là âm mũi, không thuộc cặp này.",
      }),
      choice({
        key: `${initialsLabial}-f-ph`, prompt: "Phụ âm f trong pinyin gần với âm nào của tiếng Việt?",
        options: [vi('“ph”'), vi('“th”'), vi('“b”')], correctIndex: 0,
        explanation: "f là âm môi răng, gần “ph” tiếng Việt.",
      }),
      choice({
        key: `${initialsLabial}-listen-p`, prompt: "Bấm nghe rồi chọn âm tiết bạn nghe được.",
        options: ['bà', 'pà', 'mà'], correctIndex: 1, listen: '怕',
        explanation: "Âm tiết là pà: p có luồng hơi mạnh, thanh 4.",
      }),
      typed({
        key: `${initialsLabial}-ta-first`,
        prompt: "Ghép phụ âm bật hơi t với vần a, giọng giữ cao và bằng. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['tā'], mode: 'pinyin', explanation: "t + a, thanh 1: tā (ta1).",
      }),
      typed({
        key: `${initialsLabial}-mu-third`,
        prompt: "Ghép m với vần u, giọng xuống thấp rồi lên nhẹ. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['mǔ'], mode: 'pinyin', explanation: "m + u, thanh 3: mǔ (mu3).",
      }),
      typed({
        key: `${initialsLabial}-nv-third`,
        prompt: "Ghép n với vần ü, giọng xuống thấp rồi lên nhẹ. Gõ pinyin có dấu thanh; nếu thiếu ü, gõ v.",
        answers: ['nǚ'], mode: 'pinyin', explanation: "n + ü, thanh 3: nǚ (nü3 hoặc nv3).",
      }),
      typed({
        key: `${initialsLabial}-lu-fourth`,
        prompt: "Ghép l với vần u, giọng rơi nhanh từ cao xuống thấp. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['lù'], mode: 'pinyin', explanation: "l + u, thanh 4: lù (lu4); lü là âm khác.",
      }),
    ], ...meta({ declaration: 'lessons', item: initialsLabial }),
  },
  {
    id: `zh:lesson:${initialsVelar}`, stageId: STAGE, unitId: UNIT, order: 4, skill: 'zh:pinyin',
    titles: { vi: 'Phụ âm g k h và j q x', en: 'Initials g k h and j q x' },
    vocabIds: introduced({ lessonSlug: initialsVelar }),
    blocks: [
      objective({ text: "Đọc g k h và j q x; phân biệt không bật hơi với bật hơi; hiểu chữ u sau j q x đọc như ü." }),
      explain({
        text: "Nhóm g k h dùng cuống lưỡi: g không bật hơi, gần “c/k” trong “cá”, “kể”; k bật hơi mạnh, không phải “kh” " +
          "tiếng Việt; h là âm xát, luồng hơi cọ nhẹ ở phía sau vòm miệng, gần “kh” hơn “h” tiếng Việt. Nhóm j q x dùng " +
          "mặt lưỡi: môi dẹt, đầu lưỡi chạm chân răng dưới. j không bật hơi, q bật hơi, x là âm xát; không đọc chúng " +
          "như “gi”, “ch” hay “x” tiếng Việt. Các phụ âm này chỉ đi với i hoặc ü: ji, qi, xi, và ju, qu, xu. Trong " +
          "ju, qu, xu chữ u thực ra đọc là ü, nhưng pinyin viết u không có hai chấm; l và n thì vẫn viết ü: nü, lü.",
      }),
      example({ text: '哥 / 渴 / 喝', transcription: 'gē / kě / hē', translation: "anh (trai) / khát / uống; g, k, h." }),
      example({ text: '古 / 苦 / 虎', transcription: 'gǔ / kǔ / hǔ', translation: "cổ / đắng / hổ; g không bật hơi, k bật hơi." }),
      example({ text: '鸡 / 七 / 西', transcription: 'jī / qī / xī', translation: "gà / bảy / hướng tây; j, q, x với i." }),
      example({ text: '句 / 去 / 序', transcription: 'jù / qù / xù', translation: "câu / đi / thứ tự; viết u nhưng đọc ü." }),
      example({ text: '去', transcription: 'qù', translation: "đi; viết qu, đọc q + ü, môi tròn như khi đọc i rồi chu môi." }),
      mistake({
        wrong: 'khě (渴)', right: 'kě (渴)',
        note: "k trong pinyin là âm bật hơi, không phải “kh” tiếng Việt. Đặt tờ giấy trước miệng: giấy bay khi đọc k, không có luồng xát ở cuống lưỡi.",
      }),
      mistake({
        wrong: 'sī (西)', right: 'xī (西)',
        note: "x không đọc như “x” tiếng Việt (gần “s”). Môi dẹt, đầu lưỡi chạm chân răng dưới, mặt lưỡi nâng gần vòm cứng.",
      }),
      tip({ text: "Sau j, q, x không bao giờ có u thật; thấy ju, qu, xu hãy nghĩ ü. Điều này chỉ là quy tắc viết, không đổi âm." }),
    ],
    questions: [
      choice({
        key: `${initialsVelar}-aspirated-k`, prompt: "Trong 古 (cổ) và 苦 (đắng), âm tiết nào bật hơi?",
        options: ['gǔ', 'kǔ', 'hǔ'], correctIndex: 1,
        explanation: "k bật hơi: kǔ. g không bật hơi; h là âm xát.",
      }),
      choice({
        key: `${initialsVelar}-ju-umlaut`, prompt: "Sau j, q, x, chữ u trong pinyin thực ra đọc như nguyên âm nào?",
        options: ['u', 'ü', 'o'], correctIndex: 1,
        explanation: "Sau j, q, x chỉ có ü, nhưng được viết là u không có hai chấm.",
      }),
      choice({
        key: `${initialsVelar}-fricative-h`, prompt: "Phụ âm nào là âm xát (luồng hơi cọ ở phía sau vòm miệng), không bật hơi?",
        options: ['g', 'k', 'h'], correctIndex: 2,
        explanation: "h là âm xát; g không bật hơi và k bật hơi.",
      }),
      choice({
        key: `${initialsVelar}-review-unaspirated`, prompt: "Ôn bài trước: chọn âm tiết không bật hơi.",
        options: ['pā', 'bā', 'tā'], correctIndex: 1,
        explanation: "b không bật hơi; p và t bật hơi.",
      }),
      typed({
        key: `${initialsVelar}-xi-first`,
        prompt: "Ghép x với i, giọng giữ cao và bằng. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['xī'], mode: 'pinyin', explanation: "x + i, thanh 1: xī (xi1).",
      }),
      typed({
        key: `${initialsVelar}-qu-fourth`,
        prompt: "Ghép q với ü, giọng rơi nhanh từ cao xuống thấp. Hãy nhớ cách viết sau q. Gõ pinyin có dấu thanh.",
        answers: ['qù'], mode: 'pinyin', explanation: "Sau q viết u: qù (qu4). Có thể gõ qü4 hoặc qv4, đều đọc là cùng âm.",
      }),
      typed({
        key: `${initialsVelar}-he-second`,
        prompt: "Ghép h với e, giọng đi lên từ mức giữa lên cao. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['hé'], mode: 'pinyin', explanation: "h + e, thanh 2: hé (he2).",
      }),
      typed({
        key: `${initialsVelar}-review-da-fourth`,
        prompt: "Ôn bài trước: ghép d (không bật hơi) với a, giọng rơi nhanh từ cao xuống thấp. Gõ pinyin có dấu thanh.",
        answers: ['dà'], mode: 'pinyin', explanation: "d + a, thanh 4: dà (da4).",
      }),
    ], ...meta({ declaration: 'lessons', item: initialsVelar }),
  },
  {
    id: `zh:lesson:${initialsSibilant}`, stageId: STAGE, unitId: UNIT, order: 5, skill: 'zh:pinyin',
    titles: { vi: 'Phụ âm z c s và zh ch sh r', en: 'Initials z c s and zh ch sh r' },
    vocabIds: introduced({ lessonSlug: initialsSibilant }),
    blocks: [
      objective({ text: "Phân biệt z c s (lưỡi phẳng) với zh ch sh r (cong lưỡi) và đọc đúng vần i đi sau chúng." }),
      explain({
        text: "Hai nhóm này dễ lẫn nhất. z c s: đầu lưỡi đặt sau răng cửa trên, lưỡi phẳng. zh ch sh r: đầu lưỡi cong " +
          "lên gần vòm miệng phía sau lợi. Trong mỗi nhóm có cặp không bật hơi và bật hơi: z, zh không bật hơi; c, ch " +
          "bật hơi. s và sh là âm xát; r là âm xát cong lưỡi có rung dây thanh. Chữ i đứng sau z c s zh ch sh r không " +
          "phải i thường: zi, ci, si, zhi, chi, shi, ri đọc như kéo dài phụ âm, môi dẹt. Mẹo: nếu viết có h (zh ch sh) " +
          "thì cong lưỡi lên.",
      }),
      example({ text: '字 / 词 / 四', transcription: 'zì / cí / sì', translation: "chữ / từ / bốn; nhóm lưỡi phẳng." }),
      example({ text: '知 / 吃 / 是 / 日', transcription: 'zhī / chī / shì / rì', translation: "biết / ăn / là / ngày; nhóm cong lưỡi." }),
      example({ text: '四 / 是', transcription: 'sì / shì', translation: "bốn / là; chỉ khác nhau ở s và sh." }),
      example({ text: '词 / 迟', transcription: 'cí / chí', translation: "từ / muộn; c lưỡi phẳng, ch cong lưỡi." }),
      example({ text: '擦 / 插', transcription: 'cā / chā', translation: "lau / cắm; hai âm bật hơi, khác vị trí lưỡi." }),
      example({ text: '三 / 山', transcription: 'sān / shān', translation: "ba / núi; s lưỡi phẳng, sh cong lưỡi." }),
      mistake({
        wrong: 'sì (是)', right: 'shì (是)',
        note: "Đọc sh thành s làm đổi từ: shì là “là”, sì là “bốn”. Khi viết có h, hãy cong đầu lưỡi lên. Âm Hán-Việt không giúp đoán được.",
      }),
      mistake({
        wrong: 'zì (日)', right: 'rì (日)',
        note: "r không đọc như “r” tiếng Việt và cũng không phải z hay d: đầu lưỡi cong lên, luồng hơi cọ xát và dây thanh rung.",
      }),
      tip({ text: "Soi gương: với zh, ch, sh, r đầu lưỡi phải nâng lên; với z, c, s đầu lưỡi nằm sau răng cửa." }),
    ],
    questions: [
      choice({
        key: `${initialsSibilant}-retroflex-group`, prompt: "Nhóm phụ âm nào đều phải cong lưỡi?",
        options: ['z, c, s', 'zh, ch, sh', 'zh, c, s'], correctIndex: 1,
        explanation: "zh, ch, sh (và r) cong lưỡi; z, c, s lưỡi phẳng.",
      }),
      choice({
        key: `${initialsSibilant}-si-four`, prompt: "Chọn pinyin của 四 (bốn).",
        options: ['shì', 'sì', 'zì'], correctIndex: 1,
        explanation: "四 là sì, lưỡi phẳng; shì là “là”, cong lưỡi.",
      }),
      choice({
        key: `${initialsSibilant}-aspirated-ch`, prompt: "Trong ba âm tiết dưới đây, âm tiết nào bật hơi?",
        options: ['zhī', 'chī', 'shī'], correctIndex: 1,
        explanation: "ch bật hơi; zh không bật hơi; sh là âm xát.",
      }),
      choice({
        key: `${initialsSibilant}-review-aspirated`, prompt: "Ôn bài trước: chọn âm tiết bật hơi.",
        options: ['jī', 'qī', 'xī'], correctIndex: 1,
        explanation: "q bật hơi; j không bật hơi; x là âm xát.",
      }),
      typed({
        key: `${initialsSibilant}-ci-second`,
        prompt: "Ghép c (bật hơi, lưỡi phẳng) với i, giọng đi lên từ giữa lên cao. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['cí'], mode: 'pinyin', explanation: "c + i, thanh 2: cí (ci2).",
      }),
      typed({
        key: `${initialsSibilant}-zhi-first`,
        prompt: "Ghép zh (cong lưỡi, không bật hơi) với i, giọng giữ cao và bằng. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['zhī'], mode: 'pinyin', explanation: "zh + i, thanh 1: zhī (zhi1).",
      }),
      typed({
        key: `${initialsSibilant}-ri-fourth`,
        prompt: "Ghép r với i, giọng rơi nhanh từ cao xuống thấp. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['rì'], mode: 'pinyin', explanation: "r + i, thanh 4: rì (ri4).",
      }),
      typed({
        key: `${initialsSibilant}-review-fu-second`,
        prompt: "Ôn bài trước: ghép f với u, giọng đi lên từ giữa lên cao. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['fú'], mode: 'pinyin', explanation: "f + u, thanh 2: fú (fu2).",
      }),
    ], ...meta({ declaration: 'lessons', item: initialsSibilant }),
  },
  {
    id: `zh:lesson:${finalsCompound}`, stageId: STAGE, unitId: UNIT, order: 6, skill: 'zh:pinyin',
    titles: { vi: 'Vần ghép', en: 'Compound finals' }, vocabIds: introduced({ lessonSlug: finalsCompound }),
    blocks: [
      objective({ text: "Đọc các vần ghép ai ei ao ou, ia ie iao iu, ua uo uai ui, üe và đặt dấu thanh đúng chỗ." }),
      explain({
        text: "Vần ghép là hai hoặc ba nguyên âm trượt liền nhau. Nhóm 1: ai, ei, ao, ou. Nhóm 2 bắt đầu bằng i: ia, ie, " +
          "iao, iu (viết gọn của iou). Nhóm 3 bắt đầu bằng u: ua, uo, uai, ui (viết gọn của uei). Nhóm 4: üe. " +
          "Trong ie và üe, chữ e đọc nhẹ hơn e đơn. Quy tắc đặt dấu thanh: ưu tiên a, rồi e, rồi o trong ou; còn lại " +
          "đặt trên nguyên âm đứng sau cùng, vì vậy liù và guì mang dấu ở u và i. Ví dụ ghép: bai, bei, hao, dou, jia, " +
          "xie, xiao, liu, hua, guo, kuai, hui, xue.",
      }),
      example({ text: '白 / 来', transcription: 'bái / lái', translation: "trắng / đến; vần ai." }),
      example({ text: '杯 / 好 / 都', transcription: 'bēi / hǎo / dōu', translation: "cốc / tốt / đều; vần ei, ao, ou." }),
      example({ text: '家 / 谢 / 小', transcription: 'jiā / xiè / xiǎo', translation: "nhà / cảm ơn / nhỏ; vần ia, ie, iao." }),
      example({ text: '六 / 回', transcription: 'liù / huí', translation: "sáu / về; iu và ui, dấu thanh ở nguyên âm sau." }),
      example({ text: '花 / 国 / 快', transcription: 'huā / guó / kuài', translation: "hoa / nước / nhanh; vần ua, uo, uai." }),
      example({ text: '学 / 略', transcription: 'xué / lüè', translation: "học / sơ lược; vần üe, sau l vẫn viết ü." }),
      mistake({
        wrong: 'lìu (六)', right: 'liù (六)',
        note: "Trong iu, dấu thanh đặt trên u (nguyên âm đứng sau). Đặt dấu trên i là sai chỗ dù nghe vẫn là thanh 4.",
      }),
      mistake({
        wrong: 'gùi (贵)', right: 'guì (贵)',
        note: "Trong ui, dấu thanh đặt trên i. Quy tắc: a, e, o (trong ou) được ưu tiên; các vần khác đặt dấu ở nguyên âm cuối.",
      }),
      tip({ text: "Đọc vần ghép như một lần trượt, không tách thành hai âm tiết: hao là một âm tiết, không phải ha-o." }),
    ],
    questions: [
      choice({
        key: `${finalsCompound}-liu-mark`, prompt: "Chọn cách viết đúng của liu với thanh 4.",
        options: ['liù', 'lìu', 'lǐu'], correctIndex: 0,
        explanation: "Trong iu, dấu thanh đặt trên u: liù. lǐu có thanh 3 và đặt sai chỗ.",
      }),
      choice({
        key: `${finalsCompound}-ei-final`, prompt: "Chọn âm tiết có vần ei.",
        options: ['bái', 'bēi', 'bāo'], correctIndex: 1,
        explanation: "bēi có vần ei; bái có ai, bāo có ao.",
      }),
      choice({
        key: `${finalsCompound}-guo-country`, prompt: "Chọn pinyin của 国 (nước).",
        options: ['guó', 'guá', 'guǒ'], correctIndex: 0,
        explanation: "国 là guó, thanh 2, vần uo. guá và guǒ là âm tiết khác.",
      }),
      choice({
        key: `${finalsCompound}-review-retroflex`, prompt: "Ôn bài trước: chọn âm tiết cong lưỡi.",
        options: ['sān', 'shān', 'zān'], correctIndex: 1,
        explanation: "sh cong lưỡi; s và z lưỡi phẳng.",
      }),
      typed({
        key: `${finalsCompound}-jiao-third`,
        prompt: "Ghép j với vần iao, giọng xuống thấp rồi lên nhẹ. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['jiǎo'], mode: 'pinyin', explanation: "j + iao, thanh 3: jiǎo (jiao3); dấu đặt trên a.",
      }),
      typed({
        key: `${finalsCompound}-huai-fourth`,
        prompt: "Ghép h với vần uai, giọng rơi nhanh từ cao xuống thấp. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['huài'], mode: 'pinyin', explanation: "h + uai, thanh 4: huài (huai4); dấu đặt trên a.",
      }),
      typed({
        key: `${finalsCompound}-xue-second`,
        prompt: "Ghép x với vần üe, giọng đi lên từ mức giữa lên cao. Hãy nhớ cách viết sau x. Gõ pinyin có dấu thanh.",
        answers: ['xué'], mode: 'pinyin', explanation: "Sau x viết u: xué (xue2); dấu đặt trên e.",
      }),
      typed({
        key: `${finalsCompound}-review-di-first`,
        prompt: "Ôn bài trước: ghép d (không bật hơi) với i, giọng giữ cao và bằng. Gõ pinyin có dấu thanh.",
        answers: ['dī'], mode: 'pinyin', explanation: "d + i, thanh 1: dī (di1).",
      }),
    ], ...meta({ declaration: 'lessons', item: finalsCompound }),
  },
  {
    id: `zh:lesson:${finalsNasal}`, stageId: STAGE, unitId: UNIT, order: 7, skill: 'zh:pinyin',
    titles: { vi: 'Vần mũi -n và -ng', en: 'Nasal finals -n and -ng' },
    vocabIds: introduced({ lessonSlug: finalsNasal }),
    blocks: [
      objective({ text: "Phân biệt đuôi -n với -ng, đọc các vần mũi và không thêm đuôi -m, -p, -t, -c theo âm Hán-Việt." }),
      explain({
        text: "Vần mũi có đuôi -n hoặc -ng. -n: đầu lưỡi chạm lợi trên, miệng gần khép. -ng: cuống lưỡi nâng chạm vòm miệng " +
          "mềm, miệng không khép. Nhóm -n: an, en, in, un (viết gọn của uen), ün, ian, uan, üan. Nhóm -ng: ang, eng, " +
          "ing, ong, iang, uang, iong. in và ing khác nhau như xīn và xīng; ing gần “inh”, ong gần “ung”. Với người biết " +
          "âm Hán-Việt: tiếng Trung phổ thông không có đuôi -m, -p, -t, -c. 心 là xīn (không phải “tâm”), 十 là shí (không " +
          "phải “thập”), 国 là guó (không phải “quốc”), 学 là xué (không phải “học”).",
      }),
      example({ text: '班 / 帮', transcription: 'bān / bāng', translation: "lớp / giúp; an và ang." }),
      example({ text: '门 / 猛', transcription: 'mén / měng', translation: "cửa / dữ dội; en và eng." }),
      example({ text: '心 / 星', transcription: 'xīn / xīng', translation: "tim / sao; in và ing." }),
      example({ text: '林 / 零', transcription: 'lín / líng', translation: "rừng / số không; in và ing." }),
      example({ text: '东 / 中', transcription: 'dōng / zhōng', translation: "phía đông / giữa; vần ong." }),
      example({ text: '山 / 商', transcription: 'shān / shāng', translation: "núi / thương mại; an và ang." }),
      mistake({
        wrong: 'xīm (心)', right: 'xīn (心)',
        note: "Âm Hán-Việt của 心 là “tâm” (đuôi -m), nhưng pinyin chỉ có đuôi -n. Đừng chuyển đuôi -m, -p, -t, -c của âm Hán-Việt sang tiếng Trung.",
      }),
      mistake({
        wrong: 'xīng (心)', right: 'xīn (心)',
        note: "Đừng gộp -n và -ng: xīn (tim) và xīng (sao) là hai từ khác nhau. Với -n đầu lưỡi chạm lợi; với -ng cuống lưỡi nâng lên.",
      }),
      tip({ text: "Đặt tay lên cổ khi đọc -ng: cuống lưỡi nâng và luồng hơi đi qua mũi, miệng vẫn mở." }),
    ],
    questions: [
      choice({
        key: `${finalsNasal}-ng-final`, prompt: "Chọn âm tiết có đuôi -ng.",
        options: ['xīn', 'xīng', 'xiān'], correctIndex: 1,
        explanation: "xīng kết thúc bằng -ng; xīn và xiān kết thúc bằng -n.",
      }),
      choice({
        key: `${finalsNasal}-xin-ending`, prompt: "Pinyin của 心 (tim, âm Hán-Việt “tâm”) kết thúc bằng đuôi nào?",
        options: [vi('Đuôi -m'), vi('Đuôi -n'), vi('Đuôi -ng')], correctIndex: 1,
        explanation: "心 là xīn, đuôi -n. Tiếng Trung phổ thông không có đuôi -m.",
      }),
      choice({
        key: `${finalsNasal}-listen-xing`, prompt: "Bấm nghe rồi chọn âm tiết bạn nghe được.",
        options: ['xīn', 'xīng', 'xiāng'], correctIndex: 1, listen: '星',
        explanation: "Âm tiết là xīng: vần ing, đuôi -ng.",
      }),
      choice({
        key: `${finalsNasal}-review-gui`, prompt: "Ôn bài trước: chọn cách viết đúng của gui với thanh 4.",
        options: ['guì', 'gùi', 'guí'], correctIndex: 0,
        explanation: "Trong ui, dấu thanh đặt trên i; thanh 4 dùng dấu `.",
      }),
      typed({
        key: `${finalsNasal}-jin-first`,
        prompt: "Ghép j với vần in, giọng giữ cao và bằng. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['jīn'], mode: 'pinyin', explanation: "j + in, thanh 1: jīn (jin1).",
      }),
      typed({
        key: `${finalsNasal}-ling-second`,
        prompt: "Ghép l với vần ing, giọng đi lên từ mức giữa lên cao. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['líng'], mode: 'pinyin', explanation: "l + ing, thanh 2: líng (ling2).",
      }),
      typed({
        key: `${finalsNasal}-zhong-first`,
        prompt: "Ghép zh với vần ong, giọng giữ cao và bằng. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['zhōng'], mode: 'pinyin', explanation: "zh + ong, thanh 1: zhōng (zhong1).",
      }),
      typed({
        key: `${finalsNasal}-review-pa-second`,
        prompt: "Ôn bài trước: ghép p (bật hơi) với a, giọng đi lên từ giữa lên cao. Gõ pinyin có dấu thanh.",
        answers: ['pá'], mode: 'pinyin', explanation: "p + a, thanh 2: pá (pa2).",
      }),
    ], ...meta({ declaration: 'lessons', item: finalsNasal }),
  },
  {
    id: `zh:lesson:${neutralTone}`, stageId: STAGE, unitId: UNIT, order: 8, skill: 'zh:tones',
    titles: { vi: 'Thanh nhẹ', en: 'The neutral tone' }, vocabIds: introduced({ lessonSlug: neutralTone }),
    blocks: [
      objective({ text: "Nhận ra thanh nhẹ, đọc ngắn và nhẹ, viết pinyin không dấu hoặc số 0/5 cho âm tiết nhẹ." }),
      explain({
        text: "Thanh nhẹ là âm tiết đọc ngắn, nhẹ, không có đường nét riêng; độ cao phụ thuộc thanh đứng trước nó. " +
          "Sau thanh 1 giọng hạ thấp vừa; sau thanh 2 ở mức giữa; sau thanh 3 cao vừa; sau thanh 4 thấp. Pinyin " +
          "không ghi dấu cho thanh nhẹ: xièxie, māma. Khi gõ bằng số, thanh nhẹ là 0 hoặc 5: xie4 xie0 hoặc xie4 xie5. " +
          "Thanh nhẹ của từ nằm trong từ điển: 妈妈 māma, 谢谢 xièxie, 朋友 péngyou, 学生 xuésheng, 我们 wǒmen; và " +
          "các trợ từ như 吗, 的. Bỏ hết dấu của cả cụm không có nghĩa là thanh nhẹ: ni hao không phải là nǐ hǎo. " +
          "Chữ 不 đứng một mình vẫn là bù; chỉ trong 对不起 duìbuqǐ nó đọc nhẹ.",
      }),
      example({ text: '妈妈', transcription: 'māma', translation: "mẹ; âm tiết thứ hai đọc nhẹ." }),
      example({ text: '谢谢', transcription: 'xièxie', translation: "cảm ơn; âm tiết thứ hai đọc nhẹ." }),
      example({ text: '朋友', transcription: 'péngyou', translation: "bạn bè; âm tiết thứ hai đọc nhẹ." }),
      example({ text: '学生', transcription: 'xuésheng', translation: "học sinh; âm tiết thứ hai đọc nhẹ." }),
      example({ text: '我们', transcription: 'wǒmen', translation: "chúng tôi; men đọc nhẹ sau thanh 3." }),
      example({ text: '对不起', transcription: 'duìbuqǐ', translation: "xin lỗi; chữ 不 trong từ này đọc nhẹ." }),
      mistake({
        wrong: 'xièxiè (谢谢)', right: 'xièxie (谢谢)',
        note: "Đọc cả hai âm tiết đủ thanh 4 làm từ nghe nặng và sai nhịp. Âm tiết thứ hai ngắn, nhẹ, không viết dấu.",
      }),
      mistake({
        wrong: 'xie xie (谢谢)', right: 'xièxie (谢谢)',
        note: "Âm tiết đầu vẫn có thanh 4. Chỉ âm tiết đọc nhẹ mới không dấu; bỏ dấu cả cụm là đánh mất thanh.",
      }),
      tip({ text: "Nghĩ thanh nhẹ như âm cuối “rơi” nhẹ sau âm tiết đầu: đọc māma như “MA-ma”, âm đầu rõ, âm sau nhẹ và ngắn." }),
    ],
    questions: [
      choice({
        key: `${neutralTone}-which-light`, prompt: "Trong 妈妈 māma, âm tiết nào đọc nhẹ?",
        options: [vi('Âm tiết thứ nhất'), vi('Âm tiết thứ hai'), vi('Cả hai âm tiết')], correctIndex: 1,
        explanation: "Âm tiết thứ hai ma đọc ngắn và nhẹ; âm tiết đầu giữ thanh 1.",
      }),
      choice({
        key: `${neutralTone}-writing`, prompt: "Thanh nhẹ được ghi thế nào trong pinyin?",
        options: [vi('Không đánh dấu'), vi('Dấu ngang trên nguyên âm'), vi('Dấu ˇ trên nguyên âm')], correctIndex: 0,
        explanation: "Thanh nhẹ không có dấu; khi gõ bằng số, viết 0 hoặc 5.",
      }),
      choice({
        key: `${neutralTone}-xiexie-form`, prompt: "Chọn pinyin dạng từ điển của 谢谢 (cảm ơn).",
        options: ['xièxie', 'xièxiè', 'xiéxie'], correctIndex: 0,
        explanation: "谢谢 là xièxie: thanh 4 rồi thanh nhẹ; âm tiết sau không có dấu.",
      }),
      choice({
        key: `${neutralTone}-review-nasal`, prompt: "Ôn bài trước: chọn âm tiết có đuôi -n.",
        options: ['líng', 'lín', 'lāng'], correctIndex: 1,
        explanation: "lín kết thúc bằng -n; líng và lāng kết thúc bằng -ng.",
      }),
      typed({
        key: `${neutralTone}-baba`,
        prompt: "Gõ pinyin dạng từ điển của 爸爸 (bố); âm tiết thứ hai là thanh nhẹ.",
        answers: ['bàba'], mode: 'pinyin', explanation: "爸爸 là bàba: thanh 4 rồi thanh nhẹ (ba4 ba5).",
      }),
      typed({
        key: `${neutralTone}-ma-particle`, prompt: "Gõ pinyin của trợ từ nghi vấn 吗, luôn đọc nhẹ.",
        answers: ['ma'], mode: 'pinyin', explanation: "吗 luôn đọc nhẹ nên viết ma, không dấu (hoặc ma0, ma5).",
      }),
      typed({
        key: `${neutralTone}-number-second-xie`, prompt: "Âm tiết thứ hai của xièxie mang thanh số mấy theo cách ghi số của bài? Gõ một số.",
        answers: ['0'], mode: 'tone-number', explanation: "Thanh nhẹ là số 0 (cũng viết 5): xie4 xie0.",
      }),
      typed({
        key: `${neutralTone}-review-shi-fourth`,
        prompt: "Ôn bài trước: ghép sh (cong lưỡi) với i, giọng rơi nhanh từ cao xuống thấp. Gõ pinyin có dấu thanh.",
        answers: ['shì'], mode: 'pinyin', explanation: "sh + i, thanh 4: shì (shi4).",
      }),
    ], ...meta({ declaration: 'lessons', item: neutralTone }),
  },
  {
    id: `zh:lesson:${sandhiThird}`, stageId: STAGE, unitId: UNIT, order: 9, skill: 'zh:tones',
    titles: { vi: 'Biến điệu của thanh 3', en: 'Third-tone sandhi' }, vocabIds: introduced({ lessonSlug: sandhiThird }),
    blocks: [
      objective({ text: "Biết khi hai thanh 3 đứng liền, âm tiết đầu đọc thành thanh 2; ghi thanh gốc khi viết dạng từ điển." }),
      explain({
        text: "Khi hai âm tiết thanh 3 đứng liền nhau, âm tiết đầu đọc thành thanh 2: 你好 viết nǐ hǎo nhưng đọc ní hǎo. " +
          "Khi thanh 3 đứng trước thanh 1, 2, 4 hoặc thanh nhẹ, người nói chỉ đọc phần xuống thấp, không lên lại. " +
          "Quy ước của khóa: pinyin dạng từ điển luôn ghi thanh gốc (nǐ hǎo). Câu hỏi nói rõ “ghi thanh khi đọc” mới " +
          "yêu cầu viết dạng đã biến điệu (ní hǎo). Hai dạng này không thay cho nhau: dạng từ điển nhận thanh gốc, " +
          "dạng đọc liền nhận thanh đã đổi. Ba thanh 3 liền nhau phụ thuộc cách ngắt nhịp nên chưa học ở đây.",
        pattern: '3 + 3 → 2 + 3',
      }),
      example({ text: '你好', transcription: 'nǐ hǎo', translation: "xin chào; viết nǐ hǎo, đọc liền ní hǎo." }),
      example({ text: '很好', transcription: 'hěn hǎo', translation: "rất tốt; đọc liền hén hǎo." }),
      example({ text: '水果', transcription: 'shuǐguǒ', translation: "trái cây; đọc liền shuíguǒ." }),
      example({ text: '手表', transcription: 'shǒubiǎo', translation: "đồng hồ đeo tay; đọc liền shóubiǎo." }),
      example({ text: '洗手', transcription: 'xǐshǒu', translation: "rửa tay; đọc liền xíshǒu." }),
      example({ text: '老师', transcription: 'lǎoshī', translation: "thầy, cô giáo; thanh 3 trước thanh 1 chỉ đọc phần thấp, không đổi thành thanh 2." }),
      mistake({
        wrong: 'nǐ hǎo (3 + 3)', right: 'ní hǎo (2 + 3)',
        note: "Đọc đủ hai thanh 3 liền nhau nghe nặng nề. Âm tiết đầu đọc như thanh 2, âm tiết sau giữ thanh 3. Chữ viết vẫn là nǐ hǎo.",
      }),
      mistake({
        wrong: 'shóubiǎo', right: 'shǒubiǎo',
        note: "Sách học ghi thanh gốc để bạn nhớ từ; biến điệu chỉ xuất hiện khi đọc. Đừng viết thanh 2 vào dạng từ điển.",
      }),
      tip({ text: "Nói 你好 chậm để nghe đủ hai thanh 3, rồi nói nhanh: nếu âm tiết đầu nghe như đi lên là bạn đã biến điệu đúng." }),
    ],
    questions: [
      choice({
        key: `${sandhiThird}-first-becomes`, prompt: "Hai âm tiết thanh 3 đứng liền nhau: âm tiết đầu đọc thành thanh mấy?",
        options: [vi('Thanh 1'), vi('Thanh 2'), vi('Thanh 4')], correctIndex: 1,
        explanation: "Thanh 3 + thanh 3 đọc là thanh 2 + thanh 3.",
      }),
      choice({
        key: `${sandhiThird}-dictionary-form`,
        prompt: "Trong khóa này, pinyin dạng từ điển của 手表 (đồng hồ đeo tay) ghi thế nào?",
        options: ['shǒubiǎo', 'shóubiǎo', 'shōubiǎo'], correctIndex: 0,
        explanation: "Dạng từ điển ghi thanh gốc: shǒubiǎo. Đọc liền mới thành shóubiǎo.",
      }),
      choice({
        key: `${sandhiThird}-spoken-wash`, prompt: "Đọc liền 洗手 (rửa tay), dạng từ điển xǐshǒu. Chọn cách đọc đúng.",
        options: ['xǐshǒu', 'xíshǒu', 'xìshǒu'], correctIndex: 1,
        explanation: "Hai thanh 3 liền nhau: âm tiết đầu thành thanh 2, đọc xíshǒu.",
      }),
      choice({
        key: `${sandhiThird}-review-nasal-ng`, prompt: "Ôn bài trước: chọn âm tiết có đuôi -ng.",
        options: ['mén', 'méng', 'mēn'], correctIndex: 1,
        explanation: "méng kết thúc bằng -ng; mén và mēn kết thúc bằng -n.",
      }),
      typed({
        key: `${sandhiThird}-spoken-exhibit`,
        prompt: "Dạng từ điển: zhǎnlǎn (展览, triển lãm). Gõ pinyin ghi thanh khi đọc liền.",
        answers: ['zhánlǎn'], mode: 'pinyin-sandhi', explanation: "Thanh 3 + thanh 3: âm tiết đầu thành thanh 2, đọc zhánlǎn (zhan2 lan3).",
      }),
      typed({
        key: `${sandhiThird}-spoken-beautiful`,
        prompt: "Dạng từ điển: měihǎo (美好, tốt đẹp). Gõ pinyin ghi thanh khi đọc liền.",
        answers: ['méihǎo'], mode: 'pinyin-sandhi', explanation: "Âm tiết đầu thành thanh 2: méihǎo (mei2 hao3).",
      }),
      typed({
        key: `${sandhiThird}-back-to-dictionary`,
        prompt: "Người nói đọc liền 勇敢 (dũng cảm) là yónggǎn. Gõ pinyin dạng từ điển (thanh gốc) của từ này.",
        answers: ['yǒnggǎn'], mode: 'pinyin', explanation: "Dạng từ điển ghi thanh gốc: yǒnggǎn (yong3 gan3).",
      }),
      typed({
        key: `${sandhiThird}-review-women`,
        prompt: "Ôn bài trước: gõ pinyin dạng từ điển của 我们 (chúng tôi); âm tiết sau đọc nhẹ.",
        answers: ['wǒmen'], mode: 'pinyin', explanation: "我们 là wǒmen: thanh 3 rồi thanh nhẹ (wo3 men5).",
      }),
    ], ...meta({ declaration: 'lessons', item: sandhiThird }),
  },
  {
    id: `zh:lesson:${sandhiBuYi}`, stageId: STAGE, unitId: UNIT, order: 10, skill: 'zh:tones',
    titles: { vi: 'Biến điệu của 不 và 一', en: 'Sandhi of 不 and 一' }, vocabIds: introduced({ lessonSlug: sandhiBuYi }),
    blocks: [
      objective({ text: "Biết 不 đổi thành bú trước thanh 4, 一 đổi thành yí hoặc yì; ghi thanh gốc ở dạng từ điển." }),
      explain({
        text: "不 là bù. Trước thanh 4 nó đọc bú: 不是 bú shì. Trước thanh 1, 2, 3 vẫn đọc bù: 不吃, 不来, 不好. " +
          "一 là yī khi đứng một mình, khi đếm, ở số thứ tự và ở cuối cụm. Trước thanh 4 đọc yí: 一个 yí gè. Trước " +
          "thanh 1, 2, 3 đọc yì: 一天 yì tiān, 一年 yì nián, 一起 yì qǐ. Quy ước của khóa giống bài trước: dạng từ " +
          "điển ghi thanh gốc (bù shì, yī gè), còn câu hỏi nói rõ “ghi thanh khi đọc” mới nhận bú và yí, yì. Nhiều " +
          "sách pinyin ghi trực tiếp thanh đã đổi; bạn có thể gặp cả hai cách.",
        pattern: '不 + 4 → bú; 一 + 4 → yí; 一 + 1/2/3 → yì',
      }),
      example({ text: '不是', transcription: 'bù shì', translation: "không phải; viết bù shì, đọc liền bú shì." }),
      example({ text: '不去', transcription: 'bù qù', translation: "không đi; đọc liền bú qù." }),
      example({ text: '不好', transcription: 'bù hǎo', translation: "không tốt; trước thanh 3 vẫn đọc bù." }),
      example({ text: '一个', transcription: 'yī gè', translation: "một cái; đọc liền yí gè." }),
      example({ text: '一天', transcription: 'yī tiān', translation: "một ngày; đọc liền yì tiān." }),
      example({ text: '一起', transcription: 'yī qǐ', translation: "cùng nhau; đọc liền yì qǐ." }),
      mistake({
        wrong: 'bú hǎo', right: 'bù hǎo',
        note: "Chỉ đổi bù thành bú trước thanh 4. Trước thanh 3 (hǎo) vẫn giữ bù, thanh 4 đầy đủ.",
      }),
      mistake({
        wrong: 'yí tiān', right: 'yì tiān',
        note: "Phân biệt yí và yì: trước thanh 4 là yí (đi lên), trước thanh 1, 2, 3 là yì (rơi). 天 là thanh 1 nên đọc yì tiān.",
      }),
      tip({ text: "Nhớ 不 và 一 đổi theo thanh đứng sau; hãy nhìn âm tiết sau trước khi quyết định đọc bù hay bú, yī hay yí hay yì." }),
    ],
    questions: [
      choice({
        key: `${sandhiBuYi}-bu-before-fourth`, prompt: "Cách đọc liền đúng của 不是 (không phải).",
        options: ['bù shì', 'bú shì', 'bǔ shì'], correctIndex: 1,
        explanation: "不 đứng trước thanh 4 (shì) đọc bú: bú shì.",
      }),
      choice({
        key: `${sandhiBuYi}-bu-before-third`, prompt: "Cách đọc liền đúng của 不好 (không tốt).",
        options: ['bú hǎo', 'bù hǎo', 'bǔ hǎo'], correctIndex: 1,
        explanation: "Trước thanh 3 (hǎo) 不 vẫn đọc bù.",
      }),
      choice({
        key: `${sandhiBuYi}-yi-before-fourth`, prompt: "Cách đọc liền đúng của 一个 (một cái).",
        options: ['yì gè', 'yī gè', 'yí gè'], correctIndex: 2,
        explanation: "一 đứng trước thanh 4 (gè) đọc yí: yí gè.",
      }),
      choice({
        key: `${sandhiBuYi}-review-spoken-friend`, prompt: "Ôn bài trước: đọc liền 好友 (bạn thân), dạng từ điển hǎoyǒu. Chọn cách đọc đúng.",
        options: ['hǎoyǒu', 'háoyǒu', 'hàoyǒu'], correctIndex: 1,
        explanation: "Hai thanh 3 liền nhau: âm tiết đầu thành thanh 2, đọc háoyǒu.",
      }),
      typed({
        key: `${sandhiBuYi}-spoken-bu-yao`,
        prompt: "Dạng từ điển: bù yào (不要, không muốn, đừng). Gõ pinyin ghi thanh khi đọc liền.",
        answers: ['bú yào'], mode: 'pinyin-sandhi', explanation: "不 trước thanh 4 đọc bú: bú yào (bu2 yao4).",
      }),
      typed({
        key: `${sandhiBuYi}-spoken-yi-nian`,
        prompt: "Dạng từ điển: yī nián (一年, một năm). Gõ pinyin ghi thanh khi đọc liền.",
        answers: ['yì nián'], mode: 'pinyin-sandhi', explanation: "一 trước thanh 2 đọc yì: yì nián (yi4 nian2).",
      }),
      typed({
        key: `${sandhiBuYi}-back-bu-keqi`,
        prompt: "Người nói đọc liền “bú kèqi” (不客气, không có gì). Gõ pinyin dạng từ điển (thanh gốc).",
        answers: ['bù kèqi'], mode: 'pinyin', explanation: "Dạng từ điển ghi thanh gốc: bù kèqi (bu4 ke4 qi5).",
      }),
      typed({
        key: `${sandhiBuYi}-review-jiejie`,
        prompt: "Ôn bài trước: gõ pinyin dạng từ điển của 姐姐 (chị gái); âm tiết sau đọc nhẹ.",
        answers: ['jiějie'], mode: 'pinyin', explanation: "姐姐 là jiějie: thanh 3 rồi thanh nhẹ (jie3 jie5).",
      }),
    ], ...meta({ declaration: 'lessons', item: sandhiBuYi }),
  },
  {
    id: `zh:lesson:${spellingRules}`, stageId: STAGE, unitId: UNIT, order: 11, skill: 'zh:pinyin',
    titles: { vi: 'Quy tắc viết pinyin', en: 'Pinyin spelling rules' }, vocabIds: introduced({ lessonSlug: spellingRules }),
    blocks: [
      objective({ text: "Viết đúng y/w, ü sau j q x, iu/ui/un và đặt dấu thanh đúng chỗ; dùng dấu nháy tách âm tiết." }),
      explain({
        text: "1) Không có phụ âm đầu: i thành yi, u thành wu, ü thành yu; ia, ie, iao, iou thành ya, ye, yao, you; " +
          "ua, uo, uai, uei, uen thành wa, wo, wai, wei, wen; üe, üan, ün thành yue, yuan, yun. 2) Có phụ âm đầu: " +
          "iou, uei, uen viết gọn thành iu, ui, un: liu, gui, kun. 3) ü: sau j, q, x, y viết u không có hai chấm " +
          "(ju, qu, xu, yu); sau n, l giữ ü (nü, lü, nüe, lüe). 4) Dấu thanh: a, rồi e, rồi o trong ou; còn lại đặt ở " +
          "nguyên âm cuối, nên liù và guì mang dấu ở u và i. 5) Dấu nháy ' tách âm tiết khi a, o, e đứng đầu âm tiết " +
          "sau: Xī'ān (西安) khác xiān (先).",
      }),
      example({ text: '一 / 五 / 鱼', transcription: 'yī / wǔ / yú', translation: "một / năm / cá; i, u, ü đứng một mình viết yi, wu, yu." }),
      example({ text: '六 / 对 / 春', transcription: 'liù / duì / chūn', translation: "sáu / đúng / mùa xuân; iu, ui, un sau phụ âm." }),
      example({ text: '有 / 为 / 问', transcription: 'yǒu / wèi / wèn', translation: "có / vì / hỏi; you, wei, wen khi không có phụ âm đầu." }),
      example({ text: '去 / 学 / 女 / 绿', transcription: 'qù / xué / nǚ / lǜ', translation: "đi / học / nữ / xanh lá; sau q, x viết u; sau n, l giữ ü." }),
      example({ text: '好 / 谢 / 六 / 贵', transcription: 'hǎo / xiè / liù / guì', translation: "tốt / cảm ơn / sáu / đắt; dấu thanh trên a, e, u, i." }),
      example({ text: '西安 / 先', transcription: "xī'ān / xiān", translation: "Tây An / trước; dấu nháy tách hai âm tiết xī và ān." }),
      mistake({
        wrong: 'lìu (六)', right: 'liù (六)',
        note: "Trong iu và ui, dấu thanh đặt trên nguyên âm đứng sau (u hoặc i), không phải nguyên âm đầu.",
      }),
      mistake({
        wrong: 'uǒ (我)', right: 'wǒ (我)',
        note: "u đứng đầu âm tiết không có phụ âm phải viết w: wǒ, wǔ. Tương tự i viết y: yī; ü viết yu.",
      }),
      mistake({
        wrong: 'xiān (西安)', right: "xī'ān (西安)",
        note: "西安 có hai âm tiết xī và ān. Thiếu dấu nháy thì xiān đọc thành một âm tiết, nghĩa là “trước”.",
      }),
      tip({ text: "Nếu không chắc có hai chấm hay không: sau j, q, x, y luôn viết u; chỉ sau n, l mới phải phân biệt u và ü." }),
    ],
    questions: [
      choice({
        key: `${spellingRules}-uo-alone`, prompt: "Vần uo đứng một mình, không có phụ âm đầu, được viết thế nào?",
        options: ['uo', 'wo', 'vo'], correctIndex: 1,
        explanation: "u đứng đầu âm tiết viết w: wo.",
      }),
      choice({
        key: `${spellingRules}-iou-short`, prompt: "Phụ âm j ghép với iou thì viết gọn thành gì?",
        options: ['jiou', 'jiu', 'jou'], correctIndex: 1,
        explanation: "iou sau phụ âm viết gọn thành iu: jiu.",
      }),
      choice({
        key: `${spellingRules}-apostrophe`, prompt: "西安 (Tây An) gồm hai âm tiết xī và ān. Chọn cách viết đúng không dấu thanh.",
        options: ["xi'an", "xia'n", 'xian'], correctIndex: 0,
        explanation: "Dấu nháy tách âm tiết ān khỏi xī: xi'an. Không có dấu nháy, xian là một âm tiết khác.",
      }),
      choice({
        key: `${spellingRules}-mark-hui`, prompt: "Chọn cách đánh dấu đúng cho hui với thanh 2.",
        options: ['húi', 'huí', 'hŭi'], correctIndex: 1,
        explanation: "Trong ui, dấu thanh đặt trên i: huí.",
      }),
      typed({
        key: `${spellingRules}-g-uei`,
        prompt: "Ghép g với vần uei, viết gọn theo quy tắc. Tạm bỏ dấu thanh, gõ âm tiết.",
        answers: ['gui'], mode: 'pinyin-toneless', explanation: "uei sau phụ âm viết gọn thành ui: gui.",
      }),
      typed({
        key: `${spellingRules}-yuan`,
        prompt: "Vần üan đứng một mình, không có phụ âm đầu. Tạm bỏ dấu thanh, gõ âm tiết viết đúng quy tắc.",
        answers: ['yuan'], mode: 'pinyin-toneless', explanation: "üan không có phụ âm đầu viết yuan, không phải üan hay uan.",
      }),
      typed({
        key: `${spellingRules}-l-ue`,
        prompt: "Ghép l với vần üe. Tạm bỏ dấu thanh, gõ âm tiết; gõ v nếu thiếu ü.",
        answers: ['lüe'], mode: 'pinyin-toneless', explanation: "Sau l vẫn giữ ü: lüe. Viết lue là sai.",
      }),
      typed({
        key: `${spellingRules}-xiu-fourth`,
        prompt: "Ghép x với vần iu, giọng rơi nhanh từ cao xuống thấp. Gõ pinyin có dấu thanh (hoặc số thanh).",
        answers: ['xiù'], mode: 'pinyin', explanation: "Trong iu dấu thanh đặt trên u: xiù (xiu4).",
      }),
      choice({
        key: `${spellingRules}-review-bu-dui`, prompt: "Ôn bài trước: cách đọc liền đúng của 不对 (không đúng).",
        options: ['bù duì', 'bú duì', 'bǔ duì'], correctIndex: 1,
        explanation: "不 trước thanh 4 (duì) đọc bú: bú duì.",
      }),
      typed({
        key: `${spellingRules}-review-umbrella`,
        prompt: "Ôn bài trước: dạng từ điển yǔsǎn (雨伞, cái ô). Gõ pinyin ghi thanh khi đọc liền.",
        answers: ['yúsǎn'], mode: 'pinyin-sandhi', explanation: "Thanh 3 + thanh 3: âm tiết đầu thành thanh 2, đọc yúsǎn (yu2 san3).",
      }),
    ], ...meta({ declaration: 'lessons', item: spellingRules }),
  },
  {
    id: `zh:lesson:${vocabulary}`, stageId: STAGE, unitId: UNIT, order: 12, skill: 'vocabulary',
    titles: { vi: 'Sáu lời chào đầu tiên', en: 'Six first words' }, vocabIds: introduced({ lessonSlug: vocabulary }),
    blocks: [
      objective({ text: "Dùng sáu từ để chào hỏi, cảm ơn, đáp lời cảm ơn, xin lỗi, đáp lời xin lỗi và tạm biệt; đọc đúng thanh của chúng." }),
      explain({
        text: "你好 (nǐ hǎo) là xin chào; đọc liền thành ní hǎo. 谢谢 (xièxie) là cảm ơn, âm tiết sau đọc nhẹ; đáp lại " +
          "bằng 不客气 (bù kèqi, không có gì; đọc liền bú kèqi). 对不起 (duìbuqǐ) là xin lỗi, chữ 不 trong từ này đọc " +
          "nhẹ; đáp lại bằng 没关系 (méi guānxi, không sao). 再见 (zàijiàn) là tạm biệt. Một số chữ có âm Hán-Việt " +
          "gần nghĩa, như 谢 (tạ) và 再见 (tái kiến), nhưng pinyin mới là cách đọc: đừng suy đoán cách đọc hay thanh từ " +
          "âm Hán-Việt. Khóa dùng chữ giản thể.",
      }),
      example({ text: '你好！', transcription: 'nǐ hǎo', translation: "Xin chào!", vocabIds: ids({ slugs: ['ni-hao'] }) }),
      example({ text: '谢谢！', transcription: 'xièxie', translation: "Cảm ơn!", vocabIds: ids({ slugs: ['xiexie'] }) }),
      example({ text: '不客气。', transcription: 'bù kèqi', translation: "Không có gì.", vocabIds: ids({ slugs: ['bu-ke-qi'] }) }),
      example({ text: '再见！', transcription: 'zàijiàn', translation: "Tạm biệt!", vocabIds: ids({ slugs: ['zaijian'] }) }),
      example({ text: '对不起。', transcription: 'duìbuqǐ', translation: "Xin lỗi.", vocabIds: ids({ slugs: ['dui-bu-qi'] }) }),
      example({ text: '没关系。', transcription: 'méi guānxi', translation: "Không sao.", vocabIds: ids({ slugs: ['mei-guan-xi'] }) }),
      mistake({
        wrong: 'duìbùqǐ (对不起)', right: 'duìbuqǐ (对不起)',
        note: "Trong 对不起 chữ 不 đọc nhẹ nên không có dấu. Đừng mang bù của 不 đứng riêng vào từ này.",
      }),
      mistake({
        wrong: 'xièxiè (谢谢)', right: 'xièxie (谢谢)',
        note: "Âm Hán-Việt “tạ” không cho biết thanh: 谢谢 là thanh 4 rồi thanh nhẹ. Hãy học theo pinyin, không theo âm Hán-Việt.",
      }),
      tip({ text: "Học theo cặp: 谢谢 – 不客气 và 对不起 – 没关系. Nói to cả hai vế, giữ đúng thanh và âm nhẹ ở âm tiết cuối." }),
    ],
    questions: [
      choice({
        key: `${vocabulary}-greeting`, prompt: "Bạn gặp một người lần đầu trong ngày. Chọn lời chào.",
        options: ['你好', '再见', '对不起'], correctIndex: 0,
        explanation: "你好 là xin chào; 再见 là tạm biệt; 对不起 là xin lỗi.",
        vocabIds: ids({ slugs: ['ni-hao', 'zaijian', 'dui-bu-qi'] }),
      }),
      choice({
        key: `${vocabulary}-reply-thanks`, prompt: "Có người nói “谢谢”. Chọn lời đáp lịch sự.",
        options: ['不客气', '对不起', '再见'], correctIndex: 0,
        explanation: "不客气 là lời đáp “không có gì” khi được cảm ơn.",
        vocabIds: ids({ slugs: ['xiexie', 'bu-ke-qi', 'dui-bu-qi', 'zaijian'] }),
      }),
      choice({
        key: `${vocabulary}-reply-sorry`, prompt: "Có người nói “对不起”. Chọn lời đáp.",
        options: ['没关系', '谢谢', '你好'], correctIndex: 0,
        explanation: "没关系 là “không sao”, đáp lời xin lỗi.",
        vocabIds: ids({ slugs: ['dui-bu-qi', 'mei-guan-xi', 'xiexie', 'ni-hao'] }),
      }),
      choice({
        key: `${vocabulary}-pinyin-goodbye`, prompt: "Chọn pinyin đúng của 再见 (tạm biệt).",
        options: ['zàijiàn', 'zàijián', 'zāijiàn'], correctIndex: 0,
        explanation: "再见 là zàijiàn: hai âm tiết đều thanh 4.",
        vocabIds: ids({ slugs: ['zaijian'] }),
      }),
      choice({
        key: `${vocabulary}-meaning-meiguanxi`, prompt: "“méi guānxi” có nghĩa là gì?",
        options: [vi('Không sao'), vi('Xin lỗi'), vi('Tạm biệt')], correctIndex: 0,
        explanation: "没关系 nghĩa là không sao, dùng để đáp lời xin lỗi.",
        vocabIds: ids({ slugs: ['mei-guan-xi'] }),
      }),
      typed({
        key: `${vocabulary}-hanzi-thanks`, prompt: "Gõ chữ Hán (giản thể) của lời “cảm ơn”.",
        answers: ['谢谢'], mode: 'hanzi', explanation: "Khóa dùng giản thể: 谢谢; 謝謝 là phồn thể.",
        vocabIds: ids({ slugs: ['xiexie'] }),
      }),
      typed({
        key: `${vocabulary}-hanzi-goodbye`, prompt: "Gõ chữ Hán (giản thể) của lời “tạm biệt”.",
        answers: ['再见'], mode: 'hanzi', explanation: "Khóa dùng giản thể: 再见; 再見 là phồn thể.",
        vocabIds: ids({ slugs: ['zaijian'] }),
      }),
      typed({
        key: `${vocabulary}-pinyin-sorry`, prompt: "Gõ pinyin dạng từ điển của 对不起 (xin lỗi).",
        answers: ['duìbuqǐ'], mode: 'pinyin', explanation: "对不起 là duìbuqǐ: chữ 不 đọc nhẹ nên không có dấu.",
        vocabIds: ids({ slugs: ['dui-bu-qi'] }),
      }),
      typed({
        key: `${vocabulary}-spoken-hello`, prompt: "Gõ pinyin của 你好 ghi thanh khi đọc liền.",
        answers: ['ní hǎo'], mode: 'pinyin-sandhi', explanation: "Hai thanh 3 liền nhau: ní hǎo (ni2 hao3).",
        vocabIds: ids({ slugs: ['ni-hao'] }),
      }),
      typed({
        key: `${vocabulary}-spoken-welcome`, prompt: "Gõ pinyin của 不客气 ghi thanh khi đọc liền.",
        answers: ['bú kèqi'], mode: 'pinyin-sandhi', explanation: "不 trước thanh 4 đọc bú: bú kèqi (bu2 ke4 qi5).",
        vocabIds: ids({ slugs: ['bu-ke-qi'] }),
      }),
    ], ...meta({ declaration: 'lessons', item: vocabulary }),
  },
];

interface ScheduleRow {
  readonly day: number;
  /** Two main lessons per day (three would be allowed on sound days; none is needed here). */
  readonly mainLessons: Readonly<Record<'lesson-a' | 'lesson-b', string>>;
  /** Optional side quests (writing, radicals) are attached here by the side unit; none exist yet. */
  readonly sideQuests: readonly { readonly slug: string; readonly lessonSlugs: readonly string[]; readonly activity: string }[];
  readonly test: { readonly slug: string; readonly kind: 'daily'; readonly reviewVocabIds: readonly string[]; readonly warmUp: boolean };
}

/**
 * Explicit unit schedule: no assumption about lesson count or checkpoint placement. Days, prerequisites and
 * groups are all generated from this table. Estimate: 10 + 10 minutes of lessons and 6 minutes for the test,
 * 26 minutes core; the side activities are optional and add time. These are author estimates, not measured
 * with beginners. Day 1 has no earlier day, so its three review questions are a warm-up on day 1 itself.
 * Vocabulary is introduced only on day 6 (lesson `vocab`), so `reviewVocabIds` is empty on days 1 to 6:
 * earlier days review sound skills in review-category questions, not vocabulary. Later HSK1 days recycle the
 * six words; remove `truncateAtScheduleEnd` (see authoring-checks.ts) once they exist.
 */
export const schedule: readonly ScheduleRow[] = [
  { day: 1, mainLessons: { 'lesson-a': pinyin, 'lesson-b': tone }, sideQuests: [],
    test: { slug: 'n1-day1', kind: 'daily', reviewVocabIds: [], warmUp: true } },
  { day: 2, mainLessons: { 'lesson-a': initialsLabial, 'lesson-b': initialsVelar }, sideQuests: [],
    test: { slug: 'n1-day2', kind: 'daily', reviewVocabIds: [], warmUp: false } },
  { day: 3, mainLessons: { 'lesson-a': initialsSibilant, 'lesson-b': finalsCompound }, sideQuests: [],
    test: { slug: 'n1-day3', kind: 'daily', reviewVocabIds: [], warmUp: false } },
  { day: 4, mainLessons: { 'lesson-a': finalsNasal, 'lesson-b': neutralTone }, sideQuests: [],
    test: { slug: 'n1-day4', kind: 'daily', reviewVocabIds: [], warmUp: false } },
  { day: 5, mainLessons: { 'lesson-a': sandhiThird, 'lesson-b': sandhiBuYi }, sideQuests: [],
    test: { slug: 'n1-day5', kind: 'daily', reviewVocabIds: [], warmUp: false } },
  { day: 6, mainLessons: { 'lesson-a': spellingRules, 'lesson-b': vocabulary }, sideQuests: [],
    test: { slug: 'n1-day6', kind: 'daily', reviewVocabIds: [], warmUp: false } },
];

/** Categories name schedule lesson slots; review categories group by unit. */
function daily({ question, day, category }: {
  question: Question; day: number; category: 'lesson-a' | 'lesson-b' | 'review';
}): Question {
  const key = question.id.replace('zh:question:', '');
  const entry = schedule.find((row) => row.day === day)!;
  const lesson = category === 'review' ? undefined : entry.mainLessons[category];
  return { ...question, id: `zh:assessment:${key}`, category,
    group: lesson === undefined ? UNIT : `zh:lesson:${lesson}`,
    ...meta({ declaration: 'assessments', item: key }) };
}

const t = (key: string) => `n1-${key}`;

export const assessments: readonly Question[] = [
  // Day 1
  daily({ day: 1, category: 'lesson-a', question: choice({
    key: t('day1-a-round-o'), prompt: "Ngày 1: nguyên âm nào tròn môi và đọc gần “ô”?",
    options: ['e', 'o', 'i'], correctIndex: 1, explanation: "o tròn môi, gần “ô”; e và i đọc với môi dẹt." }) }),
  daily({ day: 1, category: 'lesson-a', question: choice({
    key: t('day1-a-round-u'), prompt: "Ngày 1: chọn nguyên âm chụm môi tròn và KHÔNG có hai chấm.",
    options: ['ü', 'u', 'a'], correctIndex: 1, explanation: "u chụm môi tròn; ü cũng tròn môi nhưng có hai chấm." }) }),
  daily({ day: 1, category: 'lesson-a', question: typed({
    key: t('day1-a-mu'), prompt: "Ngày 1: ghép m với nguyên âm u. Tạm bỏ dấu thanh, gõ âm tiết.",
    answers: ['mu'], mode: 'pinyin-toneless', explanation: "m + u là mu." }) }),
  daily({ day: 1, category: 'lesson-a', question: typed({
    key: t('day1-a-nu'), prompt: "Ngày 1: ghép n với nguyên âm u (không phải ü). Tạm bỏ dấu thanh, gõ âm tiết.",
    answers: ['nu'], mode: 'pinyin-toneless', explanation: "n + u là nu; n + ü là nü, một âm khác." }) }),
  daily({ day: 1, category: 'lesson-b', question: choice({
    key: t('day1-b-third-a'), prompt: "Ngày 1: chọn âm tiết a mang thanh 3 (xuống thấp rồi lên nhẹ).",
    options: ['ā', 'ǎ', 'à'], correctIndex: 1, explanation: "Dấu ˇ là thanh 3: ǎ." }) }),
  daily({ day: 1, category: 'lesson-b', question: typed({
    key: t('day1-b-e-fourth'),
    prompt: "Ngày 1: ghép nguyên âm e với giọng rơi nhanh từ cao xuống thấp. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['è'], mode: 'pinyin', explanation: "Rơi nhanh là thanh 4: è (e4)." }) }),
  daily({ day: 1, category: 'lesson-b', question: typed({
    key: t('day1-b-la-second'),
    prompt: "Ngày 1: ghép l với a, giọng đi lên từ mức giữa lên cao. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['lá'], mode: 'pinyin', explanation: "Đi lên là thanh 2: lá (la2)." }) }),
  daily({ day: 1, category: 'review', question: choice({
    key: t('day1-review-fourth'), prompt: "Khởi động / warm-up ngày 1: giọng rơi nhanh từ cao xuống thấp. Đó là thanh mấy?",
    options: [vi('Thanh 3'), vi('Thanh 4'), vi('Thanh 1')], correctIndex: 1, explanation: "Rơi nhanh từ cao xuống thấp là thanh 4." }) }),
  daily({ day: 1, category: 'review', question: typed({
    key: t('day1-review-ma'), prompt: "Khởi động / warm-up ngày 1: ghép m với a. Tạm bỏ dấu thanh, gõ âm tiết.",
    answers: ['ma'], mode: 'pinyin-toneless', explanation: "m + a là ma." }) }),
  daily({ day: 1, category: 'review', question: typed({
    key: t('day1-review-number-ta'), prompt: "Khởi động / warm-up ngày 1: âm tiết tǎ mang thanh mấy? Gõ một số.",
    answers: ['3'], mode: 'tone-number', explanation: "Dấu ˇ là thanh 3." }) }),
  // Day 2
  daily({ day: 2, category: 'lesson-a', question: choice({
    key: t('day2-a-aspirated-t'), prompt: "Ngày 2: chọn âm tiết bật hơi.",
    options: ['dǎo', 'tǎo', 'nǎo'], correctIndex: 1, explanation: "t bật hơi; d không bật hơi; n là âm mũi." }) }),
  daily({ day: 2, category: 'lesson-a', question: choice({
    key: t('day2-a-unaspirated'), prompt: "Ngày 2: trong p, t, d, phụ âm nào KHÔNG bật hơi?",
    options: ['p', 't', 'd'], correctIndex: 2, explanation: "d không bật hơi; p và t bật hơi." }) }),
  daily({ day: 2, category: 'lesson-a', question: typed({
    key: t('day2-a-po-first'),
    prompt: "Ngày 2: ghép p (bật hơi) với o, giọng giữ cao và bằng. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['pō'], mode: 'pinyin', explanation: "p + o, thanh 1: pō (po1)." }) }),
  daily({ day: 2, category: 'lesson-a', question: typed({
    key: t('day2-a-na-fourth'),
    prompt: "Ngày 2: ghép n với a, giọng rơi nhanh từ cao xuống thấp. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['nà'], mode: 'pinyin', explanation: "n + a, thanh 4: nà (na4)." }) }),
  daily({ day: 2, category: 'lesson-b', question: choice({
    key: t('day2-b-aspirated-k'), prompt: "Ngày 2: trong ba âm tiết dưới đây, âm tiết nào có luồng hơi bật mạnh?",
    options: ['gē', 'kē', 'hē'], correctIndex: 1, explanation: "k bật hơi; g không bật hơi; h là âm xát." }) }),
  daily({ day: 2, category: 'lesson-b', question: typed({
    key: t('day2-b-ju-third'),
    prompt: "Ngày 2: ghép j với ü, giọng xuống thấp rồi lên nhẹ. Hãy nhớ cách viết sau j. Gõ pinyin có dấu thanh.",
    answers: ['jǔ'], mode: 'pinyin', explanation: "Sau j viết u: jǔ (ju3)." }) }),
  daily({ day: 2, category: 'lesson-b', question: typed({
    key: t('day2-b-qi-second'),
    prompt: "Ngày 2: ghép q với i, giọng đi lên từ mức giữa lên cao. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['qí'], mode: 'pinyin', explanation: "q + i, thanh 2: qí (qi2)." }) }),
  daily({ day: 2, category: 'review', question: choice({
    key: t('day2-review-second'), prompt: "Ôn ngày 1: chọn âm tiết mang thanh 2 (đi lên từ giữa lên cao).",
    options: ['nī', 'ní', 'nǐ'], correctIndex: 1, explanation: "Dấu ´ là thanh 2: ní." }) }),
  daily({ day: 2, category: 'review', question: typed({
    key: t('day2-review-da-third'),
    prompt: "Ôn ngày 1: ghép d với a, giọng xuống thấp rồi lên nhẹ. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['dǎ'], mode: 'pinyin', explanation: "d + a, thanh 3: dǎ (da3)." }) }),
  daily({ day: 2, category: 'review', question: typed({
    key: t('day2-review-number-ge'), prompt: "Ôn ngày 1: âm tiết gé mang thanh mấy? Gõ một số.",
    answers: ['2'], mode: 'tone-number', explanation: "Dấu ´ là thanh 2." }) }),
  // Day 3
  daily({ day: 3, category: 'lesson-a', question: choice({
    key: t('day3-a-retroflex-shu'), prompt: "Ngày 3: chọn âm tiết cong lưỡi.",
    options: ['sū', 'shū', 'zū'], correctIndex: 1, explanation: "sh cong lưỡi; s và z lưỡi phẳng." }) }),
  daily({ day: 3, category: 'lesson-a', question: choice({
    key: t('day3-a-aspirated-ca'), prompt: "Ngày 3: chọn âm tiết bật hơi và lưỡi phẳng (đầu lưỡi sau răng cửa).",
    options: ['zā', 'cā', 'shā'], correctIndex: 1, explanation: "c bật hơi với lưỡi phẳng; z không bật hơi; sh cong lưỡi." }) }),
  daily({ day: 3, category: 'lesson-a', question: typed({
    key: t('day3-a-zi-third'),
    prompt: "Ngày 3: ghép z với i, giọng xuống thấp rồi lên nhẹ. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['zǐ'], mode: 'pinyin', explanation: "z + i, thanh 3: zǐ (zi3)." }) }),
  daily({ day: 3, category: 'lesson-a', question: typed({
    key: t('day3-a-chi-second'),
    prompt: "Ngày 3: ghép ch (cong lưỡi, bật hơi) với i, giọng đi lên từ giữa lên cao. Gõ pinyin có dấu thanh.",
    answers: ['chí'], mode: 'pinyin', explanation: "ch + i, thanh 2: chí (chi2)." }) }),
  daily({ day: 3, category: 'lesson-b', question: choice({
    key: t('day3-b-ao-final'), prompt: "Ngày 3: chọn âm tiết có vần ao.",
    options: ['bēi', 'bāo', 'bān'], correctIndex: 1, explanation: "bāo có vần ao; bēi có ei; bān có an." }) }),
  daily({ day: 3, category: 'lesson-b', question: typed({
    key: t('day3-b-kuai-fourth'),
    prompt: "Ngày 3: ghép k với vần uai, giọng rơi nhanh từ cao xuống thấp. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['kuài'], mode: 'pinyin', explanation: "k + uai, thanh 4: kuài (kuai4); dấu đặt trên a." }) }),
  daily({ day: 3, category: 'lesson-b', question: typed({
    key: t('day3-b-mei-third'),
    prompt: "Ngày 3: ghép m với vần ei, giọng xuống thấp rồi lên nhẹ. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['měi'], mode: 'pinyin', explanation: "m + ei, thanh 3: měi (mei3); dấu đặt trên e." }) }),
  daily({ day: 3, category: 'review', question: choice({
    key: t('day3-review-unaspirated-du'), prompt: "Ôn ngày 2: chọn âm tiết không bật hơi.",
    options: ['tǔ', 'dǔ', 'pǔ'], correctIndex: 1, explanation: "d không bật hơi; t và p bật hơi." }) }),
  daily({ day: 3, category: 'review', question: typed({
    key: t('day3-review-xu-fourth'),
    prompt: "Ôn ngày 2: ghép x với ü, giọng rơi nhanh từ cao xuống thấp. Hãy nhớ cách viết sau x. Gõ pinyin có dấu thanh.",
    answers: ['xù'], mode: 'pinyin', explanation: "Sau x viết u: xù (xu4)." }) }),
  daily({ day: 3, category: 'review', question: typed({
    key: t('day3-review-hu-second'),
    prompt: "Ôn ngày 2: ghép h với u, giọng đi lên từ mức giữa lên cao. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['hú'], mode: 'pinyin', explanation: "h + u, thanh 2: hú (hu2)." }) }),
  // Day 4
  daily({ day: 4, category: 'lesson-a', question: choice({
    key: t('day4-a-ng-ping'), prompt: "Ngày 4: chọn âm tiết có đuôi -ng.",
    options: ['pín', 'píng', 'pián'], correctIndex: 1, explanation: "píng kết thúc bằng -ng; pín và pián kết thúc bằng -n." }) }),
  daily({ day: 4, category: 'lesson-a', question: choice({
    key: t('day4-a-n-fen'), prompt: "Ngày 4: chọn âm tiết có đuôi -n (đầu lưỡi chạm lợi trên).",
    options: ['fāng', 'fēng', 'fēn'], correctIndex: 2, explanation: "fēn kết thúc bằng -n; fāng và fēng kết thúc bằng -ng." }) }),
  daily({ day: 4, category: 'lesson-a', question: typed({
    key: t('day4-a-sheng-first'),
    prompt: "Ngày 4: ghép sh với vần eng, giọng giữ cao và bằng. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['shēng'], mode: 'pinyin', explanation: "sh + eng, thanh 1: shēng (sheng1)." }) }),
  daily({ day: 4, category: 'lesson-a', question: typed({
    key: t('day4-a-tian-first'),
    prompt: "Ngày 4: ghép t với vần ian, giọng giữ cao và bằng. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['tiān'], mode: 'pinyin', explanation: "t + ian, thanh 1: tiān (tian1); dấu đặt trên a." }) }),
  daily({ day: 4, category: 'lesson-b', question: choice({
    key: t('day4-b-xiansheng'), prompt: "Ngày 4: chọn pinyin dạng từ điển của 先生 (ông, ngài; thầy).",
    options: ['xiānsheng', 'xiānshēng', 'xiānshéng'], correctIndex: 0,
    explanation: "先生 là xiānsheng: âm tiết sau đọc nhẹ nên không có dấu." }) }),
  daily({ day: 4, category: 'lesson-b', question: typed({
    key: t('day4-b-de-particle'), prompt: "Ngày 4: gõ pinyin của trợ từ 的, luôn đọc nhẹ.",
    answers: ['de'], mode: 'pinyin', explanation: "的 luôn đọc nhẹ nên viết de, không dấu (hoặc de0, de5)." }) }),
  daily({ day: 4, category: 'lesson-b', question: typed({
    key: t('day4-b-gege'), prompt: "Ngày 4: gõ pinyin dạng từ điển của 哥哥 (anh trai); âm tiết sau đọc nhẹ.",
    answers: ['gēge'], mode: 'pinyin', explanation: "哥哥 là gēge: thanh 1 rồi thanh nhẹ (ge1 ge5)." }) }),
  daily({ day: 4, category: 'review', question: choice({
    key: t('day4-review-retroflex-chu'), prompt: "Ôn ngày 3: chọn âm tiết cong lưỡi.",
    options: ['cū', 'chū', 'zū'], correctIndex: 1, explanation: "ch cong lưỡi; c và z lưỡi phẳng." }) }),
  daily({ day: 4, category: 'review', question: typed({
    key: t('day4-review-shou-fourth'),
    prompt: "Ôn ngày 3: ghép sh với vần ou, giọng rơi nhanh từ cao xuống thấp. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['shòu'], mode: 'pinyin', explanation: "sh + ou, thanh 4: shòu (shou4); dấu đặt trên o." }) }),
  daily({ day: 4, category: 'review', question: typed({
    key: t('day4-review-ha-first'),
    prompt: "Ôn ngày 1: ghép h với a, giọng giữ cao và bằng. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['hā'], mode: 'pinyin', explanation: "h + a, thanh 1: hā (ha1)." }) }),
  // Day 5
  daily({ day: 5, category: 'lesson-a', question: choice({
    key: t('day5-a-spoken-mouse'), prompt: "Ngày 5: đọc liền 老鼠 (chuột), dạng từ điển lǎoshǔ. Chọn cách đọc đúng.",
    options: ['láoshǔ', 'lǎoshǔ', 'làoshǔ'], correctIndex: 0, explanation: "Hai thanh 3 liền nhau: âm tiết đầu thành thanh 2, đọc láoshǔ." }) }),
  daily({ day: 5, category: 'lesson-a', question: choice({
    key: t('day5-a-dictionary-finger'), prompt: "Ngày 5: pinyin dạng từ điển của 手指 (ngón tay) ghi thế nào trong khóa này?",
    options: ['shǒuzhǐ', 'shóuzhǐ', 'shōuzhǐ'], correctIndex: 0, explanation: "Dạng từ điển ghi thanh gốc: shǒuzhǐ." }) }),
  daily({ day: 5, category: 'lesson-a', question: typed({
    key: t('day5-a-spoken-well'),
    prompt: "Ngày 5: dạng từ điển: shuǐjǐng (水井, giếng nước). Gõ pinyin ghi thanh khi đọc liền.",
    answers: ['shuíjǐng'], mode: 'pinyin-sandhi', explanation: "Thanh 3 + thanh 3: âm tiết đầu thành thanh 2, đọc shuíjǐng (shui2 jing3)." }) }),
  daily({ day: 5, category: 'lesson-a', question: typed({
    key: t('day5-a-back-idea'),
    prompt: "Ngày 5: người nói đọc liền 想法 (ý nghĩ) là xiángfǎ. Gõ pinyin dạng từ điển (thanh gốc).",
    answers: ['xiǎngfǎ'], mode: 'pinyin', explanation: "Dạng từ điển ghi thanh gốc: xiǎngfǎ (xiang3 fa3)." }) }),
  daily({ day: 5, category: 'lesson-b', question: choice({
    key: t('day5-b-bu-yong'), prompt: "Ngày 5: cách đọc liền đúng của 不用 (không cần).",
    options: ['bù yòng', 'bú yòng', 'bǔ yòng'], correctIndex: 1, explanation: "不 trước thanh 4 (yòng) đọc bú: bú yòng." }) }),
  daily({ day: 5, category: 'lesson-b', question: typed({
    key: t('day5-b-spoken-yi-ban'),
    prompt: "Ngày 5: dạng từ điển: yī bàn (一半, một nửa). Gõ pinyin ghi thanh khi đọc liền.",
    answers: ['yí bàn'], mode: 'pinyin-sandhi', explanation: "一 trước thanh 4 đọc yí: yí bàn (yi2 ban4)." }) }),
  daily({ day: 5, category: 'lesson-b', question: typed({
    key: t('day5-b-back-yi-zhang'),
    prompt: "Ngày 5: người nói đọc liền yì zhāng (一张, một tờ). Gõ pinyin dạng từ điển (thanh gốc).",
    answers: ['yī zhāng'], mode: 'pinyin', explanation: "Dạng từ điển ghi thanh gốc: yī zhāng (yi1 zhang1)." }) }),
  daily({ day: 5, category: 'review', question: choice({
    key: t('day5-review-ng-ming'), prompt: "Ôn ngày 4: chọn âm tiết có đuôi -ng.",
    options: ['mín', 'míng', 'miàn'], correctIndex: 1, explanation: "míng kết thúc bằng -ng; mín và miàn kết thúc bằng -n." }) }),
  daily({ day: 5, category: 'review', question: typed({
    key: t('day5-review-nainai'), prompt: "Ôn ngày 4: gõ pinyin dạng từ điển của 奶奶 (bà nội); âm tiết sau đọc nhẹ.",
    answers: ['nǎinai'], mode: 'pinyin', explanation: "奶奶 là nǎinai: thanh 3 rồi thanh nhẹ (nai3 nai5)." }) }),
  daily({ day: 5, category: 'review', question: typed({
    key: t('day5-review-ke-third'),
    prompt: "Ôn ngày 2: ghép k với e, giọng xuống thấp rồi lên nhẹ. Gõ pinyin có dấu thanh (hoặc số thanh).",
    answers: ['kě'], mode: 'pinyin', explanation: "k + e, thanh 3: kě (ke3)." }) }),
  // Day 6
  daily({ day: 6, category: 'lesson-a', question: choice({
    key: t('day6-a-ye-alone'), prompt: "Ngày 6: vần ie đứng một mình, không có phụ âm đầu, được viết thế nào?",
    options: ['ye', 'ie', 'yie'], correctIndex: 0, explanation: "ie đứng đầu âm tiết viết ye." }) }),
  daily({ day: 6, category: 'lesson-a', question: choice({
    key: t('day6-a-mark-gui'), prompt: "Ngày 6: chọn cách đánh dấu đúng cho gui với thanh 3.",
    options: ['gǔi', 'guǐ', 'guì'], correctIndex: 1, explanation: "Trong ui, dấu thanh đặt trên i; thanh 3 dùng dấu ˇ: guǐ." }) }),
  daily({ day: 6, category: 'lesson-a', question: typed({
    key: t('day6-a-d-uen'),
    prompt: "Ngày 6: ghép d với vần uen, viết gọn theo quy tắc. Tạm bỏ dấu thanh, gõ âm tiết.",
    answers: ['dun'], mode: 'pinyin-toneless', explanation: "uen sau phụ âm viết gọn thành un: dun." }) }),
  daily({ day: 6, category: 'lesson-a', question: typed({
    key: t('day6-a-yue'),
    prompt: "Ngày 6: vần üe đứng một mình, không có phụ âm đầu. Tạm bỏ dấu thanh, gõ âm tiết viết đúng quy tắc.",
    answers: ['yue'], mode: 'pinyin-toneless', explanation: "üe không có phụ âm đầu viết yue." }) }),
  daily({ day: 6, category: 'lesson-b', question: choice({
    key: t('day6-b-apologise'), prompt: "Ngày 6: bạn đến muộn và muốn xin lỗi bằng tiếng Trung. Chọn lời nói.",
    options: ['再见', '对不起', '谢谢'], correctIndex: 1, explanation: "对不起 là xin lỗi; 再见 là tạm biệt; 谢谢 là cảm ơn.",
    vocabIds: ids({ slugs: ['zaijian', 'dui-bu-qi', 'xiexie'] }) }) }),
  daily({ day: 6, category: 'lesson-b', question: typed({
    key: t('day6-b-meiguanxi-form'), prompt: "Ngày 6: gõ pinyin dạng từ điển của 没关系 (không sao).",
    answers: ['méi guānxi'], mode: 'pinyin', explanation: "没关系 là méi guānxi (mei2 guan1 xi5): âm tiết cuối đọc nhẹ.",
    vocabIds: ids({ slugs: ['mei-guan-xi'] }) }) }),
  daily({ day: 6, category: 'lesson-b', question: typed({
    key: t('day6-b-nihao-form'), prompt: "Ngày 6: gõ pinyin dạng từ điển của 你好 (xin chào).",
    answers: ['nǐ hǎo'], mode: 'pinyin', explanation: "Dạng từ điển ghi thanh gốc: nǐ hǎo (ni3 hao3); đọc liền mới thành ní hǎo.",
    vocabIds: ids({ slugs: ['ni-hao'] }) }) }),
  daily({ day: 6, category: 'review', question: choice({
    key: t('day6-review-bu-kan'), prompt: "Ôn ngày 5: cách đọc liền đúng của 不看 (không xem).",
    options: ['bù kàn', 'bú kàn', 'bǔ kàn'], correctIndex: 1, explanation: "不 trước thanh 4 (kàn) đọc bú: bú kàn." }) }),
  daily({ day: 6, category: 'review', question: typed({
    key: t('day6-review-yi-ci'),
    prompt: "Ôn ngày 5: dạng từ điển: yī cì (一次, một lần). Gõ pinyin ghi thanh khi đọc liền.",
    answers: ['yí cì'], mode: 'pinyin-sandhi', explanation: "一 trước thanh 4 đọc yí: yí cì (yi2 ci4)." }) }),
  daily({ day: 6, category: 'review', question: typed({
    key: t('day6-review-shui'),
    prompt: "Ôn ngày 3: ghép sh với vần uei (viết gọn theo quy tắc), giọng rơi nhanh từ cao xuống thấp. Gõ pinyin có dấu thanh.",
    answers: ['shuì'], mode: 'pinyin', explanation: "uei sau phụ âm viết ui, dấu thanh trên i: shuì (shui4)." }) }),
];

export const tests: readonly Test[] = schedule.map(({ test }) => ({
  id: `zh:test:${test.slug}`, kind: test.kind, passRatio: 0.85,
  questionIds: assessments.filter((question) => question.id.startsWith(`zh:assessment:${test.slug}-`))
    .map(({ id }) => id),
  reviewVocabIds: [...test.reviewVocabIds],
  ...meta({ declaration: 'tests', item: test.slug }),
}));

const lessonMeta: Readonly<Record<string, { icon: string; reason: string }>> = {
  [pinyin]: { icon: 'ü', reason: "Pinyin là cách ghi âm mọi chữ Hán; học trước để đọc được từ mới." },
  [tone]: { icon: '〰', reason: "Cùng âm “ma”, bốn thanh cho bốn nghĩa khác nhau." },
  [initialsLabial]: { icon: 'bp', reason: "Bật hơi hay không bật hơi là điểm khác nhau chính của b–p và d–t." },
  [initialsVelar]: { icon: 'jq', reason: "g k h và j q x mở rộng số âm tiết bạn đọc được." },
  [initialsSibilant]: { icon: 'zh', reason: "Cong lưỡi hay lưỡi phẳng: cặp dễ lẫn nhất của người mới." },
  [finalsCompound]: { icon: 'ai', reason: "Vần ghép đi cùng phụ âm tạo phần lớn âm tiết thường gặp." },
  [finalsNasal]: { icon: 'ng', reason: "Phân biệt -n và -ng giúp bạn nghe và nói đúng từ." },
  [neutralTone]: { icon: '·', reason: "Nhiều từ thông dụng có âm tiết nhẹ; đọc đúng giúp lời nói tự nhiên." },
  [sandhiThird]: { icon: '3·3', reason: "Hai thanh 3 liền nhau đổi cách đọc; biết quy tắc để nói trôi chảy." },
  [sandhiBuYi]: { icon: '不', reason: "不 và 一 đổi thanh theo âm tiết sau; hai chữ này rất thường gặp." },
  [spellingRules]: { icon: 'yw', reason: "Quy tắc viết pinyin giúp bạn gõ và đọc đúng mọi âm tiết." },
  [vocabulary]: { icon: '你', reason: "Dùng ngay những gì vừa học để chào hỏi, cảm ơn và xin lỗi." },
};

export const quests: readonly Quest[] = [
  ...lessons.map((lesson) => {
    const slug = lesson.id.replace('zh:lesson:', '');
    return {
      id: `zh:quest:${slug}`, stageId: STAGE, titles: lesson.titles!, skill: lesson.skill, minutes: 10,
      xp: XP.main, lessonIds: [lesson.id], optional: false,
      extensions: { 'zh:icon': lessonMeta[slug]!.icon, 'zh:reason': vi(lessonMeta[slug]!.reason) },
      ...meta({ declaration: 'quests', item: lesson.id }),
    } satisfies Quest;
  }),
  ...schedule.map(({ day, mainLessons, test }) => ({
    id: `zh:quest:${test.slug}-test`, stageId: STAGE,
    titles: { vi: test.warmUp ? 'Kiểm tra ngày 1 — khởi động / warm-up' : `Kiểm tra ngày ${day}`,
      en: test.warmUp ? 'Day 1 test with warm-up' : `Day ${day} test` },
    skill: 'vocabulary', minutes: 6, xp: XP.daily, lessonIds: [], optional: false,
    extensions: { 'zh:test-policy': { testId: `zh:test:${test.slug}`,
      afterQuestIds: Object.values(mainLessons).map((slug) => `zh:quest:${slug}`),
      repeatXp: XP.repeat, reward: 'first-pass-per-day' } },
    ...meta({ declaration: 'quests', item: test.slug }),
  } satisfies Quest)),
  ...schedule.flatMap(({ day, sideQuests }) => sideQuests.map((side) => ({
    id: `zh:quest:${side.slug}`, stageId: STAGE,
    titles: { vi: `Viết chữ ngày ${day}`, en: `Day ${day} writing` },
    skill: 'writing', minutes: 3, xp: XP.side,
    lessonIds: side.lessonSlugs.map((slug) => `zh:lesson:${slug}`), optional: true,
    extensions: { 'zh:activity': vi(side.activity) }, ...meta({ declaration: 'quests', item: side.slug }),
  } satisfies Quest))),
];

export const days: readonly Day[] = schedule.map(({ day, mainLessons, sideQuests, test }) => ({
  id: `zh:day:${test.slug}`, stageId: STAGE, unitId: UNIT, day,
  mainQuestIds: Object.values(mainLessons).map((slug) => `zh:quest:${slug}`),
  ...(sideQuests.length === 0 ? {} : { sideQuestIds: sideQuests.map((side) => `zh:quest:${side.slug}`) }),
  testId: `zh:test:${test.slug}`, ...meta({ declaration: 'days', item: test.slug }),
}));

export default { unit, lessons, quests, assessments, days, tests } satisfies UnitContent;
