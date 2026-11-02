# Architecture Decision Records (ADR)

Thư mục này lưu các quyết định kiến trúc đã chốt của SoloLanguages. Mỗi ADR ghi lại **bối cảnh**, **quyết định**, **hệ quả** và **phương án đã cân nhắc** để người vào sau hiểu vì sao hệ thống được dựng như vậy.

## Danh mục

| Số | Tiêu đề | Trạng thái | Ngày |
| --- | --- | --- | --- |
| [0001](0001-monorepo-language-modules.md) | Monorepo, lõi dùng chung và module ngôn ngữ | Đã chấp nhận | 2026-11-02 |
| [0002](0002-toolchain-tsconfig.md) | Toolchain TypeScript, Vitest, Zod và cấu hình `tsconfig` | Đã chấp nhận | 2026-11-02 |

Tài liệu kiến trúc liên quan: [Cấu trúc repository](../architecture/repository-structure.md) và [Hợp đồng module ngôn ngữ](../architecture/language-module-contract.md).

## Trạng thái

| Trạng thái | Ý nghĩa |
| --- | --- |
| Đề xuất | Đang thảo luận, chưa áp dụng. |
| Đã chấp nhận | Đã chốt và đang là căn cứ cho mã nguồn. |
| Bị thay thế | Đã có ADR mới thay thế; ghi rõ số ADR mới ở đầu file. |
| Bị bỏ | Không còn áp dụng và không có ADR thay thế. |

## Quy ước

- Tên file: `NNNN-tieu-de-ngan-gon.md`, số tăng dần, không dùng lại số.
- Viết bằng tiếng Việt; thuật ngữ kỹ thuật và định danh mã giữ nguyên tiếng Anh.
- Không sửa nội dung quyết định của ADR đã chấp nhận. Khi đổi hướng, tạo ADR mới, đổi trạng thái ADR cũ thành **Bị thay thế** và trỏ sang ADR mới.
- Điều chưa kiểm chứng được ghi nhãn **[Chưa xác minh]** ngay đầu câu.
- Mỗi ADR thêm một dòng vào bảng Danh mục ở trên.

## Mẫu

Sao chép khối dưới đây vào file `NNNN-tieu-de.md` mới.

```markdown
# ADR NNNN: Tiêu đề quyết định

- Trạng thái: Đề xuất | Đã chấp nhận | Bị thay thế bởi ADR MMMM | Bị bỏ
- Ngày: YYYY-MM-DD

## Bối cảnh

Vấn đề cần giải quyết, ràng buộc hiện có, các lực tác động lên quyết định.

## Quyết định

Điều đã chọn, viết ở dạng khẳng định ngắn gọn. Liệt kê giá trị cụ thể nếu có
(phiên bản, tên thư mục, tên lệnh).

## Hệ quả

- Lợi ích nhận được.
- Chi phí hoặc ràng buộc mới.
- Việc cần theo dõi hoặc xem lại, kèm điều kiện kích hoạt.

## Phương án đã cân nhắc

| Phương án | Lý do không chọn |
| --- | --- |
| Phương án A | ... |
| Phương án B | ... |
```
