# HANDOFF — SoloLanguages multi-language platform

Tài liệu bàn giao để một agent khác (Claude Code, Codex…) tiếp tục công việc. Cập nhật: 2026-11-02.

## 1. Mục tiêu

Biến SoloLanguages thành nền tảng học đa ngôn ngữ: thêm một ngôn ngữ mới (Japanese/JLPT, Korean/TOPIK, German…) **không sửa core**. Mỗi ngôn ngữ là một Language Module đăng ký qua registry, bật/tắt độc lập.

Đọc trước khi làm:

- [ADR 0001 — monorepo + language modules](adr/0001-monorepo-language-modules.md)
- [ADR 0002 — toolchain + tsconfig](adr/0002-toolchain-tsconfig.md)
- [Language Module contract](architecture/language-module-contract.md) (interface, registry, issue codes, 20 contract checks, ví dụ thêm tiếng Nhật)
- [Nguồn dữ liệu học tập và giấy phép](research/learning-data-sources.md)
- [Ghi chú sản phẩm](product-notes.md)

## 2. Quyết định đã chốt với chủ dự án

| Chủ đề | Quyết định |
|---|---|
| Vị trí code | Monorepo mới ở thư mục gốc. `mockup/` chỉ tham khảo giao diện — **không sửa** |
| Backend | NestJS (chưa làm) |
| Frontend | React + Vite + TypeScript (chưa làm) |
| Database | PostgreSQL (chưa làm; máy hiện **không có** Docker/PostgreSQL) |
| Test | Vitest (unit/contract), Playwright (E2E, chưa làm) |
| Package manager | npm workspaces (không pnpm, không cài global) |
| Interface locale v1 | `vi`; thiết kế sẵn cho nhiều locale |
| Native language v1 | `vi` |
| Dữ liệu localStorage của mockup | Không migrate |
| Giấy phép nội dung tự viết | Độc quyền: `license: "LicenseRef-SoloLanguages-Proprietary"`, `attribution: "© SoloLanguages. All rights reserved."` (chốt 2026-11-02) |
| Chuẩn HSK | GF0025-2021 (không dùng đề cương thi 2025) |
| Database Phase 3 | PostgreSQL qua Docker Desktop + docker compose (chủ dự án tự cài Docker Desktop) |
| Threat model | Language module là code first-party, bundle lúc build. Registry cô lập **bug**, không cô lập code độc hại. Vòng lặp đồng bộ vô hạn là giới hạn đã chấp nhận |

## 3. Trạng thái

| Phase | Nội dung | Trạng thái |
|---|---|---|
| 0 | ADR, docs, scaffold monorepo | Xong |
| 1 | `packages/language-sdk` (types, Zod schemas, registry, contract suite), `languages/_fixture` (code `qaa`), `tools/literal-check` (checker dựa trên TypeScript compiler API) | **Xong** — 6 vòng QA + Review (Claude và Codex review chéo), 582/582 test |
| 2 | `packages/content-schema` (định dạng content pack dùng chung) + `languages/en` (CEFR, IELTS) + `languages/zh` (HSK 3.0, chuẩn GF0025-2021) | Fix round 1 bước A, B xong (1236/1236 test). **Tạm dừng theo yêu cầu chủ dự án** trước bước C (docs), QA và review — xem mục 5a |
| 3 | `packages/db`: schema PostgreSQL + seed từ module | Bị chặn: chờ chủ dự án cài Docker Desktop |
| 4 | `packages/core`: quest, XP, SRS, quiz engine không phụ thuộc ngôn ngữ | Chưa bắt đầu |
| 5 | `apps/web` (React/Vite), routing `/learn/:lang/:course`, i18n | Chưa bắt đầu |
| 6 | Plugin đặc thù (pinyin, thanh điệu, luyện viết), admin theo ngôn ngữ, `apps/api` (NestJS) | Chưa bắt đầu |
| 7 | Chứng minh: thêm `languages/ja` (N5 mẫu) với diff chỉ trong `languages/ja/**` | Chưa bắt đầu |

**Git:** Phase 0–1 đã commit `d73b0ad` trên nhánh `feat/language-sdk` (chủ dự án đồng ý ngày 2026-11-02). **Chưa push.** Các phase sau làm tiếp trên nhánh này; chỉ commit/push khi chủ dự án đồng ý.

## 4. Kiểm tra

