# Nguồn dữ liệu học tập & giấy phép — SoloLanguages

- Ngày nghiên cứu: 2026-11-02
- Phạm vi: English (CEFR + IELTS), Chinese (HSK 3.0); sau này Japanese (JLPT), Korean (TOPIK), German, French, Spanish. Ngôn ngữ giao diện v1: tiếng Việt.
- Phương pháp: WebSearch + WebFetch. Mỗi khẳng định có URL nguồn. Chỗ nào không kiểm chứng được từ nguồn gốc thì ghi **Unverified**. Chỗ nào là suy luận của người viết thì ghi **[Inference]**.
- **Đây không phải tư vấn pháp lý.** Trước khi phát hành thương mại, cần người có chuyên môn pháp lý đọc lại văn bản license gốc.

Ký hiệu:
- ✅ = đã đọc trực tiếp nguồn gốc (trang chủ dự án / file license / PDF chính thức).
- ⚠️ = chỉ có nguồn thứ cấp (Wikipedia, repo bên thứ ba, đoạn trích kết quả tìm kiếm).
- ❌ = không tìm thấy / không kiểm chứng được → **Unverified**.

---

## 1. Khung trình độ (level framework) chính thức

### 1.1 CEFR (Council of Europe)

| Mục | Nội dung | Trạng thái | Nguồn |
|---|---|---|---|
| Đơn vị phát hành | Council of Europe | ⚠️ | https://www.coe.int/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions |
| Phiên bản mới nhất | *CEFR Companion Volume*, bản tiếng Anh © Council of Europe, April 2020, ISBN 978-92-871-8621-8. Bản 2020 "replaces the 2001 version" của các illustrative descriptors | ⚠️ (theo đoạn trích tìm kiếm; trang coe.int và PDF rm.coe.int trả 403 khi fetch) | https://rm.coe.int/16809ea0d4 |
| Danh sách level | A1, A2, B1, B2, C1, C2; Pre-A1 có trong Companion Volume | ❌ **Unverified** (không mở được PDF để xác nhận Pre-A1) | — |
| Công bố gì | Descriptors dạng "can-do" theo kỹ năng. CEFR **không** công bố word list hay grammar list cho từng ngôn ngữ (danh sách từ do từng tổ chức quốc gia/nhà xuất bản làm — xem Goethe, Cervantes, EVP bên dưới) | [Inference] | — |
| Bản quyền | "the copyright of the CEFR belongs to the Council of Europe. Requests concerning the translation or the reproduction of all or part of the CEFR should be addressed to the Council of Europe." | ⚠️ | https://www.coe.int/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions |

**Hệ quả cho sản phẩm:** chỉ dùng **nhãn level** (A1…C2) và tự viết lại mô tả can-do bằng lời của mình. Không copy nguyên văn descriptor vào app khi chưa xin phép Council of Europe.

### 1.2 IELTS band descriptors

| Mục | Nội dung | Trạng thái | Nguồn |
|---|---|---|---|
| Chủ sở hữu | "IELTS is jointly owned by the British Council; IDP IELTS; and Cambridge University Press & Assessment" (metadata `dc:rights`, file được đánh dấu rights-reserved) | ✅ | https://ielts.org/cdn/ielts-downloadable-assets/ielts-guidance-and-support/ielts-guides/ielts-writing-band-descriptors.pdf |
| Writing (công khai) | PDF "Writing Band Descriptors — Updated May 2023". Gồm Task 1 (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy) và Task 2 (Task Response thay cho Task Achievement) | ✅ | (như trên) |
| Speaking (công khai) | PDF "Speaking Band Descriptors". 4 tiêu chí: Fluency and coherence, Lexical resource, Grammatical range and accuracy, Pronunciation. Metadata: © 2025, ngày tạo file 2025-09-16 | ✅ (ngày sửa đổi nội dung chính thức: ❌ Unverified — chỉ có ngày của file) | https://ielts.org/cdn/ielts-downloadable-assets/ielts-guidance-and-support/ielts-guides/ielts-speaking-band-descriptors.pdf |
| Thông báo cập nhật Writing 2023 | ielts.org news, 03/05/2023 | ⚠️ | https://www.ielts.org/news/2023/ielts-writing-band-descriptors-and-key-assessment-criteria |
| Reading/Listening | Không có band descriptor kiểu này | [Inference] | — |

**Hệ quả:** có thể **tham chiếu** (link) và dùng tên tiêu chí (sự kiện) trong rubric chấm AI. **Không** copy nguyên văn bảng descriptor vào app khi chưa xin phép (tài liệu đánh dấu rights-reserved).

### 1.3 HSK 3.0 — 《国际中文教育中文水平等级标准》 GF0025-2021

