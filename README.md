# SoloLanguages

Hệ thống học IELTS theo lộ trình cá nhân, từ Level 0 đến mục tiêu 7.0+, với nhiệm vụ, XP, cây kỹ năng và ôn tập bằng quiz.

## Cấu trúc

```text
SoloLanguages/
├── mockup/                 # Bản HTML tương tác, chạy độc lập; chỉ để đối chiếu giao diện
│   ├── index.html
│   ├── onboarding.css
│   ├── onboarding.js
│   ├── review-quiz.css
│   ├── review-quiz.js
│   ├── admin.html          # Không gian quản trị độc lập
│   ├── admin.css
│   └── admin.js
├── apps/                   # Dự kiến, chưa tồn tại: web/, api/
├── packages/
│   ├── language-sdk/       # Hiện có: src/contract/, src/registry/, src/testing/
│   ├── core/               # Dự kiến
│   ├── db/                 # Dự kiến
│   ├── i18n/               # Dự kiến
│   ├── ui/                 # Dự kiến
│   └── feature-*/          # Dự kiến: capability dùng chung giữa các ngôn ngữ
├── languages/
│   ├── _fixture/           # Hiện có: module qaa để kiểm thử; không discover ở production
│   ├── _template/          # Dự kiến
│   └── en/, zh/, ja/        # Dự kiến: module ngôn ngữ thật
├── tools/
│   ├── literal-check/      # Hiện có: bin/, src/, config/, test/
│   └── create-language/    # Dự kiến
├── docs/
│   ├── product-notes.md    # Luồng sử dụng, quy tắc và phạm vi đã chốt
│   ├── adr/                # Quyết định kiến trúc (ADR)
│   ├── architecture/       # Tài liệu kiến trúc, hợp đồng module ngôn ngữ
│   └── research/           # Tư liệu nghiên cứu
├── package.json            # Monorepo npm workspaces
├── package-lock.json
├── tsconfig.base.json
├── vitest.config.ts
├── .editorconfig
├── .nvmrc
├── .gitattributes
├── .gitignore
└── README.md
```

## Mở mockup

Mở `mockup/index.html` bằng trình duyệt hiện đại. Không cần cài dependency hay build. Giữ các file CSS/JS cạnh file HTML.

Có thể dùng Live Server trong VS Code để mở thư mục `mockup/`. Đường dẫn trang bắt đầu sau khi chuyển thư mục là `mockup/index.html`.

Mở `mockup/admin.html` để dùng giao diện quản trị: tổng quan, hồ sơ học viên, bài học, kho từ, ngân hàng câu hỏi, nhật ký và cấu hình học tập. Các thao tác thêm/sửa, lưu trữ/khôi phục và lọc/xuất CSV dùng dữ liệu admin mẫu riêng trên trình duyệt, chưa đồng bộ sang học viên. Trang admin chưa có xác thực hoặc phân quyền thật.

### Thử hộp thư học viên ↔ admin

Mở `index.html` và `admin.html` bằng cùng một Live Server (cùng trình duyệt và origin). Sau khi vào không gian học viên, bấm **Nhắn quản trị viên**, chọn **Hỏi đáp / Báo lỗi / Góp ý** và gửi tin. Trong admin, mở **Tin nhắn học viên** để xem, phản hồi và đánh dấu đã xử lý. Học viên xem trả lời trong cùng cuộc trò chuyện. Đây là mô phỏng dùng localStorage, chưa có gửi/nhận qua server.

Tiến độ demo được lưu trong localStorage theo tài khoản trên trình duyệt. Chuyển từ đường dẫn file cũ sang thư mục mới hoặc đổi sang localhost có thể tạo vùng dữ liệu trình duyệt khác; dữ liệu này không nằm trong Git.

## Luồng chính

**Các trang học tập đã có mẫu ở cả hai khóa:** Cây kỹ năng, Sổ từ vựng, Ôn tập, Sổ lỗi, Kiểm tra, Tiến độ và Cài đặt. Tiếng Trung có Pinyin và luyện viết ngay trong thẻ từ/lượt ôn; cả hai khóa có nghe phát âm từ/câu và nghe chậm. Cài đặt âm thanh ở trang Cài đặt hoặc thanh âm thanh tại Sổ từ vựng. Âm thanh dùng giọng đọc trình duyệt nếu có, chưa phải bộ audio chuẩn của khóa học.

**Trợ lý chibi:** Vào **Cài đặt → Trợ lý chibi của bạn** để chọn Naruto, Sasuke, Sakura, Luffy, Gojo hoặc Anya, đổi góc đứng, bật/tắt hoạt ảnh và gợi ý tự động. Bấm nhân vật ở góc màn hình để xem mẹo theo trang hoặc mở trợ lý hội thoại. Ảnh được tạo bằng imagegen và lưu tại `mockup/assets/companions/`; prompt và mô tả atlas nằm trong README của thư mục đó.