```bash
npm install
npm run check          # check:literals + typecheck + test
npm test -w @solo/language-sdk
npm test -w @solo/lang-fixture
npm test -w @solo/literal-check
git diff --stat -- mockup   # phải rỗng
```

Kết quả gần nhất đã xác minh (2026-11-02, sau round 6, ngoài sandbox và trên bản clone sạch với `npm ci`): `npm run check` exit 0, 17 file được quét literal, 19 file test, 582/582 test pass.

Cấu trúc thư mục và quy ước: [repository-structure.md](architecture/repository-structure.md).

Lưu ý: chạy test `tools` trong sandbox của Codex có thể lỗi `spawn EPERM` ở 3 test CLI dùng subprocess; chạy ngoài sandbox thì pass.

## 5b. Nội dung Nền tảng + cấp 1 (đang làm — tiếp tục 2026-11-03)

**2026-11-03 (cập nhật):** bảng từ vựng zh xong (`languages/zh/src/content/manifest/hsk.ts`, 153 từ; cần người bản ngữ duyệt thanh nhẹ của 对不起, 不客气, 多少). Pilot en unit F1 xong (6 bài, 54 câu, 3 ngày, 2102/2102 test toàn repo) nhưng review nội dung tìm ra 3 blocker: câu đánh vần chấp nhận gõ nguyên tên; đáp án có `!`/`?` bị chấm sai; ghi chú nội bộ lộ ra cho học viên. Thêm lỗi major: Daily Test chép lại câu luyện, chưa luyện trọng âm thirteen/thirty, distractor dùng từ chưa học. Codex đang sửa F1 + bộ chấm (`gradeAnswer` với chế độ sequence/spelling/case-sensitive) + viết `docs/curriculum/authoring-guide.md` (bộ quy tắc khuôn mẫu cho mọi unit). Bộ kiểm tra chương trình có thêm tùy chọn `truncateAtScheduleEnd` (chỉ bật khi khóa học còn soạn dở). **Chưa soạn hàng loạt** — chờ F1 đạt chuẩn và chủ dự án duyệt.

**Review lần 2 (Claude Opus 5.5 medium): DUYỆT KÈM SỬA.** Bộ chấm đã sửa đúng (đã probe). Phải sửa trước khi soạn hàng loạt: (B1) bài bảng chữ cái không thực sự kiểm tra tên chữ cái — học viên chỉ chép lại; (M1) đáp án trọng âm lộ qua định dạng, sai thuật ngữ "âm đầu" → "âm tiết đầu"; (M2) thiếu dấu phẩy bị chấm sai; (M3) lịch 2 bài/ngày viết cứng → bảng `schedule` theo unit; (M4) chuyển các kiểm tra riêng của F1 thành kiểm tra chung trong `checkCurriculum` (testNovelty, taughtVocabulary, forbiddenPhrases, optionParity); (M5) chế độ chấm `phone`; (M6) F1 vi phạm chính guide; (M7) guide chưa có quy tắc cho tiếng Trung (chấm pinyin, biến điệu, thanh nhẹ, chữ giản thể, bài viết chữ); (M8) guide phải cho phép bài nghe bằng giọng đọc trình duyệt theo quyết định §7. **Lượt sửa 2 xong (2026-11-03):** Codex báo đã xử lý B1, M1–M8 và các lỗi minor. `npm run check` exit 0, 55 file test, 2230/2230 test. `checkCurriculum` có thêm tùy chọn `testNovelty`, `taughtVocabulary`, `forbiddenPhrases`, `optionParity`, `optionVocabIds` (opt-in) và module en áp dụng cho toàn khóa `general`. Bộ chấm en có thêm chế độ `phone`. Guide tách quy tắc chung / tiếng Anh / tiếng Trung. **Review xác nhận lượt 2 (Sonnet):** B1, M1, M2, M5, M6, M8 và các lỗi minor đã sửa; bốn lỗi được cố ý chèn vào (chép câu luyện vào test, từ chưa học trong phương án, ghi chú nội bộ, lộ đáp án qua định dạng) đều bị bắt; bản gốc 0 lỗi. Còn 2 việc bắt buộc: (1) thanh nhẹ: kế hoạch §4 quy định `toneNumber` = 0 nhưng schema zh chỉ cho 1–4 → sửa schema; (2) test chứng minh `generalCurriculumOptions` phủ mọi stage của khóa `general`. Kèm vài lỗi nhỏ (testNovelty chưa theo chế độ chấm; "phụ âm tiết cuối" → "phụ âm cuối"; id câu hỏi sai nội dung; gợi ý đếm chữ số; helper `daily()` chỉ cho 2 bài/ngày). **Lượt 3 xong (2026-11-03):** `toneNumber` zh nhận 0–4; test chứng minh kiểm tra chung phủ cả 5 stage `general` ngoài Nền tảng; `testNovelty` có `answerKey` theo chế độ chấm; sửa thuật ngữ, id câu hỏi, gợi ý đếm; `daily()` hỗ trợ ngày 3 bài / checkpoint. `npm run check` exit 0, 55 file test, 2270/2270 test. **F1 + guide sẵn sàng làm khuôn mẫu** (lượt 3 chưa qua review riêng — chỉ sửa nhỏ, đã có test). Chủ dự án đồng ý soạn hàng loạt, dùng cả Codex và Claude.