| Mục | Nội dung | Trạng thái | Nguồn |
|---|---|---|---|
| Đơn vị phát hành | 教育部 + 国家语言文字工作委员会; thực hiện từ 2021-07-01; do 教育部中外语言合作交流中心 tổ chức biên soạn | ⚠️ (nguồn tin tức/Confucius Institute, chưa mở văn bản trên trang MOE) | https://institut-confucius.univ-larochelle.fr/2021/03/31/publication-du-standard-for-chinese-proficiency-in-international-chinese-language-education-%E3%80%8A%E5%9B%BD%E9%99%85%E4%B8%AD%E6%96%87%E6%95%99%E8%82%B2%E4%B8%AD%E6%96%87%E6%B0%B4%E5%B9%B3/ ; https://www.ithome.com/0/543/419.htm |
| Cấu trúc | "三等九级" (初等 1–3, 中等 4–6, 高等 7–9); "四维基准": 音节、汉字、词汇、语法 | ✅ (đọc từ bản sao văn bản) | https://www.tuttocina.it/HSK/NuovoHSK-lineamenti.pdf |
| Phụ lục | Văn bản có 音节表、汉字表、词汇表、语法等级大纲 (và 手写汉字表) — bộ 《应用解读本》 3 tập giải thích các bảng này | ⚠️ | kết quả tìm kiếm tổng hợp; https://yuyi.com.sg/products/9787561957202 |
| Giấy phép của các bảng từ | Không tìm thấy tuyên bố license | ❌ **Unverified** | — |

**Bảng định lượng theo GF0025-2021** (đọc trực tiếp từ bản sao văn bản tại tuttocina.it — **bản sao của bên thứ ba, chưa đối chiếu với bản gốc trên trang MOE**):

| Level | 音节 (tích lũy / mới) | 汉字 | 词语 | 语法点 | 手写汉字 (theo văn bản) |
|---|---|---|---|---|---|
| 1 | 269 | 300 | 500 | 48 | 100 (初等手写汉字表) |
| 2 | 468 / +199 | 600 / +300 | 1272 / +772 | 129 / +81 | 200 (初等表) |
| 3 | 608 / +140 | 900 / +300 | 2245 / +973 | 210 / +81 | 300 (初等表) |
| **初等 tổng** | **608** | **900** | **2245** | **210** | **300** |
| 4 | 724 / +116 | 1200 / +300 | 3245 / +1000 | 286 / +76 | "中等手写汉字表中的汉字100个" |
| 5 | 822 / +98 | 1500 / +300 | 4316 / +1071 | 357 / +71 | 中等表 250 |
| 6 | 908 / +86 | 1800 / +300 | 5456 / +1140 | 424 / +67 | 中等表 400 |
| **中等 tổng** | **908 (+300)** | **1800 (+900)** | **5456 (+3211)** | **424 (+214)** | **700 (+400)** |
| 7–9 (高等, không chia theo cấp) | 1110 / +202 | 3000 / +1200 | 11092 / +5636 | 572 / +148 | 1200 / +500 |

Nguồn: https://www.tuttocina.it/HSK/NuovoHSK-lineamenti.pdf (trích: "语言量化指标 音节269个，汉字300个，词语500个，语法点48个"; "音节1110个（新增202）、汉字3000个（新增1200）、词语11092个（新增5636）、语法点 572个（新增148）,能够书写汉字1200个（新增500）"; "高等（七-九级）语言量化指标不再按级别细分").

**Kiểm tra ghi chú hiện tại của dự án:**
- HSK1 = 269 音节 / 300 字 / 500 词 / 48 语法 / 100 手写字 → **khớp** với văn bản.
- HSK7–9 = 1110 / 3000 / 11092 / 572 / 1200 → **khớp**.
- Lưu ý: số 手写 ở level 4–6 trong văn bản là số trong "中等手写汉字表" (100/250/400), không phải số tích lũy từ level 1. Tổng 中等 = 700 (+400 so với 初等). [Inference] Số tích lũy level 4/5/6 = 400/550/700.

**⚠️ Rủi ro nội dung quan trọng — Đề thi HSK 3.0 (2025) dùng số từ khác:**
- Wikipedia: syllabus thi HSK 3.0 công bố 2025-11-15 tại 世界中文大会, hiệu lực 2025-11-18; "the syllabus lowered the vocabulary requirements at the beginner and intermediate levels". Số từ tích lũy theo syllabus 2025: L1 300, L2 500, L3 1000, L4 2000, L5 3600, L6 5400, L7–9 11000. Nguồn: https://en.wikipedia.org/wiki/Hanyu_Shuiping_Kaoshi (⚠️ thứ cấp; **chưa đối chiếu với văn bản CTI/chinesetest.cn → Unverified**).
- Thi thử (trial) HSK 3.0 cấp 1–6 ngày 2026-01-31; đăng ký 19/12/2025–07/01/2026 (giấy) và đến 15/01/2026 (máy tính). Nguồn: https://english.beijing.gov.cn/studyinginbeijing/news/202512/t20251222_4355931.html ✅
- Ngày triển khai chính thức toàn cầu: các nguồn mâu thuẫn (Wikipedia: "As of July 2026, the full rollout … yet to be implemented"; trang AUEB ghi 13/12/2026; Glasgow ghi trial 20/09/2026) → **Unverified**. Nguồn: https://confucius.aueb.gr/en/exams/sk-exam ; https://www.gla.ac.uk/explore/confucius/whatson/headline_1284976_en.html
- **Khuyến nghị:** schema nội dung tiếng Trung phải tách **2 trục**: `standard_level` (GF0025-2021, 1–9) và `exam_syllabus_level` (HSK 3.0 exam syllabus 2025). Không gộp làm một.

