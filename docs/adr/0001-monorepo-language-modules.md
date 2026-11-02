# ADR 0001: Monorepo, lõi dùng chung và module ngôn ngữ

- Trạng thái: Đã chấp nhận
- Ngày: 2026-11-02

## Bối cảnh

- `mockup/` là bản HTML/CSS/JS chạy độc lập, đã có hai khóa (Tiếng Anh · IELTS, Tiếng Trung · HSK) và "Sắp có" cho Nhật, Hàn, Đức. Dữ liệu nằm trong localStorage, không có backend (xem [README](../../README.md) và [ghi chú sản phẩm](../product-notes.md)).
- Trong mockup, nội dung và quy tắc riêng của từng ngôn ngữ (Pinyin, thanh điệu, thang HSK, band IELTS) nằm cùng chỗ với mã giao diện chung. Thêm một ngôn ngữ mới nghĩa là sửa lại phần chung.
- Mục tiêu sản phẩm là học nhiều ngôn ngữ trên cùng một khung: Tổng quan, nhiệm vụ, XP, ôn tập, bảng xếp hạng dùng chung; mỗi khóa chỉ cung cấp nội dung. Cần thêm tiếng Nhật, Hàn, Đức mà không phải viết lại lõi.
- Ba khái niệm dễ bị trộn lẫn nếu không tách từ đầu: ngôn ngữ (Language), khung cấp độ/chứng chỉ (Level framework) và khóa học (Course). Tiếng Anh là ví dụ rõ nhất: một ngôn ngữ nhưng có hai khung (CEFR và IELTS).
- Môi trường phát triển: Windows, Node v24.20.0, npm 11.19.0, không có Docker hay PostgreSQL.

## Quyết định

### 1. Monorepo mới ở thư mục gốc, dùng npm workspaces

Workspaces khai báo trong `package.json` gốc: `apps/*`, `packages/*`, `languages/*`, `tools/*`. Mỗi package nằm ngay một cấp dưới thư mục workspace; `apps/` chưa tồn tại nhưng glob được giữ sẵn.

| Thư mục | Vai trò | Trạng thái |
| --- | --- | --- |
| `packages/language-sdk` | Types, Zod schemas, `defineLanguage()`, `defineLevelFramework()`, registry, bộ contract test dùng lại (`@solo/language-sdk/testing`) | Phase 1 |
| `languages/_fixture` | Module giả (`code: qaa`) để kiểm thử SDK và registry | Phase 1 |
| `tools/literal-check/` | Package `@solo/literal-check`: CLI trong `bin/`, logic trong `src/`, cấu hình trong `config/`, test trong `test/` | Phase 1 |
| `packages/core` | Engine học tập không phụ thuộc ngôn ngữ | Dự kiến |
| `packages/i18n`, `packages/db`, `packages/ui` | Giao diện đa locale; truy cập dữ liệu; thành phần giao diện dùng chung | Dự kiến |
| `packages/feature-*` | Capability dùng chung giữa các ngôn ngữ | Dự kiến |
| `apps/web`, `apps/api` | Frontend và backend | Dự kiến |
| `languages/en`, `languages/zh`, `languages/ja` | Module ngôn ngữ thật | Dự kiến |
| `languages/_template`, `tools/create-language` | Khuôn và công cụ sinh module mới | Dự kiến |

Phase 1 chỉ gồm SDK, registry, contract suite, fixture và literal checker. Các mục "Dự kiến" chưa tồn tại trong repo. Quy ước tên, cấu trúc nội bộ và bố trí test nằm ở [Cấu trúc repository](../architecture/repository-structure.md).

### 2. Lõi và module ngôn ngữ

- Lõi chỉ biết **hợp đồng** `LanguageModule` do SDK định nghĩa. Mọi thứ riêng của một ngôn ngữ nằm trong `languages/<code>/`.
- Registry nạp module qua các nguồn được truyền vào, kiểm tra, đăng ký, rồi bật/tắt theo trạng thái. Chi tiết ở [Hợp đồng module ngôn ngữ](../architecture/language-module-contract.md).
- Thêm ngôn ngữ mới là thêm một thư mục module. Nếu SDK thiếu điểm mở rộng, nâng phiên bản SDK dùng chung cho mọi ngôn ngữ; không viết nhánh theo mã ngôn ngữ trong lõi (ví dụ `if (lang === 'ja')`).

### 3. `mockup/` chỉ là tài liệu đối chiếu giao diện

- Không sửa `mockup/`, không import mã từ `mockup/` vào mã mới.
- Không di trú dữ liệu localStorage của mockup sang ứng dụng mới.
- Quy tắc nghiệp vụ trong mockup được đọc lại và cài đặt lại ở các phase sau. Các giả định sản phẩm chưa kiểm chứng (ví dụ ngưỡng 85% của Daily Test) giữ nguyên nhãn giả định trong [ghi chú sản phẩm](../product-notes.md).

