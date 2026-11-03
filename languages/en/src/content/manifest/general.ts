/**
 * Frozen vocab manifest for the English `general` course (Foundation + A1).
 *
 * Self-authored word selection (not copied from any published list). AI draft:
 * IPA (British, broad) and Vietnamese glosses are unreviewed; see plan section 6/7.
 * Each id is defined in exactly one unit; the `ielts` manifest reuses these ids.
 * Lesson slugs follow docs/curriculum/plan-foundation-level1.md section 2a.
 */

export type VocabManifestPos =
  | 'noun' | 'verb' | 'modal' | 'adjective' | 'adverb' | 'pronoun' | 'determiner'
  | 'article' | 'preposition' | 'conjunction' | 'interjection' | 'numeral' | 'phrase';

/** Plain local row shape; deliberately independent of `@solo/content-schema`. */
export interface VocabManifestRow {
  /** `en:vocab:<slug>`, ASCII. */
  readonly id: string;
  /** British spelling. */
  readonly headword: string;
  /** British IPA, broad transcription, wrapped in slashes. */
  readonly ipa: string;
  readonly pos: VocabManifestPos;
  readonly glosses: { readonly vi: string };
  /** Owning unit: `en:unit:<slug>`. */
  readonly unitId: string;
  /** Lesson that introduces the word (plan slug). */
  readonly lessonSlug: string;
  /** One short natural example sentence, usable later. */
  readonly exampleHint: string;
  /** Present only when the American spelling differs. */
  readonly americanVariant?: string;
  /** Short reason, only for tricky usage points (Vietnamese). */
  readonly note?: string;
}

