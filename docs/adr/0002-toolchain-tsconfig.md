# ADR 0002: Toolchain TypeScript, Vitest, Zod và cấu hình `tsconfig`

- Trạng thái: Đã chấp nhận
- Ngày: 2026-11-02

## Bối cảnh

- Monorepo mới ([ADR 0001](0001-monorepo-language-modules.md)) cần một toolchain thống nhất cho SDK, module ngôn ngữ và công cụ.
- Môi trường: Windows, Node v24.20.0, npm 11.19.0. Không có Docker hay PostgreSQL. Chủ dự án yêu cầu không dùng pnpm và tránh cài đặt toàn cục.
- Backend sau này dùng NestJS. Phase 1 chưa có ứng dụng, chỉ có thư viện (SDK), module và công cụ kiểm tra, nên chưa cần bước build.
- Registry của SDK kiểm tra dữ liệu module lúc chạy (dữ liệu có thể đến từ mã người khác viết), nên cần thư viện schema có suy ra kiểu TypeScript.

## Quyết định

### 1. Phiên bản ghim chính xác (không dùng `^`)

| Thành phần | Phiên bản | Khai báo tại |
| --- | --- | --- |
| Node | v24.20.0 (`engines.node` là `>=24`) | `.nvmrc`, `package.json` gốc |
| npm | 11.19.0 | `packageManager` trong `package.json` gốc |
| TypeScript | 6.0.3 | `devDependencies` gốc |
| Vitest | 5.0.5 | `devDependencies` gốc |
| Vite | 8.3.5 | `devDependencies` gốc |
| `@types/node` | 24.19.2 | `devDependencies` gốc |
| Zod | 4.6.7 | `dependencies` của `packages/language-sdk/package.json` |

- Các phiên bản trên lấy từ spec Phase 0/1. Đã kiểm tra bản cài trong `node_modules` ngày 2026-11-02: TypeScript 6.0.3, Vitest 5.0.5, Vite 8.3.5, `@types/node` 24.19.2, Zod 4.6.7, Node v24.20.0.
- Ghim chính xác và commit `package-lock.json` để mọi máy dùng cùng một bộ công cụ. Nâng phiên bản là một thay đổi có chủ đích.
- **TypeScript 6.0.3, không dùng 7.x.** [Chưa xác minh] Khả năng tương thích của 7.x với Nest CLI chưa được kiểm tra. Khi `apps/api` bắt đầu, kiểm tra lại rồi quyết định bằng một ADR mới.
- Không thêm thư viện semver. SDK dùng `packages/language-sdk/src/contract/compat.ts` nhỏ với biểu thức chính quy SemVer 2.0.0 chặt (không số 0 đứng đầu, không định danh rỗng), dùng chung cho `manifest.version` và trường `sdk`. `satisfies()` hỗ trợ dạng chính xác `x.y.z` và dạng caret `^x.y.z` (ngữ nghĩa caret của npm); metadata build bị bỏ qua. Phiên bản pre-release không thỏa dải caret, trừ khi chính dải đó mang pre-release trên cùng `x.y.z`. Schema của module chỉ chấp nhận dạng caret ở trường `sdk`.

### 2. `tsconfig`: `module` và `moduleResolution` là `NodeNext`

`tsconfig.base.json` ở thư mục gốc. Mỗi package có `tsconfig.json` riêng kế thừa file gốc (ví dụ `packages/language-sdk/tsconfig.json` dùng `"extends": "../../tsconfig.base.json"`).

