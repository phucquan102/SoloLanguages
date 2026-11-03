# Kế hoạch nội dung: Nền tảng + cấp 1

Trạng thái: **bản đề xuất, chờ chủ dự án duyệt** (2026-11-02). Do Planner (Claude Opus) soạn; số liệu chưa xác minh được gắn [Unverified].

Phạm vi đã chốt: English `general` Foundation + A1, English `ielts` IELTS Foundation, Chinese Nền tảng + HSK1. Chuẩn bài học: đầy đủ.

## 1. Hiện trạng (gap)

| Tiêu chí | en `general` | en `ielts` | zh `hsk` |
|---|---|---|---|
| Số bài | 6 (chỉ Foundation) | 0 | 4 (Nền tảng), 0 ở HSK1 |
| Tiêu đề bài | Không có trường `Lesson.titles` | – | như en |
| Mục tiêu can-do | Không | – | Không |
| Ví dụ | 1/bài, thiếu bản dịch | – | 0–6, một số thiếu dịch |
| Câu luyện | 1/bài, chỉ trắc nghiệm | – | 1/bài, chỉ trắc nghiệm |
| Lỗi thường gặp | chỉ ở `Vocab.mistakes` | – | như en |
| Ôn lặp từ cũ | Không | – | Không |
| Ngày học / Daily Test | Không có bản ghi | – | Không có bản ghi |
| Thanh nhẹ | – | – | `toneNumber` chỉ cho 1–4 |
| Trạng thái duyệt | Không | – | chỉ cờ `verified` tạm |

Chấm điểm: en chưa bỏ dấu câu cuối ("I am a student." ≠ "I am a student"); zh coi dấu thanh và số thanh là khác nhau (`ni3hao3` ≠ `nǐhǎo`).

## 2. Khung chương trình

Id bài: `<code>:lesson:<slug>`. Mỗi bài: mục tiêu, giải thích tiếng Việt, 4–6 ví dụ có dịch, 6–10 câu luyện (≥2 trắc nghiệm, ≥2 tự gõ, mỗi câu có giải thích), ≥1 lỗi thường gặp, ≥2 câu ôn từ cũ (từ bài thứ 4).

### 2a. English `general` — 36 bài, ~210 từ

Lý do ~210 từ [Inference]: ~6 từ mới/bài, đủ từ chức năng cho *to be / have / present simple* và chủ đề sinh tồn; khoảng 30–40% vốn từ A1 (con số 500–700 từ cho cả A1 là ước lượng [Unverified]). Danh sách tự chọn, không lấy từ Oxford/EVP.

**Foundation**

| Unit | Bài (slug · tiêu đề · kỹ năng) | Mục tiêu / ngữ pháp | Từ mẫu |
|---|---|---|---|
| F1 Âm & chào hỏi | `f1-alphabet-a-m` Chữ cái A–M · pron | đọc tên chữ | letter |
| | `f1-alphabet-n-z` Đánh vần tên · listening | đánh vần tên mình | spell, name |
| | `f1-greetings` Chào hỏi · speaking | chào/tạm biệt; *Nice to meet you* | hello, hi, goodbye, please, thank you, sorry, yes, no |
| | `f1-my-name` Tên tôi là · speaking | *My name is / I'm / What's your name?* | my, your, what, I, am |
| | `f1-numbers-0-20` Số 0–20 · listening | nghe/viết số | zero…twenty |
| | `f1-numbers-phone` Số điện thoại · listening | đọc số điện thoại | thirty…hundred, phone, number |
| F2 Lớp học | `f2-objects` Đồ vật · vocab | *a/an* theo **âm** | book, pen, bag, desk, chair, door, window, notebook |
| | `f2-this-that` Đây là gì · grammar | *This/That is a…? What is this?* | this, that, it |
| | `f2-colours` Màu sắc · vocab | tính từ đứng trước danh từ | red, blue, green, black, white |
| | `f2-classroom` Câu lệnh lớp học · listening | câu mệnh lệnh | open, close, read, write, listen, repeat, sit down |
| | `f2-plurals` Số nhiều · grammar | *-s/-es; these/those* | box, boxes |
| | `f2-days` Thứ trong tuần · vocab | *on Monday* | Monday…Sunday, today, tomorrow |

**A1 core**

