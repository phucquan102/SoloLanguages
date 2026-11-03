/**
 * Frozen vocab manifest for the Chinese `hsk` course (Nền tảng + HSK1 first pass).
 *
 * Self-authored selection, examples and Vietnamese glosses; AI draft, unreviewed.
 * Official GF0025/2025 list alignment: [Unverified], per plan sections 6/7.
 * Each id belongs to exactly one unit. Lesson slugs follow plan sections 2c/2d.
 * This is authoring data, independent of the pack and its provenance records.
 *
 * Pinyin: lowercase, citation tones (yī, bù), never written tone sandhi.
 * Join syllables within a word; separate words in phrases (nǐ hǎo, bù kèqi,
 * méi guānxi). Lexical neutral tones stay unmarked, including duìbuqǐ.
 * Numbered pinyin separates EVERY syllable with one space; 5 = neutral tone.
 * New ids separate toneless syllables with hyphens (ü -> v); suffix homophones.
 * Existing ids are preserved: ni-hao, xiexie, zaijian, ren, xuesheng, pengyou,
 * shui, shu. These legacy spellings are deliberate exceptions to new-id rules.
 * H2 spreads the numbers across its first two lessons to keep 5–7 words/lesson.
 */

export type VocabManifestPos =
  | 'noun' | 'verb' | 'modal' | 'adjective' | 'adverb' | 'pronoun'
  | 'determiner' | 'numeral' | 'measure' | 'particle' | 'preposition'
  | 'conjunction' | 'phrase';

/** Plain local row shape; deliberately independent of `@solo/content-schema`. */
export interface VocabManifestRow {
  readonly id: string;
  readonly hanzi: string;
  readonly pinyin: string;
  readonly pinyinNumbered: string;
  readonly pos: VocabManifestPos;
  readonly glosses: { readonly vi: string };
  readonly hanViet?: string;
  readonly unitId: string;
  readonly lessonSlug: string;
  /** Hanzi classifier, e.g. 个; lists are separated by / when needed. */
  readonly measureWord?: string;
  readonly exampleHint: string;
  readonly note?: string;
}