### 1.4 JLPT

| Mục | Nội dung | Trạng thái | Nguồn |
|---|---|---|---|
| Level | N1–N5 | ✅ | https://www.jlpt.jp/e/faq/index.html |
| Danh sách từ/kanji/ngữ pháp chính thức | **Không công bố từ bản sửa đổi 2010.** FAQ: "'Test Content Specifications' containing a list of vocabulary, kanji and grammar items was not necessarily appropriate." | ✅ | https://www.jlpt.jp/e/faq/index.html |
| Trước 2010 | Kỳ thi 4 cấp cũ có công bố danh sách; các list "N5–N1" hiện nay trên mạng là list không chính thức dựa trên list cũ + quan sát đề | ⚠️ | https://www.edrdg.org/jmdict_edict_list/2013/msg00045.html ; https://kanjikana.com/en/kanji/jlpt |

**Hệ quả:** mọi tag "JLPT N3" trên một từ là **ước lượng của bên thứ ba**. Phải ghi `level_source` (ví dụ "community-estimate") thay vì "official".

### 1.5 TOPIK

| Mục | Nội dung | Trạng thái | Nguồn |
|---|---|---|---|
| Level | TOPIK I (cấp 1–2), TOPIK II (cấp 3–6) | ⚠️ | https://en.wikipedia.org/wiki/Test_of_Proficiency_in_Korean |
| Ngưỡng điểm từng cấp | Có nguồn thứ cấp liệt kê, chưa đối chiếu exam.topik.go.kr | ❌ Unverified | https://seoulstart.com/guides/topik-levels-explained |
| Word list chính thức của TOPIK (국립국제교육원) | **Không tìm thấy** danh sách chính thức | ❌ Unverified | — |
| Thay thế có license rõ | 국립국어원 "한국어 학습용 어휘 목록" (05/2003): 1단계 982 (A), 2단계 2,111 (B), 3단계 2,872 (C), tổng 5,965 từ; Excel/TXT/HWP; **공공누리 제1유형** (ghi nguồn) | ✅ | https://www.korean.go.kr/front_eng/down/down_02V.do?etc_seq=70 |

**공공누리 (KOGL) 제1유형:** ghi nguồn; cho phép thương mại và phi thương mại; cho phép tạo tác phẩm phái sinh. Nguồn: https://www.mcst.go.kr/kor/s_open/kogl/koglType.jsp?pTab=03 (⚠️ đọc qua đoạn trích tìm kiếm). Lưu ý: 3 cấp A/B/C của list này **không** tương ứng 1–1 với TOPIK 1–6 [Inference].

### 1.6 German / French / Spanish (qua CEFR)

| Ngôn ngữ | Tổ chức / tài liệu | Có gì | License | Nguồn |
|---|---|---|---|---|
| German | Goethe-Institut — Wortliste theo kỳ thi (vd. "Goethe-Zertifikat A1: Fit in Deutsch 1") | PDF word list; dẫn chiếu *Profile Deutsch* (Europarat, EDK, ÖSD, Goethe-Institut, Langenscheidt 2005) | "© Goethe-Institut 2024 2. Auflage" — **không có license tái sử dụng** → coi là proprietary | ✅ https://www.goethe.de/pro/relaunch/prf/sw/Goethe-Zertifikat_A1_Fit1_Wortliste.pdf |
| French | France Éducation international — DELF (A1–B2), DALF (C1–C2), hài hòa 6 level CEFR từ 09/2005 | Référentiels "Niveau A1/A2/B1/B2 pour le français" (Beacco et al., Didier) là sách thương mại | Không tìm thấy license mở → coi là proprietary. **Unverified** chi tiết | ⚠️ https://www.france-education-international.fr/en/diplome/delf-tout-public?langue=fr |
| Spanish | Instituto Cervantes — *Plan Curricular del Instituto Cervantes: Niveles de referencia para el español* (2006), A1–C2; gồm inventario gramática, funciones, nociones generales/específicas, referentes culturales… | Có bản tra cứu online trên Centro Virtual Cervantes (URL không fetch được) | **Unverified** — chưa thấy điều khoản tái sử dụng → coi là proprietary | ⚠️ https://marcoele.com/los-niveles-de-referencia-para-la-ensenanza-de-la-lengua-espanola/ ; https://www.edelsa.es/catalogo/documentos/Niveles_de_Referencia_explicacion.pdf |