**Cách học hiện tại:** Tổng quan hiển thị khung nhiệm vụ chính rộng. Người học hoàn thành đầy đủ theo thứ tự lộ trình rồi làm Daily Test; nhiệm vụ phụ và ôn tập là tùy chọn. Đã bỏ chọn nhịp và khái niệm phiên học. Trợ lý Người đồng hành hỗ trợ giải thích và hướng dẫn, không thay đổi số nhiệm vụ.

1. Nhận thông điệp hệ thống và đồng ý tiếp nhận.
2. Tạo tài khoản email hoặc đăng nhập; Google có luồng demo riêng.
3. Đặt tên người dùng.
4. Làm khảo sát ngắn hoặc chọn trực tiếp trình độ.
5. Vào dashboard, học bài mẫu và quản lý từ vựng.
6. Ôn bằng quiz trắc nghiệm, gõ từ, điền từ, đúng/sai và ghép cặp.

## Phạm vi hiện tại

Đây là mockup để phát triển trải nghiệm và nghiệp vụ, chưa phải ứng dụng production. Đăng nhập email dùng tài khoản cục bộ, Google chưa kết nối OAuth. Khảo sát ngắn chỉ gợi ý điểm xuất phát, không xác nhận CEFR hay band IELTS. Spaced repetition tự động và chương trình bài học đầy đủ chưa triển khai.

## Phát triển ứng dụng sau này

Giữ `mockup/` làm tài liệu đối chiếu giao diện; không sửa và không import mã từ đó vào mã mới. Mã ứng dụng nằm trong monorepo npm workspaces ở thư mục gốc, gồm lõi dùng chung và các module ngôn ngữ độc lập.

Đọc theo thứ tự:

1. [ADR 0001: Monorepo, lõi dùng chung và module ngôn ngữ](docs/adr/0001-monorepo-language-modules.md): vì sao tách lõi và module, quy tắc "không literal ngôn ngữ trong lõi".
2. [ADR 0002: Toolchain TypeScript, Vitest, Zod và `tsconfig`](docs/adr/0002-toolchain-tsconfig.md): phiên bản ghim và cấu hình.
3. [Hợp đồng module ngôn ngữ](docs/architecture/language-module-contract.md): giao diện `LanguageModule`, vòng đời registry, mã lỗi, bật/tắt module và ví dụ thêm tiếng Nhật (JLPT).
4. [Cấu trúc repository](docs/architecture/repository-structure.md): workspace, quy ước tên, bố trí test và cách thêm module, tool, shared feature.
5. [Danh mục ADR](docs/adr/README.md): mẫu và quy ước khi thêm quyết định mới.

### Phạm vi hiện có (Phase 1)

SDK module ngôn ngữ, registry, contract suite dùng lại, module mẫu `languages/_fixture` và công cụ `tools/literal-check/bin/check-no-language-literals.mjs`. Chưa có ứng dụng web, API, cơ sở dữ liệu hay module ngôn ngữ thật.

Dự kiến ở các phase sau (chưa tồn tại): `packages/core`, `packages/i18n`, `packages/db`, `packages/ui`, `packages/feature-*`, `apps/web` (React + Vite), `apps/api` (NestJS), PostgreSQL, `languages/en`, `languages/zh`, `languages/ja`, `languages/_template` và `tools/create-language`. Thư mục dự kiến chỉ được tạo khi bắt đầu phase tương ứng.

### Chạy lệnh

Cần Node 24 (xem `.nvmrc`) và npm. Không cần cài công cụ toàn cục; mọi công cụ đến từ `npm install`.

```bash
npm install       # cài toàn bộ workspace
npm test          # chạy Vitest: unit test và contract test
npm run check:literals # kiểm tra literal ngôn ngữ trong lõi và SDK
npm run check     # check:literals, typecheck rồi test
```

`check:literals` dùng TypeScript compiler API; tên mã ngôn ngữ bị cắm cờ tại key, method, accessor, enum member, import/export specifier, shorthand destructuring và property access (`o.en`), ngoài các string và thuật ngữ trong cấu hình. Biến hoặc parameter thuần không bị cắm cờ chỉ vì tên mã ngôn ngữ. Exit code: `0` sạch, `1` có finding, `2` có scan error. Xem [quy tắc literal checker](docs/architecture/repository-structure.md#quy-tắc-literal-checker).

Xem [ghi chú sản phẩm](docs/product-notes.md) để tiếp tục phân tích và triển khai.