| Unit | Bài | Từ mẫu |
|---|---|---|
| A1-U1 Bản thân | `be-positive`, `be-neg-questions`, `countries` (*from*), `jobs` (*a/an* + nghề), `age-address`, `read-profile` | Vietnam, Vietnamese, China, Chinese, teacher, doctor, nurse, driver, live, city, years old |
| A1-U2 Gia đình | `family`, `possessives`, `have-has`, `apostrophe-s`, `describe-people`, `write-family` | mother, father, brother, sister, son, daughter, tall, young, happy |
| A1-U3 Một ngày | `routines`, `present-simple`, `third-person-s`, `do-does-q`, `time`, `frequency`, `listen-day` | get up, have breakfast, go to work, study, always, usually, never |
| A1-U4 Ăn & mua | `food`, `countable-some-any`, `like-dont-like`, `id-like`, `how-much`, `there-is-are` | rice, bread, egg, milk, coffee, chicken, fish, apple, noodles, cheap, expensive |

### 2b. English `ielts` — IELTS Foundation, 24 bài, ~120 từ mới

Giả định đầu vào A2 (chờ xác nhận). Từ trùng với `general` dùng lại id.

| Unit | Bài |
|---|---|
| I1 Bản đồ kỳ thi | `i1-test-format` (đối chiếu ielts.org khi duyệt), `i1-instruction-words` (NO MORE THAN TWO WORDS, True/False/Not Given), `i1-band-scale` (tự diễn đạt, không chép descriptor), `i1-part1-hometown`, `i1-spelling-dates`, `i1-study-goal` |
| I2 Listening | `i2-numbers-prices`, `i2-names-addresses`, `i2-corrections`, `i2-directions-map`, `i2-form-completion`, `i2-review` |
| I3 Reading | `i3-skimming`, `i3-scanning`, `i3-paraphrase`, `i3-tfng`, `i3-sentence-completion`, `i3-review` |
| I4 Writing/Speaking | `i4-svo-sentences`, `i4-linkers`, `i4-trend-words`, `i4-opinion`, `i4-paragraph`, `i4-part2-planning` |

### 2c. Chinese Nền tảng — 12 bài chính + 8 bài phụ

| Loại | Bài |
|---|---|
| Chính | `pinyin` (6 nguyên âm), `tone` (thanh 1–4), `initials-bpmf-dtnl` (bật hơi p/t vs b/d; b pinyin ≠ "b" tiếng Việt), `initials-gkh-jqx`, `initials-zcs-zhchshr`, `finals-compound`, `finals-nasal` (-n/-ng), `neutral-tone`, `sandhi-third` (3+3→2+3), `sandhi-bu-yi`, `spelling-rules` (y/w, ü sau j/q/x, iu/ui/un, vị trí dấu), `vocab` (你好, 谢谢, 不客气, 再见, 对不起, 没关系) |
| Phụ (Viết chữ / Bộ thủ) | `strokes-basic`, `strokes-turning`, `stroke-order-rules`, `radicals-1`…`radicals-5` (30 bộ thủ, chọn theo độ phủ chữ HSK1) |

Giữ id `zh:lesson:pinyin`, `zh:lesson:tone`, `zh:lesson:vocab` hiện có và mở rộng.

### 2d. HSK1 lượt đầu — 24 bài, ~150 từ

GF0025-2021 cấp 1 có 500 từ. Lượt đầu chọn ~150 từ (≈6 từ/bài vì mỗi từ phải học pinyin + thanh + chữ), ưu tiên từ có cả trong danh sách GF0025 cấp 1 và đề cương 2025 cấp 1; chỉ phủ unit 1–4 của lộ trình. [Unverified] Từng từ phải đối chiếu danh sách chính thức ở bước 0.

| Unit | Bài (ngữ pháp) | Từ mẫu |
|---|---|---|
| H1 Chào hỏi | `h1-shi` (是/不是), `h1-name` (叫 + 什么), `h1-ma-ne` (吗, 呢, 很 + adj), `h1-nationality` (哪国人), `h1-de` (的), `h1-read-dialogue` | 我 你 他 她 老师 学生 中国 越南 朋友 |
| H2 Số & giờ | `h2-numbers`, `h2-age` (几/多少, 岁), `h2-dates` (年 月 号 星期), `h2-clock` (点 分), `h2-time-order`, `h2-review` | 今天 明天 昨天 现在 上午 下午 |
| H3 Gia đình | `h3-family`, `h3-you-meiyou`, `h3-measure` (个 本 口), `h3-work-zai`, `h3-dou-ye`, `h3-review` | 爸爸 妈妈 哥哥 家 医生 工作 学校 |
| H4 Ăn & mua | `h4-food`, `h4-xiang-yao`, `h4-money` (多少钱), `h4-tai-le`, `h4-ordering` (请, 给, 杯), `h4-review` | 吃 喝 米饭 茶 苹果 钱 块 买 贵 |