---

## 2. Bộ dữ liệu mở (open datasets)

Cột "Gloss VI": có sẵn nghĩa tiếng Việt hay không.

### 2.1 Chinese

| Dataset | Nội dung | License (tên chính xác) | Thương mại? | Nghĩa vụ | Gloss VI | Nguồn |
|---|---|---|---|---|---|---|
| **CC-CEDICT** (MDBG) | Từ điển Trung–Anh; 125,346 entry; bản phát hành 2026-10-31 | **CC BY-SA 4.0** ("Creative Commons Attribution-ShareAlike 4.0 International License") | Có (theo CC BY-SA) | Attribution + **ShareAlike** cho dữ liệu phái sinh | Không | ✅ https://www.mdbg.net/chinese/dictionary?page=cc-cedict ; ✅ https://cc-cedict.org/wiki/ |
| **Unihan** (Unicode) | Thuộc tính chữ Hán; có trường **`kVietnamese`** = "The ideograph's pronunciation(s) in Quốc ngữ" (âm Hán Việt); bản mới nhất Unicode 18.0.0 (2026-09-01) | **Unicode License v3** áp dụng cho "Unicode Data Files" dưới `unicode.org/Public/` | Có ("use, copy, modify, merge, publish, distribute, and/or sell") | Kèm copyright + permission notice (trong bản copy hoặc trong tài liệu đi kèm); không dùng tên Unicode để quảng bá | **Có âm Hán Việt** (không phải nghĩa) | ✅ https://www.unicode.org/license.txt ; ✅ https://www.unicode.org/copyright.html ; ✅ https://www.unicode.org/reports/tr38/ — [Inference] Unihan.zip nằm dưới /Public/ nên thuộc "Data Files"; trang copyright không nêu tên Unihan → **cần xác nhận** |
| **Make Me a Hanzi** | >9000 chữ giản/phồn thể; `dictionary.txt` (nguồn Unihan + CJKlib) + `graphics.txt` (nét SVG, median) | `dictionary.txt`: **GNU LGPL v3 or later**; `graphics.txt`: **Arphic Public License** | Có điều kiện (xem ghi chú) | APL: phân phối bản sửa đổi phải "Freely Available … under the terms of this License" (copyleft); LGPL: copyleft cho chính file | Không | ✅ https://github.com/skishore/makemeahanzi/blob/master/COPYING ; ✅ http://ftp.gnu.org/non-gnu/chinese-fonts-truetype/LICENSE |
| **Hanzi Writer** + hanzi-writer-data | Thư viện JS vẽ/animate thứ tự nét + data | Code: **MIT**; data: **Arphic Public License** | Có điều kiện | Như APL ở trên | Không | ✅ https://hanziwriter.org/license.html |
| **SUBTLEX-CH** | Tần suất từ/chữ từ phụ đề phim (Cai & Brysbaert 2010, PLoS ONE) | Không thấy license chính thức. Dự án wordfreq ghi đã được Marc Brysbaert cho phép qua email "for any purpose", với điều kiện ghi công tác giả SUBTLEX | **Unverified** | Ghi công | Không | ⚠️ https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2880003/ ; ⚠️ https://cdn.jsdelivr.net/npm/nodewordfreq@0.2.1/NOTICE.md |
| **CVDICT** (Phong Phan) | Từ điển Trung–Việt dịch từ CC-CEDICT; >122,000 mục; **dịch chủ yếu bằng GPT-4o fine-tune**, sửa tay các dòng bị gắn cờ; tác giả cảnh báo còn lỗi (hallucination, sót tiếng Anh, tên riêng sai) | **CC BY-SA 4.0** | Có (theo CC BY-SA) | Attribution + ShareAlike | **Có** | ✅ https://github.com/ph0ngp/CVDICT |

### 2.2 Japanese

| Dataset | Nội dung | License | Thương mại? | Nghĩa vụ | Gloss VI | Nguồn |
|---|---|---|---|---|---|---|
| **JMdict / EDICT / KANJIDIC2 / RADKFILE…** (EDRDG) | Từ điển Nhật đa ngữ; kanji | **CC BY-SA 4.0** ("Creative Commons Attribution-ShareAlike Licence (V4.0)") | **Có** — "there is NO restriction placed on commercial use" | Ghi công trong tài liệu + kèm file license; **web dictionary: ghi công "on each screen display"**; **mobile app: "not sufficient just to mention it on a start-up/launch page"**; **phải có quy trình cập nhật định kỳ, web server "at least once a month"; "Failure to keep the versions up-to-date is a violation of the licence"**; không được claim copyright; một số trường KANJIDIC (vd. SKIP) có license riêng; bản dịch không phải tiếng Anh thuộc bản quyền người biên soạn | **Không** — JMdict đầy đủ có English, German, French, Russian, Spanish, Hungarian, Slovenian, Dutch | ✅ https://www.edrdg.org/edrdg/licence.html ; ⚠️ https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project |
| **KanjiVG** | SVG nét chữ kanji | **CC BY-SA 3.0** | Có (theo CC BY-SA) | Attribution + ShareAlike; "copyright © 2009-2026 Ulrich Apel" | Không | ✅ https://kanjivg.tagaini.net/ |