export const generalVocabManifest: readonly VocabManifestRow[] = [
  // ---------------------------------------------------------------- F1
  // f1-alphabet-a-m
  { id: 'en:vocab:alphabet', headword: 'alphabet', ipa: '/ˈælfəbet/', pos: 'noun', glosses: { vi: 'bảng chữ cái' }, unitId: 'en:unit:f1', lessonSlug: 'f1-alphabet-a-m', exampleHint: 'The English alphabet has twenty-six letters.' },
  { id: 'en:vocab:letter', headword: 'letter', ipa: '/ˈletə/', pos: 'noun', glosses: { vi: 'chữ cái' }, unitId: 'en:unit:f1', lessonSlug: 'f1-alphabet-a-m', exampleHint: 'A is the first letter.', note: 'Letter còn có nghĩa “lá thư”; ở bài này là chữ cái.' },
  { id: 'en:vocab:english', headword: 'English', ipa: '/ˈɪŋɡlɪʃ/', pos: 'noun', glosses: { vi: 'tiếng Anh' }, unitId: 'en:unit:f1', lessonSlug: 'f1-alphabet-a-m', exampleHint: 'Do you speak English?', note: 'Tên ngôn ngữ và quốc tịch luôn viết hoa chữ cái đầu.' },
  { id: 'en:vocab:learn', headword: 'learn', ipa: '/lɜːn/', pos: 'verb', glosses: { vi: 'học, học được' }, unitId: 'en:unit:f1', lessonSlug: 'f1-alphabet-a-m', exampleHint: 'I learn English every day.' },

  // f1-alphabet-n-z
  { id: 'en:vocab:spell', headword: 'spell', ipa: '/spel/', pos: 'verb', glosses: { vi: 'đánh vần' }, unitId: 'en:unit:f1', lessonSlug: 'f1-alphabet-n-z', exampleHint: 'How do you spell your name?' },
  { id: 'en:vocab:name', headword: 'name', ipa: '/neɪm/', pos: 'noun', glosses: { vi: 'tên' }, unitId: 'en:unit:f1', lessonSlug: 'f1-alphabet-n-z', exampleHint: 'My name is Linh.' },
  { id: 'en:vocab:surname', headword: 'surname', ipa: '/ˈsɜːneɪm/', pos: 'noun', glosses: { vi: 'họ (tên họ)' }, unitId: 'en:unit:f1', lessonSlug: 'f1-alphabet-n-z', exampleHint: 'My surname is Nguyen.', note: 'Surname là họ; tên gọi là first name. Tên người Việt có họ đứng trước.' },
  { id: 'en:vocab:how', headword: 'how', ipa: '/haʊ/', pos: 'adverb', glosses: { vi: 'như thế nào, thế nào' }, unitId: 'en:unit:f1', lessonSlug: 'f1-alphabet-n-z', exampleHint: 'How are you today?' },

  // f1-greetings
  { id: 'en:vocab:hello', headword: 'hello', ipa: '/həˈləʊ/', pos: 'interjection', glosses: { vi: 'xin chào' }, unitId: 'en:unit:f1', lessonSlug: 'f1-greetings', exampleHint: 'Hello, my name is Linh.' },
  { id: 'en:vocab:hi', headword: 'hi', ipa: '/haɪ/', pos: 'interjection', glosses: { vi: 'chào (thân mật)' }, unitId: 'en:unit:f1', lessonSlug: 'f1-greetings', exampleHint: 'Hi, Nam! How are you?' },
  { id: 'en:vocab:goodbye', headword: 'goodbye', ipa: '/ˌɡʊdˈbaɪ/', pos: 'interjection', glosses: { vi: 'tạm biệt' }, unitId: 'en:unit:f1', lessonSlug: 'f1-greetings', exampleHint: 'Goodbye, see you tomorrow.' },
  { id: 'en:vocab:please', headword: 'please', ipa: '/pliːz/', pos: 'adverb', glosses: { vi: 'làm ơn, xin vui lòng' }, unitId: 'en:unit:f1', lessonSlug: 'f1-greetings', exampleHint: 'Sit down, please.' },
  { id: 'en:vocab:thank-you', headword: 'thank you', ipa: '/ˈθæŋk juː/', pos: 'phrase', glosses: { vi: 'cảm ơn' }, unitId: 'en:unit:f1', lessonSlug: 'f1-greetings', exampleHint: 'Thank you very much.' },
  { id: 'en:vocab:sorry', headword: 'sorry', ipa: '/ˈsɒri/', pos: 'interjection', glosses: { vi: 'xin lỗi' }, unitId: 'en:unit:f1', lessonSlug: 'f1-greetings', exampleHint: 'Sorry, I am late.' },
  { id: 'en:vocab:yes', headword: 'yes', ipa: '/jes/', pos: 'interjection', glosses: { vi: 'vâng/dạ, có' }, unitId: 'en:unit:f1', lessonSlug: 'f1-greetings', exampleHint: 'Yes, I am a student.' },
  { id: 'en:vocab:no', headword: 'no', ipa: '/nəʊ/', pos: 'interjection', glosses: { vi: 'không' }, unitId: 'en:unit:f1', lessonSlug: 'f1-greetings', exampleHint: 'No, thank you.' },
  { id: 'en:vocab:nice', headword: 'nice', ipa: '/naɪs/', pos: 'adjective', glosses: { vi: 'dễ chịu, tốt, đẹp' }, unitId: 'en:unit:f1', lessonSlug: 'f1-greetings', exampleHint: 'Nice to meet you.', note: 'Trong “Nice to meet you” dịch là “rất vui được gặp bạn”.' },
  { id: 'en:vocab:meet', headword: 'meet', ipa: '/miːt/', pos: 'verb', glosses: { vi: 'gặp, làm quen' }, unitId: 'en:unit:f1', lessonSlug: 'f1-greetings', exampleHint: 'I meet my friend on Saturday.' },

  // f1-my-name
  { id: 'en:vocab:my', headword: 'my', ipa: '/maɪ/', pos: 'determiner', glosses: { vi: 'của tôi' }, unitId: 'en:unit:f1', lessonSlug: 'f1-my-name', exampleHint: 'My name is Minh.' },
  { id: 'en:vocab:your', headword: 'your', ipa: '/jɔː/', pos: 'determiner', glosses: { vi: 'của bạn' }, unitId: 'en:unit:f1', lessonSlug: 'f1-my-name', exampleHint: 'What is your name?' },
  { id: 'en:vocab:what', headword: 'what', ipa: '/wɒt/', pos: 'pronoun', glosses: { vi: 'gì, cái gì' }, unitId: 'en:unit:f1', lessonSlug: 'f1-my-name', exampleHint: 'What is your phone number?' },
  { id: 'en:vocab:i', headword: 'I', ipa: '/aɪ/', pos: 'pronoun', glosses: { vi: 'tôi' }, unitId: 'en:unit:f1', lessonSlug: 'f1-my-name', exampleHint: 'I am from Vietnam.', note: 'Luôn viết hoa chữ I.' },
  { id: 'en:vocab:you', headword: 'you', ipa: '/juː/', pos: 'pronoun', glosses: { vi: 'bạn, các bạn' }, unitId: 'en:unit:f1', lessonSlug: 'f1-my-name', exampleHint: 'Are you a student?', note: 'Một từ you thay cho bạn/anh/chị/em/các bạn; không đổi theo tuổi hay vai vế.' },
  { id: 'en:vocab:am', headword: 'am', ipa: '/æm/', pos: 'verb', glosses: { vi: 'là, thì (đi với I)' }, unitId: 'en:unit:f1', lessonSlug: 'f1-my-name', exampleHint: 'I am Linh.', note: 'Chỉ đi với I: I am (không nói “I is”).' },
  { id: 'en:vocab:is', headword: 'is', ipa: '/ɪz/', pos: 'verb', glosses: { vi: 'là, thì (đi với he/she/it)' }, unitId: 'en:unit:f1', lessonSlug: 'f1-my-name', exampleHint: 'She is my sister.' },

  // f1-numbers-0-20
  { id: 'en:vocab:zero', headword: 'zero', ipa: '/ˈzɪərəʊ/', pos: 'numeral', glosses: { vi: 'không, số 0' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'It is zero degrees today.', note: 'Trong số điện thoại thường đọc “oh” /əʊ/ thay cho zero.' },
  { id: 'en:vocab:one', headword: 'one', ipa: '/wʌn/', pos: 'numeral', glosses: { vi: 'một' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'I have one sister.' },
  { id: 'en:vocab:two', headword: 'two', ipa: '/tuː/', pos: 'numeral', glosses: { vi: 'hai' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'I have two brothers.' },
  { id: 'en:vocab:three', headword: 'three', ipa: '/θriː/', pos: 'numeral', glosses: { vi: 'ba' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: "The class is at three o'clock." },
  { id: 'en:vocab:four', headword: 'four', ipa: '/fɔː/', pos: 'numeral', glosses: { vi: 'bốn' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'We have four chairs.' },
  { id: 'en:vocab:five', headword: 'five', ipa: '/faɪv/', pos: 'numeral', glosses: { vi: 'năm' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'I have five books.' },
  { id: 'en:vocab:six', headword: 'six', ipa: '/sɪks/', pos: 'numeral', glosses: { vi: 'sáu' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'I get up at six.' },
  { id: 'en:vocab:seven', headword: 'seven', ipa: '/ˈsevn/', pos: 'numeral', glosses: { vi: 'bảy' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'There are seven days in a week.' },
  { id: 'en:vocab:eight', headword: 'eight', ipa: '/eɪt/', pos: 'numeral', glosses: { vi: 'tám' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'My son is eight years old.' },
  { id: 'en:vocab:nine', headword: 'nine', ipa: '/naɪn/', pos: 'numeral', glosses: { vi: 'chín' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'The shop opens at nine.' },
  { id: 'en:vocab:ten', headword: 'ten', ipa: '/ten/', pos: 'numeral', glosses: { vi: 'mười' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'It costs ten pounds.' },
  { id: 'en:vocab:eleven', headword: 'eleven', ipa: '/ɪˈlevn/', pos: 'numeral', glosses: { vi: 'mười một' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'She is eleven years old.' },
  { id: 'en:vocab:twelve', headword: 'twelve', ipa: '/twelv/', pos: 'numeral', glosses: { vi: 'mười hai' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: "It is twelve o'clock." },
  { id: 'en:vocab:thirteen', headword: 'thirteen', ipa: '/ˌθɜːˈtiːn/', pos: 'numeral', glosses: { vi: 'mười ba' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'He is thirteen years old.', note: 'Nhấn âm tiết cuối (thirTEEN); thirty nhấn âm tiết đầu (THIRty).' },
  { id: 'en:vocab:fourteen', headword: 'fourteen', ipa: '/ˌfɔːˈtiːn/', pos: 'numeral', glosses: { vi: 'mười bốn' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'She is fourteen years old.' },
  { id: 'en:vocab:fifteen', headword: 'fifteen', ipa: '/ˌfɪfˈtiːn/', pos: 'numeral', glosses: { vi: 'mười lăm' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'It is fifteen minutes from here.' },
  { id: 'en:vocab:sixteen', headword: 'sixteen', ipa: '/ˌsɪksˈtiːn/', pos: 'numeral', glosses: { vi: 'mười sáu' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'My sister is sixteen.' },
  { id: 'en:vocab:seventeen', headword: 'seventeen', ipa: '/ˌsevnˈtiːn/', pos: 'numeral', glosses: { vi: 'mười bảy' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'He is seventeen.' },
  { id: 'en:vocab:eighteen', headword: 'eighteen', ipa: '/ˌeɪˈtiːn/', pos: 'numeral', glosses: { vi: 'mười tám' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'My brother is eighteen.' },
  { id: 'en:vocab:nineteen', headword: 'nineteen', ipa: '/ˌnaɪnˈtiːn/', pos: 'numeral', glosses: { vi: 'mười chín' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'My friend is nineteen.' },
  { id: 'en:vocab:twenty', headword: 'twenty', ipa: '/ˈtwenti/', pos: 'numeral', glosses: { vi: 'hai mươi' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-0-20', exampleHint: 'I am twenty years old.' },

  // f1-numbers-phone
  { id: 'en:vocab:thirty', headword: 'thirty', ipa: '/ˈθɜːti/', pos: 'numeral', glosses: { vi: 'ba mươi' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-phone', exampleHint: 'It costs thirty pounds.', note: 'Phân biệt thirty (THIRty) và thirteen (thirTEEN).' },
  { id: 'en:vocab:forty', headword: 'forty', ipa: '/ˈfɔːti/', pos: 'numeral', glosses: { vi: 'bốn mươi' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-phone', exampleHint: 'My father is forty years old.', note: 'Viết forty, không phải “fourty”.' },
  { id: 'en:vocab:fifty', headword: 'fifty', ipa: '/ˈfɪfti/', pos: 'numeral', glosses: { vi: 'năm mươi' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-phone', exampleHint: 'The book costs fifty pounds.' },
  { id: 'en:vocab:sixty', headword: 'sixty', ipa: '/ˈsɪksti/', pos: 'numeral', glosses: { vi: 'sáu mươi' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-phone', exampleHint: 'My grandmother is sixty.' },
  { id: 'en:vocab:seventy', headword: 'seventy', ipa: '/ˈsevnti/', pos: 'numeral', glosses: { vi: 'bảy mươi' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-phone', exampleHint: 'He is seventy years old.' },
  { id: 'en:vocab:eighty', headword: 'eighty', ipa: '/ˈeɪti/', pos: 'numeral', glosses: { vi: 'tám mươi' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-phone', exampleHint: 'My grandfather is eighty.' },
  { id: 'en:vocab:ninety', headword: 'ninety', ipa: '/ˈnaɪnti/', pos: 'numeral', glosses: { vi: 'chín mươi' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-phone', exampleHint: 'It costs ninety pounds.' },
  { id: 'en:vocab:hundred', headword: 'hundred', ipa: '/ˈhʌndrəd/', pos: 'numeral', glosses: { vi: 'trăm' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-phone', exampleHint: 'There are one hundred students.', note: 'Không thêm -s sau số: two hundred (không nói “two hundreds”).' },
  { id: 'en:vocab:phone', headword: 'phone', ipa: '/fəʊn/', pos: 'noun', glosses: { vi: 'điện thoại' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-phone', exampleHint: 'What is your phone number?' },
  { id: 'en:vocab:number', headword: 'number', ipa: '/ˈnʌmbə/', pos: 'noun', glosses: { vi: 'số, con số' }, unitId: 'en:unit:f1', lessonSlug: 'f1-numbers-phone', exampleHint: 'Write your number here.' },

  // ---------------------------------------------------------------- F2
  // f2-objects
  { id: 'en:vocab:book', headword: 'book', ipa: '/bʊk/', pos: 'noun', glosses: { vi: 'quyển sách' }, unitId: 'en:unit:f2', lessonSlug: 'f2-objects', exampleHint: 'This is a book.' },
  { id: 'en:vocab:pen', headword: 'pen', ipa: '/pen/', pos: 'noun', glosses: { vi: 'bút (bút bi, bút mực)' }, unitId: 'en:unit:f2', lessonSlug: 'f2-objects', exampleHint: 'I have a blue pen.' },
  { id: 'en:vocab:bag', headword: 'bag', ipa: '/bæɡ/', pos: 'noun', glosses: { vi: 'túi, cặp' }, unitId: 'en:unit:f2', lessonSlug: 'f2-objects', exampleHint: 'My bag is on the desk.' },
  { id: 'en:vocab:desk', headword: 'desk', ipa: '/desk/', pos: 'noun', glosses: { vi: 'bàn học, bàn làm việc' }, unitId: 'en:unit:f2', lessonSlug: 'f2-objects', exampleHint: 'The book is on the desk.' },
  { id: 'en:vocab:chair', headword: 'chair', ipa: '/tʃeə/', pos: 'noun', glosses: { vi: 'ghế' }, unitId: 'en:unit:f2', lessonSlug: 'f2-objects', exampleHint: 'This chair is small.' },
  { id: 'en:vocab:door', headword: 'door', ipa: '/dɔː/', pos: 'noun', glosses: { vi: 'cửa ra vào, cửa' }, unitId: 'en:unit:f2', lessonSlug: 'f2-objects', exampleHint: 'The door is open.' },
  { id: 'en:vocab:window', headword: 'window', ipa: '/ˈwɪndəʊ/', pos: 'noun', glosses: { vi: 'cửa sổ' }, unitId: 'en:unit:f2', lessonSlug: 'f2-objects', exampleHint: 'The window is next to the door.' },
  { id: 'en:vocab:notebook', headword: 'notebook', ipa: '/ˈnəʊtbʊk/', pos: 'noun', glosses: { vi: 'vở/tập, sổ tay' }, unitId: 'en:unit:f2', lessonSlug: 'f2-objects', exampleHint: 'I write new words in my notebook.' },
  { id: 'en:vocab:a', headword: 'a', ipa: '/ə/', pos: 'article', glosses: { vi: 'một (trước danh từ đếm được số ít)' }, unitId: 'en:unit:f2', lessonSlug: 'f2-objects', exampleHint: 'This is a pen.', note: 'Dùng a trước ÂM phụ âm: a book, a university (không xét chữ cái).' },
  { id: 'en:vocab:an', headword: 'an', ipa: '/ən/', pos: 'article', glosses: { vi: 'một (trước âm nguyên âm)' }, unitId: 'en:unit:f2', lessonSlug: 'f2-objects', exampleHint: 'This is an umbrella.', note: 'Dùng an trước ÂM nguyên âm: an umbrella, an hour (không xét chữ cái).' },
  { id: 'en:vocab:umbrella', headword: 'umbrella', ipa: '/ʌmˈbrelə/', pos: 'noun', glosses: { vi: 'ô/dù' }, unitId: 'en:unit:f2', lessonSlug: 'f2-objects', exampleHint: 'My umbrella is black.' },

  // f2-this-that
  { id: 'en:vocab:this', headword: 'this', ipa: '/ðɪs/', pos: 'determiner', glosses: { vi: 'này, đây (vật ở gần)' }, unitId: 'en:unit:f2', lessonSlug: 'f2-this-that', exampleHint: 'What is this?' },
  { id: 'en:vocab:that', headword: 'that', ipa: '/ðæt/', pos: 'determiner', glosses: { vi: 'kia, đó (vật ở xa)' }, unitId: 'en:unit:f2', lessonSlug: 'f2-this-that', exampleHint: 'That is a door.' },
  { id: 'en:vocab:it', headword: 'it', ipa: '/ɪt/', pos: 'pronoun', glosses: { vi: 'nó, cái đó' }, unitId: 'en:unit:f2', lessonSlug: 'f2-this-that', exampleHint: 'It is a bag.', note: 'It chỉ vật hoặc con vật; không dùng cho người.' },
  { id: 'en:vocab:here', headword: 'here', ipa: '/hɪə/', pos: 'adverb', glosses: { vi: 'ở đây, đây' }, unitId: 'en:unit:f2', lessonSlug: 'f2-this-that', exampleHint: 'Here is my pen.' },

  // f2-colours
  { id: 'en:vocab:colour', headword: 'colour', ipa: '/ˈkʌlə/', pos: 'noun', glosses: { vi: 'màu sắc' }, unitId: 'en:unit:f2', lessonSlug: 'f2-colours', exampleHint: 'What colour is your bag?', americanVariant: 'color' },
  { id: 'en:vocab:red', headword: 'red', ipa: '/red/', pos: 'adjective', glosses: { vi: 'đỏ' }, unitId: 'en:unit:f2', lessonSlug: 'f2-colours', exampleHint: 'I have a red pen.' },
  { id: 'en:vocab:blue', headword: 'blue', ipa: '/bluː/', pos: 'adjective', glosses: { vi: 'xanh dương/xanh da trời' }, unitId: 'en:unit:f2', lessonSlug: 'f2-colours', exampleHint: 'The door is blue.', note: 'Tiếng Việt thường gọi chung là “xanh”; tiếng Anh tách blue và green.' },
  { id: 'en:vocab:green', headword: 'green', ipa: '/ɡriːn/', pos: 'adjective', glosses: { vi: 'xanh lá cây' }, unitId: 'en:unit:f2', lessonSlug: 'f2-colours', exampleHint: 'My notebook is green.' },
  { id: 'en:vocab:yellow', headword: 'yellow', ipa: '/ˈjeləʊ/', pos: 'adjective', glosses: { vi: 'vàng' }, unitId: 'en:unit:f2', lessonSlug: 'f2-colours', exampleHint: 'She has a yellow bag.' },
  { id: 'en:vocab:black', headword: 'black', ipa: '/blæk/', pos: 'adjective', glosses: { vi: 'đen' }, unitId: 'en:unit:f2', lessonSlug: 'f2-colours', exampleHint: 'This is a black chair.' },
  { id: 'en:vocab:white', headword: 'white', ipa: '/waɪt/', pos: 'adjective', glosses: { vi: 'trắng' }, unitId: 'en:unit:f2', lessonSlug: 'f2-colours', exampleHint: 'The desk is white.' },

  // f2-classroom
  { id: 'en:vocab:open', headword: 'open', ipa: '/ˈəʊpən/', pos: 'verb', glosses: { vi: 'mở' }, unitId: 'en:unit:f2', lessonSlug: 'f2-classroom', exampleHint: 'Open your book.' },
  { id: 'en:vocab:close', headword: 'close', ipa: '/kləʊz/', pos: 'verb', glosses: { vi: 'đóng' }, unitId: 'en:unit:f2', lessonSlug: 'f2-classroom', exampleHint: 'Close the window, please.', note: 'Động từ close đọc /kləʊz/; tính từ close (gần) đọc /kləʊs/.' },
  { id: 'en:vocab:read', headword: 'read', ipa: '/riːd/', pos: 'verb', glosses: { vi: 'đọc' }, unitId: 'en:unit:f2', lessonSlug: 'f2-classroom', exampleHint: 'Read the sentence.' },
  { id: 'en:vocab:write', headword: 'write', ipa: '/raɪt/', pos: 'verb', glosses: { vi: 'viết' }, unitId: 'en:unit:f2', lessonSlug: 'f2-classroom', exampleHint: 'Write your name.' },
  { id: 'en:vocab:listen', headword: 'listen', ipa: '/ˈlɪsn/', pos: 'verb', glosses: { vi: 'nghe (chú ý nghe)' }, unitId: 'en:unit:f2', lessonSlug: 'f2-classroom', exampleHint: 'Listen and repeat.', note: 'Listen to + người/âm thanh (có “to”); khác hear là nghe thấy.' },
  { id: 'en:vocab:repeat', headword: 'repeat', ipa: '/rɪˈpiːt/', pos: 'verb', glosses: { vi: 'nhắc lại, đọc lại' }, unitId: 'en:unit:f2', lessonSlug: 'f2-classroom', exampleHint: 'Repeat after me.' },
  { id: 'en:vocab:sit-down', headword: 'sit down', ipa: '/ˌsɪt ˈdaʊn/', pos: 'verb', glosses: { vi: 'ngồi xuống' }, unitId: 'en:unit:f2', lessonSlug: 'f2-classroom', exampleHint: 'Sit down, please.' },
  { id: 'en:vocab:the', headword: 'the', ipa: '/ðə/', pos: 'article', glosses: { vi: '(mạo từ) dùng khi người nghe biết rõ là cái nào' }, unitId: 'en:unit:f2', lessonSlug: 'f2-classroom', exampleHint: 'Open the door.', note: 'Tiếng Việt không có mạo từ. Đọc /ðə/ trước âm phụ âm, /ðiː/ trước âm nguyên âm (the egg).' },

  // f2-plurals
  { id: 'en:vocab:box', headword: 'box', ipa: '/bɒks/', pos: 'noun', glosses: { vi: 'cái hộp, thùng' }, unitId: 'en:unit:f2', lessonSlug: 'f2-plurals', exampleHint: 'This is a box.' },
  { id: 'en:vocab:boxes', headword: 'boxes', ipa: '/ˈbɒksɪz/', pos: 'noun', glosses: { vi: 'những cái hộp (số nhiều của box)' }, unitId: 'en:unit:f2', lessonSlug: 'f2-plurals', exampleHint: 'These are boxes.', note: 'Thêm -es sau -x, -s, -sh, -ch: box → boxes.' },
  { id: 'en:vocab:these', headword: 'these', ipa: '/ðiːz/', pos: 'determiner', glosses: { vi: 'những ... này (số nhiều của this)' }, unitId: 'en:unit:f2', lessonSlug: 'f2-plurals', exampleHint: 'These are my pens.' },
  { id: 'en:vocab:those', headword: 'those', ipa: '/ðəʊz/', pos: 'determiner', glosses: { vi: 'những ... kia (số nhiều của that)' }, unitId: 'en:unit:f2', lessonSlug: 'f2-plurals', exampleHint: 'Those are windows.' },

  // f2-days
  { id: 'en:vocab:monday', headword: 'Monday', ipa: '/ˈmʌndeɪ/', pos: 'noun', glosses: { vi: 'thứ Hai' }, unitId: 'en:unit:f2', lessonSlug: 'f2-days', exampleHint: 'I have class on Monday.', note: 'Tên thứ luôn viết hoa chữ cái đầu.' },
  { id: 'en:vocab:tuesday', headword: 'Tuesday', ipa: '/ˈtjuːzdeɪ/', pos: 'noun', glosses: { vi: 'thứ Ba' }, unitId: 'en:unit:f2', lessonSlug: 'f2-days', exampleHint: 'See you on Tuesday.' },
  { id: 'en:vocab:wednesday', headword: 'Wednesday', ipa: '/ˈwenzdeɪ/', pos: 'noun', glosses: { vi: 'thứ Tư' }, unitId: 'en:unit:f2', lessonSlug: 'f2-days', exampleHint: 'The shop is closed on Wednesday.', note: 'Đọc /ˈwenzdeɪ/ — không đọc âm “d” đầu.' },
  { id: 'en:vocab:thursday', headword: 'Thursday', ipa: '/ˈθɜːzdeɪ/', pos: 'noun', glosses: { vi: 'thứ Năm' }, unitId: 'en:unit:f2', lessonSlug: 'f2-days', exampleHint: 'My class is on Thursday.' },
  { id: 'en:vocab:friday', headword: 'Friday', ipa: '/ˈfraɪdeɪ/', pos: 'noun', glosses: { vi: 'thứ Sáu' }, unitId: 'en:unit:f2', lessonSlug: 'f2-days', exampleHint: 'Friday is my favourite day.' },
  { id: 'en:vocab:saturday', headword: 'Saturday', ipa: '/ˈsætədeɪ/', pos: 'noun', glosses: { vi: 'thứ Bảy' }, unitId: 'en:unit:f2', lessonSlug: 'f2-days', exampleHint: 'I meet my friends on Saturday.' },
  { id: 'en:vocab:sunday', headword: 'Sunday', ipa: '/ˈsʌndeɪ/', pos: 'noun', glosses: { vi: 'Chủ nhật' }, unitId: 'en:unit:f2', lessonSlug: 'f2-days', exampleHint: 'We do not work on Sunday.' },
  { id: 'en:vocab:today', headword: 'today', ipa: '/təˈdeɪ/', pos: 'adverb', glosses: { vi: 'hôm nay' }, unitId: 'en:unit:f2', lessonSlug: 'f2-days', exampleHint: 'It is Monday today.' },
  { id: 'en:vocab:tomorrow', headword: 'tomorrow', ipa: '/təˈmɒrəʊ/', pos: 'adverb', glosses: { vi: 'ngày mai' }, unitId: 'en:unit:f2', lessonSlug: 'f2-days', exampleHint: 'See you tomorrow.' },
  { id: 'en:vocab:day', headword: 'day', ipa: '/deɪ/', pos: 'noun', glosses: { vi: 'ngày' }, unitId: 'en:unit:f2', lessonSlug: 'f2-days', exampleHint: 'Have a good day.' },
  { id: 'en:vocab:on', headword: 'on', ipa: '/ɒn/', pos: 'preposition', glosses: { vi: 'vào (thứ, ngày); trên' }, unitId: 'en:unit:f2', lessonSlug: 'f2-days', exampleHint: 'I have class on Monday.', note: 'Dùng on trước thứ/ngày: on Monday (không nói “in Monday”).' },

  // ---------------------------------------------------------------- A1-U1 Bản thân
  // be-positive
  { id: 'en:vocab:are', headword: 'are', ipa: '/ɑː/', pos: 'verb', glosses: { vi: 'là, thì (đi với you/we/they)' }, unitId: 'en:unit:a1-u1', lessonSlug: 'be-positive', exampleHint: 'You are my friend.' },
  { id: 'en:vocab:he', headword: 'he', ipa: '/hiː/', pos: 'pronoun', glosses: { vi: 'anh ấy, ông ấy (nam)' }, unitId: 'en:unit:a1-u1', lessonSlug: 'be-positive', exampleHint: 'He is my brother.' },
  { id: 'en:vocab:she', headword: 'she', ipa: '/ʃiː/', pos: 'pronoun', glosses: { vi: 'cô ấy, chị ấy (nữ)' }, unitId: 'en:unit:a1-u1', lessonSlug: 'be-positive', exampleHint: 'She is from Hue.' },
  { id: 'en:vocab:we', headword: 'we', ipa: '/wiː/', pos: 'pronoun', glosses: { vi: 'chúng tôi, chúng ta' }, unitId: 'en:unit:a1-u1', lessonSlug: 'be-positive', exampleHint: 'We are students.', note: 'Tiếng Việt tách “chúng tôi” và “chúng ta”; tiếng Anh chỉ có we.' },
  { id: 'en:vocab:they', headword: 'they', ipa: '/ðeɪ/', pos: 'pronoun', glosses: { vi: 'họ, chúng' }, unitId: 'en:unit:a1-u1', lessonSlug: 'be-positive', exampleHint: 'They are in the classroom.' },
  { id: 'en:vocab:and', headword: 'and', ipa: '/ænd/', pos: 'conjunction', glosses: { vi: 'và' }, unitId: 'en:unit:a1-u1', lessonSlug: 'be-positive', exampleHint: 'Nam and Lan are friends.' },
  { id: 'en:vocab:friend', headword: 'friend', ipa: '/frend/', pos: 'noun', glosses: { vi: 'bạn, bạn bè' }, unitId: 'en:unit:a1-u1', lessonSlug: 'be-positive', exampleHint: 'He is my friend.' },

  // be-neg-questions
  { id: 'en:vocab:not', headword: 'not', ipa: '/nɒt/', pos: 'adverb', glosses: { vi: 'không (phủ định)' }, unitId: 'en:unit:a1-u1', lessonSlug: 'be-neg-questions', exampleHint: 'I am not a teacher.', note: 'Phủ định với am/is/are dùng not (không dùng “no”): I am not…' },
  { id: 'en:vocab:who', headword: 'who', ipa: '/huː/', pos: 'pronoun', glosses: { vi: 'ai' }, unitId: 'en:unit:a1-u1', lessonSlug: 'be-neg-questions', exampleHint: 'Who is he?' },
  { id: 'en:vocab:where', headword: 'where', ipa: '/weə/', pos: 'adverb', glosses: { vi: 'ở đâu' }, unitId: 'en:unit:a1-u1', lessonSlug: 'be-neg-questions', exampleHint: 'Where are you from?' },

  // countries
  { id: 'en:vocab:country', headword: 'country', ipa: '/ˈkʌntri/', pos: 'noun', glosses: { vi: 'đất nước, quốc gia' }, unitId: 'en:unit:a1-u1', lessonSlug: 'countries', exampleHint: 'Vietnam is my country.' },
  { id: 'en:vocab:from', headword: 'from', ipa: '/frɒm/', pos: 'preposition', glosses: { vi: 'từ, đến từ' }, unitId: 'en:unit:a1-u1', lessonSlug: 'countries', exampleHint: 'I am from Vietnam.', note: 'Cần có am/is/are: I am from Vietnam (không nói “I from Vietnam”).' },
  { id: 'en:vocab:vietnam', headword: 'Vietnam', ipa: '/ˌvjetˈnæm/', pos: 'noun', glosses: { vi: 'Việt Nam' }, unitId: 'en:unit:a1-u1', lessonSlug: 'countries', exampleHint: 'My family lives in Vietnam.' },
  { id: 'en:vocab:vietnamese', headword: 'Vietnamese', ipa: '/ˌvjetnəˈmiːz/', pos: 'adjective', glosses: { vi: 'thuộc Việt Nam; người Việt; tiếng Việt' }, unitId: 'en:unit:a1-u1', lessonSlug: 'countries', exampleHint: 'I am Vietnamese.', note: 'Quốc tịch và ngôn ngữ luôn viết hoa chữ cái đầu.' },
  { id: 'en:vocab:china', headword: 'China', ipa: '/ˈtʃaɪnə/', pos: 'noun', glosses: { vi: 'Trung Quốc' }, unitId: 'en:unit:a1-u1', lessonSlug: 'countries', exampleHint: 'She is from China.' },
  { id: 'en:vocab:chinese', headword: 'Chinese', ipa: '/ˌtʃaɪˈniːz/', pos: 'adjective', glosses: { vi: 'thuộc Trung Quốc; người Trung Quốc; tiếng Trung' }, unitId: 'en:unit:a1-u1', lessonSlug: 'countries', exampleHint: 'My teacher is Chinese.' },

  // jobs
  { id: 'en:vocab:job', headword: 'job', ipa: '/dʒɒb/', pos: 'noun', glosses: { vi: 'công việc, nghề' }, unitId: 'en:unit:a1-u1', lessonSlug: 'jobs', exampleHint: 'What is your job?', note: 'Job đếm được (a job); work (công việc nói chung) không đếm được.' },
  { id: 'en:vocab:teacher', headword: 'teacher', ipa: '/ˈtiːtʃə/', pos: 'noun', glosses: { vi: 'giáo viên' }, unitId: 'en:unit:a1-u1', lessonSlug: 'jobs', exampleHint: 'She is a teacher.' },
  { id: 'en:vocab:doctor', headword: 'doctor', ipa: '/ˈdɒktə/', pos: 'noun', glosses: { vi: 'bác sĩ' }, unitId: 'en:unit:a1-u1', lessonSlug: 'jobs', exampleHint: 'My brother is a doctor.' },
  { id: 'en:vocab:nurse', headword: 'nurse', ipa: '/nɜːs/', pos: 'noun', glosses: { vi: 'y tá, điều dưỡng' }, unitId: 'en:unit:a1-u1', lessonSlug: 'jobs', exampleHint: 'My mother is a nurse.' },
  { id: 'en:vocab:driver', headword: 'driver', ipa: '/ˈdraɪvə/', pos: 'noun', glosses: { vi: 'tài xế, người lái xe' }, unitId: 'en:unit:a1-u1', lessonSlug: 'jobs', exampleHint: 'My father is a driver.' },
  { id: 'en:vocab:student', headword: 'student', ipa: '/ˈstjuːdənt/', pos: 'noun', glosses: { vi: 'học sinh, sinh viên' }, unitId: 'en:unit:a1-u1', lessonSlug: 'jobs', exampleHint: 'I am a student.', note: 'Tiếng Anh dùng một từ student cho cả học sinh và sinh viên.' },

  // age-address
  { id: 'en:vocab:live', headword: 'live', ipa: '/lɪv/', pos: 'verb', glosses: { vi: 'sống, ở (nơi cư trú)' }, unitId: 'en:unit:a1-u1', lessonSlug: 'age-address', exampleHint: 'I live in Hanoi.', note: 'Sau I/you/we/they dùng live, không nói “I am live”.' },
  { id: 'en:vocab:city', headword: 'city', ipa: '/ˈsɪti/', pos: 'noun', glosses: { vi: 'thành phố' }, unitId: 'en:unit:a1-u1', lessonSlug: 'age-address', exampleHint: 'I live in a big city.' },
  { id: 'en:vocab:years-old', headword: 'years old', ipa: '/ˌjɪəz ˈəʊld/', pos: 'phrase', glosses: { vi: 'tuổi' }, unitId: 'en:unit:a1-u1', lessonSlug: 'age-address', exampleHint: 'I am twenty years old.', note: 'Nói tuổi: am/is/are + số + years old (không dùng have).' },
  { id: 'en:vocab:age', headword: 'age', ipa: '/eɪdʒ/', pos: 'noun', glosses: { vi: 'tuổi, độ tuổi' }, unitId: 'en:unit:a1-u1', lessonSlug: 'age-address', exampleHint: 'Please write your name and age.' },
  { id: 'en:vocab:address', headword: 'address', ipa: '/əˈdres/', pos: 'noun', glosses: { vi: 'địa chỉ' }, unitId: 'en:unit:a1-u1', lessonSlug: 'age-address', exampleHint: 'What is your address?' },
  { id: 'en:vocab:street', headword: 'street', ipa: '/striːt/', pos: 'noun', glosses: { vi: 'đường, phố' }, unitId: 'en:unit:a1-u1', lessonSlug: 'age-address', exampleHint: 'The shop is on this street.' },
  { id: 'en:vocab:in', headword: 'in', ipa: '/ɪn/', pos: 'preposition', glosses: { vi: 'trong, ở' }, unitId: 'en:unit:a1-u1', lessonSlug: 'age-address', exampleHint: 'I live in Vietnam.', note: 'Trước tên thành phố hoặc nước dùng in: in Hanoi, in Vietnam.' },

  // read-profile
  { id: 'en:vocab:profile', headword: 'profile', ipa: '/ˈprəʊfaɪl/', pos: 'noun', glosses: { vi: 'hồ sơ cá nhân, trang giới thiệu' }, unitId: 'en:unit:a1-u1', lessonSlug: 'read-profile', exampleHint: 'Her profile says she is a nurse.' },
  { id: 'en:vocab:email', headword: 'email', ipa: '/ˈiːmeɪl/', pos: 'noun', glosses: { vi: 'thư điện tử, email' }, unitId: 'en:unit:a1-u1', lessonSlug: 'read-profile', exampleHint: 'What is your email address?' },
  { id: 'en:vocab:hobby', headword: 'hobby', ipa: '/ˈhɒbi/', pos: 'noun', glosses: { vi: 'sở thích' }, unitId: 'en:unit:a1-u1', lessonSlug: 'read-profile', exampleHint: 'My hobby is music.' },

  // ---------------------------------------------------------------- A1-U2 Gia đình
  // family
  { id: 'en:vocab:family', headword: 'family', ipa: '/ˈfæməli/', pos: 'noun', glosses: { vi: 'gia đình' }, unitId: 'en:unit:a1-u2', lessonSlug: 'family', exampleHint: 'I have a big family.' },
  { id: 'en:vocab:mother', headword: 'mother', ipa: '/ˈmʌðə/', pos: 'noun', glosses: { vi: 'mẹ' }, unitId: 'en:unit:a1-u2', lessonSlug: 'family', exampleHint: 'My mother is a teacher.', note: 'Hội thoại Anh-Anh thường nói mum; Anh-Mỹ nói mom.' },
  { id: 'en:vocab:father', headword: 'father', ipa: '/ˈfɑːðə/', pos: 'noun', glosses: { vi: 'bố/ba' }, unitId: 'en:unit:a1-u2', lessonSlug: 'family', exampleHint: 'My father is a driver.', note: 'Thân mật hơn: dad.' },
  { id: 'en:vocab:brother', headword: 'brother', ipa: '/ˈbrʌðə/', pos: 'noun', glosses: { vi: 'anh trai, em trai' }, unitId: 'en:unit:a1-u2', lessonSlug: 'family', exampleHint: 'I have one brother.', note: 'Tiếng Anh không phân anh/em: brother là anh hoặc em trai; thêm older/younger khi cần.' },
  { id: 'en:vocab:sister', headword: 'sister', ipa: '/ˈsɪstə/', pos: 'noun', glosses: { vi: 'chị gái, em gái' }, unitId: 'en:unit:a1-u2', lessonSlug: 'family', exampleHint: 'My sister is sixteen.', note: 'Tiếng Anh không phân chị/em: sister là chị hoặc em gái.' },
  { id: 'en:vocab:son', headword: 'son', ipa: '/sʌn/', pos: 'noun', glosses: { vi: 'con trai' }, unitId: 'en:unit:a1-u2', lessonSlug: 'family', exampleHint: 'She has one son.' },
  { id: 'en:vocab:daughter', headword: 'daughter', ipa: '/ˈdɔːtə/', pos: 'noun', glosses: { vi: 'con gái' }, unitId: 'en:unit:a1-u2', lessonSlug: 'family', exampleHint: 'He has a daughter.' },

  // possessives
  { id: 'en:vocab:his', headword: 'his', ipa: '/hɪz/', pos: 'determiner', glosses: { vi: 'của anh ấy, của ông ấy' }, unitId: 'en:unit:a1-u2', lessonSlug: 'possessives', exampleHint: 'His name is Nam.' },
  { id: 'en:vocab:her', headword: 'her', ipa: '/hɜː/', pos: 'determiner', glosses: { vi: 'của cô ấy, của chị ấy' }, unitId: 'en:unit:a1-u2', lessonSlug: 'possessives', exampleHint: 'Her name is Lan.', note: 'Her còn là tân ngữ “cô ấy” (I know her); ở bài này là “của cô ấy”.' },
  { id: 'en:vocab:our', headword: 'our', ipa: '/ˈaʊə/', pos: 'determiner', glosses: { vi: 'của chúng tôi, của chúng ta' }, unitId: 'en:unit:a1-u2', lessonSlug: 'possessives', exampleHint: 'Our class is on Monday.' },
  { id: 'en:vocab:their', headword: 'their', ipa: '/ðeə/', pos: 'determiner', glosses: { vi: 'của họ' }, unitId: 'en:unit:a1-u2', lessonSlug: 'possessives', exampleHint: 'Their names are Nam and Lan.' },

  // have-has
  { id: 'en:vocab:have', headword: 'have', ipa: '/hæv/', pos: 'verb', glosses: { vi: 'có' }, unitId: 'en:unit:a1-u2', lessonSlug: 'have-has', exampleHint: 'I have a sister.' },
  { id: 'en:vocab:has', headword: 'has', ipa: '/hæz/', pos: 'verb', glosses: { vi: 'có (đi với he/she/it)' }, unitId: 'en:unit:a1-u2', lessonSlug: 'have-has', exampleHint: 'She has two brothers.', note: 'Ngôi he/she/it dùng has, không nói “haves”.' },
  { id: 'en:vocab:dog', headword: 'dog', ipa: '/dɒɡ/', pos: 'noun', glosses: { vi: 'con chó' }, unitId: 'en:unit:a1-u2', lessonSlug: 'have-has', exampleHint: 'I have a dog.' },

  // apostrophe-s
  { id: 'en:vocab:husband', headword: 'husband', ipa: '/ˈhʌzbənd/', pos: 'noun', glosses: { vi: 'chồng' }, unitId: 'en:unit:a1-u2', lessonSlug: 'apostrophe-s', exampleHint: "Her husband's name is Nam." },
  { id: 'en:vocab:wife', headword: 'wife', ipa: '/waɪf/', pos: 'noun', glosses: { vi: 'vợ' }, unitId: 'en:unit:a1-u2', lessonSlug: 'apostrophe-s', exampleHint: "His wife's name is Lan." },
  { id: 'en:vocab:grandmother', headword: 'grandmother', ipa: '/ˈɡrænmʌðə/', pos: 'noun', glosses: { vi: 'bà (nội/ngoại)' }, unitId: 'en:unit:a1-u2', lessonSlug: 'apostrophe-s', exampleHint: "This is my grandmother's house.", note: 'Tiếng Anh không phân nội/ngoại.' },
  { id: 'en:vocab:grandfather', headword: 'grandfather', ipa: '/ˈɡrænfɑːðə/', pos: 'noun', glosses: { vi: 'ông (nội/ngoại)' }, unitId: 'en:unit:a1-u2', lessonSlug: 'apostrophe-s', exampleHint: "This is my grandfather's chair.", note: 'Tiếng Anh không phân nội/ngoại.' },

  // describe-people
  { id: 'en:vocab:tall', headword: 'tall', ipa: '/tɔːl/', pos: 'adjective', glosses: { vi: 'cao' }, unitId: 'en:unit:a1-u2', lessonSlug: 'describe-people', exampleHint: 'My brother is tall.' },
  { id: 'en:vocab:short', headword: 'short', ipa: '/ʃɔːt/', pos: 'adjective', glosses: { vi: 'thấp, ngắn' }, unitId: 'en:unit:a1-u2', lessonSlug: 'describe-people', exampleHint: 'She is short.' },
  { id: 'en:vocab:young', headword: 'young', ipa: '/jʌŋ/', pos: 'adjective', glosses: { vi: 'trẻ' }, unitId: 'en:unit:a1-u2', lessonSlug: 'describe-people', exampleHint: 'My mother is young.' },
  { id: 'en:vocab:old', headword: 'old', ipa: '/əʊld/', pos: 'adjective', glosses: { vi: 'già, cũ' }, unitId: 'en:unit:a1-u2', lessonSlug: 'describe-people', exampleHint: 'My grandfather is old.' },
  { id: 'en:vocab:happy', headword: 'happy', ipa: '/ˈhæpi/', pos: 'adjective', glosses: { vi: 'vui, hạnh phúc' }, unitId: 'en:unit:a1-u2', lessonSlug: 'describe-people', exampleHint: 'We are happy.' },
  { id: 'en:vocab:very', headword: 'very', ipa: '/ˈveri/', pos: 'adverb', glosses: { vi: 'rất' }, unitId: 'en:unit:a1-u2', lessonSlug: 'describe-people', exampleHint: 'He is very tall.', note: 'Very đứng trước tính từ: very tall (không nói “tall very”).' },

  // write-family
  { id: 'en:vocab:but', headword: 'but', ipa: '/bʌt/', pos: 'conjunction', glosses: { vi: 'nhưng' }, unitId: 'en:unit:a1-u2', lessonSlug: 'write-family', exampleHint: 'I have a brother, but I do not have a sister.' },
  { id: 'en:vocab:also', headword: 'also', ipa: '/ˈɔːlsəʊ/', pos: 'adverb', glosses: { vi: 'cũng' }, unitId: 'en:unit:a1-u2', lessonSlug: 'write-family', exampleHint: 'She also has a dog.', note: 'Also đứng trước động từ thường hoặc sau am/is/are; không đứng cuối câu như “cũng”.' },
  { id: 'en:vocab:with', headword: 'with', ipa: '/wɪð/', pos: 'preposition', glosses: { vi: 'với, cùng với' }, unitId: 'en:unit:a1-u2', lessonSlug: 'write-family', exampleHint: 'I live with my parents.' },
  { id: 'en:vocab:parents', headword: 'parents', ipa: '/ˈpeərənts/', pos: 'noun', glosses: { vi: 'bố mẹ, cha mẹ' }, unitId: 'en:unit:a1-u2', lessonSlug: 'write-family', exampleHint: 'My parents are teachers.', note: 'Luôn ở số nhiều; một người là a parent.' },

  // ---------------------------------------------------------------- A1-U3 Một ngày
  // routines
  { id: 'en:vocab:get-up', headword: 'get up', ipa: '/ˌɡet ˈʌp/', pos: 'verb', glosses: { vi: 'thức dậy, ngủ dậy' }, unitId: 'en:unit:a1-u3', lessonSlug: 'routines', exampleHint: 'I get up at six.' },
  { id: 'en:vocab:have-breakfast', headword: 'have breakfast', ipa: '/ˌhæv ˈbrekfəst/', pos: 'phrase', glosses: { vi: 'ăn sáng' }, unitId: 'en:unit:a1-u3', lessonSlug: 'routines', exampleHint: 'I have breakfast at seven.', note: 'Với bữa ăn, bài này dùng have: have breakfast/lunch/dinner.' },
  { id: 'en:vocab:have-lunch', headword: 'have lunch', ipa: '/ˌhæv ˈlʌntʃ/', pos: 'phrase', glosses: { vi: 'ăn trưa' }, unitId: 'en:unit:a1-u3', lessonSlug: 'routines', exampleHint: 'We have lunch at twelve.' },
  { id: 'en:vocab:have-dinner', headword: 'have dinner', ipa: '/ˌhæv ˈdɪnə/', pos: 'phrase', glosses: { vi: 'ăn tối' }, unitId: 'en:unit:a1-u3', lessonSlug: 'routines', exampleHint: 'They have dinner at seven.' },
  { id: 'en:vocab:go-to-work', headword: 'go to work', ipa: '/ˌɡəʊ tə ˈwɜːk/', pos: 'phrase', glosses: { vi: 'đi làm' }, unitId: 'en:unit:a1-u3', lessonSlug: 'routines', exampleHint: 'He goes to work at eight.', note: 'Không có the: go to work (không nói “go to the work”).' },
  { id: 'en:vocab:go-to-bed', headword: 'go to bed', ipa: '/ˌɡəʊ tə ˈbed/', pos: 'phrase', glosses: { vi: 'đi ngủ' }, unitId: 'en:unit:a1-u3', lessonSlug: 'routines', exampleHint: 'I go to bed at ten.' },
  { id: 'en:vocab:study', headword: 'study', ipa: '/ˈstʌdi/', pos: 'verb', glosses: { vi: 'học, học tập' }, unitId: 'en:unit:a1-u3', lessonSlug: 'routines', exampleHint: 'I study English.', note: 'Study: học môn học, học ở trường; learn: học để biết, học được.' },

  // present-simple
  { id: 'en:vocab:work', headword: 'work', ipa: '/wɜːk/', pos: 'verb', glosses: { vi: 'làm việc' }, unitId: 'en:unit:a1-u3', lessonSlug: 'present-simple', exampleHint: 'I work in Hanoi.' },
  { id: 'en:vocab:play', headword: 'play', ipa: '/pleɪ/', pos: 'verb', glosses: { vi: 'chơi' }, unitId: 'en:unit:a1-u3', lessonSlug: 'present-simple', exampleHint: 'I play football on Sundays.' },
  { id: 'en:vocab:finish', headword: 'finish', ipa: '/ˈfɪnɪʃ/', pos: 'verb', glosses: { vi: 'kết thúc, xong' }, unitId: 'en:unit:a1-u3', lessonSlug: 'present-simple', exampleHint: 'I finish work at five.' },

  // third-person-s
  { id: 'en:vocab:go', headword: 'go', ipa: '/ɡəʊ/', pos: 'verb', glosses: { vi: 'đi' }, unitId: 'en:unit:a1-u3', lessonSlug: 'third-person-s', exampleHint: 'She goes to work by bus.', note: 'Ngôi he/she/it: goes (thêm -es), không nói “she go”.' },
  { id: 'en:vocab:watch', headword: 'watch', ipa: '/wɒtʃ/', pos: 'verb', glosses: { vi: 'xem (ti vi, phim)' }, unitId: 'en:unit:a1-u3', lessonSlug: 'third-person-s', exampleHint: 'He watches TV at night.', note: 'Ngôi he/she/it: watches (thêm -es sau -ch).' },
  { id: 'en:vocab:tv', headword: 'TV', ipa: '/ˌtiːˈviː/', pos: 'noun', glosses: { vi: 'ti vi' }, unitId: 'en:unit:a1-u3', lessonSlug: 'third-person-s', exampleHint: 'I watch TV in the evening.' },

  // do-does-q
  { id: 'en:vocab:do', headword: 'do', ipa: '/duː/', pos: 'verb', glosses: { vi: 'làm; (trợ động từ tạo câu hỏi/phủ định)' }, unitId: 'en:unit:a1-u3', lessonSlug: 'do-does-q', exampleHint: 'Do you like coffee?', note: 'Do/does ở đầu câu hỏi chỉ là trợ động từ, không dịch thành “làm”. Phủ định: do not (don’t).' },
  { id: 'en:vocab:does', headword: 'does', ipa: '/dʌz/', pos: 'verb', glosses: { vi: 'làm; (trợ động từ, ngôi he/she/it)' }, unitId: 'en:unit:a1-u3', lessonSlug: 'do-does-q', exampleHint: 'Does he work here?', note: 'Sau does dùng động từ nguyên mẫu: Does she work? (không nói “Does she works?”).' },
  { id: 'en:vocab:when', headword: 'when', ipa: '/wen/', pos: 'adverb', glosses: { vi: 'khi nào, bao giờ' }, unitId: 'en:unit:a1-u3', lessonSlug: 'do-does-q', exampleHint: 'When do you get up?' },
  { id: 'en:vocab:why', headword: 'why', ipa: '/waɪ/', pos: 'adverb', glosses: { vi: 'tại sao, vì sao' }, unitId: 'en:unit:a1-u3', lessonSlug: 'do-does-q', exampleHint: 'Why do you study English?' },

  // time
  { id: 'en:vocab:time', headword: 'time', ipa: '/taɪm/', pos: 'noun', glosses: { vi: 'giờ, thời gian' }, unitId: 'en:unit:a1-u3', lessonSlug: 'time', exampleHint: 'What time is it?' },
  { id: 'en:vocab:o-clock', headword: "o'clock", ipa: '/əˈklɒk/', pos: 'adverb', glosses: { vi: 'giờ (đúng)' }, unitId: 'en:unit:a1-u3', lessonSlug: 'time', exampleHint: "It is seven o'clock.", note: "Chỉ dùng cho giờ chẵn: seven o'clock (không nói “seven thirty o'clock”)." },
  { id: 'en:vocab:half', headword: 'half', ipa: '/hɑːf/', pos: 'noun', glosses: { vi: 'một nửa; rưỡi (khi nói giờ)' }, unitId: 'en:unit:a1-u3', lessonSlug: 'time', exampleHint: 'It is half past six.' },
  { id: 'en:vocab:quarter', headword: 'quarter', ipa: '/ˈkwɔːtə/', pos: 'noun', glosses: { vi: 'một phần tư; mười lăm phút (khi nói giờ)' }, unitId: 'en:unit:a1-u3', lessonSlug: 'time', exampleHint: 'It is a quarter past nine.' },
  { id: 'en:vocab:past', headword: 'past', ipa: '/pɑːst/', pos: 'preposition', glosses: { vi: 'qua, hơn (khi nói giờ)' }, unitId: 'en:unit:a1-u3', lessonSlug: 'time', exampleHint: 'It is ten past eight.' },
  { id: 'en:vocab:to', headword: 'to', ipa: '/tuː/', pos: 'preposition', glosses: { vi: 'kém (khi nói giờ); đến, tới' }, unitId: 'en:unit:a1-u3', lessonSlug: 'time', exampleHint: 'It is ten to nine.', note: 'Ten to nine = chín giờ kém mười.' },
  { id: 'en:vocab:at', headword: 'at', ipa: '/æt/', pos: 'preposition', glosses: { vi: 'lúc, vào lúc; ở' }, unitId: 'en:unit:a1-u3', lessonSlug: 'time', exampleHint: 'I get up at six.', note: 'Giờ dùng at (at six), thứ dùng on (on Monday), buổi dùng in (in the morning).' },

  // frequency
  { id: 'en:vocab:always', headword: 'always', ipa: '/ˈɔːlweɪz/', pos: 'adverb', glosses: { vi: 'luôn luôn, lúc nào cũng' }, unitId: 'en:unit:a1-u3', lessonSlug: 'frequency', exampleHint: 'I always have breakfast.', note: 'Trạng từ tần suất đứng trước động từ thường, sau am/is/are.' },
  { id: 'en:vocab:usually', headword: 'usually', ipa: '/ˈjuːʒuəli/', pos: 'adverb', glosses: { vi: 'thường, thường xuyên' }, unitId: 'en:unit:a1-u3', lessonSlug: 'frequency', exampleHint: 'I usually get up at six.' },
  { id: 'en:vocab:often', headword: 'often', ipa: '/ˈɒfn/', pos: 'adverb', glosses: { vi: 'thường, hay' }, unitId: 'en:unit:a1-u3', lessonSlug: 'frequency', exampleHint: 'We often watch TV.' },
  { id: 'en:vocab:sometimes', headword: 'sometimes', ipa: '/ˈsʌmtaɪmz/', pos: 'adverb', glosses: { vi: 'đôi khi, thỉnh thoảng' }, unitId: 'en:unit:a1-u3', lessonSlug: 'frequency', exampleHint: 'I sometimes play football.' },
  { id: 'en:vocab:never', headword: 'never', ipa: '/ˈnevə/', pos: 'adverb', glosses: { vi: 'không bao giờ' }, unitId: 'en:unit:a1-u3', lessonSlug: 'frequency', exampleHint: 'I never drink coffee.', note: 'Never đã mang nghĩa phủ định; không thêm don’t: I never drink… (không nói “I don’t never drink”).' },

  // listen-day
  { id: 'en:vocab:morning', headword: 'morning', ipa: '/ˈmɔːnɪŋ/', pos: 'noun', glosses: { vi: 'buổi sáng' }, unitId: 'en:unit:a1-u3', lessonSlug: 'listen-day', exampleHint: 'I study in the morning.' },
  { id: 'en:vocab:afternoon', headword: 'afternoon', ipa: '/ˌɑːftəˈnuːn/', pos: 'noun', glosses: { vi: 'buổi chiều' }, unitId: 'en:unit:a1-u3', lessonSlug: 'listen-day', exampleHint: 'I work in the afternoon.' },
  { id: 'en:vocab:evening', headword: 'evening', ipa: '/ˈiːvnɪŋ/', pos: 'noun', glosses: { vi: 'buổi tối, chiều tối' }, unitId: 'en:unit:a1-u3', lessonSlug: 'listen-day', exampleHint: 'We have dinner in the evening.', note: 'Evening kéo dài từ chiều muộn đến tối; night là lúc đêm, đi ngủ.' },
  { id: 'en:vocab:night', headword: 'night', ipa: '/naɪt/', pos: 'noun', glosses: { vi: 'đêm, ban đêm' }, unitId: 'en:unit:a1-u3', lessonSlug: 'listen-day', exampleHint: 'He watches TV at night.' },

  // ---------------------------------------------------------------- A1-U4 Ăn & mua
  // food
  { id: 'en:vocab:food', headword: 'food', ipa: '/fuːd/', pos: 'noun', glosses: { vi: 'đồ ăn, thức ăn' }, unitId: 'en:unit:a1-u4', lessonSlug: 'food', exampleHint: 'I like Vietnamese food.' },
  { id: 'en:vocab:rice', headword: 'rice', ipa: '/raɪs/', pos: 'noun', glosses: { vi: 'cơm, gạo' }, unitId: 'en:unit:a1-u4', lessonSlug: 'food', exampleHint: 'I eat rice every day.', note: 'Không đếm được: some rice (không nói “a rice”, “rices”).' },
  { id: 'en:vocab:noodles', headword: 'noodles', ipa: '/ˈnuːdlz/', pos: 'noun', glosses: { vi: 'mì, bún, phở' }, unitId: 'en:unit:a1-u4', lessonSlug: 'food', exampleHint: 'I have noodles for lunch.', note: 'Thường dùng số nhiều: noodles; “một bát” là a bowl of noodles.' },
  { id: 'en:vocab:bread', headword: 'bread', ipa: '/bred/', pos: 'noun', glosses: { vi: 'bánh mì' }, unitId: 'en:unit:a1-u4', lessonSlug: 'food', exampleHint: 'We have bread for breakfast.', note: 'Không đếm được: some bread, a slice of bread (không nói “a bread”).' },
  { id: 'en:vocab:egg', headword: 'egg', ipa: '/eɡ/', pos: 'noun', glosses: { vi: 'trứng' }, unitId: 'en:unit:a1-u4', lessonSlug: 'food', exampleHint: 'I have an egg for breakfast.' },
  { id: 'en:vocab:chicken', headword: 'chicken', ipa: '/ˈtʃɪkɪn/', pos: 'noun', glosses: { vi: 'gà, thịt gà' }, unitId: 'en:unit:a1-u4', lessonSlug: 'food', exampleHint: 'She likes chicken.' },
  { id: 'en:vocab:fish', headword: 'fish', ipa: '/fɪʃ/', pos: 'noun', glosses: { vi: 'cá, thịt cá' }, unitId: 'en:unit:a1-u4', lessonSlug: 'food', exampleHint: 'We have fish for dinner.' },

  // countable-some-any
  { id: 'en:vocab:apple', headword: 'apple', ipa: '/ˈæpl/', pos: 'noun', glosses: { vi: 'quả táo' }, unitId: 'en:unit:a1-u4', lessonSlug: 'countable-some-any', exampleHint: 'I have an apple.' },
  { id: 'en:vocab:orange', headword: 'orange', ipa: '/ˈɒrɪndʒ/', pos: 'noun', glosses: { vi: 'quả cam; màu cam' }, unitId: 'en:unit:a1-u4', lessonSlug: 'countable-some-any', exampleHint: 'I would like an orange.' },
  { id: 'en:vocab:water', headword: 'water', ipa: '/ˈwɔːtə/', pos: 'noun', glosses: { vi: 'nước (uống)' }, unitId: 'en:unit:a1-u4', lessonSlug: 'countable-some-any', exampleHint: 'Some water, please.', note: 'Không đếm được: some water (không nói “two waters” trong bài này).' },
  { id: 'en:vocab:milk', headword: 'milk', ipa: '/mɪlk/', pos: 'noun', glosses: { vi: 'sữa' }, unitId: 'en:unit:a1-u4', lessonSlug: 'countable-some-any', exampleHint: 'I drink milk in the morning.' },
  { id: 'en:vocab:coffee', headword: 'coffee', ipa: '/ˈkɒfi/', pos: 'noun', glosses: { vi: 'cà phê' }, unitId: 'en:unit:a1-u4', lessonSlug: 'countable-some-any', exampleHint: 'Do you want some coffee?' },
  { id: 'en:vocab:some', headword: 'some', ipa: '/sʌm/', pos: 'determiner', glosses: { vi: 'một vài, một ít' }, unitId: 'en:unit:a1-u4', lessonSlug: 'countable-some-any', exampleHint: 'I have some eggs.' },
  { id: 'en:vocab:any', headword: 'any', ipa: '/ˈeni/', pos: 'determiner', glosses: { vi: 'nào, chút nào (câu hỏi, phủ định)' }, unitId: 'en:unit:a1-u4', lessonSlug: 'countable-some-any', exampleHint: 'Do you have any milk?', note: 'Khẳng định dùng some; câu hỏi và phủ định dùng any: I do not have any milk.' },

  // like-dont-like
  { id: 'en:vocab:like', headword: 'like', ipa: '/laɪk/', pos: 'verb', glosses: { vi: 'thích' }, unitId: 'en:unit:a1-u4', lessonSlug: 'like-dont-like', exampleHint: 'I like rice.', note: 'Phủ định bằng don’t/doesn’t + like: I do not like fish.' },
  { id: 'en:vocab:favourite', headword: 'favourite', ipa: '/ˈfeɪvərɪt/', pos: 'adjective', glosses: { vi: 'yêu thích, ưa thích nhất' }, unitId: 'en:unit:a1-u4', lessonSlug: 'like-dont-like', exampleHint: 'My favourite colour is blue.', americanVariant: 'favorite' },
  { id: 'en:vocab:eat', headword: 'eat', ipa: '/iːt/', pos: 'verb', glosses: { vi: 'ăn' }, unitId: 'en:unit:a1-u4', lessonSlug: 'like-dont-like', exampleHint: 'I eat rice every day.' },
  { id: 'en:vocab:drink', headword: 'drink', ipa: '/drɪŋk/', pos: 'verb', glosses: { vi: 'uống' }, unitId: 'en:unit:a1-u4', lessonSlug: 'like-dont-like', exampleHint: 'I drink water.' },

  // id-like
  { id: 'en:vocab:would', headword: 'would', ipa: '/wʊd/', pos: 'modal', glosses: { vi: '(trong would like) muốn, lịch sự' }, unitId: 'en:unit:a1-u4', lessonSlug: 'id-like', exampleHint: 'I would like a coffee, please.', note: "I'd like = I would like: cách gọi món và đề nghị lịch sự." },
  { id: 'en:vocab:want', headword: 'want', ipa: '/wɒnt/', pos: 'verb', glosses: { vi: 'muốn' }, unitId: 'en:unit:a1-u4', lessonSlug: 'id-like', exampleHint: 'I want some water.', note: "Want khá thẳng; khi gọi món nên nói I'd like." },
  { id: 'en:vocab:menu', headword: 'menu', ipa: '/ˈmenjuː/', pos: 'noun', glosses: { vi: 'thực đơn' }, unitId: 'en:unit:a1-u4', lessonSlug: 'id-like', exampleHint: 'Here is the menu.' },
  { id: 'en:vocab:restaurant', headword: 'restaurant', ipa: '/ˈrestrɒnt/', pos: 'noun', glosses: { vi: 'nhà hàng, quán ăn' }, unitId: 'en:unit:a1-u4', lessonSlug: 'id-like', exampleHint: 'We have dinner at a restaurant.' },
  { id: 'en:vocab:cup', headword: 'cup', ipa: '/kʌp/', pos: 'noun', glosses: { vi: 'tách/chén' }, unitId: 'en:unit:a1-u4', lessonSlug: 'id-like', exampleHint: 'A cup of coffee, please.' },
  { id: 'en:vocab:glass', headword: 'glass', ipa: '/ɡlɑːs/', pos: 'noun', glosses: { vi: 'ly/cốc' }, unitId: 'en:unit:a1-u4', lessonSlug: 'id-like', exampleHint: 'A glass of water, please.' },
  { id: 'en:vocab:of', headword: 'of', ipa: '/ɒv/', pos: 'preposition', glosses: { vi: 'của; (chỉ lượng) a cup of coffee = một tách cà phê' }, unitId: 'en:unit:a1-u4', lessonSlug: 'id-like', exampleHint: 'A cup of coffee, please.' },

  // how-much
  { id: 'en:vocab:how-much', headword: 'how much', ipa: '/ˌhaʊ ˈmʌtʃ/', pos: 'phrase', glosses: { vi: 'bao nhiêu (tiền, lượng không đếm được)' }, unitId: 'en:unit:a1-u4', lessonSlug: 'how-much', exampleHint: 'How much is this bag?', note: 'How much hỏi giá hoặc lượng không đếm được: How much milk?' },
  { id: 'en:vocab:how-many', headword: 'how many', ipa: '/ˌhaʊ ˈmeni/', pos: 'phrase', glosses: { vi: 'bao nhiêu (đếm được)' }, unitId: 'en:unit:a1-u4', lessonSlug: 'how-much', exampleHint: 'How many eggs do you want?', note: 'How many + danh từ số nhiều: How many eggs?' },
  { id: 'en:vocab:cheap', headword: 'cheap', ipa: '/tʃiːp/', pos: 'adjective', glosses: { vi: 'rẻ' }, unitId: 'en:unit:a1-u4', lessonSlug: 'how-much', exampleHint: 'This bag is cheap.' },
  { id: 'en:vocab:expensive', headword: 'expensive', ipa: '/ɪkˈspensɪv/', pos: 'adjective', glosses: { vi: 'đắt/mắc' }, unitId: 'en:unit:a1-u4', lessonSlug: 'how-much', exampleHint: 'This phone is expensive.' },
  { id: 'en:vocab:buy', headword: 'buy', ipa: '/baɪ/', pos: 'verb', glosses: { vi: 'mua' }, unitId: 'en:unit:a1-u4', lessonSlug: 'how-much', exampleHint: 'I buy bread at the shop.' },
  { id: 'en:vocab:money', headword: 'money', ipa: '/ˈmʌni/', pos: 'noun', glosses: { vi: 'tiền' }, unitId: 'en:unit:a1-u4', lessonSlug: 'how-much', exampleHint: 'I have some money.', note: 'Không đếm được: không nói “a money” hay “moneys”.' },

  // there-is-are
  { id: 'en:vocab:there', headword: 'there', ipa: '/ðeə/', pos: 'adverb', glosses: { vi: 'ở đó; (there is/are) có' }, unitId: 'en:unit:a1-u4', lessonSlug: 'there-is-are', exampleHint: 'There is a shop near here.', note: 'There is/are = có (tồn tại ở một nơi); không dùng have cho nghĩa này.' },
  { id: 'en:vocab:shop', headword: 'shop', ipa: '/ʃɒp/', pos: 'noun', glosses: { vi: 'cửa hàng' }, unitId: 'en:unit:a1-u4', lessonSlug: 'there-is-are', exampleHint: 'The shop opens at nine.' },
  { id: 'en:vocab:near', headword: 'near', ipa: '/nɪə/', pos: 'preposition', glosses: { vi: 'gần' }, unitId: 'en:unit:a1-u4', lessonSlug: 'there-is-are', exampleHint: 'The shop is near my house.' },
];