**Tổng ước tính [Inference]:** 104 bài (en 36, ielts 24, zh 44), ~830 câu luyện, ~600 câu Daily Test/checkpoint.

## 3. Kế hoạch theo ngày và nhiệm vụ

| Thành phần | Quy tắc |
|---|---|
| Nhiệm vụ chính | 2 bài/ngày theo thứ tự (3 vào các ngày luyện âm của Nền tảng tiếng Trung); mỗi bài Học → Luyện → Hoàn thành |
| Ôn trong bài | Từ bài thứ 4: ≥2 câu dùng từ đã học cách ≥2 ngày |
| Daily Test (10 câu) | 4 câu bài A, 3 câu bài B, 3 câu ôn (từ ngày D-1, D-3, D-7); ≥3 câu tự gõ; không trùng đề với phần luyện; mở sau khi xong nhiệm vụ chính; đạt 85% |
| Ngày checkpoint unit | Thay Daily Test: 20 câu, 80% unit hiện tại + 20% unit trước |
| Nhiệm vụ phụ | en: shadowing / viết ngắn; zh: Viết chữ, Bộ thủ |
| Quiz ôn tập | Tùy chọn, không tính XP |

XP đề xuất (theo khóa): bài chính 10, Daily Test đạt lần đầu trong ngày 20, nhiệm vụ phụ 10, checkpoint 30, làm lại/quiz ôn 0.

## 4. Thay đổi `content-schema` (giữ `schemaVersion: 1`)

| Thay đổi | Loại |
|---|---|
| `Lesson.titles: LocalizedText` | schema |
| Block mới: `objective`, `explanation` {text, pattern?}, `mistake` {wrong, right, note}, `tip` | schema |
| `example.transcription?` (IPA/pinyin/romaji, không phụ thuộc ngôn ngữ) | schema |
| Collection `units[]` {id, stageId, order, titles, canDo[]} + `Lesson.unitId`, `Lesson.order` | schema |
| `Lesson.vocabIds` = từ giới thiệu; thêm `Lesson.reviewVocabIds` | schema |
| Collection `days[]` {id, stageId, unitId, day, mainQuestIds, sideQuestIds, testId} | schema |
| Collection `tests[]` {id, kind: daily/unit, questionIds, passRatio, reviewVocabIds} | schema |
| `ContentRecord.review?` {status: ai-draft → dev-checked → native-reviewed → vi-reviewed → approved; reviewerRoles[]; date} | schema |
| Thanh nhẹ (`toneNumber` 0); dataset `zh:radicals` | extension của zh |
| Helper provenance cho nội dung tự soạn (`source.file` = file nội dung trong module) | trong module |

## 5. Quy trình soạn

**Bước 0 (một developer, làm trước):** thay đổi schema; `checkCurriculum(pack, { compareAnswer, ranges })` trong `@solo/content-schema/testing`; khung file unit; **vocab manifest** cố định cho từng khóa (từ, nghĩa, IPA/pinyin, unit sở hữu) — mỗi id từ chỉ định nghĩa ở một unit; `ielts` dùng lại id của `general`.

**Song song (mỗi unit một file, không chồng file):**

| Luồng | File |
|---|---|
| A | `languages/en/src/content/general/f1.ts`, `f2.ts` |
| B | `languages/en/src/content/general/a1-u1.ts` … `a1-u4.ts` |
| C | `languages/en/src/content/ielts/i1.ts` … `i4.ts` |
| D | `languages/zh/src/content/foundation/n1.ts`, `side.ts` |
| E | `languages/zh/src/content/hsk1/h1.ts` … `h4.ts` |