### 2.3 Korean

| Dataset | Nội dung | License | Thương mại? | Nghĩa vụ | Gloss VI | Nguồn |
|---|---|---|---|---|---|---|
| **한국어 학습용 어휘 목록** (국립국어원, 2003) | 5,965 từ, 3 cấp A/B/C | **공공누리 제1유형** | Có | Ghi nguồn cụ thể | Không | ✅ https://www.korean.go.kr/front_eng/down/down_02V.do?etc_seq=70 |
| **한국어기초사전 (krdict) Open API** (국립국어원) | Từ điển cơ bản cho người học; bản song ngữ dịch sang 10 ngôn ngữ, **có tiếng Việt** | data.go.kr ghi: "[제3자 권리 포함 : 저작권 표시, 공공저작물 : 출처표시 (제 1유형)]". Một repo bên thứ ba ghi "크리에이티브 커먼즈 저작자표시-동일조건변경허락 2.0 대한민국" (CC BY-SA 2.0 KR) | **Unverified** (2 nguồn ghi khác nhau; có "제3자 권리 포함") | Ghi nguồn; có thể ShareAlike | **Có** (theo tài liệu 2016 của 국립국어원 — ⚠️) | ✅ https://www.data.go.kr/data/15040738/openapi.do ; ⚠️ https://github.com/spellcheck-ko/korean-dict-nikl-krdict ; ⚠️ https://www.korean.go.kr/nkview/nklife/2016_4/26_0401.pdf |
| krdict — file phát âm | — | Repo bên thứ ba ghi (07/2019) được trả lời là "재배포 불가능" | **Không** (theo nguồn 2019 — ⚠️, có thể đã cũ) | — | — | ⚠️ https://github.com/spellcheck-ko/korean-dict-nikl-krdict |

### 2.4 Đa ngôn ngữ (dùng cho mọi ngôn ngữ đích)

| Dataset | Nội dung | License | Thương mại? | Nghĩa vụ | Gloss VI | Nguồn |
|---|---|---|---|---|---|---|
| **Tatoeba — câu** | Câu ví dụ + bản dịch | Mặc định **CC BY 2.0 FR**; một phần câu **CC0 1.0** (file export riêng) | Có | Attribution (CC BY) | Có câu tiếng Việt (số lượng **Unverified**) | ✅ https://tatoeba.org/en/terms_of_use ; ✅ https://tatoeba.org/en/downloads |
| **Tatoeba — audio** | Audio câu | **Theo từng người đóng góp** (CC BY, CC BY-SA, CC BY-NC, hoặc không có license công khai). File `sentences_with_audio` có cột License + Attribution URL. "If the license field is empty … can't be reused outside the Tatoeba project" | **Tùy file** | Lọc theo cột License; loại bỏ NC và trống | — | ✅ https://tatoeba.org/en/downloads ; ⚠️ https://en.wikipedia.org/wiki/Tatoeba |
| **Wiktionary** (mọi phiên bản, gồm vi.wiktionary) | Từ điển cộng đồng | **CC BY-SA 4.0** + GFDL (người dùng lại có thể chọn tuân theo một trong hai) | Có | Ghi công tác giả (link tới trang hoặc danh sách tác giả); nội dung sửa đổi phải CC BY-SA 4.0+; nêu rõ đã sửa đổi | Có (vi.wiktionary; và bản dịch tiếng Việt trong en.wiktionary) | ✅ https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use ; ✅ https://en.wiktionary.org/wiki/Wiktionary:Copyrights |
| **Wikidata Lexemes** | Dữ liệu từ vựng có cấu trúc | **CC0** | Có | Không bắt buộc ghi công | Tùy mục (độ phủ **Unverified**) | ✅ https://www.wikidata.org/wiki/Wikidata:Licensing |
| **Kaikki.org / wiktextract** | JSONL trích xuất từ Wiktionary; có bản en.wiktionary cho tiếng Việt và `vi-extract.jsonl` (273.1MB) từ Wiktionary tiếng Việt (đánh dấu "work in progress") | Code wiktextract: **MIT**. Dữ liệu: trang kaikki **không ghi license** → [Inference] kế thừa license Wiktionary (CC BY-SA 4.0 / GFDL) | Có (theo Wiktionary) | Như Wiktionary; kaikki yêu cầu trích dẫn bài LREC 2022 nếu dùng cho nghiên cứu | **Có** | ✅ https://kaikki.org/ ; ✅ https://kaikki.org/dictionary/rawdata.html ; ✅ https://github.com/tatuylonen/wiktextract |
| **Mozilla Common Voice** | Giọng đọc + câu | **CC0** (theo Wikipedia và trang dataset trên Mozilla Data Collective); điều khoản kèm: không cố xác định danh tính người nói | Có | Không ghi công bắt buộc; cam kết không định danh người nói | — | ⚠️ https://en.wikipedia.org/wiki/Common_Voice ; ⚠️ https://datacollective.mozillafoundation.org/datasets/cmfzu8u8wa555eq8onrk334h4 — trang terms chính thức không đọc được → **Unverified** chi tiết; có tiếng Việt/Nhật/Hàn hay không: **Unverified** |
| **Lingua Libre** | Audio phát âm từ, upload lên Wikimedia Commons | **CC BY-SA 4.0** (mức dự án) — phải kiểm từng file trên Commons | Có | Attribution + ShareAlike | — | ⚠️ https://en.wikipedia.org/wiki/Lingua_Libre |
| **SUBTLEX-US** | Tần suất từ tiếng Anh từ phụ đề | Như SUBTLEX-CH ở trên | **Unverified** | Ghi công | Không | ⚠️ https://cdn.jsdelivr.net/npm/nodewordfreq@0.2.1/NOTICE.md |