### 4. Công nghệ ứng dụng ở các phase sau

- Backend: NestJS. Frontend: React + Vite + TypeScript. Cơ sở dữ liệu: PostgreSQL. E2E: Playwright.
- Phase 1 chưa cài các thành phần này. Mỗi thành phần sẽ có ADR riêng khi bắt đầu triển khai.
- [Chưa xác minh] Cách NestJS CLI dùng package workspace khi `exports` trỏ thẳng tới file `.ts` (xem [ADR 0002](0002-toolchain-tsconfig.md)).

### 5. Lõi không chứa literal ngôn ngữ

- Công cụ `tools/literal-check/bin/check-no-language-literals.mjs` (chạy bằng `npm run check:literals`, nằm trong `npm run check`) quét `packages/core/src` và `packages/language-sdk/src`. Thư mục chưa tồn tại bị bỏ qua và được in ra.
- Quy tắc nằm trong `tools/literal-check/config/language-literals.config.json`. Công cụ dùng TypeScript compiler API qua `tools/literal-check/src/ts-adapter.mjs`; `tools/literal-check/src/scanner.mjs` áp quy tắc theo `scope`. Các mẫu bị cắm cờ:
  - Tên chứng chỉ và hệ chữ viết (`hsk`, `ielts`, `cefr`, `jlpt`, `topik`, `toefl`, `pinyin`, `hanzi`, `kanji`, `kana`, `hiragana`, `katakana`, `furigana`, `romaji`, `hangul`), không phân biệt hoa/thường, kể cả khi nằm trong định danh (ví dụ `hskLevel`, `HSK_LEVELS`, `isKana`).
  - Mã ngôn ngữ (`en`, `zh`, `ja`, `ko`, `vi`, `fr`, `de`, `es`, `sr`) đặt trong dấu nháy, ở dạng thẻ có `-` hoặc `_` và các thành phần phụ theo cấu hình (ví dụ `'zh-Hans-CN'`, `'en-US-u-ca-gregory'`, `'zh_CN'`), kể cả phần đầu của template literal (`` `zh-${r}` ``).
  - Tên mã ngôn ngữ tại key, property declaration/signature, method declaration/signature, accessor, enum member, import/export specifier (cả tên nguồn và tên đích), shorthand destructuring và property access. Ví dụ: `{ zh: 1 }`, `en() {}`, `get en() {}`, `enum L { en }`, `import { en }`, `export { x as en }`, `const { en } = o`, `o.en`, `messages.zh`. Biến, parameter, label hoặc biểu thức dùng biến thuần như `const de = 1`, `function f(en: string) {}` hay `cond ? en : b` không bị cắm cờ chỉ vì tên mã ngôn ngữ.
  - Ký tự thuộc các script Han, Hiragana, Katakana, Hangul, Bopomofo (theo thuộc tính Unicode `Script`).
  - Chuỗi escape `\uXXXX`, `\u{...}` và `\xXX` trong chuỗi hoặc template được giải mã trước khi so khớp, nên `'en'` cũng bị bắt như `'en'`.
- Ngoại lệ có chủ đích dùng chú thích dòng `// lang-literal-allow: <lý do>`, với lý do không rỗng, đặt cùng dòng hoặc trên một dòng chỉ có chú thích ngay phía trên. Chỉ chú thích dòng thật mới có hiệu lực; dấu hiệu nằm trong chuỗi hoặc chú thích khối không được tính.
- Mã ngôn ngữ trong dấu nháy ở comment hoặc JSDoc không bị cắm cờ; thuật ngữ framework/script và ký tự thuộc các script bị cấm trong comment vẫn bị cắm cờ. Exit code: `0` khi sạch, `1` khi có finding, `2` khi có scan error (kể cả khi đồng thời có finding); lỗi từng file được báo dạng `file: scan error: <message>`.
- SDK cũng không ghi cứng `vi`. Locale bắt buộc do bên gọi truyền vào (ví dụ `requiredLocales` của contract suite).
- Công cụ chỉ phát hiện các mẫu đã khai báo. Nó không chứng minh lõi trung lập về ngôn ngữ; review code vẫn cần.
- Registry của SDK được thiết kế cho module first-party, review được, đóng gói lúc build; giới hạn của mô hình đó nằm ở [Hợp đồng module ngôn ngữ, mục 7](../architecture/language-module-contract.md).

### 6. Language, Level framework, Course là ba thực thể riêng