export const hskVocabManifest: readonly VocabManifestRow[] = [
  // ---------------------------------------------------------------- N1 — Nền tảng
  // vocab
  { id: 'zh:vocab:ni-hao', hanzi: '你好', pinyin: 'nǐ hǎo', pinyinNumbered: 'ni3 hao3', pos: 'phrase', glosses: { vi: 'xin chào' }, unitId: 'zh:unit:n1', lessonSlug: 'vocab', exampleHint: '你好！' },
  { id: 'zh:vocab:xiexie', hanzi: '谢谢', pinyin: 'xièxie', pinyinNumbered: 'xie4 xie5', pos: 'verb', glosses: { vi: 'cảm ơn' }, unitId: 'zh:unit:n1', lessonSlug: 'vocab', exampleHint: '谢谢你！' },
  { id: 'zh:vocab:bu-ke-qi', hanzi: '不客气', pinyin: 'bù kèqi', pinyinNumbered: 'bu4 ke4 qi5', pos: 'phrase', glosses: { vi: 'không có gì (đáp lời cảm ơn)' }, unitId: 'zh:unit:n1', lessonSlug: 'vocab', exampleHint: '不客气！', note: 'Đáp lời cảm ơn; đáp lời xin lỗi thường dùng 没关系.' },
  { id: 'zh:vocab:zaijian', hanzi: '再见', pinyin: 'zàijiàn', pinyinNumbered: 'zai4 jian4', pos: 'verb', glosses: { vi: 'tạm biệt; hẹn gặp lại' }, unitId: 'zh:unit:n1', lessonSlug: 'vocab', exampleHint: '再见！' },
  { id: 'zh:vocab:dui-bu-qi', hanzi: '对不起', pinyin: 'duìbuqǐ', pinyinNumbered: 'dui4 bu5 qi3', pos: 'verb', glosses: { vi: 'xin lỗi' }, unitId: 'zh:unit:n1', lessonSlug: 'vocab', exampleHint: '对不起！', note: '不 trong từ này đọc nhẹ; 不 đứng riêng vẫn ghi bù.' },
  { id: 'zh:vocab:mei-guan-xi', hanzi: '没关系', pinyin: 'méi guānxi', pinyinNumbered: 'mei2 guan1 xi5', pos: 'phrase', glosses: { vi: 'không sao (đáp lời xin lỗi)' }, unitId: 'zh:unit:n1', lessonSlug: 'vocab', exampleHint: '没关系。' },

  // ---------------------------------------------------------------- H1 — Chào hỏi
  // h1-shi
  { id: 'zh:vocab:wo', hanzi: '我', pinyin: 'wǒ', pinyinNumbered: 'wo3', pos: 'pronoun', glosses: { vi: 'tôi, mình' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-shi', exampleHint: '我是学生。' },
  { id: 'zh:vocab:ni', hanzi: '你', pinyin: 'nǐ', pinyinNumbered: 'ni3', pos: 'pronoun', glosses: { vi: 'bạn (người đang nói chuyện với mình)' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-shi', exampleHint: '你是老师。' },
  { id: 'zh:vocab:shi-be', hanzi: '是', pinyin: 'shì', pinyinNumbered: 'shi4', pos: 'verb', glosses: { vi: 'là' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-shi', exampleHint: '我是老师。', note: '是 nối với danh từ; trước tính từ thường không dùng 是: 我很好.' },
  { id: 'zh:vocab:bu', hanzi: '不', pinyin: 'bù', pinyinNumbered: 'bu4', pos: 'adverb', glosses: { vi: 'không' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-shi', exampleHint: '我不是老师。', note: 'Phủ định 是 bằng 不是; phủ định 有 bằng 没有, không dùng 不有.' },
  { id: 'zh:vocab:lao-shi', hanzi: '老师', pinyin: 'lǎoshī', pinyinNumbered: 'lao3 shi1', pos: 'noun', glosses: { vi: 'thầy, cô giáo' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-shi', measureWord: '个', exampleHint: '老师，你好！' },
  { id: 'zh:vocab:xuesheng', hanzi: '学生', pinyin: 'xuésheng', pinyinNumbered: 'xue2 sheng5', pos: 'noun', glosses: { vi: 'học sinh, sinh viên' }, hanViet: 'học sinh', unitId: 'zh:unit:h1', lessonSlug: 'h1-shi', measureWord: '个', exampleHint: '你是学生。', note: '学生 chỉ cả học sinh lẫn sinh viên, rộng hơn “học sinh” trong tiếng Việt.' },
  // h1-name
  { id: 'zh:vocab:jiao', hanzi: '叫', pinyin: 'jiào', pinyinNumbered: 'jiao4', pos: 'verb', glosses: { vi: 'tên là; gọi' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-name', exampleHint: '你叫什么？' },
  { id: 'zh:vocab:shen-me', hanzi: '什么', pinyin: 'shénme', pinyinNumbered: 'shen2 me5', pos: 'pronoun', glosses: { vi: 'gì, cái gì' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-name', exampleHint: '你叫什么名字？' },
  { id: 'zh:vocab:ming-zi', hanzi: '名字', pinyin: 'míngzi', pinyinNumbered: 'ming2 zi5', pos: 'noun', glosses: { vi: 'tên' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-name', measureWord: '个', exampleHint: '她叫什么名字？' },
  { id: 'zh:vocab:ta-he', hanzi: '他', pinyin: 'tā', pinyinNumbered: 'ta1', pos: 'pronoun', glosses: { vi: 'anh ấy, ông ấy, cậu ấy' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-name', exampleHint: '他是学生。' },
  { id: 'zh:vocab:ta-she', hanzi: '她', pinyin: 'tā', pinyinNumbered: 'ta1', pos: 'pronoun', glosses: { vi: 'cô ấy, bà ấy, chị ấy' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-name', exampleHint: '她是老师。' },
  { id: 'zh:vocab:xing-surname', hanzi: '姓', pinyin: 'xìng', pinyinNumbered: 'xing4', pos: 'verb', glosses: { vi: 'mang họ (họ là)' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-name', exampleHint: '我姓李。' },
  // h1-ma-ne
  { id: 'zh:vocab:ma', hanzi: '吗', pinyin: 'ma', pinyinNumbered: 'ma5', pos: 'particle', glosses: { vi: 'à, không (cuối câu hỏi có/không)' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-ma-ne', exampleHint: '你是学生吗？', note: 'Không thêm 吗 vào câu đã có từ hỏi như 什么.' },
  { id: 'zh:vocab:ne', hanzi: '呢', pinyin: 'ne', pinyinNumbered: 'ne5', pos: 'particle', glosses: { vi: 'còn… thì sao?' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-ma-ne', exampleHint: '我很好，你呢？' },
  { id: 'zh:vocab:hen', hanzi: '很', pinyin: 'hěn', pinyinNumbered: 'hen3', pos: 'adverb', glosses: { vi: 'rất; từ nối tự nhiên trước tính từ' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-ma-ne', exampleHint: '她很好。', note: 'Trong câu tính từ đơn giản, 很 không nhất thiết nhấn mạnh mức “rất”.' },
  { id: 'zh:vocab:hao-good', hanzi: '好', pinyin: 'hǎo', pinyinNumbered: 'hao3', pos: 'adjective', glosses: { vi: 'tốt; khỏe' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-ma-ne', exampleHint: '你好吗？' },
  { id: 'zh:vocab:mang', hanzi: '忙', pinyin: 'máng', pinyinNumbered: 'mang2', pos: 'adjective', glosses: { vi: 'bận' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-ma-ne', exampleHint: '老师很忙。' },
  { id: 'zh:vocab:gao-xing', hanzi: '高兴', pinyin: 'gāoxìng', pinyinNumbered: 'gao1 xing4', pos: 'adjective', glosses: { vi: 'vui, vui mừng' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-ma-ne', exampleHint: '我很高兴。' },
  // h1-nationality
  { id: 'zh:vocab:zhong-guo', hanzi: '中国', pinyin: 'zhōngguó', pinyinNumbered: 'zhong1 guo2', pos: 'noun', glosses: { vi: 'Trung Quốc' }, hanViet: 'Trung Quốc', unitId: 'zh:unit:h1', lessonSlug: 'h1-nationality', exampleHint: '他是中国人。' },
  { id: 'zh:vocab:yue-nan', hanzi: '越南', pinyin: 'yuènán', pinyinNumbered: 'yue4 nan2', pos: 'noun', glosses: { vi: 'Việt Nam' }, hanViet: 'Việt Nam', unitId: 'zh:unit:h1', lessonSlug: 'h1-nationality', exampleHint: '我是越南人。' },
  { id: 'zh:vocab:ren', hanzi: '人', pinyin: 'rén', pinyinNumbered: 'ren2', pos: 'noun', glosses: { vi: 'người' }, hanViet: 'nhân', unitId: 'zh:unit:h1', lessonSlug: 'h1-nationality', measureWord: '个', exampleHint: '她是中国人。' },
  { id: 'zh:vocab:na', hanzi: '哪', pinyin: 'nǎ', pinyinNumbered: 'na3', pos: 'determiner', glosses: { vi: 'nào' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-nationality', exampleHint: '你是哪国人？' },
  { id: 'zh:vocab:guo', hanzi: '国', pinyin: 'guó', pinyinNumbered: 'guo2', pos: 'noun', glosses: { vi: 'nước, quốc gia (trong 哪国)' }, hanViet: 'quốc', unitId: 'zh:unit:h1', lessonSlug: 'h1-nationality', measureWord: '个', exampleHint: '她是哪国人？', note: 'Trong 哪国, 国 là dạng ngắn của 国家; không dùng 国 thay 国家 trong mọi ngữ cảnh.' },
  { id: 'zh:vocab:han-yu', hanzi: '汉语', pinyin: 'hànyǔ', pinyinNumbered: 'han4 yu3', pos: 'noun', glosses: { vi: 'tiếng Hán, tiếng Trung' }, hanViet: 'Hán ngữ', unitId: 'zh:unit:h1', lessonSlug: 'h1-nationality', exampleHint: '她是汉语老师。' },
  // h1-de
  { id: 'zh:vocab:de', hanzi: '的', pinyin: 'de', pinyinNumbered: 'de5', pos: 'particle', glosses: { vi: 'của; nối phần bổ nghĩa với danh từ' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-de', exampleHint: '他是我的朋友。', note: 'Thứ tự ngược tiếng Việt: 我的书 = sách của tôi; 的 ở đây đọc nhẹ de.' },
  { id: 'zh:vocab:pengyou', hanzi: '朋友', pinyin: 'péngyou', pinyinNumbered: 'peng2 you5', pos: 'noun', glosses: { vi: 'bạn, bạn bè' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-de', measureWord: '个', exampleHint: '她是我的朋友。' },
  { id: 'zh:vocab:zhe', hanzi: '这', pinyin: 'zhè', pinyinNumbered: 'zhe4', pos: 'pronoun', glosses: { vi: 'đây, này' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-de', exampleHint: '这是我的书。' },
  { id: 'zh:vocab:na-that', hanzi: '那', pinyin: 'nà', pinyinNumbered: 'na4', pos: 'pronoun', glosses: { vi: 'kia, đó' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-de', exampleHint: '那是你的老师吗？' },
  { id: 'zh:vocab:shu', hanzi: '书', pinyin: 'shū', pinyinNumbered: 'shu1', pos: 'noun', glosses: { vi: 'sách' }, hanViet: 'thư', unitId: 'zh:unit:h1', lessonSlug: 'h1-de', measureWord: '本', exampleHint: '这是你的书吗？', note: '书 là sách; “lá thư” trong tiếng Việt là 信, không phải 书.' },
  { id: 'zh:vocab:nin', hanzi: '您', pinyin: 'nín', pinyinNumbered: 'nin2', pos: 'pronoun', glosses: { vi: 'ông, bà, thầy, cô… (cách xưng hô kính trọng)' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-de', exampleHint: '老师，您好！' },
  // h1-read-dialogue
  { id: 'zh:vocab:wo-men', hanzi: '我们', pinyin: 'wǒmen', pinyinNumbered: 'wo3 men5', pos: 'pronoun', glosses: { vi: 'chúng tôi, chúng ta' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-read-dialogue', exampleHint: '我们是学生。' },
  { id: 'zh:vocab:ni-men', hanzi: '你们', pinyin: 'nǐmen', pinyinNumbered: 'ni3 men5', pos: 'pronoun', glosses: { vi: 'các bạn' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-read-dialogue', exampleHint: '你们是中国人吗？' },
  { id: 'zh:vocab:ta-men', hanzi: '他们', pinyin: 'tāmen', pinyinNumbered: 'ta1 men5', pos: 'pronoun', glosses: { vi: 'họ (nhóm nam hoặc nhóm có cả nam và nữ)' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-read-dialogue', exampleHint: '他们是我的朋友。' },
  { id: 'zh:vocab:xian-sheng', hanzi: '先生', pinyin: 'xiānsheng', pinyinNumbered: 'xian1 sheng5', pos: 'noun', glosses: { vi: 'ông, ngài (cách gọi lịch sự)' }, hanViet: 'tiên sinh', unitId: 'zh:unit:h1', lessonSlug: 'h1-read-dialogue', measureWord: '个', exampleHint: '先生，您好！' },
  { id: 'zh:vocab:ren-shi', hanzi: '认识', pinyin: 'rènshi', pinyinNumbered: 'ren4 shi5', pos: 'verb', glosses: { vi: 'quen, biết (một người); nhận biết' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-read-dialogue', exampleHint: '认识你很高兴。' },
  { id: 'zh:vocab:shei', hanzi: '谁', pinyin: 'shéi', pinyinNumbered: 'shei2', pos: 'pronoun', glosses: { vi: 'ai' }, unitId: 'zh:unit:h1', lessonSlug: 'h1-read-dialogue', exampleHint: '她是谁？' },

  // ---------------------------------------------------------------- H2 — Số & giờ
  // h2-numbers
  { id: 'zh:vocab:yi', hanzi: '一', pinyin: 'yī', pinyinNumbered: 'yi1', pos: 'numeral', glosses: { vi: 'một' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-numbers', exampleHint: '这是一本书。' },
  { id: 'zh:vocab:er', hanzi: '二', pinyin: 'èr', pinyinNumbered: 'er4', pos: 'numeral', glosses: { vi: 'hai (khi đếm, đọc số)' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-numbers', exampleHint: '一和一是二。', note: 'Đếm: 一、二、三; trước lượng từ thường dùng 两: 两个人.' },
  { id: 'zh:vocab:san', hanzi: '三', pinyin: 'sān', pinyinNumbered: 'san1', pos: 'numeral', glosses: { vi: 'ba' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-numbers', exampleHint: '这是三本书。' },
  { id: 'zh:vocab:si', hanzi: '四', pinyin: 'sì', pinyinNumbered: 'si4', pos: 'numeral', glosses: { vi: 'bốn' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-numbers', exampleHint: '这是四本书。' },
  { id: 'zh:vocab:wu', hanzi: '五', pinyin: 'wǔ', pinyinNumbered: 'wu3', pos: 'numeral', glosses: { vi: 'năm (số)' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-numbers', exampleHint: '这是五本书。' },
  { id: 'zh:vocab:liu', hanzi: '六', pinyin: 'liù', pinyinNumbered: 'liu4', pos: 'numeral', glosses: { vi: 'sáu' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-numbers', exampleHint: '这是六本书。' },
  { id: 'zh:vocab:qi', hanzi: '七', pinyin: 'qī', pinyinNumbered: 'qi1', pos: 'numeral', glosses: { vi: 'bảy' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-numbers', exampleHint: '这是七本书。' },
  // h2-age
  { id: 'zh:vocab:ba', hanzi: '八', pinyin: 'bā', pinyinNumbered: 'ba1', pos: 'numeral', glosses: { vi: 'tám' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-age', exampleHint: '他八岁。' },
  { id: 'zh:vocab:jiu', hanzi: '九', pinyin: 'jiǔ', pinyinNumbered: 'jiu3', pos: 'numeral', glosses: { vi: 'chín' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-age', exampleHint: '她九岁。' },
  { id: 'zh:vocab:shi-ten', hanzi: '十', pinyin: 'shí', pinyinNumbered: 'shi2', pos: 'numeral', glosses: { vi: 'mười' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-age', exampleHint: '我十岁。' },
  { id: 'zh:vocab:bai', hanzi: '百', pinyin: 'bǎi', pinyinNumbered: 'bai3', pos: 'numeral', glosses: { vi: 'trăm' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-age', exampleHint: '那是一百本书。', note: 'Nói 一百 cho “một trăm”; không chỉ nói 百 khi nêu số lượng cụ thể.' },
  { id: 'zh:vocab:ji', hanzi: '几', pinyin: 'jǐ', pinyinNumbered: 'ji3', pos: 'pronoun', glosses: { vi: 'mấy, bao nhiêu (thường dự kiến số nhỏ)' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-age', exampleHint: '你几岁？' },
  { id: 'zh:vocab:duo-shao', hanzi: '多少', pinyin: 'duōshao', pinyinNumbered: 'duo1 shao5', pos: 'pronoun', glosses: { vi: 'bao nhiêu' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-age', exampleHint: '你有多少朋友？' },
  { id: 'zh:vocab:sui', hanzi: '岁', pinyin: 'suì', pinyinNumbered: 'sui4', pos: 'measure', glosses: { vi: 'tuổi' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-age', exampleHint: '他二十岁。', note: 'Tuổi không dùng 是: 我二十岁, không nói 我是二十岁.' },
  // h2-dates
  { id: 'zh:vocab:nian', hanzi: '年', pinyin: 'nián', pinyinNumbered: 'nian2', pos: 'noun', glosses: { vi: 'năm (thời gian)' }, hanViet: 'niên', unitId: 'zh:unit:h2', lessonSlug: 'h2-dates', exampleHint: '现在是二零二六年。' },
  { id: 'zh:vocab:yue', hanzi: '月', pinyin: 'yuè', pinyinNumbered: 'yue4', pos: 'noun', glosses: { vi: 'tháng' }, hanViet: 'nguyệt', unitId: 'zh:unit:h2', lessonSlug: 'h2-dates', measureWord: '个', exampleHint: '今天是五月三号。', note: '五月 = tháng Năm; 五个月 = năm tháng (thời lượng).' },
  { id: 'zh:vocab:hao-date', hanzi: '号', pinyin: 'hào', pinyinNumbered: 'hao4', pos: 'noun', glosses: { vi: 'ngày (trong tháng, cách nói thông dụng)' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-dates', exampleHint: '今天是几号？' },
  { id: 'zh:vocab:xing-qi', hanzi: '星期', pinyin: 'xīngqī', pinyinNumbered: 'xing1 qi1', pos: 'noun', glosses: { vi: 'tuần; thứ (trong tuần)' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-dates', measureWord: '个', exampleHint: '今天是星期三。' },
  { id: 'zh:vocab:jin-tian', hanzi: '今天', pinyin: 'jīntiān', pinyinNumbered: 'jin1 tian1', pos: 'noun', glosses: { vi: 'hôm nay' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-dates', exampleHint: '今天是五月一号。' },
  { id: 'zh:vocab:ming-tian', hanzi: '明天', pinyin: 'míngtiān', pinyinNumbered: 'ming2 tian1', pos: 'noun', glosses: { vi: 'ngày mai' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-dates', exampleHint: '明天是星期四。' },
  // h2-clock
  { id: 'zh:vocab:dian', hanzi: '点', pinyin: 'diǎn', pinyinNumbered: 'dian3', pos: 'measure', glosses: { vi: 'giờ (chỉ thời điểm)' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-clock', exampleHint: '现在是三点。' },
  { id: 'zh:vocab:fen', hanzi: '分', pinyin: 'fēn', pinyinNumbered: 'fen1', pos: 'measure', glosses: { vi: 'phút (khi nói giờ)' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-clock', exampleHint: '现在是三点十分。' },
  { id: 'zh:vocab:ban', hanzi: '半', pinyin: 'bàn', pinyinNumbered: 'ban4', pos: 'numeral', glosses: { vi: 'nửa; rưỡi (khi nói giờ)' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-clock', exampleHint: '现在是三点半。' },
  { id: 'zh:vocab:xian-zai', hanzi: '现在', pinyin: 'xiànzài', pinyinNumbered: 'xian4 zai4', pos: 'noun', glosses: { vi: 'bây giờ, hiện tại' }, hanViet: 'hiện tại', unitId: 'zh:unit:h2', lessonSlug: 'h2-clock', exampleHint: '现在是几点？' },
  { id: 'zh:vocab:ling', hanzi: '零', pinyin: 'líng', pinyinNumbered: 'ling2', pos: 'numeral', glosses: { vi: 'không (số 0)' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-clock', exampleHint: '现在是三点零五分。' },
  { id: 'zh:vocab:fen-zhong', hanzi: '分钟', pinyin: 'fēnzhōng', pinyinNumbered: 'fen1 zhong1', pos: 'measure', glosses: { vi: 'phút (thời lượng)' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-clock', exampleHint: '我学习十分钟。', note: '三点十分 là 3 giờ 10; 十分钟 là khoảng thời gian 10 phút.' },
  { id: 'zh:vocab:xiao-shi', hanzi: '小时', pinyin: 'xiǎoshí', pinyinNumbered: 'xiao3 shi2', pos: 'noun', glosses: { vi: 'giờ, tiếng (thời lượng)' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-clock', measureWord: '个', exampleHint: '一个小时是六十分钟。', note: '三点 = 3 giờ (thời điểm); 三个小时 = 3 tiếng (thời lượng).' },
  // h2-time-order
  { id: 'zh:vocab:zuo-tian', hanzi: '昨天', pinyin: 'zuótiān', pinyinNumbered: 'zuo2 tian1', pos: 'noun', glosses: { vi: 'hôm qua' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-time-order', exampleHint: '昨天是星期二。' },
  { id: 'zh:vocab:shang-wu', hanzi: '上午', pinyin: 'shàngwǔ', pinyinNumbered: 'shang4 wu3', pos: 'noun', glosses: { vi: 'buổi sáng (trước trưa)' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-time-order', exampleHint: '现在是上午九点。' },
  { id: 'zh:vocab:xia-wu', hanzi: '下午', pinyin: 'xiàwǔ', pinyinNumbered: 'xia4 wu3', pos: 'noun', glosses: { vi: 'buổi chiều (sau trưa)' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-time-order', exampleHint: '现在是下午三点。' },
  { id: 'zh:vocab:wan-shang', hanzi: '晚上', pinyin: 'wǎnshang', pinyinNumbered: 'wan3 shang5', pos: 'noun', glosses: { vi: 'buổi tối' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-time-order', exampleHint: '现在是晚上八点。' },
  { id: 'zh:vocab:zao-shang', hanzi: '早上', pinyin: 'zǎoshang', pinyinNumbered: 'zao3 shang5', pos: 'noun', glosses: { vi: 'buổi sáng sớm' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-time-order', exampleHint: '现在是早上六点。' },
  { id: 'zh:vocab:shi-hou', hanzi: '时候', pinyin: 'shíhou', pinyinNumbered: 'shi2 hou5', pos: 'noun', glosses: { vi: 'lúc, khi, thời điểm' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-time-order', exampleHint: '你什么时候来？' },
  // h2-review
  { id: 'zh:vocab:qu', hanzi: '去', pinyin: 'qù', pinyinNumbered: 'qu4', pos: 'verb', glosses: { vi: 'đi' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-review', exampleHint: '你什么时候去中国？' },
  { id: 'zh:vocab:lai', hanzi: '来', pinyin: 'lái', pinyinNumbered: 'lai2', pos: 'verb', glosses: { vi: 'đến' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-review', exampleHint: '他明天下午来。' },
  { id: 'zh:vocab:hui', hanzi: '回', pinyin: 'huí', pinyinNumbered: 'hui2', pos: 'verb', glosses: { vi: 'về, trở về' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-review', exampleHint: '我明天回越南。' },
  { id: 'zh:vocab:mei-every', hanzi: '每', pinyin: 'měi', pinyinNumbered: 'mei3', pos: 'determiner', glosses: { vi: 'mỗi' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-review', exampleHint: '他每星期三来。' },
  { id: 'zh:vocab:mei-tian', hanzi: '每天', pinyin: 'měitiān', pinyinNumbered: 'mei3 tian1', pos: 'noun', glosses: { vi: 'mỗi ngày, hằng ngày' }, unitId: 'zh:unit:h2', lessonSlug: 'h2-review', exampleHint: '老师每天上午来。' },
  { id: 'zh:vocab:sheng-ri', hanzi: '生日', pinyin: 'shēngrì', pinyinNumbered: 'sheng1 ri4', pos: 'noun', glosses: { vi: 'sinh nhật' }, hanViet: 'sinh nhật', unitId: 'zh:unit:h2', lessonSlug: 'h2-review', measureWord: '个', exampleHint: '明天是我的生日。' },

  // ---------------------------------------------------------------- H3 — Gia đình
  // h3-family
  { id: 'zh:vocab:ba-ba', hanzi: '爸爸', pinyin: 'bàba', pinyinNumbered: 'ba4 ba5', pos: 'noun', glosses: { vi: 'bố, ba' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-family', measureWord: '个', exampleHint: '这是我爸爸。' },
  { id: 'zh:vocab:ma-ma', hanzi: '妈妈', pinyin: 'māma', pinyinNumbered: 'ma1 ma5', pos: 'noun', glosses: { vi: 'mẹ, má' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-family', measureWord: '个', exampleHint: '我妈妈是老师。' },
  { id: 'zh:vocab:ge-ge', hanzi: '哥哥', pinyin: 'gēge', pinyinNumbered: 'ge1 ge5', pos: 'noun', glosses: { vi: 'anh trai' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-family', measureWord: '个', exampleHint: '我哥哥二十岁。' },
  { id: 'zh:vocab:jie-jie', hanzi: '姐姐', pinyin: 'jiějie', pinyinNumbered: 'jie3 jie5', pos: 'noun', glosses: { vi: 'chị gái' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-family', measureWord: '个', exampleHint: '我姐姐是学生。' },
  { id: 'zh:vocab:di-di', hanzi: '弟弟', pinyin: 'dìdi', pinyinNumbered: 'di4 di5', pos: 'noun', glosses: { vi: 'em trai' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-family', measureWord: '个', exampleHint: '我弟弟八岁。' },
  { id: 'zh:vocab:mei-mei', hanzi: '妹妹', pinyin: 'mèimei', pinyinNumbered: 'mei4 mei5', pos: 'noun', glosses: { vi: 'em gái' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-family', measureWord: '个', exampleHint: '我妹妹六岁。' },
  // h3-you-meiyou
  { id: 'zh:vocab:you', hanzi: '有', pinyin: 'yǒu', pinyinNumbered: 'you3', pos: 'verb', glosses: { vi: 'có' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-you-meiyou', exampleHint: '我有哥哥。' },
  { id: 'zh:vocab:mei-not', hanzi: '没', pinyin: 'méi', pinyinNumbered: 'mei2', pos: 'adverb', glosses: { vi: 'không, chưa (trong 没有; phủ định việc đã xảy ra)' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-you-meiyou', exampleHint: '我没有哥哥。', note: '没 ở đây đọc méi, không phải mò; 有 chỉ sở hữu được phủ định bằng 没 hoặc 没有.' },
  { id: 'zh:vocab:mei-you', hanzi: '没有', pinyin: 'méiyǒu', pinyinNumbered: 'mei2 you3', pos: 'verb', glosses: { vi: 'không có' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-you-meiyou', exampleHint: '我没有妹妹。' },
  { id: 'zh:vocab:jia', hanzi: '家', pinyin: 'jiā', pinyinNumbered: 'jia1', pos: 'noun', glosses: { vi: 'nhà, gia đình' }, hanViet: 'gia', unitId: 'zh:unit:h3', lessonSlug: 'h3-you-meiyou', measureWord: '个', exampleHint: '我家有三口人。' },
  { id: 'zh:vocab:er-zi', hanzi: '儿子', pinyin: 'érzi', pinyinNumbered: 'er2 zi5', pos: 'noun', glosses: { vi: 'con trai' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-you-meiyou', measureWord: '个', exampleHint: '他有一个儿子。' },
  { id: 'zh:vocab:nv-er', hanzi: '女儿', pinyin: 'nǚ’ér', pinyinNumbered: 'nü3 er2', pos: 'noun', glosses: { vi: 'con gái' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-you-meiyou', measureWord: '个', exampleHint: '她女儿五岁。' },
  // h3-measure
  { id: 'zh:vocab:ge', hanzi: '个', pinyin: 'gè', pinyinNumbered: 'ge4', pos: 'measure', glosses: { vi: 'lượng từ thông dụng cho người và nhiều đồ vật' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-measure', exampleHint: '我有一个哥哥。', note: 'Số + lượng từ + danh từ: 一个人; 个 không thay được mọi lượng từ.' },
  { id: 'zh:vocab:ben', hanzi: '本', pinyin: 'běn', pinyinNumbered: 'ben3', pos: 'measure', glosses: { vi: 'quyển, cuốn (lượng từ cho sách)' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-measure', exampleHint: '我有三本书。' },
  { id: 'zh:vocab:kou', hanzi: '口', pinyin: 'kǒu', pinyinNumbered: 'kou3', pos: 'measure', glosses: { vi: 'người (lượng từ đếm thành viên gia đình)' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-measure', exampleHint: '你家有几口人？', note: '口 dùng đếm người trong gia đình; không thay 个 cho mọi nhóm người.' },
  { id: 'zh:vocab:liang', hanzi: '两', pinyin: 'liǎng', pinyinNumbered: 'liang3', pos: 'numeral', glosses: { vi: 'hai (thường đứng trước lượng từ)' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-measure', exampleHint: '我有两本书。', note: '两本书 nhưng 二十; không thay mọi 二 bằng 两.' },
  { id: 'zh:vocab:zhuo-zi', hanzi: '桌子', pinyin: 'zhuōzi', pinyinNumbered: 'zhuo1 zi5', pos: 'noun', glosses: { vi: 'cái bàn' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-measure', measureWord: '张', exampleHint: '这是我家的桌子。' },
  { id: 'zh:vocab:yi-zi', hanzi: '椅子', pinyin: 'yǐzi', pinyinNumbered: 'yi3 zi5', pos: 'noun', glosses: { vi: 'cái ghế' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-measure', measureWord: '把', exampleHint: '那是你的椅子吗？' },
  // h3-work-zai
  { id: 'zh:vocab:zai', hanzi: '在', pinyin: 'zài', pinyinNumbered: 'zai4', pos: 'verb', glosses: { vi: 'ở; tại (trước nơi diễn ra hành động)' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-work-zai', exampleHint: '妈妈在家。', note: 'Nơi diễn ra hành động đứng trước động từ: 我在学校工作.' },
  { id: 'zh:vocab:yi-sheng', hanzi: '医生', pinyin: 'yīshēng', pinyinNumbered: 'yi1 sheng1', pos: 'noun', glosses: { vi: 'bác sĩ' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-work-zai', measureWord: '个', exampleHint: '我爸爸是医生。' },
  { id: 'zh:vocab:gong-zuo', hanzi: '工作', pinyin: 'gōngzuò', pinyinNumbered: 'gong1 zuo4', pos: 'verb', glosses: { vi: 'làm việc' }, hanViet: 'công tác', unitId: 'zh:unit:h3', lessonSlug: 'h3-work-zai', exampleHint: '我妈妈在学校工作。' },
  { id: 'zh:vocab:xue-xiao', hanzi: '学校', pinyin: 'xuéxiào', pinyinNumbered: 'xue2 xiao4', pos: 'noun', glosses: { vi: 'trường học' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-work-zai', measureWord: '所', exampleHint: '哥哥在学校。' },
  { id: 'zh:vocab:yi-yuan', hanzi: '医院', pinyin: 'yīyuàn', pinyinNumbered: 'yi1 yuan4', pos: 'noun', glosses: { vi: 'bệnh viện' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-work-zai', measureWord: '家', exampleHint: '爸爸在医院工作。' },
  { id: 'zh:vocab:zhu', hanzi: '住', pinyin: 'zhù', pinyinNumbered: 'zhu4', pos: 'verb', glosses: { vi: 'sống, ở (cư trú)' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-work-zai', exampleHint: '我住在学校。' },
  // h3-dou-ye
  { id: 'zh:vocab:dou', hanzi: '都', pinyin: 'dōu', pinyinNumbered: 'dou1', pos: 'adverb', glosses: { vi: 'đều' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-dou-ye', exampleHint: '我们都是学生。', note: 'Nghĩa “đều” đọc dōu, không đọc dū; 都 đứng sau chủ ngữ, trước động từ.' },
  { id: 'zh:vocab:ye', hanzi: '也', pinyin: 'yě', pinyinNumbered: 'ye3', pos: 'adverb', glosses: { vi: 'cũng' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-dou-ye', exampleHint: '我也是学生。', note: '也 đứng trước động từ, không đặt cuối câu như “cũng” trong một số câu tiếng Việt.' },
  { id: 'zh:vocab:hai', hanzi: '还', pinyin: 'hái', pinyinNumbered: 'hai2', pos: 'adverb', glosses: { vi: 'còn, vẫn; còn… nữa' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-dou-ye', exampleHint: '我还有一个妹妹。', note: 'Nghĩa “còn, vẫn” đọc hái; huán là “trả lại”, chưa học ở đây.' },
  { id: 'zh:vocab:he', hanzi: '和', pinyin: 'hé', pinyinNumbered: 'he2', pos: 'conjunction', glosses: { vi: 'và (nối danh từ, đại từ)' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-dou-ye', exampleHint: '爸爸和妈妈都在家。', note: 'Bài này dùng 和 nối người/vật; không dùng thay “và” để nối hai câu bất kỳ.' },
  { id: 'zh:vocab:yi-qi', hanzi: '一起', pinyin: 'yīqǐ', pinyinNumbered: 'yi1 qi3', pos: 'adverb', glosses: { vi: 'cùng nhau' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-dou-ye', exampleHint: '我们一起去学校。' },
  { id: 'zh:vocab:shang-ban', hanzi: '上班', pinyin: 'shàngbān', pinyinNumbered: 'shang4 ban1', pos: 'verb', glosses: { vi: 'đi làm, vào ca làm' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-dou-ye', exampleHint: '我们每天都上班。' },
  // h3-review
  { id: 'zh:vocab:kan', hanzi: '看', pinyin: 'kàn', pinyinNumbered: 'kan4', pos: 'verb', glosses: { vi: 'xem, nhìn; đọc (sách)' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-review', exampleHint: '我在家看书。' },
  { id: 'zh:vocab:ting', hanzi: '听', pinyin: 'tīng', pinyinNumbered: 'ting1', pos: 'verb', glosses: { vi: 'nghe' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-review', exampleHint: '我听老师说汉语。' },
  { id: 'zh:vocab:shuo', hanzi: '说', pinyin: 'shuō', pinyinNumbered: 'shuo1', pos: 'verb', glosses: { vi: 'nói' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-review', exampleHint: '我们说汉语。' },
  { id: 'zh:vocab:du', hanzi: '读', pinyin: 'dú', pinyinNumbered: 'du2', pos: 'verb', glosses: { vi: 'đọc (có thể đọc thành tiếng)' }, hanViet: 'độc', unitId: 'zh:unit:h3', lessonSlug: 'h3-review', exampleHint: '她每天读书。' },
  { id: 'zh:vocab:xie', hanzi: '写', pinyin: 'xiě', pinyinNumbered: 'xie3', pos: 'verb', glosses: { vi: 'viết' }, unitId: 'zh:unit:h3', lessonSlug: 'h3-review', exampleHint: '你写什么？' },
  { id: 'zh:vocab:xue-xi', hanzi: '学习', pinyin: 'xuéxí', pinyinNumbered: 'xue2 xi2', pos: 'verb', glosses: { vi: 'học, học tập' }, hanViet: 'học tập', unitId: 'zh:unit:h3', lessonSlug: 'h3-review', exampleHint: '我们在学校学习汉语。' },

  // ---------------------------------------------------------------- H4 — Ăn & mua
  // h4-food
  { id: 'zh:vocab:chi', hanzi: '吃', pinyin: 'chī', pinyinNumbered: 'chi1', pos: 'verb', glosses: { vi: 'ăn' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-food', exampleHint: '我吃米饭。' },
  { id: 'zh:vocab:he-drink', hanzi: '喝', pinyin: 'hē', pinyinNumbered: 'he1', pos: 'verb', glosses: { vi: 'uống' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-food', exampleHint: '我喝水。' },
  { id: 'zh:vocab:mi-fan', hanzi: '米饭', pinyin: 'mǐfàn', pinyinNumbered: 'mi3 fan4', pos: 'noun', glosses: { vi: 'cơm' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-food', measureWord: '碗', exampleHint: '我们都吃米饭。' },
  { id: 'zh:vocab:cha', hanzi: '茶', pinyin: 'chá', pinyinNumbered: 'cha2', pos: 'noun', glosses: { vi: 'trà, chè (đồ uống)' }, hanViet: 'trà', unitId: 'zh:unit:h4', lessonSlug: 'h4-food', measureWord: '杯', exampleHint: '爸爸喝茶。' },
  { id: 'zh:vocab:ping-guo', hanzi: '苹果', pinyin: 'píngguǒ', pinyinNumbered: 'ping2 guo3', pos: 'noun', glosses: { vi: 'quả táo' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-food', measureWord: '个', exampleHint: '妹妹吃苹果。' },
  { id: 'zh:vocab:shui', hanzi: '水', pinyin: 'shuǐ', pinyinNumbered: 'shui3', pos: 'noun', glosses: { vi: 'nước' }, hanViet: 'thủy', unitId: 'zh:unit:h4', lessonSlug: 'h4-food', measureWord: '杯', exampleHint: '我喝水。' },
  // h4-xiang-yao
  { id: 'zh:vocab:xiang', hanzi: '想', pinyin: 'xiǎng', pinyinNumbered: 'xiang3', pos: 'modal', glosses: { vi: 'muốn, muốn làm gì' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-xiang-yao', exampleHint: '我想喝茶。' },
  { id: 'zh:vocab:yao', hanzi: '要', pinyin: 'yào', pinyinNumbered: 'yao4', pos: 'modal', glosses: { vi: 'muốn, cần; muốn lấy (khi gọi món)' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-xiang-yao', exampleHint: '我要一杯茶。', note: '要 có thể theo sau bằng danh từ hoặc động từ; 想 chỉ ý muốn thường đi với động từ.' },
  { id: 'zh:vocab:xi-huan', hanzi: '喜欢', pinyin: 'xǐhuan', pinyinNumbered: 'xi3 huan5', pos: 'verb', glosses: { vi: 'thích' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-xiang-yao', exampleHint: '我喜欢吃苹果。' },
  { id: 'zh:vocab:mian-tiao', hanzi: '面条', pinyin: 'miàntiáo', pinyinNumbered: 'mian4 tiao2', pos: 'noun', glosses: { vi: 'mì sợi' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-xiang-yao', measureWord: '碗', exampleHint: '我想吃面条。' },
  { id: 'zh:vocab:ji-dan', hanzi: '鸡蛋', pinyin: 'jīdàn', pinyinNumbered: 'ji1 dan4', pos: 'noun', glosses: { vi: 'trứng gà' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-xiang-yao', measureWord: '个', exampleHint: '弟弟想吃两个鸡蛋。' },
  { id: 'zh:vocab:niu-nai', hanzi: '牛奶', pinyin: 'niúnǎi', pinyinNumbered: 'niu2 nai3', pos: 'noun', glosses: { vi: 'sữa bò' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-xiang-yao', measureWord: '杯', exampleHint: '我每天早上喝牛奶。' },
  // h4-money
  { id: 'zh:vocab:qian', hanzi: '钱', pinyin: 'qián', pinyinNumbered: 'qian2', pos: 'noun', glosses: { vi: 'tiền' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-money', measureWord: '块/元', exampleHint: '这本书多少钱？' },
  { id: 'zh:vocab:kuai', hanzi: '块', pinyin: 'kuài', pinyinNumbered: 'kuai4', pos: 'measure', glosses: { vi: 'đồng (cách nói thông dụng của 元)' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-money', exampleHint: '这本书十块钱。', note: '块 là đơn vị tiền trong cách nói giá; không phải đồng Việt Nam.' },
  { id: 'zh:vocab:mai-buy', hanzi: '买', pinyin: 'mǎi', pinyinNumbered: 'mai3', pos: 'verb', glosses: { vi: 'mua' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-money', exampleHint: '我想买苹果。' },
  { id: 'zh:vocab:mai-sell', hanzi: '卖', pinyin: 'mài', pinyinNumbered: 'mai4', pos: 'verb', glosses: { vi: 'bán' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-money', exampleHint: '这家商店卖牛奶。', note: '买 mǎi = mua; 卖 mài = bán. Phân biệt cả chữ lẫn thanh.' },
  { id: 'zh:vocab:yuan', hanzi: '元', pinyin: 'yuán', pinyinNumbered: 'yuan2', pos: 'measure', glosses: { vi: 'nhân dân tệ (đơn vị tiền Trung Quốc)' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-money', exampleHint: '这本书十元。' },
  { id: 'zh:vocab:shang-dian', hanzi: '商店', pinyin: 'shāngdiàn', pinyinNumbered: 'shang1 dian4', pos: 'noun', glosses: { vi: 'cửa hàng' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-money', measureWord: '家', exampleHint: '我去商店买茶。' },
  // h4-tai-le
  { id: 'zh:vocab:tai', hanzi: '太', pinyin: 'tài', pinyinNumbered: 'tai4', pos: 'adverb', glosses: { vi: 'quá, rất (trong 太…了)' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-tai-le', exampleHint: '这本书太贵了！' },
  { id: 'zh:vocab:le', hanzi: '了', pinyin: 'le', pinyinNumbered: 'le5', pos: 'particle', glosses: { vi: 'trợ từ cuối câu trong 太…了 (quá…!)' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-tai-le', exampleHint: '太好了！', note: 'Ở đây đọc nhẹ le, không phải liǎo; 了 không luôn có nghĩa “đã”.' },
  { id: 'zh:vocab:gui', hanzi: '贵', pinyin: 'guì', pinyinNumbered: 'gui4', pos: 'adjective', glosses: { vi: 'đắt, mắc' }, hanViet: 'quý', unitId: 'zh:unit:h4', lessonSlug: 'h4-tai-le', exampleHint: '这本书很贵。' },
  { id: 'zh:vocab:pian-yi', hanzi: '便宜', pinyin: 'piányi', pinyinNumbered: 'pian2 yi5', pos: 'adjective', glosses: { vi: 'rẻ' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-tai-le', exampleHint: '苹果很便宜。' },
  { id: 'zh:vocab:re', hanzi: '热', pinyin: 'rè', pinyinNumbered: 're4', pos: 'adjective', glosses: { vi: 'nóng' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-tai-le', exampleHint: '水太热了！' },
  { id: 'zh:vocab:leng', hanzi: '冷', pinyin: 'lěng', pinyinNumbered: 'leng3', pos: 'adjective', glosses: { vi: 'lạnh' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-tai-le', exampleHint: '牛奶太冷了！' },
  // h4-ordering
  { id: 'zh:vocab:qing', hanzi: '请', pinyin: 'qǐng', pinyinNumbered: 'qing3', pos: 'verb', glosses: { vi: 'mời; xin (lời đề nghị lịch sự)' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-ordering', exampleHint: '请喝茶。' },
  { id: 'zh:vocab:gei', hanzi: '给', pinyin: 'gěi', pinyinNumbered: 'gei3', pos: 'verb', glosses: { vi: 'cho, đưa cho' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-ordering', exampleHint: '请给我一杯水。' },
  { id: 'zh:vocab:bei', hanzi: '杯', pinyin: 'bēi', pinyinNumbered: 'bei1', pos: 'measure', glosses: { vi: 'cốc, ly (lượng từ cho đồ uống)' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-ordering', exampleHint: '我要两杯茶。' },
  { id: 'zh:vocab:bei-zi', hanzi: '杯子', pinyin: 'bēizi', pinyinNumbered: 'bei1 zi5', pos: 'noun', glosses: { vi: 'cái cốc, cái ly' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-ordering', measureWord: '个', exampleHint: '这是我的杯子。' },
  { id: 'zh:vocab:ka-fei', hanzi: '咖啡', pinyin: 'kāfēi', pinyinNumbered: 'ka1 fei1', pos: 'noun', glosses: { vi: 'cà phê' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-ordering', measureWord: '杯', exampleHint: '请给我一杯咖啡。' },
  { id: 'zh:vocab:fu-wu-yuan', hanzi: '服务员', pinyin: 'fúwùyuán', pinyinNumbered: 'fu2 wu4 yuan2', pos: 'noun', glosses: { vi: 'nhân viên phục vụ' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-ordering', measureWord: '个', exampleHint: '服务员，请给我一杯水。' },
  // h4-review
  { id: 'zh:vocab:dong-xi', hanzi: '东西', pinyin: 'dōngxi', pinyinNumbered: 'dong1 xi5', pos: 'noun', glosses: { vi: 'đồ, đồ vật, thứ' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-review', measureWord: '个', exampleHint: '你想买什么东西？', note: 'Nghĩa “đồ vật” đọc dōngxi; dōngxī là “đông và tây”.' },
  { id: 'zh:vocab:yi-fu', hanzi: '衣服', pinyin: 'yīfu', pinyinNumbered: 'yi1 fu5', pos: 'noun', glosses: { vi: 'quần áo' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-review', measureWord: '件', exampleHint: '她想买衣服。' },
  { id: 'zh:vocab:chang', hanzi: '长', pinyin: 'cháng', pinyinNumbered: 'chang2', pos: 'adjective', glosses: { vi: 'dài' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-review', exampleHint: '这件衣服太长了。', note: 'Nghĩa “dài” đọc cháng; zhǎng là cách đọc khác trong “lớn lên, trưởng…”.' },
  { id: 'zh:vocab:xing-ok', hanzi: '行', pinyin: 'xíng', pinyinNumbered: 'xing2', pos: 'verb', glosses: { vi: 'được, ổn (đồng ý hoặc chấp nhận)' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-review', exampleHint: '十块钱，行吗？', note: 'Nghĩa “được, ổn” đọc xíng; háng là cách đọc trong “hàng, ngành”.' },
  { id: 'zh:vocab:cai', hanzi: '菜', pinyin: 'cài', pinyinNumbered: 'cai4', pos: 'noun', glosses: { vi: 'món ăn; rau' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-review', measureWord: '个', exampleHint: '这是什么菜？' },
  { id: 'zh:vocab:hao-chi', hanzi: '好吃', pinyin: 'hǎochī', pinyinNumbered: 'hao3 chi1', pos: 'adjective', glosses: { vi: 'ngon (đồ ăn)' }, unitId: 'zh:unit:h4', lessonSlug: 'h4-review', exampleHint: '这个菜很好吃。' },
];
