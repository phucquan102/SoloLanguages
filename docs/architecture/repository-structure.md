# Cấu trúc repository

Monorepo dùng npm workspaces với bốn glob trong `package.json` gốc: `apps/*`, `packages/*`, `languages/*`, `tools/*`. Mỗi package nằm ngay một cấp dưới thư mục workspace; không lồng thêm package vào các nhóm con. Tài liệu này phân biệt cấu trúc đã có với các phần **dự kiến**, chưa triển khai.

Bối cảnh nằm ở [ADR 0001](../adr/0001-monorepo-language-modules.md), cấu hình công cụ ở [ADR 0002](../adr/0002-toolchain-tsconfig.md), API và vòng đời module ở [Hợp đồng module ngôn ngữ](language-module-contract.md).

## Cây thư mục workspace

```text
SoloLanguages/
├── apps/                              # Dự kiến; giữ glob apps/* dù chưa có thư mục
│   ├── web/                           # Dự kiến: React + Vite
│   └── api/                           # Dự kiến: NestJS
├── packages/
│   ├── language-sdk/                  # Hiện có: @solo/language-sdk
│   │   ├── src/
│   │   │   ├── index.ts               # Public API chính
│   │   │   ├── contract/              # types, schemas, validate, skills, define, version, compat
│   │   │   ├── registry/              # registry, state, discover, errors, timeout, messages
│   │   │   └── testing/               # checks, contract, index (public testing entry)
│   │   └── test/                      # contract/, registry/, testing/, fixtures/, exports.test.ts
│   ├── core/                          # Dự kiến: engine học tập
│   ├── db/                            # Dự kiến: truy cập dữ liệu
│   ├── i18n/                          # Dự kiến: giao diện đa locale
│   ├── ui/                            # Dự kiến: thành phần giao diện dùng chung
│   └── feature-*/                     # Dự kiến: capability dùng chung giữa các ngôn ngữ
├── languages/
│   ├── _fixture/                      # Hiện có: module qaa để kiểm thử, không discover ở production
│   ├── _template/                     # Dự kiến: khuôn module mới
│   ├── en/                            # Dự kiến
│   ├── zh/                            # Dự kiến
│   └── ja/                            # Dự kiến
├── tools/
│   ├── literal-check/                 # Hiện có: @solo/literal-check
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   ├── bin/check-no-language-literals.mjs
│   │   ├── src/                       # scanner.mjs, ts-adapter.mjs, config.mjs
│   │   ├── config/                    # language-literals.config.json, iso15924-script-codes.json
│   │   └── test/                      # scanner, ts-adapter, cli, config; fixtures/
│   └── create-language/               # Dự kiến: sinh module ngôn ngữ
├── mockup/                            # Hiện có: tài liệu đối chiếu giao diện
├── docs/                              # Hiện có: kiến trúc, ADR, sản phẩm và nghiên cứu
├── package.json                       # Workspaces và script chung
├── package-lock.json
├── tsconfig.base.json
└── vitest.config.ts
```

`tools/` là thư mục chứa các package công cụ, không phải một package riêng. Phase 1 mới có SDK, fixture và literal checker; cây trên không xác nhận các ứng dụng, module thật hoặc package dự kiến đã hoàn thành.

## Quy ước tên và discovery