| Tùy chọn | Giá trị | Mục đích |
| --- | --- | --- |
| `module`, `moduleResolution` | `NodeNext` | Giải quyết import theo quy tắc ESM của Node; mã TypeScript và công cụ `.mjs` cùng một quy tắc. |
| `target`, `lib` | `ES2023`, `["ES2023"]` | Không có DOM trong SDK; mã SDK không được dùng API trình duyệt. |
| `types` | `[]` | Không tự nạp mọi `@types/*`; package nào cần kiểu Node phải khai báo riêng. |
| `strict` | `true` | Kiểm tra kiểu nghiêm ngặt. |
| `noUncheckedIndexedAccess` | `true` | Truy cập mảng/record có thể trả `undefined`. |
| `exactOptionalPropertyTypes` | `true` | Thuộc tính tùy chọn không nhận `undefined` tường minh. |
| `verbatimModuleSyntax` | `true` | Phân biệt rõ `import type`; giữ nguyên import/export như đã viết. |
| `isolatedModules` | `true` | Mỗi file phải biên dịch độc lập (cần cho Vitest/Vite). |
| `erasableSyntaxOnly` | `true` | Chỉ dùng cú pháp TypeScript xóa được; cấm `enum`, `namespace` có mã chạy và parameter properties. |
| `allowImportingTsExtensions` | `true` | Cho phép import tương đối có đuôi `.ts`. |
| `noEmit` | `true` | `tsc` chỉ kiểm tra kiểu, không sinh file. |
| `skipLibCheck`, `forceConsistentCasingInFileNames`, `resolveJsonModule` | `true` | Bỏ kiểm tra file `.d.ts` của thư viện; ép nhất quán chữ hoa/thường trong đường dẫn (quan trọng trên Windows); cho phép import JSON. |

### 3. Không có bước build ở Phase 1

- Trường `exports` của SDK trỏ thẳng tới mã TypeScript: `"."` trỏ `./src/index.ts`, `"./testing"` trỏ `./src/testing/index.ts`. SDK chia nội bộ thành `src/contract/`, `src/registry/`, `src/testing/`; import ngoài package vẫn qua public exports.
- Import tương đối giữa các file trong cùng package dùng đuôi `.ts`.
- Vitest chạy TypeScript trực tiếp. Kiểm tra kiểu bằng `npm run typecheck`: script gốc chạy `typecheck` của từng workspace có khai báo script đó (SDK dùng `tsc -p tsconfig.json`; `noEmit` đã bật trong `tsconfig.base.json`).
- Ví dụ import trong mã:

```ts
import { defineLanguage } from '@solo/language-sdk';
import { runLanguageModuleContract } from '@solo/language-sdk/testing';
import { jlpt } from './levels/jlpt.ts';
```

### 4. Vitest cho unit và contract test

- Cấu hình gốc `vitest.config.ts` dùng `test.projects`: `packages/*`, `languages/*` và `tools/*`. Mỗi package có thể có `vitest.config.ts` riêng. Test phản chiếu các thư mục `src/`, đặt tên theo module, không theo đợt sửa lỗi.
- Chạy toàn bộ: `npm test`. Playwright cho E2E là việc của phase sau, chưa cài.
- Contract suite của SDK tách thành `checkLanguageModule` (hàm bất đồng bộ trả `Promise<CheckResult[]>`, không import `vitest`) và wrapper `runLanguageModuleContract` dùng `describe`/`it`. `vitest` là peer dependency tùy chọn của SDK. Chi tiết ở [Hợp đồng module ngôn ngữ](../architecture/language-module-contract.md).

### 5. Zod 4 cho schema

- Schema của module nằm ở `packages/language-sdk/src/contract/schemas.ts`.
- Trường kiểu hàm được kiểm tra bằng `z.custom<Fn>(v => typeof v === 'function')`. Lúc chạy chỉ biết đó là hàm; chữ ký hàm do TypeScript và contract suite kiểm tra.
- Registry lưu bản sao thuần do Zod trả về (`parsed.data`), không lưu đối tượng gốc: khóa lạ bị bỏ, hàm giữ nguyên tham chiếu.
- Đầu ra của schema và kiểu viết tay `LanguageModule` được giữ khớp nhau bằng một phép khẳng định kiểu lúc biên dịch trong `src/contract/schemas.ts` của SDK (`Assert<T extends true>`). Chưa thử cố ý làm lệch hai bên để xem `tsc` báo lỗi.
- Dữ liệu `tutor` và `dictionary` được kiểm tra là JSON thuần bằng `z.json()`.

### 6. npm workspaces, không pnpm, không cài toàn cục

