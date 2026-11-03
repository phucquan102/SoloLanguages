# Hướng dẫn soạn unit cho người học Việt

Mẫu cấu trúc: `languages/en/src/content/general/f1.ts`. F1 vẫn là `ai-draft`;
review AI và test xanh không thay thế duyệt bản ngữ, biên tập Việt hoặc quyền phát hành.
Quyết định chủ dự án ở `plan-foundation-level1.md` §3, §5–7 là căn cứ về lịch,
giọng đọc trình duyệt, thanh gốc và ngưỡng đạt. Ví dụ **Sai** là điều cần tránh,
không phải câu mẫu để đưa vào nội dung học.

## A. Quy tắc chung cho mọi ngôn ngữ

- [ ] **A1 — Quyền sở hữu và mã nguồn dễ đọc.** Mỗi unit có một file với
  `unit`, `lessons`, `quests`, `assessments`, `days`, `tests`, theo `UnitContent`.
  Lấy id từ manifest; mỗi id từ vựng chỉ có một unit sở hữu. Dùng slug có nghĩa,
  helper nhận object có tên tham số, chuỗi dài chia thành các dòng ngắn mà giữ
  nguyên khoảng trắng. Mọi lời Việt dùng `LocalizedText`; plain string ở option
  dành cho ngôn ngữ đích. Provenance trỏ đúng file tác giả.
  **Đúng:** `typed({ key, prompt, answers, explanation, vocabIds, mode })` và
  `introduced({ lessonSlug: alphabetSecondHalf })`. **Sai:** `typed(a, b, c, d, e, f)`
  hoặc định nghĩa lại một từ khi unit sau chỉ cần ôn id cũ.

- [ ] **A2 — Bài đủ cấu trúc, id phản ánh nội dung.** Mỗi lesson có tiêu đề,
  mục tiêu can-do đo được, giải thích Việt, 4–6 ví dụ có `translations.vi`, ít nhất
  một khối lỗi và 6–10 câu luyện (ít nhất hai choice, hai typed). Mọi câu có lời
  giải; mỗi từ mới có ít nhất một ví dụ và hai câu luyện thực sự sử dụng từ đó.
  `vocabIds` mô tả nội dung, không phải cách làm test coverage xanh.
  **Đúng:** dạy số rồi hỏi nhận diện, viết từ và chuyển đổi chữ số.
  **Sai:** gắn `nice`/`meet` vào một câu chỉ yêu cầu chọn `Hello`.

- [ ] **A3 — Nhiệm vụ phải đòi hỏi kỹ năng mục tiêu, không chép đáp án.** Nếu
  bỏ kiến thức vừa học mà vẫn chép được lời giải từ đề, phải đổi nhiệm vụ. Tiến
  từ nhận diện sang tự nhớ và vận dụng; không hỏi lại thông tin đã được trả lời
  trong cùng hội thoại. Không dùng IPA làm điều kiện làm bài cho người mới.
  **Đúng:** tên chữ `en, jee, you, why, ee, en` → gõ `N-G-U-Y-E-N`.
  **Sai:** hiển thị `NGUYEN` rồi yêu cầu chèn gạch nối để “kiểm tra tên chữ”.

- [ ] **A4 — Từ đã học trong mọi option.** Kiểm cả `vocabIds`, đáp án đúng và
  mọi distractor theo ngày trong lịch; mọi từ phải được giới thiệu chậm nhất vào
  ngày đó, và trước câu hỏi trong trình tự học thực tế. Thành phần mẫu cố định
  phải được giải thích trước. Kiểm token/nghĩa trong module, không chỉ tin id đã
  khai báo. Tên người, mã và dạng gợi đọc là dữ liệu có giải thích, không phải từ
  mới để lách coverage. Ví dụ có tối đa 10% token chưa học. Distractor phải hợp
  lý, chỉ có một key đúng sau normalize; dạng sai chỉ dùng khi hình thái đó là
  mục tiêu.
  **Đúng:** thẻ 9–12 dùng các dãy đảo thứ tự làm distractor, đều là số đã học.
  **Sai:** đưa ninety vào option ngày học bảng chữ cái, hoặc dùng câu vô nghĩa làm mồi.