- Package nội bộ dùng scope `@solo/*`: SDK là `@solo/language-sdk`, checker là `@solo/literal-check`; module thật dùng `@solo/lang-<code>`.
- Capability dùng chung giữa nhiều ngôn ngữ đặt tại `packages/feature-<name>/`, package name là `@solo/feature-<name>`. Phần riêng của một ngôn ngữ nằm trong `languages/<code>/src/features/`.
- Thư mục bắt đầu bằng `_` dành cho fixture hoặc template, **không bao giờ được discover ở production**. `discoverFromRecord` trong `packages/language-sdk/src/registry/discover.ts` mặc định loại mọi đường dẫn có một đoạn bắt đầu bằng `_`, với cả dấu `/` và `\`.
- `includeUnderscored: true` chỉ dùng trong test hoặc dev. Bộ lọc nằm ở adapter, nên bên gọi tự dựng nguồn cho registry phải giữ cùng quy tắc. Tiền tố `_` không loại package khỏi npm workspaces hoặc Vitest.
- Mã bên ngoài SDK import từ `@solo/language-sdk` hoặc `@solo/language-sdk/testing`; không phụ thuộc đường dẫn nội bộ `src/contract/` hay `src/registry/`.

## Bố trí test

Thư mục `test/` phản chiếu các thư mục trong `src/`. Tên file theo module được kiểm tra, ví dụ `src/registry/discover.ts` đi với `test/registry/discover.test.ts`, `src/testing/checks.ts` đi với `test/testing/checks.test.ts`. Dữ liệu và loader giả đặt trong `test/fixtures/`; kiểm tra public exports ở `test/exports.test.ts`.

Quy tắc phản chiếu áp dụng cho thư mục chứa **logic**. Thư mục chỉ chứa dữ liệu khai báo của language module (`i18n/`, `content/`, `levels/` thuần dữ liệu) không cần thư mục test riêng: `test/contract.test.ts` đã kiểm tra chúng qua contract suite (ví dụ check 8–10 cho cấp độ, check 17 cho loader `content`/`i18n`). Khi một thư mục dữ liệu bắt đầu chứa logic (hàm chuyển đổi, tính toán), thêm test phản chiếu cho nó.

Không đặt tên theo đợt sửa lỗi như `round3-*.test.ts`, `round4.test.ts` hoặc `hardening.test.ts`. Tên `describe` mô tả hành vi cần bảo đảm. Với CLI đặt ở `bin/`, checker dùng `test/cli.test.ts`; các module trong `src/` có `test/scanner.test.ts`, `test/ts-adapter.test.ts`, `test/config.test.ts`.

## Cấu trúc chuẩn của module ngôn ngữ

Đây là cấu trúc áp dụng khi tạo module thật; fixture hiện tại nhỏ hơn và `languages/_template` chưa có. Các điểm mở rộng tùy chọn chỉ cần file hoặc thư mục khi có triển khai; SDK không bắt buộc module phải có đủ các đường dẫn này.

```text
languages/<code>/
├── package.json               # @solo/lang-<code>, type: module
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts               # Ghép module, export default defineLanguage(...)
│   ├── manifest.ts            # Mã, tên, scripts, version
│   ├── levels/                # Level framework
│   ├── courses/               # Course tham chiếu framework và level
│   ├── text-tools.ts          # normalize, compareAnswer, tokenize
│   ├── speech.ts              # tags, voiceFilter nếu có
│   ├── features/              # Logic tính năng riêng của ngôn ngữ
│   ├── exercises/             # Dạng bài tập riêng
│   ├── content/               # Nội dung tải lazy
│   └── i18n/                  # Messages theo locale, tải lazy
└── test/
    └── contract.test.ts       # runLanguageModuleContract