### 2.5 English word list có level (proprietary)

| Dataset | Tình trạng | License | Nguồn |
|---|---|---|---|
| **Oxford 3000 / 5000** (OUP) | Oxford 3000: từ cốt lõi A1–B2; Oxford 5000 = 3000 + 2000 từ B2–C1. Bản sao PDF có "© Oxford University Press" | **Không tìm thấy license tái sử dụng**; trang chính thức trả 403 khi fetch → **Unverified**; coi là proprietary | ⚠️ https://www.oxfordlearnersdictionaries.com/about/wordlists/oxford3000-5000 ; ⚠️ https://cdn.hackaday.io/files/1880418045146144/American_Oxford_3000%20In%202022.pdf |
| **English Vocabulary Profile (EVP)** (Cambridge) | A1–C2; "available to all for a limited time for free after registration" | Điều khoản tái sử dụng/thương mại **Unverified**; coi là proprietary | ⚠️ https://en.wikipedia.org/wiki/English_Profile |
| **Forvo** | Audio phát âm cộng đồng. CC BY-NC-SA 3.0 từ 2008; cuối 2019 bỏ CC, thay bằng license "ad hoc" hạn chế sao chép/sửa đổi/phân phối lại. API có phí ("$2/year for non-commercial use") | Proprietary | ⚠️ https://en.wikipedia.org/wiki/Forvo (trang forvo.com/license trả 403) |

---

## 3. Gloss tiếng Việt — có gì, license ra sao

| Cặp | Nguồn | License | Đánh giá |
|---|---|---|---|
| EN → VI | en.wiktionary (mục Translations → Vietnamese) qua Kaikki; vi.wiktionary (`vi-extract.jsonl`) | CC BY-SA 4.0 / GFDL | **Dùng được, có ShareAlike.** Độ phủ & chất lượng cần đo thực tế (**Unverified**) |
| EN → VI | **FVDP** (Free Vietnamese Dictionary Project, Hồ Ngọc Đức) | **Không tìm thấy license của chính FVDP → Unverified.** Chỉ thấy các sản phẩm phái sinh (spellchecker Firefox: GPL-3.0-only; OpenOffice: GPLv2/GPLv3) | **Tránh** cho tới khi có văn bản license gốc. Nguồn: ⚠️ https://addons.mozilla.org/addon/7479 ; ⚠️ https://git.stg.centos.org/source-git/hunspell-vi/blob/2d1e698af65fc19bd83e1722825b9f4dc0cd9327/f/LICENSES-en.txt |
| EN/ZH → VI | **OVDP** (Open Vietnamese Dictionary Project, SourceForge) | Trang SourceForge ghi GPLv2 (⚠️ theo đoạn trích tìm kiếm). Nguồn gốc dữ liệu bên trong (vd. bản Trung–Việt 157,844 mục) **không rõ** | **Tránh** — GPL không phù hợp cho dữ liệu nội dung và nguồn gốc dữ liệu không rõ. ⚠️ https://sourceforge.net/p/ovdp/ ; ⚠️ https://github.com/meap158/Pleco-Collection |
| ZH → VI | **CVDICT** | CC BY-SA 4.0 | **Dùng với cẩn trọng:** license rõ, nhưng dịch máy bằng LLM → bắt buộc review bởi người trước khi hiển thị ở level thấp. ✅ https://github.com/ph0ngp/CVDICT |
| ZH → âm Hán Việt | **Unihan `kVietnamese`** | Unicode License v3 | **Dùng được** (chỉ là âm đọc, không phải nghĩa). ✅ https://www.unicode.org/reports/tr38/ |
| ZH → VI | en.wiktionary / vi.wiktionary | CC BY-SA 4.0 | Dùng được, ShareAlike |
| JA → VI | **Không tìm thấy** từ điển Nhật–Việt nào có license mở rõ ràng. JMdict không có tiếng Việt. Một tài nguyên "Vietnamese-Japanese Dictionary" 65,000 mục trên ISLRN để trống trường license | — | **Chưa có nguồn có license rõ.** Phương án: Wiktionary (CC BY-SA) + tự biên soạn/dịch có review. ⚠️ https://islrn.org/resources/719-247-130-680-9 |
| KO → VI | **krdict** (bản song ngữ Hàn–Việt) | KOGL Type 1 / CC BY-SA 2.0 KR (chưa thống nhất, có "제3자 권리 포함") | **Dùng với cẩn trọng** — cần xác nhận license trên trang krdict chính thức trước khi import |
| DE/FR/ES → VI | Wiktionary | CC BY-SA 4.0 | Dùng được; ngoài ra **không tìm thấy** từ điển song ngữ có license mở |