- [ ] **A5 — Option có định dạng ngang nhau.** Cùng kiểu thông tin, mức chi tiết,
  đơn vị và cách dùng ngoặc; không thêm bản dịch, cách đọc hoặc giải thích chỉ
  cho key. `optionParity` cảnh báo key duy nhất có đoạn trong ngoặc hoặc dài hơn
  hai lần mọi distractor; heuristic không thay thế đọc thủ công.
  **Đúng:** cả ba option đều ghi vị trí “âm tiết đầu/cuối” cho hai số.
  **Sai:** chỉ key có `(thir-TEEN)` trong khi các mồi chỉ ghi “âm đầu”.

- [ ] **A6 — Chỉ dẫn typed xác định đủ nhiệm vụ.** Nêu ngữ cảnh, mẫu câu, đầu
  từ khi thực sự cần hoặc hệ chữ phải gõ; nhận mọi cách trả lời chuẩn trong phạm
  vi yêu cầu. Không tiết lộ đáp án bằng số chữ cái, không ép chuỗi thiếu tự nhiên
  bằng giới hạn số từ.
  **Đúng:** “Gõ cả câu ‘Rất vui được gặp bạn, Bao’, bắt đầu bằng Nice.”
  **Sai:** yêu cầu `Nice meet`, hoặc gợi đáp án Hello bằng “gồm 5 chữ cái”.

- [ ] **A7 — Lời Việt tự nhiên và thuật ngữ ổn định.** Viết ngắn, trung tính:
  “Gõ…”, “Chọn…”, “Bạn…”. Dịch theo tình huống; không mặc định thêm đại từ.
  Chọn một biến thể vùng miền trong unit; có thể ghi cặp cốc/ly, vở/tập trong
  glossary. Dùng “âm tiết đầu/cuối”, “âm tiết được nhấn” cho trọng âm; “tên gọi”
  và “họ” cho hai phần tên.
  **Đúng:** `No, thank you.` → “Không, cảm ơn”.
  **Sai:** dịch mọi lời nhận đề nghị thành “Vâng, cho tôi xin” bất kể ngữ cảnh.

- [ ] **A8 — Khối lỗi có căn cứ và hướng dẫn sửa cụ thể.** Ghi nguồn và mức xác
  minh trong comment tác giả: dữ liệu ẩn danh, ý kiến giáo viên hoặc review đề
  xuất. Chưa kiểm chứng thì giữ draft, không tuyên bố tần suất lỗi của người Việt.
  Learner text chỉ mô tả đối chiếu và cách làm; có lời giải bằng chữ thường,
  động tác phát âm hoặc ngữ cảnh để hỗ trợ ký hiệu chuyên môn.
  **Đúng:** “Giữ âm t cuối meet; kết thúc nhẹ nhưng không bỏ âm.”
  **Sai:** chỉ đưa hai chuỗi IPA và ghi “giáo viên cần xác nhận” cho người học.

- [ ] **A9 — Chính sách phản hồi lỗi gõ.** Lỗi gõ vẫn sai, điểm 0; không fuzzy
  accept hoặc tự sửa thành đáp án đúng. Sau khi nộp, hiển thị đáp án mẫu và
  `explanations.vi` giúp người học sửa. Nếu UI chưa có bộ phân loại typo, dùng
  lời giải tĩnh rõ ràng; không hứa tự phát hiện nguyên nhân từ `AnswerResult`.
  Lỗi thanh, đổi chữ hoặc khác nghĩa không được gọi chung là “lỗi bàn phím”.
  **Đúng:** `Hellp` bị từ chối; phản hồi chỉ ra mẫu `Hello` và nhắc kiểm tra chữ cuối.
  **Sai:** cho `Hellp` đúng vì khoảng cách chỉnh sửa nhỏ, hoặc chỉ báo sai không có lời giải.