**Soạn hàng loạt (bắt đầu 2026-11-03).** Phân công: luồng A (EN F2), B (EN A1 U1–U4), C (IELTS I1–I4) do Codex soạn, Claude Sonnet review; D0 (dựng cấu trúc zh + pilot unit N1) do Claude Sonnet soạn, Codex review rồi Opus duyệt khuôn mẫu; D, E (phần còn lại Nền tảng + HSK1) bắt đầu sau khi pilot zh đạt chuẩn. Tối đa 1–2 agent Claude chạy cùng lúc. Mỗi luồng chỉ sửa file unit của mình (`languages/en/src/content/general/<unit>.ts`, `ielts/<unit>.ts`, `languages/zh/src/content/...`). **Tiếp tục (2026-11-03):** A (Codex) và D0 (Claude Sonnet) chạy lại, làm tiếp từ file đang dở.

**Tiến độ soạn hàng loạt:**
- **F2 (EN):** soạn xong; review Sonnet: CẦN SỬA (5 major: a/an theo âm chưa được luyện; bài this/that không bắt chọn this hay that; đề tiếng Việt lệch đáp án "Here is an umbrella"; ôn số F1 bị chèn gượng; bộ chấm từ chối "Here's…", "Please listen, please repeat", chế độ case-sensitive bắt cả chữ hoa đầu câu). Lượt sửa F2 chờ A1-U1 xong vì đụng file dùng chung `answer-forms.ts`, `grading.ts`.
- **Test en** đã sửa cho không phụ thuộc unit; kiểm tra ôn từ theo thứ tự thời gian của khóa (stage trước, hoặc ngày trước trong cùng stage).
- **A1-U1 (EN):** Codex đang soạn.
- **Pilot zh N1:** soạn xong (Claude Sonnet): cấu trúc `foundation/`, `hsk1/`, `src/pinyin.ts`, `src/grading.ts` (chế độ `pinyin`, `pinyin-sandhi`, `pinyin-toneless`, `hanzi`, `tone-number`), `zhCurriculumOptions`; 12 bài, 6 ngày; zh 933 test. Danh sách 13 nhóm điểm cần người bản ngữ duyệt nằm trong báo cáo pilot (phát âm so sánh với tiếng Việt, mô tả thanh, quy ước biến điệu 不/一, các đáp án biến điệu, chữ đa âm, khẳng định Hán Việt). Đang: Codex review → Opus duyệt khuôn mẫu.

**Cập nhật cuối (2026-11-03 tối):** Đã commit `7eb49f6` (Phase 2 + curriculum, 2387/2387 test). Lượt sửa F2 và review N1 giao cho Codex đều thất bại ngay từ đầu do Codex hết quota (mở lại lúc 19:13) — không có thay đổi nào. Brief để chạy lại nằm trong repo: `docs/curriculum/reviews/f2-review.md` (kết quả review F2), `f2-fix-brief.md` (prompt sửa F2), `n1-review-brief.md` (prompt review N1). Chạy: `codex exec -s workspace-write -C . - < docs/curriculum/reviews/f2-fix-brief.md` và `codex exec -s read-only -C . - < docs/curriculum/reviews/n1-review-brief.md`.

**DỪNG (2026-11-03, Claude 91% hạn mức):** đã dừng Codex soạn A1-U1 (file `a1-u1.ts` có thể dở dang) và Codex review N1 (chỉ đọc, chưa có kết quả). Chưa chạy `npm run check` sau pilot N1. Làm tiếp theo thứ tự: (1) `npm run check`; (2) chạy lại review N1 (Codex, read-only: độ chính xác pinyin/biến điệu/chữ đa âm, thử `gradeAnswer` với câu trả lời thực tế, khả năng làm khuôn mẫu cho HSK1 và bài phụ) → Opus duyệt; (3) soạn tiếp A1-U1 (làm tiếp từ file dở); (4) sửa F2 theo review (xem gạch đầu dòng F2 ở trên); (5) review A1-U1.