```

Unit test bổ sung tiếp tục phản chiếu `src/`, ví dụ `test/text-tools.test.ts` hoặc `test/levels/<framework>.test.ts`. `test/contract.test.ts` kiểm tra toàn bộ module qua `@solo/language-sdk/testing`. Xem [ví dụ thêm tiếng Nhật](language-module-contract.md#10-ví-dụ-thêm-tiếng-nhật-jlpt); ví dụ đó ghép một số khai báo ngay trong `src/index.ts` để dễ đọc.

## Thêm một tool

1. Tạo `tools/<name>/` với `package.json` mang tên `@solo/<name>`, `private: true`, `type: module` và các script cần dùng.
2. Đặt CLI entry trong `bin/`, logic trong `src/`, dữ liệu cấu hình trong `config/` nếu cần, test trong `test/`. Kế thừa `../../tsconfig.base.json` và thêm `vitest.config.ts` khi có test.
3. Glob workspace `tools/*` và Vitest project `tools/*` đã bao gồm package mới. Thêm script gốc nếu cần một lệnh kiểm tra chung, tương tự `check:literals`.
4. Chạy `npm install` ở gốc để cập nhật liên kết workspace và lockfile, rồi chạy các kiểm tra phù hợp. Không tạo lại `tools/package.json`.

## Thêm một shared feature

1. Tạo `packages/feature-<name>/` với package name `@solo/feature-<name>`, `src/index.ts`, `test/` phản chiếu `src/` và cấu hình package như các workspace khác.
2. Khai báo public API và dependency tường minh. Capability dùng chung nhận dữ liệu hoặc hook qua hợp đồng; nội dung và quy tắc riêng vẫn do module ngôn ngữ cung cấp.
3. Chỉ thêm điểm mở rộng SDK khi hợp đồng hiện tại chưa đủ; cập nhật dải `sdk` và contract test nếu thay đổi ảnh hưởng module. Cài workspace từ gốc và chạy kiểm tra trước khi tích hợp vào ứng dụng.

Các package `feature-*` hiện vẫn là dự kiến, chưa có engine hay API feature được triển khai.

## Quy tắc literal checker

`npm run check:literals` chạy `node tools/literal-check/bin/check-no-language-literals.mjs`. Cấu hình mặc định nằm ở `tools/literal-check/config/language-literals.config.json`, với danh mục script tại `tools/literal-check/config/iso15924-script-codes.json`. Checker quét `packages/core/src` và `packages/language-sdk/src`; root chưa tồn tại được báo rồi bỏ qua.

- Checker dùng TypeScript compiler API qua `src/ts-adapter.mjs`; `src/scanner.mjs` áp quy tắc theo `scope`. Nó phát hiện thuật ngữ framework hoặc script trong cấu hình, kể cả các từ trong định danh camelCase; ký tự Han, Hiragana, Katakana, Hangul, Bopomofo; và mã ngôn ngữ đặt trong string hoặc phần đầu template literal.
- Danh sách mã hiện tại là `en`, `zh`, `ja`, `ko`, `vi`, `fr`, `de`, `es`, `sr`. String có thể gồm script, region và extension được cấu hình; escape trong string hoặc template được giải mã trước khi so khớp.
- **Tên mã ngôn ngữ** còn bị cắm cờ tại key, property declaration/signature, method declaration/signature, accessor (`get`/`set`), enum member, import/export specifier, shorthand destructuring và property access. Ví dụ: `{ en: value }`, `{ en }`, `en() {}`, `get en() {}`, `enum L { en }`, `import { en }`, `export { x as en }`, `const { en } = o`, `o.en`, `messages.zh`. Với import chỉ kiểm tra tên được import (tên nguồn), không kiểm tra alias cục bộ: `import { es }` và `import { es as x }` bị cắm cờ, `import { x as es }` thì không. Với export kiểm tra tên được export ra ngoài. Finding của property access hiển thị dạng `.en`; key hiển thị dạng `en:`; các vị trí khác hiển thị tên trần.
- Biến hoặc parameter thuần mang tên mã ngôn ngữ không bị quy tắc tên này cắm cờ: `const de = 1`, `let a: number, en: string`, `function f(a, en: string) {}`. Label và biểu thức dùng biến như `cond ? en : b` cũng không bị cắm cờ chỉ vì tên đó. Các quy tắc thuật ngữ và ký tự vẫn áp dụng độc lập.
- Mã ngôn ngữ đặt trong dấu nháy ở comment hoặc JSDoc không bị cắm cờ; thuật ngữ framework/script và ký tự thuộc các script bị cấm trong comment vẫn bị cắm cờ. Ngoại lệ dùng `// lang-literal-allow: <lý do>` với lý do không rỗng, đặt cùng dòng hoặc trên dòng chỉ có comment ngay phía trên; string và block comment không tạo ngoại lệ.
- Exit code: `0` khi quét sạch, `1` khi có finding, `2` khi có scan error (ưu tiên hơn finding). Lỗi quét từng file được báo dưới dạng `file: scan error: <message>`. Lỗi khi liệt kê file của một root (symlink hỏng, root là file) cũng tính là scan error. Root chưa tồn tại được bỏ qua kèm thông báo `skip missing root`, nhưng nếu tổng số file quét được là 0 thì checker trả exit `2`.

Checker chỉ phát hiện các mẫu trong cấu hình; review code vẫn cần để bảo đảm lõi không phụ thuộc ngôn ngữ cụ thể.