- [ ] **A10 — Nghe được phép dùng browser TTS theo §7.** Có thể soạn câu nghe
  với giọng đọc trình duyệt ngay, không phải chờ bản thu chuẩn. Nêu rõ nguồn
  giọng mẫu; nội dung phát phải tham chiếu được, đúng ngôn ngữ và đủ làm câu hỏi.
  Kiểm thử luồng phát lại và kiểm tra thủ công giọng đọc, đặc biệt tên chữ, số và
  thanh. Không gọi TTS là audio bản ngữ đã duyệt. Câu gắn `listening` phải thực sự
  phụ thuộc vào nghe; không hiện transcript chứa đáp án trước khi nộp. Câu giải
  mã respelling trên chữ như F1 dùng `en:pronunciation`; IPA là phần hỗ trợ.
  **Đúng:** nút phát TTS đọc các tên chữ, người học gõ chữ tương ứng mà chưa thấy transcript.
  **Sai:** yêu cầu nghe nhưng không có cách phát, hoặc buộc giải mã IPA để thay nghe.

- [ ] **A11 — Bảng lịch tường minh cho từng unit.** Ghi `day → main lessons,
  side quests, test` một lần rồi sinh Day, prerequisite và group từ bảng đó.
  Không suy lịch từ vị trí lesson, phép nhân, `slice` hay regex id. Bình thường
  hai bài chính/ngày; ngày luyện âm nền tảng Chinese có thể ba bài. Checkpoint
  thay Daily Test trong chính hàng lịch, không thêm test chồng lên. Lịch phải hỗ
  trợ các nhịp này mà không sửa thuật toán. Helper `daily()` nhận `category`
  dạng string: khóa trong `mainLessons` (kể cả `lesson-c`) lấy group theo bài;
  category không phải khóa bài như `review`/`checkpoint` lấy group theo unit.
  Nhắm 25–30 phút/ngày, ghi rõ thời
  lượng bài, test và phần tùy chọn; đo với người mới trước khi duyệt.
  **Đúng:** F1 ghi ba hàng lịch, 20 phút main + 6 phút test + 3 phút side tùy chọn
  (ước tính, chưa đo); một ngày Chinese có thể ghi ba main ids.
  **Sai:** `lessons.slice(day * 2, day * 2 + 2)` hoặc coi ngày thứ ba luôn là checkpoint.

- [ ] **A12 — Ôn thật, có khoảng cách.** Từ lesson thứ tư có ít nhất hai câu ôn
  kỹ năng cũ trong ngữ cảnh mới; hướng tới cách ít nhất hai ngày. Mỗi từ ôn ít
  nhất hai lần trong 14 ngày. F1 ngày 2 chỉ có ngày 1 để ôn: ghi ngoại lệ trong
  comment/test, không trong lời học. `truncateAtScheduleEnd` chỉ dành cho lịch
  đang viết dở, phải bỏ khi khóa hoàn chỉnh. Không đánh dấu review id nếu câu ôn
  không sử dụng từ đó.
  **Đúng:** ngày sau giải mã một họ mới từ tên chữ đã học.
  **Sai:** ghép thêm “learn English alphabet letter” vào lời dẫn để đủ id ôn.