**TẠM DỪNG theo yêu cầu chủ dự án (2026-11-03, chiều):** cả A và D0 bị dừng giữa chừng. Trạng thái để lại: `languages/en/src/content/general/f2.ts` đang soạn dở (~706 dòng, chưa xác minh); `languages/zh/src/content/` đã có thư mục `foundation/`, `hsk1/` và một số file mới (`answer-forms.ts`, `authoring-checks.ts`, `unit-content.ts`, `placement-routing.ts`…) — dở dang, chưa xác minh. Khi làm tiếp: chạy `npm run check` để xem tình trạng; với mỗi luồng, giao lại cho agent kèm ghi chú "tiếp tục từ file đang dở, không làm lại phần đã xong", rồi review như kế hoạch.

**2026-11-03 (đầu ngày):** `npm run check` exit 0 (50 file test, 1470 test). Codex đang: (1) soạn bảng từ vựng zh `manifest/hsk.ts`; (2) **pilot en** — dựng cấu trúc `content/general/`, `content/ielts/` (mỗi unit một file, barrel, helper `authored()`, `review.status: "ai-draft"`) và soạn trọn unit F1 làm mẫu chất lượng. Sau pilot: review chất lượng F1 → soạn các unit còn lại song song (mỗi luồng một file unit).


Kế hoạch đã duyệt: [docs/curriculum/plan-foundation-level1.md](curriculum/plan-foundation-level1.md) (quyết định ở mục 7).

- **Bước 0a xong:** `content-schema` thêm units/days/tests/review, block bài học mới, `checkCurriculum` + `checkReleaseGate` trong `@solo/content-schema/testing` (464 test; en/zh vẫn pass).
- **Bước 0b en xong:** `languages/en/src/content/manifest/general.ts` (228 từ), `ielts.ts` (123 từ mới + 87 id dùng lại), test `languages/en/test/content/manifest.test.ts`. Từ cần người duyệt: IPA Vietnam/Vietnamese/overall/often; `per cent`; các nghĩa có biến thể vùng miền.
- **Bước 0b zh BỊ DỪNG giữa chừng:** `languages/zh/src/content/manifest/hsk.ts` và `languages/zh/test/content/manifest.test.ts` có thể dở dang hoặc chưa tồn tại — kiểm tra, chạy `npm test -w @solo/lang-zh`, làm lại theo mục 2c/2d của kế hoạch nếu cần (pinyin thanh gốc; test số âm tiết = số chữ, bảng âm tiết, vị trí dấu thanh).
- **Tiếp theo:** chạy `npm run check` → soạn bài theo 5 luồng song song (mục 5 kế hoạch) → QA + review → người bản ngữ duyệt (`review.status`).
- Chưa commit Phase 2 và phần nội dung (nhánh `feat/language-sdk`).

## 5a. Phase 2 — fix round 1 (bước A, B xong; còn bước C + QA + review)

Nguồn: Codex QA + Claude Sonnet review bản đầu của Phase 2.

**Bước A — `packages/content-schema` (xong, 259 test):** option trắc nghiệm `string | LocalizedText`; câu hỏi `kind: "choice" | "typed"` (typed dùng `acceptedAnswers`, chấm bằng `textTools.compareAnswer` của module); Stage bắt buộc `courseCode`; context validate gồm `language`, `skills`, `levels`, `courses`; kiểm tra `pack.language` và tiền tố key extension; `validateContentPack(pack, context, { extensions })` với validator cho mọi key extension; extension theo từng record; id duy nhất toàn pack; `@solo/content-schema/testing` có `checkContentHygiene`.

**Bước B — `languages/en`, `languages/zh` (Claude Sonnet, xong — en 214 test, zh 181 test):** migrate sang schema mới; stage IELTS thuộc course `ielts` (không quy đổi IELTS→CEFR); id ổn định `<code>:<kind>:<slug>`; i18n chỉ chứa chuỗi UI với key `skill.<id>`, `course.<code>`, `framework.<code>`, `level.<framework>.<level>`, `feature.<name>.*` (nhãn nội dung nằm trong content); `normalize` idempotent (NFKC lần cuối, bỏ ký tự zero-width) + fuzz test; input không phải string → không throw; test khẳng định manifest/speech/skills/frameworks/courses bằng giá trị cụ thể.