- Workspaces gốc là `apps/*`, `packages/*`, `languages/*`, `tools/*`; `apps/` vẫn là dự kiến. `tools/` chỉ chứa package công cụ, hiện có `tools/literal-check/` (`@solo/literal-check`), không có cấu hình package chung tại `tools/`. Xem [Cấu trúc repository](../architecture/repository-structure.md).
- Một lệnh `npm install` ở thư mục gốc cài mọi package. Công cụ chạy bằng `npx` hoặc script npm, dùng bản cài cục bộ trong `node_modules`.
- Script gốc: `typecheck`, `test`, `check:literals`, `check`. `npm run check` chạy lần lượt `check:literals`, `typecheck`, `test`.
- `check:literals` chạy `node tools/literal-check/bin/check-no-language-literals.mjs`, dùng cấu hình `tools/literal-check/config/language-literals.config.json`. Checker cắm cờ tên mã ngôn ngữ tại key, method, accessor, enum member, import/export specifier, shorthand destructuring và property access (`o.en`); biến hoặc parameter thuần không bị cắm cờ chỉ vì tên đó. Exit code: `0` sạch, `1` có finding, `2` có scan error. Quy tắc đầy đủ ở [ADR 0001](0001-monorepo-language-modules.md).

## Hệ quả

- Máy mới chỉ cần Node 24 và npm; mọi công cụ khác đến từ `npm install`. Hành vi giống nhau giữa các máy là mục tiêu của việc ghim phiên bản, nhưng chưa được kiểm chứng trên máy thứ hai.
- Không có bước build nên vòng lặp sửa–chạy test ngắn, và package dùng chung có thể được import ngay từ mã nguồn.
- Giới hạn của cách này: package có `exports` trỏ tới `.ts` chỉ dùng được bởi công cụ biết chạy TypeScript (Vitest/Vite, `tsc --noEmit`). Khi một công cụ khác tiêu thụ package (ví dụ Nest CLI cho `apps/api`), có thể cần bước build hoặc cấu hình bổ sung. [Chưa xác minh] Chưa thử với Nest CLI.
- `erasableSyntaxOnly` loại bỏ `enum`; dùng union kiểu chuỗi và `as const` thay thế. `exactOptionalPropertyTypes` và `noUncheckedIndexedAccess` làm mã dài hơn một chút nhưng bắt lỗi sớm hơn.
- Import tương đối bắt buộc có đuôi `.ts`; thiếu đuôi sẽ lỗi ở `tsc` hoặc lúc chạy.
- Ghim chính xác nghĩa là bản vá bảo mật và lỗi không tự đến; cần rà soát phiên bản định kỳ. [Chưa xác minh] Chưa có quy trình rà soát chính thức.
- `src/contract/compat.ts` của SDK tự viết chỉ hỗ trợ dạng chính xác và dạng caret; các dạng dải khác (`~`, `>=`, `||`) không nằm trong phạm vi và cần test riêng khi mở rộng.
- Việc cần xem lại: (a) kiểm tra TypeScript 7.x với Nest CLI khi bắt đầu `apps/api`; (b) thêm bước build khi có tiêu thụ ngoài Vitest/`tsc`.

## Phương án đã cân nhắc

| Phương án | Lý do không chọn |
| --- | --- |
| TypeScript 7.x | [Chưa xác minh] Tương thích với Nest CLI và hệ công cụ xung quanh chưa kiểm tra; chọn 6.0.3 để giảm rủi ro cho đến khi có kiểm chứng. |
| Dùng `^` cho phiên bản công cụ | Cho phép nâng phiên bản ngầm khi cài mới; chọn ghim chính xác để kiểm soát thay đổi. |
| `moduleResolution: Bundler` | Cho phép import không đuôi nhưng không khớp cách Node chạy ESM; Phase 1 không có bundler. |
| Có bước build (`tsc` phát file hoặc bundler) ngay từ Phase 1 | Thêm cấu hình và thư mục đầu ra chưa cần; SDK, fixture và công cụ chỉ chạy trong repo. |
| Jest | Chủ dự án chọn Vitest; Vitest dùng chung nền Vite với frontend dự kiến (React + Vite). |
| Thư viện `semver` | Chỉ cần kiểm tra một dạng dải; tự viết `src/contract/compat.ts` nhỏ trong SDK để không thêm phụ thuộc. |
| pnpm hoặc Yarn | Chủ dự án chọn npm workspaces và tránh cài công cụ toàn cục. |
| Thư viện schema khác thay Zod | Chủ dự án chọn Zod 4; chưa so sánh chi tiết với phương án khác. |