**Kết luận phần 3:** ngoài Wiktionary (CC BY-SA), Unihan (âm Hán Việt) và CVDICT (CC BY-SA, dịch máy), **không có** nguồn gloss tiếng Việt nào có license mở được kiểm chứng. Phần lớn gloss tiếng Việt sẽ phải **tự biên soạn** (người viết hoặc AI + người review). Nội dung tự biên soạn nên được lưu tách khỏi nội dung CC BY-SA để giữ quyền chọn license.

---

## 4. Khuyến nghị

### 4.1 Bảng phân loại

| Nhóm | Nguồn | Lý do |
|---|---|---|
| **Dùng ngay** (permissive / public domain) | Wikidata Lexemes (CC0); Tatoeba câu tập con **CC0**; Common Voice (CC0 — xác nhận lại terms); Unihan (Unicode License v3, kèm notice); 국립국어원 한국어 학습용 어휘 목록 (KOGL Type 1, ghi nguồn); Hanzi Writer **code** (MIT); wiktextract **code** (MIT) | Không có ShareAlike; chỉ cần notice/ghi nguồn |
| **Dùng với cẩn trọng** (Attribution) | Tatoeba câu CC BY 2.0 FR; Tatoeba audio chỉ các file CC BY | Bắt buộc lưu và hiển thị attribution theo từng câu/file |
| **Dùng với cẩn trọng** (ShareAlike / copyleft) | CC-CEDICT (CC BY-SA 4.0); JMdict/KANJIDIC2 (CC BY-SA 4.0 **+ yêu cầu cập nhật định kỳ và ghi công trên mỗi màn hình hiển thị**); KanjiVG (CC BY-SA 3.0); Wiktionary/Kaikki (CC BY-SA 4.0/GFDL); CVDICT (CC BY-SA 4.0 + dịch máy); Lingua Libre (CC BY-SA 4.0); Make Me a Hanzi (LGPL-3.0+ / Arphic PL); Hanzi Writer **data** (Arphic PL); krdict (license chưa thống nhất) | [Inference] Dataset phái sinh (vd. bảng từ có thêm nghĩa tiếng Việt dựa trên CC-CEDICT) phải phát hành lại theo cùng license. Lưu riêng từng nguồn, không trộn với nội dung tự viết |
| **Tránh** (proprietary / không rõ license) | Oxford 3000/5000; English Vocabulary Profile; IELTS band descriptors (chỉ link, không copy); văn bản CEFR descriptors (chỉ dùng nhãn level); Goethe Wortlisten; référentiels Beacco (Didier); Plan Curricular Cervantes (chưa thấy điều khoản); Forvo; Tatoeba audio NC hoặc không license; krdict audio; FVDP & OVDP (license không rõ/GPL); list "JLPT N5–N1" không chính thức (license của từng list khác nhau); SUBTLEX (chỉ có cho phép qua email cho bên thứ ba) | Không có quyền tái phân phối được kiểm chứng |

Ghi chú về "Tránh": vẫn có thể **tham khảo** để tự viết nội dung gốc (vd. tự chọn từ vựng theo chủ đề CEFR), nhưng không import/copy danh sách hay văn bản.

### 4.2 Metadata tối thiểu cho mỗi content item

