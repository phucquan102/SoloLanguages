/**
 * Frozen vocab manifest for the English `ielts` course (IELTS Foundation).
 *
 * Lists only NEW words. Words already owned by the `general` manifest are not repeated;
 * the ones this course uses again are listed in `ieltsReusedVocabIds` (ids of `general`).
 * Self-authored selection, AI draft: IPA (British, broad) and Vietnamese glosses are unreviewed.
 * Example hints avoid factual claims about the exam format (to be checked against ielts.org at review).
 * Lesson slugs follow docs/curriculum/plan-foundation-level1.md section 2b.
 */

import type { VocabManifestRow } from './general.ts';

export const ieltsVocabManifest: readonly VocabManifestRow[] = [
  // ---------------------------------------------------------------- I1 Bản đồ kỳ thi
  // i1-test-format
  { id: 'en:vocab:test', headword: 'test', ipa: '/test/', pos: 'noun', glosses: { vi: 'bài kiểm tra, kỳ thi' }, unitId: 'en:unit:i1', lessonSlug: 'i1-test-format', exampleHint: 'I have an English test on Friday.' },
  { id: 'en:vocab:listening', headword: 'listening', ipa: '/ˈlɪsnɪŋ/', pos: 'noun', glosses: { vi: 'kỹ năng nghe, phần nghe' }, unitId: 'en:unit:i1', lessonSlug: 'i1-test-format', exampleHint: 'Listening is the first part.' },
  { id: 'en:vocab:reading', headword: 'reading', ipa: '/ˈriːdɪŋ/', pos: 'noun', glosses: { vi: 'kỹ năng đọc, phần đọc' }, unitId: 'en:unit:i1', lessonSlug: 'i1-test-format', exampleHint: 'Reading is one part of the test.' },
  { id: 'en:vocab:writing', headword: 'writing', ipa: '/ˈraɪtɪŋ/', pos: 'noun', glosses: { vi: 'kỹ năng viết, phần viết' }, unitId: 'en:unit:i1', lessonSlug: 'i1-test-format', exampleHint: 'Writing is difficult for me.' },
  { id: 'en:vocab:speaking', headword: 'speaking', ipa: '/ˈspiːkɪŋ/', pos: 'noun', glosses: { vi: 'kỹ năng nói, phần nói' }, unitId: 'en:unit:i1', lessonSlug: 'i1-test-format', exampleHint: 'Speaking is my favourite part.' },

  // i1-instruction-words
  { id: 'en:vocab:instruction', headword: 'instruction', ipa: '/ɪnˈstrʌkʃn/', pos: 'noun', glosses: { vi: 'hướng dẫn, yêu cầu của đề' }, unitId: 'en:unit:i1', lessonSlug: 'i1-instruction-words', exampleHint: 'Read the instructions first.', note: 'Thường dùng số nhiều: instructions.' },
  { id: 'en:vocab:word', headword: 'word', ipa: '/wɜːd/', pos: 'noun', glosses: { vi: 'từ' }, unitId: 'en:unit:i1', lessonSlug: 'i1-instruction-words', exampleHint: 'Write two words.' },
  { id: 'en:vocab:true', headword: 'true', ipa: '/truː/', pos: 'adjective', glosses: { vi: 'đúng, thật' }, unitId: 'en:unit:i1', lessonSlug: 'i1-instruction-words', exampleHint: 'The statement is true.' },
  { id: 'en:vocab:false', headword: 'false', ipa: '/fɔːls/', pos: 'adjective', glosses: { vi: 'sai, không đúng' }, unitId: 'en:unit:i1', lessonSlug: 'i1-instruction-words', exampleHint: 'The statement is false.' },
  { id: 'en:vocab:given', headword: 'given', ipa: '/ˈɡɪvn/', pos: 'adjective', glosses: { vi: 'được cho, được nêu' }, unitId: 'en:unit:i1', lessonSlug: 'i1-instruction-words', exampleHint: 'The answer is not given in the passage.', note: 'Trong “Not Given” nghĩa là “bài đọc không nêu thông tin này”.' },

  // i1-band-scale
  { id: 'en:vocab:band', headword: 'band', ipa: '/bænd/', pos: 'noun', glosses: { vi: 'mức, dải (trong IELTS: mức điểm)' }, unitId: 'en:unit:i1', lessonSlug: 'i1-band-scale', exampleHint: 'Her overall band is higher than mine.', note: 'Band còn có nghĩa “ban nhạc”; trong IELTS là mức điểm trên thang.' },
  { id: 'en:vocab:score', headword: 'score', ipa: '/skɔː/', pos: 'noun', glosses: { vi: 'điểm số' }, unitId: 'en:unit:i1', lessonSlug: 'i1-band-scale', exampleHint: 'He got a high score.' },
  { id: 'en:vocab:level', headword: 'level', ipa: '/ˈlevl/', pos: 'noun', glosses: { vi: 'trình độ, mức độ' }, unitId: 'en:unit:i1', lessonSlug: 'i1-band-scale', exampleHint: 'What is your English level?' },
  { id: 'en:vocab:overall', headword: 'overall', ipa: '/ˌəʊvərˈɔːl/', pos: 'adjective', glosses: { vi: 'tổng thể, chung' }, unitId: 'en:unit:i1', lessonSlug: 'i1-band-scale', exampleHint: 'Her overall score is high.' },

  // i1-part1-hometown
  { id: 'en:vocab:part', headword: 'part', ipa: '/pɑːt/', pos: 'noun', glosses: { vi: 'phần' }, unitId: 'en:unit:i1', lessonSlug: 'i1-part1-hometown', exampleHint: 'Part One is about you.' },
  { id: 'en:vocab:question', headword: 'question', ipa: '/ˈkwestʃən/', pos: 'noun', glosses: { vi: 'câu hỏi' }, unitId: 'en:unit:i1', lessonSlug: 'i1-part1-hometown', exampleHint: 'This is an easy question.' },
  { id: 'en:vocab:answer', headword: 'answer', ipa: '/ˈɑːnsə/', pos: 'noun', glosses: { vi: 'câu trả lời; trả lời' }, unitId: 'en:unit:i1', lessonSlug: 'i1-part1-hometown', exampleHint: 'Please answer the question.', note: 'Cũng là động từ và đi thẳng với tân ngữ: answer the question (không có “to”).' },
  { id: 'en:vocab:hometown', headword: 'hometown', ipa: '/ˈhəʊmtaʊn/', pos: 'noun', glosses: { vi: 'quê hương, quê nhà' }, unitId: 'en:unit:i1', lessonSlug: 'i1-part1-hometown', exampleHint: 'My hometown is a small city.' },
  { id: 'en:vocab:village', headword: 'village', ipa: '/ˈvɪlɪdʒ/', pos: 'noun', glosses: { vi: 'làng, ngôi làng' }, unitId: 'en:unit:i1', lessonSlug: 'i1-part1-hometown', exampleHint: 'My grandmother lives in a village.' },

  // i1-spelling-dates
  { id: 'en:vocab:month', headword: 'month', ipa: '/mʌnθ/', pos: 'noun', glosses: { vi: 'tháng' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'There are twelve months in a year.' },
  { id: 'en:vocab:date', headword: 'date', ipa: '/deɪt/', pos: 'noun', glosses: { vi: 'ngày tháng, ngày (trong tháng)' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'What is the date today?', note: 'Date là ngày cụ thể trong tháng; day là thứ hoặc một ngày nói chung.' },
  { id: 'en:vocab:year', headword: 'year', ipa: '/jɪə/', pos: 'noun', glosses: { vi: 'năm' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'This year is a good year.' },
  { id: 'en:vocab:january', headword: 'January', ipa: '/ˈdʒænjuəri/', pos: 'noun', glosses: { vi: 'tháng Một' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'My birthday is in January.', note: 'Tên tháng luôn viết hoa chữ cái đầu.' },
  { id: 'en:vocab:february', headword: 'February', ipa: '/ˈfebruəri/', pos: 'noun', glosses: { vi: 'tháng Hai' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'February is a short month.', note: 'Chú ý chữ r: Feb-ru-ary.' },
  { id: 'en:vocab:march', headword: 'March', ipa: '/mɑːtʃ/', pos: 'noun', glosses: { vi: 'tháng Ba' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'The course starts in March.' },
  { id: 'en:vocab:april', headword: 'April', ipa: '/ˈeɪprəl/', pos: 'noun', glosses: { vi: 'tháng Tư' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'My test is in April.' },
  { id: 'en:vocab:may', headword: 'May', ipa: '/meɪ/', pos: 'noun', glosses: { vi: 'tháng Năm' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'We go to Hue in May.' },
  { id: 'en:vocab:june', headword: 'June', ipa: '/dʒuːn/', pos: 'noun', glosses: { vi: 'tháng Sáu' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'School finishes in June.' },
  { id: 'en:vocab:july', headword: 'July', ipa: '/dʒuˈlaɪ/', pos: 'noun', glosses: { vi: 'tháng Bảy' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'It is very hot in July.' },
  { id: 'en:vocab:august', headword: 'August', ipa: '/ˈɔːɡəst/', pos: 'noun', glosses: { vi: 'tháng Tám' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'My sister was born in August.' },
  { id: 'en:vocab:september', headword: 'September', ipa: '/sepˈtembə/', pos: 'noun', glosses: { vi: 'tháng Chín' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'School starts in September.' },
  { id: 'en:vocab:october', headword: 'October', ipa: '/ɒkˈtəʊbə/', pos: 'noun', glosses: { vi: 'tháng Mười' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'The exam is in October.' },
  { id: 'en:vocab:november', headword: 'November', ipa: '/nəʊˈvembə/', pos: 'noun', glosses: { vi: 'tháng Mười Một' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'My parents visit me in November.' },
  { id: 'en:vocab:december', headword: 'December', ipa: '/dɪˈsembə/', pos: 'noun', glosses: { vi: 'tháng Mười Hai' }, unitId: 'en:unit:i1', lessonSlug: 'i1-spelling-dates', exampleHint: 'December is the last month of the year.' },

  // i1-study-goal
  { id: 'en:vocab:goal', headword: 'goal', ipa: '/ɡəʊl/', pos: 'noun', glosses: { vi: 'mục tiêu' }, unitId: 'en:unit:i1', lessonSlug: 'i1-study-goal', exampleHint: 'My goal is to study abroad.' },
  { id: 'en:vocab:plan', headword: 'plan', ipa: '/plæn/', pos: 'noun', glosses: { vi: 'kế hoạch, dự định' }, unitId: 'en:unit:i1', lessonSlug: 'i1-study-goal', exampleHint: 'I have a plan for next year.' },
  { id: 'en:vocab:university', headword: 'university', ipa: '/ˌjuːnɪˈvɜːsəti/', pos: 'noun', glosses: { vi: 'trường đại học, đại học' }, unitId: 'en:unit:i1', lessonSlug: 'i1-study-goal', exampleHint: 'I want to go to university.', note: 'Dùng a university (âm đầu /j/ là phụ âm), không dùng “an university”.' },
  { id: 'en:vocab:abroad', headword: 'abroad', ipa: '/əˈbrɔːd/', pos: 'adverb', glosses: { vi: 'ở nước ngoài, ra nước ngoài' }, unitId: 'en:unit:i1', lessonSlug: 'i1-study-goal', exampleHint: 'She wants to study abroad.', note: 'Abroad không đi với giới từ: go abroad (không nói “go to abroad”).' },

  // ---------------------------------------------------------------- I2 Listening
  // i2-numbers-prices
  { id: 'en:vocab:price', headword: 'price', ipa: '/praɪs/', pos: 'noun', glosses: { vi: 'giá, giá cả' }, unitId: 'en:unit:i2', lessonSlug: 'i2-numbers-prices', exampleHint: 'The price is ten pounds.' },
  { id: 'en:vocab:cost', headword: 'cost', ipa: '/kɒst/', pos: 'verb', glosses: { vi: 'có giá, tốn (tiền)' }, unitId: 'en:unit:i2', lessonSlug: 'i2-numbers-prices', exampleHint: 'It costs five pounds.', note: 'Chủ ngữ là món đồ: It costs five pounds; người trả tiền dùng pay/spend.' },
  { id: 'en:vocab:pound', headword: 'pound', ipa: '/paʊnd/', pos: 'noun', glosses: { vi: 'bảng Anh (đơn vị tiền)' }, unitId: 'en:unit:i2', lessonSlug: 'i2-numbers-prices', exampleHint: 'The ticket is six pounds.' },
  { id: 'en:vocab:thousand', headword: 'thousand', ipa: '/ˈθaʊznd/', pos: 'numeral', glosses: { vi: 'nghìn/ngàn' }, unitId: 'en:unit:i2', lessonSlug: 'i2-numbers-prices', exampleHint: 'There are two thousand students.', note: 'Không thêm -s sau số: two thousand (không nói “two thousands”).' },
  { id: 'en:vocab:double', headword: 'double', ipa: '/ˈdʌbl/', pos: 'adjective', glosses: { vi: 'gấp đôi; (khi đọc số) hai lần liền' }, unitId: 'en:unit:i2', lessonSlug: 'i2-numbers-prices', exampleHint: 'My number is double five, double seven.', note: 'Trong số điện thoại, “double five” nghĩa là 55.' },

  // i2-names-addresses
  { id: 'en:vocab:postcode', headword: 'postcode', ipa: '/ˈpəʊstkəʊd/', pos: 'noun', glosses: { vi: 'mã bưu chính' }, unitId: 'en:unit:i2', lessonSlug: 'i2-names-addresses', exampleHint: 'What is your postcode?', note: 'Anh-Anh dùng postcode; Anh-Mỹ dùng zip code.' },
  { id: 'en:vocab:road', headword: 'road', ipa: '/rəʊd/', pos: 'noun', glosses: { vi: 'đường, con đường' }, unitId: 'en:unit:i2', lessonSlug: 'i2-names-addresses', exampleHint: 'I live on Park Road.' },
  { id: 'en:vocab:flat', headword: 'flat', ipa: '/flæt/', pos: 'noun', glosses: { vi: 'căn hộ' }, unitId: 'en:unit:i2', lessonSlug: 'i2-names-addresses', exampleHint: 'My flat is on the second floor.', note: 'Anh-Anh dùng flat; Anh-Mỹ dùng apartment.' },
  { id: 'en:vocab:building', headword: 'building', ipa: '/ˈbɪldɪŋ/', pos: 'noun', glosses: { vi: 'tòa nhà' }, unitId: 'en:unit:i2', lessonSlug: 'i2-names-addresses', exampleHint: 'There is a tall building near here.' },

  // i2-corrections
  { id: 'en:vocab:actually', headword: 'actually', ipa: '/ˈæktʃuəli/', pos: 'adverb', glosses: { vi: 'thực ra, thật ra' }, unitId: 'en:unit:i2', lessonSlug: 'i2-corrections', exampleHint: 'Actually, the meeting is on Tuesday.', note: 'Dùng để đính chính thông tin; không có nghĩa “hiện nay”.' },
  { id: 'en:vocab:mean', headword: 'mean', ipa: '/miːn/', pos: 'verb', glosses: { vi: 'có nghĩa là, ý là' }, unitId: 'en:unit:i2', lessonSlug: 'i2-corrections', exampleHint: 'I mean Tuesday, not Monday.', note: 'I mean… = ý tôi là…; dùng khi tự sửa lại lời vừa nói.' },
  { id: 'en:vocab:mistake', headword: 'mistake', ipa: '/mɪˈsteɪk/', pos: 'noun', glosses: { vi: 'lỗi, sai sót' }, unitId: 'en:unit:i2', lessonSlug: 'i2-corrections', exampleHint: 'Sorry, that is my mistake.', note: 'Nói make a mistake (không nói “do a mistake”).' },
  { id: 'en:vocab:change', headword: 'change', ipa: '/tʃeɪndʒ/', pos: 'verb', glosses: { vi: 'thay đổi, đổi' }, unitId: 'en:unit:i2', lessonSlug: 'i2-corrections', exampleHint: 'I want to change the date.' },
  { id: 'en:vocab:correct', headword: 'correct', ipa: '/kəˈrekt/', pos: 'adjective', glosses: { vi: 'đúng, chính xác' }, unitId: 'en:unit:i2', lessonSlug: 'i2-corrections', exampleHint: 'Is this address correct?' },

  // i2-directions-map
  { id: 'en:vocab:map', headword: 'map', ipa: '/mæp/', pos: 'noun', glosses: { vi: 'bản đồ' }, unitId: 'en:unit:i2', lessonSlug: 'i2-directions-map', exampleHint: 'Look at the map.' },
  { id: 'en:vocab:left', headword: 'left', ipa: '/left/', pos: 'adverb', glosses: { vi: 'trái, bên trái' }, unitId: 'en:unit:i2', lessonSlug: 'i2-directions-map', exampleHint: 'Turn left at the shop.' },
  { id: 'en:vocab:right', headword: 'right', ipa: '/raɪt/', pos: 'adverb', glosses: { vi: 'phải, bên phải' }, unitId: 'en:unit:i2', lessonSlug: 'i2-directions-map', exampleHint: 'Turn right at the corner.', note: 'Right còn có nghĩa “đúng”; trong chỉ đường là “bên phải”.' },
  { id: 'en:vocab:straight', headword: 'straight', ipa: '/streɪt/', pos: 'adverb', glosses: { vi: 'thẳng' }, unitId: 'en:unit:i2', lessonSlug: 'i2-directions-map', exampleHint: 'Go straight for two minutes.' },
  { id: 'en:vocab:turn', headword: 'turn', ipa: '/tɜːn/', pos: 'verb', glosses: { vi: 'rẽ/quẹo, quay' }, unitId: 'en:unit:i2', lessonSlug: 'i2-directions-map', exampleHint: 'Turn left at the corner.' },
  { id: 'en:vocab:corner', headword: 'corner', ipa: '/ˈkɔːnə/', pos: 'noun', glosses: { vi: 'góc, góc đường' }, unitId: 'en:unit:i2', lessonSlug: 'i2-directions-map', exampleHint: 'The shop is on the corner.' },
  { id: 'en:vocab:opposite', headword: 'opposite', ipa: '/ˈɒpəzɪt/', pos: 'preposition', glosses: { vi: 'đối diện' }, unitId: 'en:unit:i2', lessonSlug: 'i2-directions-map', exampleHint: 'The school is opposite the shop.', note: 'Opposite còn là tính từ/danh từ “trái nghĩa, điều ngược lại”; trên bản đồ là “đối diện”.' },
  { id: 'en:vocab:next-to', headword: 'next to', ipa: '/ˈnekst tə/', pos: 'preposition', glosses: { vi: 'bên cạnh, cạnh' }, unitId: 'en:unit:i2', lessonSlug: 'i2-directions-map', exampleHint: 'The shop is next to the school.' },

  // i2-form-completion
  { id: 'en:vocab:form', headword: 'form', ipa: '/fɔːm/', pos: 'noun', glosses: { vi: 'biểu mẫu, mẫu đơn' }, unitId: 'en:unit:i2', lessonSlug: 'i2-form-completion', exampleHint: 'Please fill in this form.' },
  { id: 'en:vocab:complete', headword: 'complete', ipa: '/kəmˈpliːt/', pos: 'verb', glosses: { vi: 'hoàn thành, điền đầy đủ' }, unitId: 'en:unit:i2', lessonSlug: 'i2-form-completion', exampleHint: 'Complete the form.' },
  { id: 'en:vocab:date-of-birth', headword: 'date of birth', ipa: '/ˌdeɪt əv ˈbɜːθ/', pos: 'phrase', glosses: { vi: 'ngày sinh' }, unitId: 'en:unit:i2', lessonSlug: 'i2-form-completion', exampleHint: 'Write your date of birth here.' },
  { id: 'en:vocab:nationality', headword: 'nationality', ipa: '/ˌnæʃəˈnæləti/', pos: 'noun', glosses: { vi: 'quốc tịch' }, unitId: 'en:unit:i2', lessonSlug: 'i2-form-completion', exampleHint: 'My nationality is Vietnamese.' },
  { id: 'en:vocab:occupation', headword: 'occupation', ipa: '/ˌɒkjuˈpeɪʃn/', pos: 'noun', glosses: { vi: 'nghề nghiệp' }, unitId: 'en:unit:i2', lessonSlug: 'i2-form-completion', exampleHint: 'Occupation: teacher.', note: 'Trên biểu mẫu dùng occupation; khi nói chuyện thường hỏi “What is your job?”.' },

  // i2-review
  { id: 'en:vocab:booking', headword: 'booking', ipa: '/ˈbʊkɪŋ/', pos: 'noun', glosses: { vi: 'việc đặt chỗ, đặt trước' }, unitId: 'en:unit:i2', lessonSlug: 'i2-review', exampleHint: 'I have a booking for two.', note: 'Anh-Anh thường dùng booking; Anh-Mỹ hay dùng reservation.' },
  { id: 'en:vocab:ticket', headword: 'ticket', ipa: '/ˈtɪkɪt/', pos: 'noun', glosses: { vi: 'vé' }, unitId: 'en:unit:i2', lessonSlug: 'i2-review', exampleHint: 'One ticket, please.' },

  // ---------------------------------------------------------------- I3 Reading
  // i3-skimming
  { id: 'en:vocab:passage', headword: 'passage', ipa: '/ˈpæsɪdʒ/', pos: 'noun', glosses: { vi: 'đoạn văn, bài đọc' }, unitId: 'en:unit:i3', lessonSlug: 'i3-skimming', exampleHint: 'Read the passage quickly.' },
  { id: 'en:vocab:paragraph', headword: 'paragraph', ipa: '/ˈpærəɡrɑːf/', pos: 'noun', glosses: { vi: 'đoạn (văn)' }, unitId: 'en:unit:i3', lessonSlug: 'i3-skimming', exampleHint: 'The first paragraph is short.' },
  { id: 'en:vocab:heading', headword: 'heading', ipa: '/ˈhedɪŋ/', pos: 'noun', glosses: { vi: 'tiêu đề (của một mục)' }, unitId: 'en:unit:i3', lessonSlug: 'i3-skimming', exampleHint: 'Each paragraph has a heading.' },
  { id: 'en:vocab:topic', headword: 'topic', ipa: '/ˈtɒpɪk/', pos: 'noun', glosses: { vi: 'chủ đề' }, unitId: 'en:unit:i3', lessonSlug: 'i3-skimming', exampleHint: 'The topic is food.' },
  { id: 'en:vocab:skim', headword: 'skim', ipa: '/skɪm/', pos: 'verb', glosses: { vi: 'đọc lướt, đọc nhanh' }, unitId: 'en:unit:i3', lessonSlug: 'i3-skimming', exampleHint: 'Skim the passage first.', note: 'Skim = đọc lướt để nắm ý chính, không đọc từng từ.' },

  // i3-scanning
  { id: 'en:vocab:scan', headword: 'scan', ipa: '/skæn/', pos: 'verb', glosses: { vi: 'đọc quét để tìm thông tin' }, unitId: 'en:unit:i3', lessonSlug: 'i3-scanning', exampleHint: 'Scan the passage for a date.', note: 'Scan = lướt mắt tìm thông tin cụ thể (tên, số, ngày).' },
  { id: 'en:vocab:detail', headword: 'detail', ipa: '/ˈdiːteɪl/', pos: 'noun', glosses: { vi: 'chi tiết' }, unitId: 'en:unit:i3', lessonSlug: 'i3-scanning', exampleHint: 'The passage gives many details.' },
  { id: 'en:vocab:keyword', headword: 'keyword', ipa: '/ˈkiːwɜːd/', pos: 'noun', glosses: { vi: 'từ khóa' }, unitId: 'en:unit:i3', lessonSlug: 'i3-scanning', exampleHint: 'Find the keyword in the question.' },
  { id: 'en:vocab:specific', headword: 'specific', ipa: '/spəˈsɪfɪk/', pos: 'adjective', glosses: { vi: 'cụ thể, riêng biệt' }, unitId: 'en:unit:i3', lessonSlug: 'i3-scanning', exampleHint: 'I need a specific date.' },

  // i3-paraphrase
  { id: 'en:vocab:paraphrase', headword: 'paraphrase', ipa: '/ˈpærəfreɪz/', pos: 'verb', glosses: { vi: 'diễn đạt lại bằng từ khác' }, unitId: 'en:unit:i3', lessonSlug: 'i3-paraphrase', exampleHint: 'Paraphrase the sentence.', note: 'Cũng là danh từ: a paraphrase.' },
  { id: 'en:vocab:synonym', headword: 'synonym', ipa: '/ˈsɪnənɪm/', pos: 'noun', glosses: { vi: 'từ đồng nghĩa' }, unitId: 'en:unit:i3', lessonSlug: 'i3-paraphrase', exampleHint: 'Big and large are synonyms.' },
  { id: 'en:vocab:similar', headword: 'similar', ipa: '/ˈsɪmələ/', pos: 'adjective', glosses: { vi: 'tương tự, giống' }, unitId: 'en:unit:i3', lessonSlug: 'i3-paraphrase', exampleHint: 'The two words are similar.' },
  { id: 'en:vocab:meaning', headword: 'meaning', ipa: '/ˈmiːnɪŋ/', pos: 'noun', glosses: { vi: 'nghĩa, ý nghĩa' }, unitId: 'en:unit:i3', lessonSlug: 'i3-paraphrase', exampleHint: 'What is the meaning of this word?' },
  { id: 'en:vocab:different', headword: 'different', ipa: '/ˈdɪfrənt/', pos: 'adjective', glosses: { vi: 'khác, khác nhau' }, unitId: 'en:unit:i3', lessonSlug: 'i3-paraphrase', exampleHint: 'Rice and bread are different.', note: 'Dùng different from (Anh-Anh cũng gặp different to); không nói “different with”.' },

  // i3-tfng
  { id: 'en:vocab:statement', headword: 'statement', ipa: '/ˈsteɪtmənt/', pos: 'noun', glosses: { vi: 'câu phát biểu, nhận định' }, unitId: 'en:unit:i3', lessonSlug: 'i3-tfng', exampleHint: 'Read each statement carefully.' },
  { id: 'en:vocab:information', headword: 'information', ipa: '/ˌɪnfəˈmeɪʃn/', pos: 'noun', glosses: { vi: 'thông tin' }, unitId: 'en:unit:i3', lessonSlug: 'i3-tfng', exampleHint: 'The passage gives information about food.', note: 'Không đếm được: some information (không nói “informations”).' },
  { id: 'en:vocab:agree', headword: 'agree', ipa: '/əˈɡriː/', pos: 'verb', glosses: { vi: 'đồng ý' }, unitId: 'en:unit:i3', lessonSlug: 'i3-tfng', exampleHint: 'I agree with you.', note: 'Agree là động từ: I agree (không nói “I am agree”); đi với with + người.' },
  { id: 'en:vocab:mention', headword: 'mention', ipa: '/ˈmenʃn/', pos: 'verb', glosses: { vi: 'đề cập, nhắc đến' }, unitId: 'en:unit:i3', lessonSlug: 'i3-tfng', exampleHint: 'The passage does not mention the price.', note: 'Mention + tân ngữ trực tiếp (mention the price), không có “about”.' },

  // i3-sentence-completion
  { id: 'en:vocab:sentence', headword: 'sentence', ipa: '/ˈsentəns/', pos: 'noun', glosses: { vi: 'câu' }, unitId: 'en:unit:i3', lessonSlug: 'i3-sentence-completion', exampleHint: 'Write a short sentence.' },
  { id: 'en:vocab:gap', headword: 'gap', ipa: '/ɡæp/', pos: 'noun', glosses: { vi: 'chỗ trống, khoảng trống' }, unitId: 'en:unit:i3', lessonSlug: 'i3-sentence-completion', exampleHint: 'Write one word in the gap.' },
  { id: 'en:vocab:missing', headword: 'missing', ipa: '/ˈmɪsɪŋ/', pos: 'adjective', glosses: { vi: 'thiếu, bị thiếu' }, unitId: 'en:unit:i3', lessonSlug: 'i3-sentence-completion', exampleHint: 'Find the missing word.' },
  { id: 'en:vocab:noun', headword: 'noun', ipa: '/naʊn/', pos: 'noun', glosses: { vi: 'danh từ' }, unitId: 'en:unit:i3', lessonSlug: 'i3-sentence-completion', exampleHint: 'Book is a noun.' },
  { id: 'en:vocab:verb', headword: 'verb', ipa: '/vɜːb/', pos: 'noun', glosses: { vi: 'động từ' }, unitId: 'en:unit:i3', lessonSlug: 'i3-sentence-completion', exampleHint: 'Read is a verb.' },

  // i3-review
  { id: 'en:vocab:evidence', headword: 'evidence', ipa: '/ˈevɪdəns/', pos: 'noun', glosses: { vi: 'bằng chứng, căn cứ' }, unitId: 'en:unit:i3', lessonSlug: 'i3-review', exampleHint: 'Find the evidence in the passage.', note: 'Không đếm được: some evidence (không nói “evidences”).' },
  { id: 'en:vocab:reason', headword: 'reason', ipa: '/ˈriːzn/', pos: 'noun', glosses: { vi: 'lý do' }, unitId: 'en:unit:i3', lessonSlug: 'i3-review', exampleHint: 'What is the reason?' },

  // ---------------------------------------------------------------- I4 Writing / Speaking
  // i4-svo-sentences
  { id: 'en:vocab:subject', headword: 'subject', ipa: '/ˈsʌbdʒɪkt/', pos: 'noun', glosses: { vi: 'chủ ngữ (trong câu)' }, unitId: 'en:unit:i4', lessonSlug: 'i4-svo-sentences', exampleHint: 'The subject comes first.', note: 'Subject còn có nghĩa “môn học, chủ đề”; ở bài này là chủ ngữ.' },
  { id: 'en:vocab:object', headword: 'object', ipa: '/ˈɒbdʒɪkt/', pos: 'noun', glosses: { vi: 'tân ngữ (trong câu)' }, unitId: 'en:unit:i4', lessonSlug: 'i4-svo-sentences', exampleHint: 'In “I read books”, books is the object.', note: 'Object còn có nghĩa “đồ vật”; ở bài này là tân ngữ.' },
  { id: 'en:vocab:comma', headword: 'comma', ipa: '/ˈkɒmə/', pos: 'noun', glosses: { vi: 'dấu phẩy' }, unitId: 'en:unit:i4', lessonSlug: 'i4-svo-sentences', exampleHint: 'Put a comma here.' },
  { id: 'en:vocab:full-stop', headword: 'full stop', ipa: '/ˌfʊl ˈstɒp/', pos: 'noun', glosses: { vi: 'dấu chấm (cuối câu)' }, unitId: 'en:unit:i4', lessonSlug: 'i4-svo-sentences', exampleHint: 'End the sentence with a full stop.', note: 'Anh-Anh dùng full stop; Anh-Mỹ dùng period.' },

  // i4-linkers
  { id: 'en:vocab:because', headword: 'because', ipa: '/bɪˈkɒz/', pos: 'conjunction', glosses: { vi: 'vì, bởi vì' }, unitId: 'en:unit:i4', lessonSlug: 'i4-linkers', exampleHint: 'I study English because I want to study abroad.', note: 'Because + mệnh đề (chủ ngữ + động từ); because of + danh từ.' },
  { id: 'en:vocab:so', headword: 'so', ipa: '/səʊ/', pos: 'conjunction', glosses: { vi: 'nên, vì vậy' }, unitId: 'en:unit:i4', lessonSlug: 'i4-linkers', exampleHint: 'It is cheap, so I buy it.', note: 'Tiếng Việt “vì… nên…” nhưng tiếng Anh không dùng because và so trong cùng một câu.' },
  { id: 'en:vocab:however', headword: 'however', ipa: '/haʊˈevə/', pos: 'adverb', glosses: { vi: 'tuy nhiên, tuy vậy' }, unitId: 'en:unit:i4', lessonSlug: 'i4-linkers', exampleHint: 'It is cheap. However, it is not good.', note: 'However thường đứng đầu câu và có dấu phẩy sau nó.' },
  { id: 'en:vocab:for-example', headword: 'for example', ipa: '/fər ɪɡˈzɑːmpl/', pos: 'phrase', glosses: { vi: 'ví dụ như, chẳng hạn' }, unitId: 'en:unit:i4', lessonSlug: 'i4-linkers', exampleHint: 'I like fruit, for example apples.' },
  { id: 'en:vocab:finally', headword: 'finally', ipa: '/ˈfaɪnəli/', pos: 'adverb', glosses: { vi: 'cuối cùng' }, unitId: 'en:unit:i4', lessonSlug: 'i4-linkers', exampleHint: 'Finally, I go to bed.' },

  // i4-trend-words
  { id: 'en:vocab:graph', headword: 'graph', ipa: '/ɡrɑːf/', pos: 'noun', glosses: { vi: 'đồ thị, biểu đồ đường' }, unitId: 'en:unit:i4', lessonSlug: 'i4-trend-words', exampleHint: 'The graph shows prices.' },
  { id: 'en:vocab:chart', headword: 'chart', ipa: '/tʃɑːt/', pos: 'noun', glosses: { vi: 'biểu đồ' }, unitId: 'en:unit:i4', lessonSlug: 'i4-trend-words', exampleHint: 'The chart shows two countries.' },
  { id: 'en:vocab:increase', headword: 'increase', ipa: '/ɪnˈkriːs/', pos: 'verb', glosses: { vi: 'tăng' }, unitId: 'en:unit:i4', lessonSlug: 'i4-trend-words', exampleHint: 'Prices increase every year.', note: 'Danh từ increase nhấn âm đầu: /ˈɪnkriːs/.' },
  { id: 'en:vocab:decrease', headword: 'decrease', ipa: '/dɪˈkriːs/', pos: 'verb', glosses: { vi: 'giảm' }, unitId: 'en:unit:i4', lessonSlug: 'i4-trend-words', exampleHint: 'The number decreases.', note: 'Danh từ decrease nhấn âm đầu: /ˈdiːkriːs/.' },
  { id: 'en:vocab:rise', headword: 'rise', ipa: '/raɪz/', pos: 'verb', glosses: { vi: 'tăng lên, nhích lên' }, unitId: 'en:unit:i4', lessonSlug: 'i4-trend-words', exampleHint: 'The price rises.', note: 'Rise không có tân ngữ (prices rise); khác raise (nâng lên cái gì).' },
  { id: 'en:vocab:fall', headword: 'fall', ipa: '/fɔːl/', pos: 'verb', glosses: { vi: 'giảm, rơi' }, unitId: 'en:unit:i4', lessonSlug: 'i4-trend-words', exampleHint: 'The number falls.' },
  { id: 'en:vocab:per-cent', headword: 'per cent', ipa: '/pə ˈsent/', pos: 'noun', glosses: { vi: 'phần trăm' }, unitId: 'en:unit:i4', lessonSlug: 'i4-trend-words', exampleHint: 'Twenty per cent of the students are men.', americanVariant: 'percent', note: 'Anh-Anh truyền thống viết per cent (hai từ); Anh-Mỹ viết percent. Sau số không thêm -s.' },
  { id: 'en:vocab:sharply', headword: 'sharply', ipa: '/ˈʃɑːpli/', pos: 'adverb', glosses: { vi: 'mạnh, đột ngột' }, unitId: 'en:unit:i4', lessonSlug: 'i4-trend-words', exampleHint: 'Prices rose sharply.' },
  { id: 'en:vocab:slightly', headword: 'slightly', ipa: '/ˈslaɪtli/', pos: 'adverb', glosses: { vi: 'nhẹ, một chút' }, unitId: 'en:unit:i4', lessonSlug: 'i4-trend-words', exampleHint: 'The number fell slightly.' },

  // i4-opinion
  { id: 'en:vocab:opinion', headword: 'opinion', ipa: '/əˈpɪnjən/', pos: 'noun', glosses: { vi: 'ý kiến, quan điểm' }, unitId: 'en:unit:i4', lessonSlug: 'i4-opinion', exampleHint: 'In my opinion, it is a good plan.', note: 'Nói in my opinion (không nói “according to my opinion”).' },
  { id: 'en:vocab:think', headword: 'think', ipa: '/θɪŋk/', pos: 'verb', glosses: { vi: 'nghĩ, cho rằng' }, unitId: 'en:unit:i4', lessonSlug: 'i4-opinion', exampleHint: 'I think it is expensive.' },
  { id: 'en:vocab:important', headword: 'important', ipa: '/ɪmˈpɔːtnt/', pos: 'adjective', glosses: { vi: 'quan trọng' }, unitId: 'en:unit:i4', lessonSlug: 'i4-opinion', exampleHint: 'English is important for my job.' },
  { id: 'en:vocab:popular', headword: 'popular', ipa: '/ˈpɒpjələ/', pos: 'adjective', glosses: { vi: 'phổ biến, được ưa chuộng' }, unitId: 'en:unit:i4', lessonSlug: 'i4-opinion', exampleHint: 'Football is popular in Vietnam.' },
  { id: 'en:vocab:difficult', headword: 'difficult', ipa: '/ˈdɪfɪkəlt/', pos: 'adjective', glosses: { vi: 'khó' }, unitId: 'en:unit:i4', lessonSlug: 'i4-opinion', exampleHint: 'English is difficult for me.' },

  // i4-paragraph
  { id: 'en:vocab:essay', headword: 'essay', ipa: '/ˈeseɪ/', pos: 'noun', glosses: { vi: 'bài luận' }, unitId: 'en:unit:i4', lessonSlug: 'i4-paragraph', exampleHint: 'I write an essay every week.' },
  { id: 'en:vocab:introduction', headword: 'introduction', ipa: '/ˌɪntrəˈdʌkʃn/', pos: 'noun', glosses: { vi: 'phần mở đầu, lời giới thiệu' }, unitId: 'en:unit:i4', lessonSlug: 'i4-paragraph', exampleHint: 'The introduction is short.' },
  { id: 'en:vocab:conclusion', headword: 'conclusion', ipa: '/kənˈkluːʒn/', pos: 'noun', glosses: { vi: 'phần kết luận, kết bài' }, unitId: 'en:unit:i4', lessonSlug: 'i4-paragraph', exampleHint: 'Write a conclusion.' },
  { id: 'en:vocab:example', headword: 'example', ipa: '/ɪɡˈzɑːmpl/', pos: 'noun', glosses: { vi: 'ví dụ' }, unitId: 'en:unit:i4', lessonSlug: 'i4-paragraph', exampleHint: 'Give an example.' },

  // i4-part2-planning
  { id: 'en:vocab:describe', headword: 'describe', ipa: '/dɪˈskraɪb/', pos: 'verb', glosses: { vi: 'mô tả' }, unitId: 'en:unit:i4', lessonSlug: 'i4-part2-planning', exampleHint: 'Describe your hometown.' },
  { id: 'en:vocab:talk', headword: 'talk', ipa: '/tɔːk/', pos: 'verb', glosses: { vi: 'nói chuyện, nói (về)' }, unitId: 'en:unit:i4', lessonSlug: 'i4-part2-planning', exampleHint: 'Talk about your family.', note: 'Talk about + chủ đề; talk to/with + người.' },
  { id: 'en:vocab:minute', headword: 'minute', ipa: '/ˈmɪnɪt/', pos: 'noun', glosses: { vi: 'phút' }, unitId: 'en:unit:i4', lessonSlug: 'i4-part2-planning', exampleHint: 'Talk for two minutes.', note: 'Minute /ˈmɪnɪt/ (phút) khác minute /maɪˈnjuːt/ (rất nhỏ).' },
  { id: 'en:vocab:note', headword: 'note', ipa: '/nəʊt/', pos: 'noun', glosses: { vi: 'ghi chú' }, unitId: 'en:unit:i4', lessonSlug: 'i4-part2-planning', exampleHint: 'Make some notes before you talk.' },
];

/**
 * Ids of `general` words that the IELTS lessons use again. Each id must exist in
 * `generalVocabManifest`; none of them is repeated in `ieltsVocabManifest`.
 */
export const ieltsReusedVocabIds: readonly string[] = [
  // numbers (i2-numbers-prices, i2-names-addresses)
  'en:vocab:zero', 'en:vocab:one', 'en:vocab:two', 'en:vocab:three', 'en:vocab:four', 'en:vocab:five',
  'en:vocab:six', 'en:vocab:seven', 'en:vocab:eight', 'en:vocab:nine', 'en:vocab:ten', 'en:vocab:eleven',
  'en:vocab:twelve', 'en:vocab:thirteen', 'en:vocab:fourteen', 'en:vocab:fifteen', 'en:vocab:sixteen',
  'en:vocab:seventeen', 'en:vocab:eighteen', 'en:vocab:nineteen', 'en:vocab:twenty', 'en:vocab:thirty',
  'en:vocab:forty', 'en:vocab:fifty', 'en:vocab:sixty', 'en:vocab:seventy', 'en:vocab:eighty',
  'en:vocab:ninety', 'en:vocab:hundred', 'en:vocab:number', 'en:vocab:phone',
  // names, forms, places (i1, i2)
  'en:vocab:spell', 'en:vocab:name', 'en:vocab:surname', 'en:vocab:address', 'en:vocab:street',
  'en:vocab:email', 'en:vocab:age', 'en:vocab:years-old', 'en:vocab:city', 'en:vocab:country',
  'en:vocab:live', 'en:vocab:from', 'en:vocab:in', 'en:vocab:near', 'en:vocab:shop',
  'en:vocab:vietnam', 'en:vocab:vietnamese', 'en:vocab:english',
  // dates and time (i1-spelling-dates, i2-corrections)
  'en:vocab:day', 'en:vocab:today', 'en:vocab:tomorrow', 'en:vocab:on', 'en:vocab:at', 'en:vocab:time',
  'en:vocab:monday', 'en:vocab:tuesday', 'en:vocab:wednesday', 'en:vocab:thursday', 'en:vocab:friday',
  'en:vocab:saturday', 'en:vocab:sunday',
  // study, work, prices (i1-study-goal, i2-numbers-prices)
  'en:vocab:study', 'en:vocab:work', 'en:vocab:student', 'en:vocab:job', 'en:vocab:want',
  'en:vocab:how-much', 'en:vocab:cheap', 'en:vocab:expensive', 'en:vocab:buy', 'en:vocab:money',
  // classroom verbs and everyday topics (i3, i4)
  'en:vocab:read', 'en:vocab:write', 'en:vocab:listen', 'en:vocab:repeat',
  'en:vocab:family', 'en:vocab:friend', 'en:vocab:hobby', 'en:vocab:like', 'en:vocab:favourite',
  'en:vocab:morning', 'en:vocab:afternoon', 'en:vocab:evening',
];