| Thực thể | Là gì | Ví dụ |
| --- | --- | --- |
| Language | Một ngôn ngữ học được, tương ứng một module trong `languages/` | Tiếng Anh, Tiếng Trung, Tiếng Nhật |
| Level framework | Thang cấp độ gắn với ngôn ngữ; `kind` là `ordinal` (cấp xếp thứ tự, không điểm) hoặc `band` (có `minScore`/`maxScore`) | CEFR, IELTS (Anh); HSK (Trung); JLPT (Nhật) |
| Course | Lộ trình có thể ghi danh; tham chiếu một framework và một dãy cấp tăng dần của framework đó | Một khóa IELTS tham chiếu framework IELTS |

- Tiếng Anh có hai framework: CEFR và IELTS. Một ngôn ngữ có thể có nhiều framework và nhiều course.
- Người học ghi danh vào **course**, không ghi danh trực tiếp vào ngôn ngữ. Ngôn ngữ đang học suy ra theo chuỗi enrollment → course → language.
- [Chưa xác minh] Mã course, mã level và cách chia khóa cụ thể của tiếng Anh/tiếng Trung do phase `languages/en` và `languages/zh` quyết định.

### 7. Ba khái niệm ngôn ngữ của người dùng

Ngôn ngữ giao diện (interface locale), ngôn ngữ đang học (learning language) và ngôn ngữ mẹ đẻ (native language) là ba thứ độc lập. Bản v1: giao diện chỉ có `vi`, ngôn ngữ mẹ đẻ là `vi`, nhưng thiết kế cho phép thêm. Định nghĩa, trường lưu trữ và chuỗi gloss dự phòng nằm ở [Hợp đồng module ngôn ngữ](../architecture/language-module-contract.md).

## Hệ quả

- Thêm ngôn ngữ mới có đường đi chuẩn: một thư mục module, một bộ contract test dùng chung. Lõi không phải đổi nếu điểm mở rộng của SDK đã đủ.
- Mọi module phụ thuộc cùng một SDK. Đổi hợp đồng ảnh hưởng tất cả ngôn ngữ, nên module khai báo dải `sdk` tương thích và registry từ chối module không tương thích.
- Có hai nguồn "sự thật" tạm thời: mockup (giao diện, luồng) và mã mới (kiến trúc). Quy tắc nghiệp vụ trong mockup phải được chuyển thủ công, và có thể lệch nhau cho đến khi có `apps/web`.
- Luật "không literal ngôn ngữ trong lõi" có chi phí: người viết lõi phải truyền mã ngôn ngữ, locale và tên chứng chỉ qua tham số hoặc module. Dương tính giả của công cụ xử lý bằng chú thích `lang-literal-allow` kèm lý do.
- Monorepo cần giữ một phiên bản công cụ chung (xem ADR 0002) và một lockfile.
- Việc cần theo dõi: khi bắt đầu `apps/api`, kiểm tra cách NestJS CLI xử lý package workspace chạy trực tiếp từ `.ts`; có thể cần thêm bước build cho các package dùng chung.

## Phương án đã cân nhắc

| Phương án | Lý do không chọn |
| --- | --- |
| Mở rộng tiếp `mockup/` thành ứng dụng | Dữ liệu nằm trong trình duyệt, không có backend; logic ngôn ngữ trộn với giao diện nên mỗi ngôn ngữ mới lại sửa phần chung. |
| Một ứng dụng đơn, nhánh theo mã ngôn ngữ trong lõi | Mỗi ngôn ngữ mới đều sửa lõi; literal ngôn ngữ lan khắp mã và khó kiểm soát. |
| Mỗi ngôn ngữ một ứng dụng hoặc một repo | Lặp lại engine nhiệm vụ, XP, ôn tập; sửa lỗi phải làm nhiều lần. |
| Polyrepo: lõi một repo, mỗi module một repo | Tăng chi phí phối hợp phiên bản và review khi SDK còn đang thay đổi nhanh. |
| Module chỉ là dữ liệu (JSON), không có mã | Mỗi ngôn ngữ cần logic riêng như `normalize`, `compareAnswer`, `voiceFilter`; không biểu diễn đầy đủ bằng dữ liệu thuần. |
| Plugin nạp động từ cơ sở dữ liệu hoặc nguồn ngoài | Vượt phạm vi Phase 1. Module được coi là mã first-party đóng gói lúc build; cách ly mã từ nguồn ngoài (worker hoặc tiến trình riêng) chưa được thiết kế. Registry nhận nguồn được truyền vào nên có thể mở rộng sau. |
| pnpm hoặc Yarn workspaces | Chủ dự án chọn npm workspaces, không dùng pnpm và tránh cài công cụ toàn cục (xem ADR 0002). |