```ts
// packages/content-schema (đề xuất) — mỗi entry/câu/audio/stroke đều mang provenance
type License =
  | "CC0-1.0" | "CC-BY-2.0-FR" | "CC-BY-4.0"
  | "CC-BY-SA-3.0" | "CC-BY-SA-4.0" | "CC-BY-SA-2.0-KR"
  | "KOGL-Type1" | "Unicode-3.0" | "LGPL-3.0-or-later" | "Arphic-PL"
  | "MIT" | "proprietary-licensed" | "original" /* do SoloLanguages tự viết */;

interface Provenance {
  source_id: string;          // "cc-cedict", "tatoeba", "jmdict", "nikl-2003", "original"
  source_url: string;         // URL trang tải / trang entry
  source_item_id?: string;    // id gốc (Tatoeba sentence id, JMdict ent_seq, ...)
  license: License;           // SPDX id khi có
  license_url: string;
  attribution: string;        // chuỗi hiển thị, vd "CC-CEDICT (MDBG), CC BY-SA 4.0"
  attribution_url?: string;   // Tatoeba audio có cột Attribution URL riêng
  author?: string;            // contributor (Tatoeba username, Commons uploader)
  share_alike: boolean;       // true => dữ liệu phái sinh phải cùng license
  commercial_ok: boolean;     // false => không được vào bản trả phí
  version: string;            // vd "2026-10-31" (CC-CEDICT), "Unicode 18.0.0"
  retrieved_at: string;       // ISO 8601
  modified: boolean;          // CC BY-SA/Wikimedia: phải nêu rõ đã sửa đổi
  derived_from?: string[];    // chuỗi nguồn khi gộp (vd CVDICT <- CC-CEDICT)
  machine_generated?: boolean;// gloss do LLM/MT tạo (CVDICT, AI)
  reviewed_by?: string;       // người review (bắt buộc nếu machine_generated)
  level_source?: "official" | "community-estimate" | "internal";
  level_framework?: "CEFR" | "IELTS" | "HSK-GF0025-2021" | "HSK3-exam-2025" | "JLPT" | "TOPIK" | "NIKL-2003";
}
```

Best practice khi import:
1. **Một thư mục / một bảng cho mỗi nguồn** (`seed/cc-cedict/`, `seed/tatoeba/`…), giữ file `LICENSE` + `SOURCE.md` (URL, version, ngày tải, checksum) bên cạnh.
2. **Allowlist license** trong pipeline import: chặn mọi item có `license` ngoài danh sách cho phép hoặc `commercial_ok=false`.
3. **Lọc Tatoeba audio theo cột License**: bỏ trống, NC, ND.
4. **JMdict:** lên lịch job cập nhật ≥ 1 lần/tháng; hiển thị ghi công trên mọi màn hình có dữ liệu JMdict (không chỉ trang About/splash).
5. **Màn hình "Nguồn & giấy phép"** trong app, sinh tự động từ bảng `Provenance`.
6. **Tách nội dung `original`** (do đội tự viết) khỏi nội dung ShareAlike để giữ quyền chọn license cho phần của mình.
7. **Gloss do máy tạo** (`machine_generated=true`) không được publish khi chưa có `reviewed_by`.

---

## 5. Danh sách mục Unverified

1. CEFR Companion Volume: có Pre-A1, có bản dịch tiếng Việt hay không, điều khoản sao chép chi tiết (PDF trả 403).
2. HSK GF0025-2021: số liệu đọc từ bản sao của bên thứ ba (tuttocina.it), chưa đối chiếu với bản gốc MOE; license của các bảng từ/chữ/ngữ pháp.
3. HSK 3.0 exam syllabus 2025: số từ 300/500/1000/2000/3600/5400/11000 (chỉ theo Wikipedia + site luyện thi); ngày triển khai chính thức toàn cầu (nguồn mâu thuẫn).
4. TOPIK: word list chính thức của 국립국제교육원; ngưỡng điểm từng cấp.
5. krdict: license chính xác (KOGL Type 1 vs CC BY-SA 2.0 KR), điều kiện thương mại, cách lấy bản dịch tiếng Việt qua API; tình trạng audio hiện nay.
6. Unihan: trang copyright của Unicode không nêu tên Unihan (suy luận rằng thuộc "Data Files").
7. Common Voice: văn bản terms chính thức; có tập tiếng Việt/Nhật/Hàn hay không.
8. Kaikki/wiktextract: license dữ liệu không được ghi trên trang (suy luận kế thừa Wiktionary).
9. Oxford 3000/5000, EVP: điều khoản tái sử dụng (đều coi là proprietary).
10. SUBTLEX-US/CH: license chính thức trên trang crr.ugent.be.
11. FVDP: license gốc. OVDP: nguồn gốc dữ liệu bên trong.
12. Plan Curricular Cervantes: điều khoản tái sử dụng bản online; référentiels Beacco.
13. Số câu tiếng Việt trên Tatoeba; độ phủ tiếng Việt trên Wiktionary/Wikidata Lexemes.
14. Từ điển Nhật–Việt có license mở: không tìm thấy.