- [ ] **A13 — Daily/unit Test mới cả đề lẫn đáp án.** So với mọi câu luyện cùng
  unit: không trùng prompt sau normalize, không trùng bất kỳ accepted answer hay
  key choice nào, kể cả biến thể dấu câu, contraction và separator. Đổi thực sự
  dữ kiện, không chỉ thay lời dẫn. Người duyệt vẫn kiểm paraphrase, vì so chuỗi
  không hiểu mọi câu tương đương. Daily Test hai-main giữ 4/3/3, 10 câu, ít nhất
  ba typed, `category`/`group` đúng nguồn. Ngày ba-main phải ghi rõ phân bổ theo
  ba bài và ôn trong kế hoạch đã duyệt, không tự áp phép chia hai-main. Checkpoint
  20 câu: 80% unit hiện tại + 20% unit trước khi đã có unit trước; unit đầu dùng
  100% nội dung đã học, không bịa lịch sử.
  **Đúng:** luyện số `07700 900123`, test số `07700 901422`.
  **Sai:** thay “Gõ…” bằng “Cuối ngày, gõ…” rồi vẫn giữ đáp án `L-E`.

- [ ] **A14 — Mở test và thưởng đúng chính sách.** Test mở sau toàn bộ main
  quests trong hàng lịch. Review ưu tiên D-1, D-3, D-7 khi tồn tại; đầu khóa chỉ
  dùng lịch sử thật. Ngày 1 có ba warm-up cùng ngày, ghi “khởi động / warm-up”
  trong title test quest và prompt. Daily Test `passRatio: 0.85` (10 câu cần 9
  đúng); không đổi ngưỡng để che lỗi grader. XP main/daily/side/checkpoint là
  10/20/10/30; chỉ lần đạt đầu ngày nhận thưởng, repeat 0; quiz ôn tùy chọn 0.
  **Đúng:** `afterQuestIds` bằng mọi main quest trong ngày, `repeatXp: 0`.
  **Sai:** gọi warm-up ngày 1 là ôn D-1 hoặc mở test khi chỉ xong bài A.

- [ ] **A15 — Không có meta text trong learner copy.** Kế hoạch, tình trạng
  nguồn, yêu cầu duyệt và giả thuyết nằm trong comment hoặc metadata được app
  xác nhận không hiển thị. Quét title, prompt, option, lời giải, mistake note,
  ví dụ, bản dịch, ghi chú từ và chỉ dẫn quest. Module cung cấp danh sách marker
  Việt; không đặt literal ngôn ngữ vào `content-schema/src`. Extension tùy ý
  chưa được xác nhận ẩn vẫn phải coi là learner-facing.
  **Đúng:** comment ghi cần kiểm chứng; learner tip hướng dẫn vị trí đầu lưỡi.
  **Sai:** tip “Cần giáo viên nghe và chỉnh trực tiếp” hoặc “sẽ được bổ sung”.

- [ ] **A16 — Duyệt, nguồn và kiểm thử trung thực.** Mọi bản ghi mới có
  provenance và `review.status: "ai-draft"`. Chỉ ghi role người thật đã duyệt;
  qua test rồi native review, biên tập Việt, cuối cùng `approved` mới phát hành.
  Không chép giáo trình/đề thi; kiểm quyền dùng nguồn. Bật generic curriculum
  checks cho toàn course, không chỉ pilot; có test tốt/xấu và malformed input.
  Kiểm đáp án qua grader thật, structural validation có extension validators,
  hygiene, curriculum và release gate riêng. Không dùng default comparator để
  tuyên bố đã kiểm được một mode chuyên biệt.
  **Đúng:** mọi curriculum/hygiene/validation issue bằng 0, nhưng release vẫn
  chặn bản draft. **Sai:** đổi `approved` sau Vitest hoặc bỏ check khi một unit mới bị lỗi.

### API kiểm nội dung chung

Các option mới của `checkCurriculum(pack, options)` đều opt-in; caller cũ không
đổi hành vi. `normalize`, `compareAnswer`, `nativeLocales` vẫn bắt buộc.

```ts
checkCurriculum(pack, {
  normalize, compareAnswer, nativeLocales: ['vi'], scopeStageIds,
  testNovelty: true,
  taughtVocabulary: true,
  forbiddenPhrases: vietnameseMetaMarkers,
  optionParity: true,
  optionVocabIds: (question, index) => readOptionVocabulary(question, index),
});
```

