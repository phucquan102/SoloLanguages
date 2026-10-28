# SoloLanguages — ghi chú sản phẩm

## Mục tiêu

Xây hệ thống học lâu dài từ nền tảng đến IELTS 7.0+, có tiến trình rõ ràng: Học hiểu → Luyện tập → Kiểm tra → Ôn tập → Mastery → Mở kiến thức tiếp theo.

## Trải nghiệm nhập môn

- Màn mở đầu lấy cảm hứng từ khoảnh khắc nhận hệ thống trong truyện/phim trùng sinh: lời dẫn truyền động lực, giao diện tối và hiệu ứng tím phát sáng.
- Người dùng đồng ý tiếp nhận trước khi tạo tài khoản và đặt tên.
- Có hai cách xác định điểm xuất phát: khảo sát 12 câu hoặc tự chọn Level 0 / A1 / A2 / B1 / B2 / C1.
- Tên, chặng học và nhiệm vụ mẫu được điều chỉnh theo lựa chọn.
- Khảo sát hiện chỉ bao phủ một phần ngữ pháp và đọc hiểu, không phải bài đánh giá IELTS chính thức.

## Ôn tập thông minh

### Dạng câu hỏi đã có

- Trắc nghiệm chọn đáp án.
- Gõ từ tiếng Anh theo nghĩa.
- Điền từ còn thiếu trong câu.
- Đúng / sai.
- Ghép từ với nghĩa; cần ít nhất hai từ đang ôn.

Quiz có giải thích đáp án, điểm trò chơi, chuỗi đúng, kết quả và luyện lại câu sai. Điểm trò chơi tách biệt XP học tập và không tự xác nhận mastery.

### Quản lý từ đã chốt

| Trạng thái | Hành vi |
| --- | --- |
| Đang ôn | Có thể xuất hiện làm nội dung câu hỏi trong lượt quiz mới. |
| Tạm bỏ ôn | Không được đưa vào nội dung câu hỏi mới; vẫn giữ trong Sổ từ vựng. |

- Đặt nút **Tạm bỏ ôn** cạnh từ ngay trang Ôn tập và trong Sổ từ vựng.
- Danh sách **Tạm bỏ ôn** nằm ngay trang Ôn tập, có nút **Thêm lại**.
- Người dùng chủ động chuyển trạng thái; tạm bỏ không đồng nghĩa đã thuộc.
- Thêm lại không tạo bản ghi trùng và không cộng XP.
- Trạng thái được lưu theo tài khoản cục bộ và chặng học hiện tại.

## Giới hạn mockup

- Không có backend, đồng bộ nhiều thiết bị, xác minh email hay Google OAuth thật.
- Bài học và kho từ vựng là dữ liệu mẫu.
- Lịch ôn tự động chưa áp dụng.
- Tài khoản, tiến độ và kết quả demo nằm trong trình duyệt, không phải dữ liệu trong repository.

## Các bước BA tiếp theo

Các mục sau là đề xuất cần cùng người dùng làm rõ trước khi triển khai:

1. Kho từ: người dùng tự thêm, import hay lấy từ nội dung bài học.
2. Quy tắc từ vựng khi chuyển chặng: giữ thư viện xuyên trình độ và xử lý trùng từ.
3. Mastery và lịch ôn: tiêu chí gợi ý giảm tần suất; người dùng có được ghi đè gợi ý hay không.
4. Đánh giá đầu vào: bổ sung nghe, viết, nói và độ tin cậy của kết quả.
5. Tài khoản thật, lưu tiến độ trên server và kết nối Google OAuth.
