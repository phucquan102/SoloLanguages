# Review pilot N1 (tiếng Trung): Claude Opus 5.5, effort medium

Ngày: 2026-11-03. Kết luận: **DUYỆT KÈM SỬA**. Không có blocker. Phải sửa xong mới được dùng N1 làm khuôn mẫu cho các unit tiếng Trung còn lại.

Dòng được trích là trong `languages/zh/src/content/foundation/n1.ts`, trừ khi có ghi file khác.

## Đã kiểm chứng đúng
- Chín đáp án biến điệu: zhánlǎn, méihǎo, shuíjǐng, yúsǎn, yónggǎn (← yǒnggǎn), láoshǔ, xiángfǎ (← xiǎngfǎ), yí bàn, yí cì.
- Đường nét thanh điệu, cao độ thanh nhẹ, quy tắc biến điệu 不/一.
- Vị trí dấu thanh và quy tắc dấu cách âm (').
- Âm đọc và nghĩa của các chữ ví dụ, kể cả chữ đa âm (都 dōu, 为 wèi, 肚 dù), cùng các khẳng định về âm Hán Việt.
- Bộ chấm:
  - Chấp nhận `ni3 hao3`, `nǐhǎo`, `nǐ hǎo`; từ chối `ni hao`.
  - Với 绿: chấp nhận `lü4`, `lv4`, `lu:4`; từ chối `lu4`.
  - Chấp nhận các biến thể 谢谢 có thanh nhẹ.
  - Chữ giản thể kèm dấu câu toàn chiều rộng được chấp nhận; chữ phồn thể bị từ chối.
  - Chế độ biến điệu có ghi rõ trong đề.
- Các kiểm tra chung phủ mọi stage của khóa `hsk`.

## Major
1. **Câu hỏi về quy tắc chính tả chấp nhận cách viết sai.** `pinyin.ts:123-124` coi ü sau j/q/x/y là u, nên chấp nhận `xüé`, `jü3`, `qü4`, `yüan`. Lỗi này ảnh hưởng các câu 361, 509, 867, 1081, 1128, vốn kiểm tra đúng quy tắc đó. Riêng câu 362 còn ghi "có thể gõ qü4", mâu thuẫn với 814 và 837. **Sửa:** thêm chế độ chấm chính tả chặt, hoặc chuyển các câu này sang trắc nghiệm; xóa câu ghi "qü4".
2. **Mô tả nguyên âm trong vần sai hoặc thiếu.** Câu 456 nói e trong ie/üe "đọc nhẹ hơn e đơn", trong khi thực tế gần với "ê" tiếng Việt. Các cặp sau chưa được dạy: ei ≈ "ây", ian ≈ "iên", üan ≈ "uyên", en/eng ≈ "ân/âng" (526-528). **Sửa:** thêm các âm tham chiếu này và một block lỗi thường gặp (đọc tiān thành "tian").
3. **Thiếu âm tham chiếu tiếng Việt hữu ích** [Inference]. Câu 314 bảo không đọc j/q/x như "ch", tức bỏ mất âm gần nhất. Các âm sau chưa có tham chiếu (383-387): j ≈ ch (không bật hơi), q ≈ ch có bật hơi, zh ≈ tr, ch ≈ tr có bật hơi, sh ≈ s uốn lưỡi, và nguyên âm "ư" trong zi/ci/si/zhi/chi/shi/ri. **Sửa:** thêm các tham chiếu này, kèm lưu ý về điểm khác biệt.
4. **Chưa nối nhiệm vụ phụ.** Mọi danh sách `sideQuests` ở 999-1010 đều rỗng, trong khi kế hoạch §2c có 8 bài phụ. Hàm dựng ở 1289-1295 ghi cứng tiêu đề "Viết chữ" và kỹ năng `writing`, nên nhiệm vụ về bộ thủ sẽ bị gắn nhãn sai. **Sửa:** nối ít nhất `strokes-basic`; lấy tiêu đề và kỹ năng từ chính bài phụ.
5. **Nghe hiểu chỉ là một extension.** `zh:listening` (dòng 38) là extension thường. Giao diện nào bỏ qua extension này sẽ hiện "Bấm nghe" mà không có âm thanh. Test (`curriculum.test.ts:377-392`) chỉ kiểm tra bài học, chỉ kiểm tra đề, và chỉ với chữ đơn. Thiết bị học viên có giọng đọc zh-CN hay không: [Unverified]. **Sửa:** đưa lên trường cấp schema, ví dụ `stimulus: { kind: 'audio', text, lang, src? }`, bắt buộc có phương án dự phòng khi không có giọng đọc, và validate cả phần assessments.
6. **Bảng kiểm tra âm đọc không mở rộng được cho HSK1.** Bảng ở `curriculum.test.ts:333-345` chỉ ghi một âm đọc cho mỗi chữ, và do chính model soạn bài viết. Các chữ đa âm của HSK1 (了, 的, 得, 还, 长, 觉, 行) sẽ làm test hỏng hoặc để lọt lỗi. **Sửa:** chuyển sang kiểm tra âm đọc theo từ, lấy từ manifest, và đối chiếu với Unihan kMandarin hoặc CC-CEDICT.

## Minor
- Câu 270: phương án sai `拿 ná` cũng là âm không bật hơi, nên có thể hiểu là có hai đáp án đúng. Thay bằng `怕 pà`.
- Câu 602: "chỉ trong 对不起" khẳng định quá mức, vì 不 cũng đọc thanh nhẹ trong 是不是, 差不多, 了不起. Đổi thành "trong một số từ như".
- Câu 742, 752: `yī qǐ` vi phạm quy tắc viết liền âm tiết trong một từ của manifest (`hsk.ts:10`). Viết là `yīqǐ`.
- Câu 812-814: danh sách quy tắc y/w còn thiếu. Bổ sung in/ing → yin/ying, ian → yan (không phải yian), uan/uang → wan/wang.
- Câu 546: đặt tay lên cổ họng chỉ cảm nhận được độ rung của dây thanh, không cảm nhận được âm -ng đóng lại. Thay mẹo này.
- Câu 90-91: thêm âm tham chiếu: e ≈ "ơ/ưa"; ü ≈ "uy" đọc thành một âm [Inference].
- Có thể đang từ chối nhầm các biến thể có trong từ điển như `guānxì`, `xiǎngfa` [Unverified]. Thêm các biến thể này nếu từ điển xác nhận.
- `xīān` đang được chấp nhận thay cho xī'ān; chế độ bỏ thanh chấp nhận cả dấu đặt sai vị trí (`gùi`). Như vậy là yếu so với yêu cầu ở guide C3.
- Câu 1283: nhiệm vụ Daily Test dùng kỹ năng `vocabulary` kể cả ở những ngày chỉ luyện phát âm. Nên lấy kỹ năng từ các bài của ngày đó.
- Một số đề pinyin thiếu "(hoặc số thanh)": 361, 371, 509, 586, 656, 1110, 1242.
- Câu 983, 986: kiểu dữ liệu lịch học ghi cứng 2 bài/ngày và `kind: 'daily'`. Kế hoạch §3 cho phép ngày luyện âm có 3 bài và có ngày checkpoint. Cần tổng quát hóa trước khi soạn HSK1.
- Khối lượng học 26 phút/ngày là ước lượng, chưa đo thực tế.

## Bắt buộc sửa trước khi dùng làm khuôn mẫu
Major 1, 2, 4, 5, 6; câu 270 (phương án sai); chính tả `yīqǐ`. Major 3: rất nên sửa.