`testNovelty` kiểm Daily và unit Test với practice cùng unit qua liên kết Day;
`answerKey(question)` tùy chọn tạo key theo answer mode cho từng accepted answer
(typed nhận một answer mỗi lần; choice nhận từng bản dịch của key). Mặc định giữ
so sánh normalized hiện tại; English dùng cùng canonicaliser với grader cho phone
(`oh`/`zero`, double/triple) và spelling (chuỗi chữ cái sau mở rộng double).
`taughtVocabulary` dùng lịch quest/lesson/test, không thứ tự mảng. Schema v1 chỉ
có option dạng text/localized text: `optionVocabIds(question, index)` là adapter
để module đọc metadata từ extension hoặc nhận diện token. Adapter trả `string[]`
cho **mọi** option, bao gồm correctIndex; lỗi callback trở thành issue, không throw.
`forbiddenPhrases` so substring không phân biệt case, chuẩn hóa Unicode và khoảng
trắng, bỏ qua provenance/review. `optionParity` là heuristic theo từng locale.
English dùng `generalCurriculumOptions(pack)` để tự lấy tất cả stage của `general`;
không thêm unit mới vào danh sách test bằng tay.

## B. Quy tắc riêng cho English

- [ ] **B1 — Biến thể và API chấm.** Dạy Anh-Anh và IPA Anh-Anh, nhận chính tả
  Mỹ chuẩn trong manifest. Tạo accepted forms bằng `acceptedForms(...)` cho dạng
  đầy đủ/viết tắt và biến thể chính tả. Default `compareAnswer` không phân biệt
  case, nhận dấu cuối `. ! ?` và comma tùy chọn ở cả hai phía; vẫn giữ thứ tự,
  từ và apostrophe. `normalize` giữ dấu câu và phải idempotent. UI dùng
  `gradeAnswer(input, question)`; choice input là numeric index.
  **Đúng:** nhận `Nice to meet you Bao`, `Nice to meet you, Bao!` và dạng đầy đủ/
  viết tắt tương ứng. **Sai:** nhận `dont` thay `don't`, hoặc chỉ thêm một dấu chấm vào key.

- [ ] **B2 — Mode lưu trong từng question.** Dùng `extensions['en:answer-mode']`,
  được schema/validator module kiểm tra; không suy mode từ id hoặc prompt.
  Không có extension thì default. Chọn đúng mode theo bảng dưới và có regression
  positive/negative, không làm yếu normalize toàn cục.
  **Đúng:** câu cần viết hoa chọn `case-sensitive`; câu giao tiếp dùng default.
  **Sai:** chấm sai một câu chào chỉ vì người học không viết hoa đầu câu.

  | Mode | Chính sách | Đúng | Sai |
  |---|---|---|---|
  | `spelling` | Từng chữ Latin, kể cả một chữ; không phân biệt case. Space, comma, dot, hyphen, en/em dash là separator; `double <letter>` lặp hai lần. Không nhận slash hay cả từ. | `J-A-double Z` = `J-A-Z-Z`; `L–E` = `L-E` | nhận `Nguyen` thay dãy chữ tách riêng |
  | `sequence` | Space/comma/hyphen/slash tương đương; giữ thứ tự token. Chỉ khi key là các chữ số đơn mới nhận gõ liền/chia nhóm. | `4,3,2,1,0` = `43210` | coi `17 5 19` bằng `17519` |
  | `phone` | Nhập cách đọc bằng từ; `oh` = `zero`; double/triple lặp đúng một tên chữ số. Nhận separator space/comma/dot/hyphen/en/em dash/slash/ngoặc. Lưu một cách đọc chuẩn, không liệt kê mọi biến thể. Dãy chữ số nội bộ giữ 0 đầu; muốn gõ digits dùng `sequence`. | `oh triple seven double zero` cùng cách đọc `zero seven seven seven oh oh` | chép `077700` từ đề, `double 77`, `double triple seven`, hoặc mất số 0 đầu |
  | `case-sensitive` | Giữ case để đo mục tiêu viết hoa; vẫn nhận dấu cuối tùy chọn. | `I am Mai!` | nhận `i am mai` khi đang kiểm viết hoa |