**Kết quả kiểm tra (2026-11-02):** `npm run check` exit 0, 47 file test, 1236/1236 test pass; literal checker quét 23 file.

**Cần chủ dự án xác nhận:** IELTS 7.5+ dùng band 7.5 (cận dưới); tier C1 "IELTS 7.0 Journey" của mockup không có stage bắt đầu nên không liên kết CEFR↔IELTS; quest zh gắn `zh:stage:foundation` (mockup ngầm hiểu level 0); chuỗi UI tiếng Việt trong i18n là bản nháp của Developer.

**Gợi ý cho content-schema (không chặn):** `checkContentHygiene` coi option dạng string là chữ của ngôn ngữ đang học nên không cảnh báo option tiếng Việt thô (module en tự kiểm bằng test riêng); thêm helper tạo extension validator từ Zod schema.

**Bước C (chưa làm):** cập nhật docs (quy ước content: id, key i18n, extension theo record, `Stage.courseCode`, loại câu hỏi). Sau đó QA (clone sạch) + review chéo.

## 5. Ghi chú kỹ thuật từ Phase 1

- **Quá trình:** 6 vòng Developer → QA → Review. Codex (`gpt-6.1-sol`) và Claude review chéo code của nhau; mọi fix có test thất bại trước khi sửa.
- **Registry:** lưu snapshot Zod đã freeze; state provider có timeout, fail-closed; đọc state dùng `appliedGen` tăng đơn điệu để không áp dụng kết quả cũ; `discover()` chồng nhau trả `superseded: true`.
- **Literal checker:** dùng TypeScript compiler API (`tools/literal-check/src/ts-adapter.mjs` là nơi duy nhất import `typescript` — nâng TypeScript 7 sau này chỉ sửa file này). Danh sách script ISO 15924 tĩnh. Exit code 0/1/2.
- **Giới hạn đã chấp nhận:** vòng lặp đồng bộ vô hạn trong module không cô lập được (module là code first-party). `getContent`/`getMessages` vẫn chạy với module đã tắt — chính sách bật/tắt áp ở tầng app.
- **Codex trên Windows:** prompt dài nên ghi vào file rồi chạy `codex exec ... - < prompt.txt` (tránh lỗi bash khi prompt có backtick). Nếu truyền prompt trực tiếp thì luôn thêm `< /dev/null` (nếu không có thể treo ở "Reading additional input from stdin..."). Sandbox Codex không có mạng (không chạy được `npm install`) và lỗi `spawn EPERM` ở 3 test CLI dùng subprocess — chạy lại ngoài sandbox để xác minh.

## 6. Bước tiếp theo sau Phase 1

1. Phase 2: tạo `languages/en` và `languages/zh` từ dữ liệu mockup (chỉ dữ liệu, không port logic). Mỗi cấp độ (HSK, CEFR) định nghĩa đúng một nơi. Pass contract suite.
2. Quyết định môi trường PostgreSQL cho Phase 3 (cài local, Docker, hoặc dịch vụ cloud) — cần chủ dự án chọn.
3. Nội dung học: theo `docs/research/learning-data-sources.md`. Mỗi item nội dung cần metadata `source`, `license`, `attribution`, `version`, `retrieved_at`. Tránh nguồn proprietary (Oxford 3000/5000, English Vocabulary Profile…). Nguồn share-alike (CC-CEDICT, Wiktionary, JMdict) lưu tách khỏi nội dung tự viết.

## 7. Quy tắc làm việc

- Không sửa `mockup/`.
- Không commit, push, merge khi chưa được chủ dự án đồng ý. Không chạy lệnh phá hủy (`reset --hard`, `clean`, `rm -rf`…).
- Core (`packages/core`, `packages/language-sdk/src`, sau này `apps/*`) không chứa literal ngôn ngữ. `npm run check:literals` phải pass.
- Mỗi task nhỏ, kiểm chứng được; không để hai agent sửa cùng file cùng lúc.
- Quy trình: Planner → Developer → QA → Reviewer → sửa lại đến khi đạt acceptance criteria.

## 8. Tiếp tục bằng Codex

```bash
codex "Đọc docs/HANDOFF.md và các tài liệu được liệt kê ở mục 1. Tiếp tục mục 6 (bước tiếp theo), tuân thủ mục 7. Báo cáo lệnh kiểm tra và kết quả."
```