**Test tự động:** đủ loại block; 4–6 ví dụ có `translations.vi`; 6–10 câu (≥2 trắc nghiệm, ≥2 tự gõ); `correctIndex` hợp lệ, option khác nhau sau `normalize`; mọi đáp án tự gõ được `compareAnswer` của module chấp nhận; đáp án đúng không trùng option sai; mỗi từ mới xuất hiện ≥2 câu và ≥1 ví dụ; mỗi từ được ôn ≥2 lần trong 14 ngày; ≤10% token trong ví dụ là từ chưa học; ngày/test tham chiếu đúng id; Daily Test đúng cấu trúc 4/3/3; zh: số âm tiết = số chữ, âm tiết có trong bảng âm tiết, dấu thanh đúng vị trí, đối chiếu Unihan `kMandarin` (Unicode License v3) với danh sách chữ đa âm được phép; stage chỉ phát hành khi `review.status === 'approved'`.

## 6. Rủi ro khi AI soạn nội dung ngôn ngữ

| Rủi ro | Cách xử lý |
|---|---|
| Sai pinyin, thanh nhẹ (学生, 东西), chữ đa âm | Đối chiếu Unihan + giáo viên tiếng Trung bản ngữ duyệt |
| Ghi biến điệu thanh không nhất quán (bú/bù) | Chốt một quy ước, có test |
| Quy tắc ngữ pháp bị đơn giản hóa sai (a/an theo chữ thay vì âm) | Giáo viên tiếng Anh duyệt phần giải thích |
| Câu tiếng Anh/Trung không tự nhiên | Người bản ngữ duyệt |
| Tiếng Việt dịch máy, lẫn từ Bắc/Nam (cốc/ly), sai văn phong | Biên tập viên tiếng Việt + test bảng thuật ngữ |
| "Lỗi thường gặp" do AI tự nghĩ ra | Ghi là giả thuyết cho đến khi giáo viên xác nhận |
| Chép giáo trình / đề IELTS | Người duyệt xác nhận tính nguyên bản |
| Sai thông tin định dạng kỳ thi IELTS | Đối chiếu ielts.org khi duyệt |

Luồng duyệt: `ai-draft` → test pass → `native-reviewed` → `vi-reviewed` → `approved`.

## 7. Quyết định đã chốt (2026-11-02)

| Câu hỏi | Quyết định |
|---|---|
| Nhịp học | 2 bài chính/ngày (~25–30 phút) + Daily Test 10 câu |
| Biến thể tiếng Anh | Anh-Anh mặc định (colour, centre; IPA Anh-Anh); vẫn chấp nhận chính tả Mỹ khi chấm câu tự gõ |
| Pinyin | Ghi thanh gốc như từ điển (nǐ hǎo, bù shì); bài biến điệu dạy cách đọc |
| Bản ghi mẫu từ mockup | Thay bằng nội dung mới; giữ id trùng (vd `zh:lesson:pinyin`), provenance chuyển sang nội dung tự soạn |
| IELTS Foundation (mặc định của Team Lead, chưa hỏi) | Giả định đầu vào A2; `general` A1 không bắt buộc, chỉ gợi ý qua bài xếp lớp |
| Danh sách HSK1 (mặc định) | Tự chọn ~150 từ theo khung trên; đối chiếu danh sách chính thức khi có nguồn hợp lệ — đến lúc đó đánh dấu `[Unverified]` trong review |
| Người duyệt (mặc định) | Chưa có → mọi bản ghi mới ở `review.status: "ai-draft"`; không phát hành cho đến khi `approved` |
| Bài nghe (mặc định) | Câu hỏi dạng chữ + giọng đọc trình duyệt minh họa; audio chuẩn làm sau |
| XP / ngưỡng đạt (mặc định) | Như mục 3 (10/20/10/30/0; Daily Test 85%) |

## 8. Câu hỏi gốc của Planner

1. Học mấy ngày/tuần, bao nhiêu phút/ngày? (quyết định 2 hay 3 nhiệm vụ chính/ngày)
2. IELTS Foundation giả định đầu vào A2? `general` A1 có bắt buộc học trước không?
3. Mặc định Anh-Anh hay Anh-Mỹ? (IPA hiện có là Anh-Anh)
4. Pinyin ghi thanh gốc hay thanh sau biến điệu? Từ điển tham chiếu cho thanh nhẹ?
5. Nguồn danh sách GF0025 cấp 1 và giấy phép?
6. Ai là người duyệt bản ngữ EN, ZH và biên tập tiếng Việt? Thời gian duyệt?
7. Thay thế hay giữ các bản ghi mẫu từ mockup?
8. Bài nghe: tạm dùng câu hỏi dạng chữ (giọng đọc trình duyệt chỉ minh họa)?
9. Xác nhận XP và ngưỡng đạt 85%?