- [ ] **B3 — Tên chữ có cách gợi đọc dễ tiếp cận.** Dạy bảng tên chữ bằng
  respelling thường và/hoặc browser TTS; IPA chỉ bổ trợ. Chỉ rõ đây là tên chữ
  tiếng Anh, không phải đọc chuỗi theo chính tả Việt. Anh-Anh dùng zed; ghi zee
  là biến thể Mỹ nếu dùng. Phân biệt E/I, G/J và cách đọc W; task phải chuyển từ
  tên chữ sang chữ hoặc nghe tên chữ, không chỉ đổi hoa/thường.
  **Đúng:** `ee, eye` → `E-I`, có bảng dạy trước `E (ee), I (eye)`.
  **Sai:** chỉ nêu `/iː/` rồi bắt người chưa học IPA tìm chữ E.

- [ ] **B4 — Tên, biểu mẫu và lịch sự.** Phân biệt `First name` (tên gọi) và
  `Surname` (họ); giải thích khi biểu mẫu cụ thể cần bỏ dấu, không coi đó là luật
  chung. Dùng tên gọi cho nhân vật được gọi bằng tên; Lê là họ trong ví dụ họ
  tên Việt. Dùng tên dài/đa dạng để chuyển kỹ năng; không dựa vào vài mẫu ngắn.
  **Đúng:** First name: Nam, Surname: Le; câu chào `Hi, Mai!`.
  **Sai:** `Name: Nam` làm nhãn phân biệt tên/họ, hoặc giới thiệu “I am Le” như tên gọi.

## C. Quy tắc riêng cho Chinese

Phần này là contract authoring cần đạt, không tuyên bố code Chinese hiện đã tự
thực hiện mọi chuyển đổi. Hiện `languages/zh/src/text-tools.ts` dùng NFKC,
lowercase và bỏ whitespace; **không** đổi tone marks ↔ tone numbers, ü ↔ v/u:,
sandhi, phồn thể hoặc dấu `。`. Manifest `hsk.ts` là nguồn dạng chuẩn. Trong phạm
vi module Chinese, phải khai báo accepted variants hoặc thêm helper/mode `zh:*`
có schema, validator và regression trước khi soạn hàng loạt; không dùng `en:*`.

- [ ] **C1 — Pinyin nhận dấu thanh và số thanh.** Bất kỳ bài nhập pinyin nào
  cũng nhận hai cách nhập chuẩn tương ứng: tone marks và tone numbers. Chỉ nhận
  toneless khi mục tiêu không đo thanh và đã nói rõ trong prompt; bài thanh bắt
  buộc giữ phân biệt thanh, không strip dấu toàn cục. Soát số âm tiết/số chữ,
  bảng âm tiết, vị trí dấu, Unihan kMandarin và ngoại lệ đa âm có nguồn.
  **Đúng:** bài thanh nhận `nǐ hǎo` và `ni3 hao3`, từ chối `ni hao`.
  **Sai:** dùng `ni hao` làm đáp án dự phòng cho mọi câu để che lỗi chấm thanh.

- [ ] **C2 — ü và cách nhập bàn phím.** Nhận `ü`, `v`, `u:` cho cùng âm tiết ở
  vị trí cần ü; đặt số thanh sau cả âm tiết. Không gộp ü với u trong cặp phân biệt
  như lǜ/lù. Sau j/q/x/y viết u theo quy tắc pinyin; helper phải dùng bảng âm tiết
  và xác thực các biến thể, không thay mọi u thành ü.
  **Đúng:** `lǜ`, `lü4`, `lv4`, `lu:4` cùng key; `lu4` không cùng key.
  **Sai:** chấp nhận `lu4` cho 绿 bằng cách bỏ dấu hai chấm/hai chấm trên ü.

