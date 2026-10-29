# SoloLanguages

Hệ thống học IELTS theo lộ trình cá nhân, từ Level 0 đến mục tiêu 7.0+, với nhiệm vụ, XP, cây kỹ năng và ôn tập bằng quiz.

## Cấu trúc

```text
SoloLanguages/
├── mockup/                 # Bản HTML tương tác, chạy độc lập
│   ├── index.html
│   ├── onboarding.css
│   ├── onboarding.js
│   ├── review-quiz.css
│   ├── review-quiz.js
│   ├── admin.html          # Không gian quản trị độc lập
│   ├── admin.css
│   └── admin.js
├── docs/
│   └── product-notes.md    # Luồng sử dụng, quy tắc và phạm vi đã chốt
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

1. Nhận thông điệp hệ thống và đồng ý tiếp nhận.
2. Tạo tài khoản email hoặc đăng nhập; Google có luồng demo riêng.
3. Đặt tên người dùng.
4. Làm khảo sát ngắn hoặc chọn trực tiếp trình độ.
5. Vào dashboard, học bài mẫu và quản lý từ vựng.
6. Ôn bằng quiz trắc nghiệm, gõ từ, điền từ, đúng/sai và ghép cặp.

## Phạm vi hiện tại

Đây là mockup để phát triển trải nghiệm và nghiệp vụ, chưa phải ứng dụng production. Đăng nhập email dùng tài khoản cục bộ, Google chưa kết nối OAuth. Khảo sát ngắn chỉ gợi ý điểm xuất phát, không xác nhận CEFR hay band IELTS. Spaced repetition tự động và chương trình bài học đầy đủ chưa triển khai.

## Phát triển ứng dụng sau này

Giữ `mockup/` làm tài liệu đối chiếu. Khi chọn công nghệ, tạo mã ứng dụng riêng tại thư mục gốc, chẳng hạn `src/` cho một ứng dụng đơn hoặc `apps/web/` và `apps/api/` nếu cần tách frontend/backend. Chưa tạo framework hoặc thư mục ứng dụng rỗng trước khi chốt kiến trúc.

Xem [ghi chú sản phẩm](docs/product-notes.md) để tiếp tục phân tích và triển khai.
