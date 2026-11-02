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
| Threat model | Language module là code first-party, bundle lúc build. Registry cô lập **bug**, không cô lập code độc hại. Vòng lặp đồng bộ vô hạn là giới hạn đã chấp nhận |

## 3. Trạng thái

| Phase | Nội dung | Trạng thái |
|---|---|---|
| 0 | ADR, docs, scaffold monorepo | Xong |
| 1 | `packages/language-sdk` (types, Zod schemas, registry, contract suite), `languages/_fixture` (code `qaa`), `tools/literal-check` (checker dựa trên TypeScript compiler API) | **Xong** — 6 vòng QA + Review (Claude và Codex review chéo), 582/582 test |
| 2 | Port English (CEFR, IELTS) và Chinese (HSK 3.0) thành `languages/en`, `languages/zh` | Chưa bắt đầu — chờ chủ dự án duyệt Phase 1 |
| 3 | `packages/db`: schema PostgreSQL + seed từ module | Bị chặn: chưa có PostgreSQL local |
| 4 | `packages/core`: quest, XP, SRS, quiz engine không phụ thuộc ngôn ngữ | Chưa bắt đầu |
| 5 | `apps/web` (React/Vite), routing `/learn/:lang/:course`, i18n | Chưa bắt đầu |
| 6 | Plugin đặc thù (pinyin, thanh điệu, luyện viết), admin theo ngôn ngữ, `apps/api` (NestJS) | Chưa bắt đầu |
| 7 | Chứng minh: thêm `languages/ja` (N5 mẫu) với diff chỉ trong `languages/ja/**` | Chưa bắt đầu |

**Chưa commit, chưa push.** Toàn bộ thay đổi nằm trong working tree trên nhánh `main`. Chỉ commit khi chủ dự án đồng ý.

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

## 5. Ghi chú kỹ thuật từ Phase 1

- **Quá trình:** 6 vòng Developer → QA → Review. Codex (`gpt-6.1-sol`) và Claude review chéo code của nhau; mọi fix có test thất bại trước khi sửa.
- **Registry:** lưu snapshot Zod đã freeze; state provider có timeout, fail-closed; đọc state dùng `appliedGen` tăng đơn điệu để không áp dụng kết quả cũ; `discover()` chồng nhau trả `superseded: true`.
- **Literal checker:** dùng TypeScript compiler API (`tools/literal-check/src/ts-adapter.mjs` là nơi duy nhất import `typescript` — nâng TypeScript 7 sau này chỉ sửa file này). Danh sách script ISO 15924 tĩnh. Exit code 0/1/2.
- **Giới hạn đã chấp nhận:** vòng lặp đồng bộ vô hạn trong module không cô lập được (module là code first-party). `getContent`/`getMessages` vẫn chạy với module đã tắt — chính sách bật/tắt áp ở tầng app.
- **Codex trên Windows:** luôn chạy `codex exec ... < /dev/null` (nếu không có thể treo ở "Reading additional input from stdin..."). Sandbox Codex không có mạng (không chạy được `npm install`) và lỗi `spawn EPERM` ở 3 test CLI dùng subprocess — chạy lại ngoài sandbox để xác minh.

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