- [ ] **C3 — Khoảng cách âm tiết và dấu phân âm.** Dạng dấu thanh trong
  manifest nối âm tiết trong từ, cách giữa từ trong cụm (`xièxie`, `nǐ hǎo`).
  Dạng số thanh của manifest cách từng âm tiết (`xie4 xie5`). Khi chấm, nhận
  khoảng trắng thay đổi và dạng số nối liền nếu phân âm duy nhất; không để việc
  bỏ space làm nhập nhằng ranh giới. Apostrophe phân âm cần thiết vẫn có nghĩa;
  có thể nhận curly apostrophe sau chuẩn hóa.
  **Đúng:** `nǐhǎo`, `nǐ hǎo`, `ni3hao3`, `ni3 hao3` được nhận cùng mục tiêu.
  **Sai:** xóa apostrophe rồi coi `xī'ān` và `xiān` là cùng âm tiết/từ.

- [ ] **C4 — Thanh gốc khi viết, biến điệu khi được hỏi cách đọc.** Theo §7,
  lời dạy/manifest ghi citation tones: `nǐ hǎo`, `bù shì`, `yī`. Câu yêu cầu
  “pinyin dạng từ điển” nhận citation forms (cả marks/numbers), không nhận sandhi
  như đáp án thay thế. Câu chuyên luyện cách đọc biến điệu phải nói rõ “ghi thanh
  khi đọc”, nhận sandhi đã dạy (`ní hǎo`, `bú shì` cùng dạng số) và không nhận
  thanh gốc thay cho mục tiêu đó. Không thêm cả hai bất kể nhiệm vụ.
  **Đúng:** câu hỏi cách đọc 不是 nhận `bú shì` / `bu2 shi4`; lời dạy vẫn ghi `bù shì`.
  **Sai:** đổi toàn bộ manifest thành `bú shì` hoặc chấm sai `bù shì` ở bài dạng từ điển.

- [ ] **C5 — Thanh nhẹ là một giá trị riêng.** Manifest dùng âm tiết không
  dấu cho lexical neutral tone và số 5 trong `pinyinNumbered`; schema toneNumber
  của Chinese chỉ nhận số nguyên 0–4: 0 là neutral, 1–4 là bốn thanh;
  không nhận 5 hoặc -1 trong trường schema này. Khi nhập nhận số 5 và 0 tương đương,
  cùng dạng không dấu trên **âm tiết nhẹ**; không coi cả cụm bỏ hết thanh là
  neutral. Giữ thanh gốc khi từ đứng riêng, phân biệt từ có thanh nhẹ theo ngữ cảnh.
  **Đúng:** 谢谢 → `xièxie`, `xie4 xie5`, `xie4 xie0`; không nhận `xie xie` ở bài thanh.
  **Sai:** gán mọi 不 thành `bu5` vì 对不起 có `duìbuqǐ`.

- [ ] **C6 — Nói rõ nhập hanzi hay pinyin.** Prompt nêu hệ chữ và mục tiêu.
  Bài đo nhận diện/viết chữ yêu cầu hanzi; bài pinyin yêu cầu pinyin. Bài từ nghĩa
  cho phép cả hai phải khai báo cả hai key có chủ đích, không suy đổi hệ chữ tự
  động. Gõ chữ bằng IME không đo nét viết hoặc thứ tự nét.
  **Đúng:** “Gõ chữ Hán nghĩa ‘tôi’” nhận `我`; bài pinyin của 我 nhận `wǒ` / `wo3`.
  **Sai:** nhận `wo3` khi mục tiêu là nhớ mặt chữ 我.

- [ ] **C7 — Chỉ dùng giản thể, phồn thể bị từ chối có phản hồi.** Nội dung và
  accepted hanzi dùng giản thể. Không tự chuyển phồn thể thành đáp án đúng; khi
  sai, lời giải hiển thị chữ giản thể cần dùng và ghi rõ quy ước khóa. Với chữ
  giản/phồn trùng nhau không tạo khác biệt giả. Có regression cho cặp khác nhau.
  **Đúng:** bài 学 nhận `学`, từ chối `學`; lời giải “Khóa dùng giản thể: 学; 學 là phồn thể.”
  **Sai:** âm thầm chấm `學` đúng bằng bộ chuyển đổi rồi vẫn tuyên bố luyện giản thể.

- [ ] **C8 — Dấu câu full-width.** Bài giao tiếp/hanzi thông thường nhận dấu
  cuối tùy chọn và cặp `。/.`, `！/!`, `？/?`, comma `，/,` khi không đo dấu câu.
  Khai báo variants hoặc dùng mode riêng; NFKC gộp một số dấu full-width nhưng
  **không gộp `。` thành `.`**. Bài đo dấu câu phải giữ phân biệt đã nêu; không
  xóa mọi punctuation, nhất là dấu phân âm pinyin.
  **Đúng:** bài lời chào nhận `你好`, `你好。`, `你好！` khi nghĩa là mục tiêu.
  **Sai:** chỉ dựa vào NFKC rồi kết luận `你好。` tự khớp key `你好.`.

- [ ] **C9 — Viết chữ/Bộ thủ là side quests có cách chấm riêng.** Đặt hoạt động
  nét, thứ tự nét, viết tay hoặc nhận diện bộ thủ trong side quest theo lịch.
  Đánh giá bằng canvas/trace/rubric thủ công hoặc grader chuyên dụng ngoài typed
  answers, ghi rõ tiêu chí và trạng thái hoàn thành. Nếu chưa có chức năng chấm,
  dùng tự đối chiếu có hướng dẫn, không tuyên bố đã xác thực kỹ năng viết.
  **Đúng:** side quest viết 木 theo bốn nét với mẫu đối chiếu và rubric thứ tự nét.
  **Sai:** gõ `木` là bằng chứng đã viết đúng bốn nét, hoặc đưa viết chữ vào main typed score.

- [ ] **C10 — Chuyển di Hán-Việt là nguồn lỗi cần kiểm chứng.** Đối chiếu nghĩa,
  phạm vi dùng, trật tự và âm Hán-Việt với tiếng Trung hiện đại. Không đoán pinyin
  hay nghĩa từ âm Hán-Việt; ghi nguồn trong comment, không bịa tần suất lỗi. Khi
  có đối chiếu, giải thích ngắn đúng ngữ cảnh cho người học.
  **Đúng:** 书 là “sách”; âm Hán-Việt “thư” không có nghĩa mọi “lá thư” đều là 书.
  **Sai:** dùng “thư” để dịch 书 thành thư gửi, hoặc suy pinyin từ cách đọc Hán-Việt.

### Chạy kiểm tra và báo cáo

Chạy ở thư mục gốc repository, không cài lại dependencies:

```powershell
npx vitest run --root packages/content-schema --configLoader native --pool threads
npx vitest run --root languages/en --configLoader native --pool threads
node node_modules/typescript/bin/tsc -p packages/content-schema/tsconfig.json
node node_modules/typescript/bin/tsc -p languages/en/tsconfig.json
node tools/literal-check/bin/check-no-language-literals.mjs
npx vitest run --root languages/zh --configLoader native --pool threads
```

Khi soạn Chinese, còn phải chạy typecheck module Chinese và các regression C1–C10
trước khi nhận unit đó. English tests không xác minh pinyin. Báo cáo gồm số test,
issues của validation/curriculum/hygiene, release gate, ngoại lệ lịch còn hiệu lực,
thời lượng ước tính so với đã đo và phần vẫn cần người thật duyệt.
