# Hợp đồng module ngôn ngữ

Tài liệu này mô tả hợp đồng giữa lõi SoloLanguages và các module ngôn ngữ (`languages/<code>/`): ba khái niệm ngôn ngữ, giao diện `LanguageModule`, vòng đời registry, mã lỗi, quy tắc bật/tắt, mô hình đe dọa và bộ kiểm tra hợp đồng. Cuối tài liệu có ví dụ thêm tiếng Nhật (JLPT).

Bối cảnh quyết định nằm ở [ADR 0001](../adr/0001-monorepo-language-modules.md) và [ADR 0002](../adr/0002-toolchain-tsconfig.md). Quy ước thư mục và test nằm ở [Cấu trúc repository](repository-structure.md).

## Phạm vi và trạng thái

- Phase 1 chỉ gồm: SDK (`packages/language-sdk`), registry, contract suite, module mẫu `languages/_fixture` và công cụ `tools/literal-check/bin/check-no-language-literals.mjs`.
- `packages/core`, `packages/i18n`, `packages/db`, `packages/ui`, `packages/feature-*`, `apps/web`, `apps/api`, `languages/en`, `languages/zh`, `languages/ja`, `languages/_template` và `tools/create-language` là **dự kiến**, chưa tồn tại.
- Nội dung đã được đối chiếu ngày 2026-11-02 với mã trong `packages/language-sdk/src` (`index.ts`; `contract/{types,schemas,validate,define,compat,skills,version}.ts`; `registry/{registry,state,discover,errors,timeout,messages}.ts`; `testing/{checks,contract,index}.ts`). Khi mã thay đổi, mã nguồn là bản đúng và tài liệu này cần cập nhật.
- Bề mặt API công khai: `@solo/language-sdk` (kiểu, `SDK_VERSION`, `CORE_SKILLS`, schema, `defineLanguage`, `defineLevelFramework`, `validateLanguageModule`, `satisfies`, `createRegistry`, `createMemoryStateProvider`, `discoverFromRecord`) và `@solo/language-sdk/testing` (`CONTRACT_CHECKS`, `checkLanguageModule`, `runLanguageModuleContract`). `withTimeout` và `deepFreeze` là hàm nội bộ, không xuất ra ngoài.

## 1. Ba khái niệm ngôn ngữ

Một người dùng có ba "ngôn ngữ" độc lập nhau. Không dùng lẫn lộn và không suy ra cái này từ cái kia.

| Khái niệm | Trả lời câu hỏi | Lưu ở đâu | Bản v1 |
| --- | --- | --- | --- |
| Interface locale (ngôn ngữ giao diện) | Menu, nút, thông báo hiển thị bằng ngôn ngữ nào? | `users.ui_locale` | Chỉ `vi`; thiết kế để thêm locale khác |
| Learning language (ngôn ngữ đang học) | Người học đang học ngôn ngữ nào? | Không lưu riêng. Suy ra theo chuỗi enrollment → course → language | Theo các module đã bật |
| Native language (ngôn ngữ mẹ đẻ) | Chú giải (gloss), nghĩa từ hiển thị bằng ngôn ngữ nào? | `users.native_language` | `vi` |

- Learning language không có cột riêng để tránh hai nguồn sự thật: course đã thuộc đúng một ngôn ngữ, nên ghi danh course là đủ để biết ngôn ngữ đang học.
- Các trường lưu trữ thuộc phase `packages/db` (dự kiến, PostgreSQL). [Chưa xác minh] Tên bảng và cột là định hướng thiết kế, chưa có schema thật.
- Interface locale và native language có thể khác nhau. Ví dụ ở phase sau, người dùng mẹ đẻ `vi` có thể chọn giao diện `en`; chú giải vẫn ưu tiên native language theo chuỗi bên dưới.

### Chuỗi gloss dự phòng

Khi cần chú giải cho một mục học (nghĩa từ, giải thích), hệ thống thử lần lượt:

```text
native language  →  interface locale  →  en
```

- Dùng bản dịch đầu tiên có sẵn trong chuỗi.
- Chuỗi này sẽ do lõi và `packages/i18n` cài đặt ở phase sau (dự kiến). Phase 1 chưa có mã giải quyết gloss.
- [Chưa xác minh] Điểm cuối của chuỗi (`en`) nên do cấu hình ứng dụng truyền vào, không ghi cứng trong SDK hoặc lõi, vì checker cắm cờ cả mã ngôn ngữ trong string lẫn tên tại key, method, accessor, enum member, import/export specifier, shorthand destructuring và property access (`o.en`). Biến hoặc parameter thuần không bị cắm cờ chỉ vì tên đó. Xem [quy tắc literal checker](repository-structure.md#quy-tắc-literal-checker), gồm exit code `0` sạch / `1` có finding / `2` scan error.
- SDK không ghi cứng `vi`. Contract suite nhận locale bắt buộc từ bên gọi qua `requiredLocales` và `supportedLocales`.

## 2. Language, Level framework, Course

| Thực thể | Trường chính | Quan hệ |
| --- | --- | --- |
| Language | `manifest` | Một module trong `languages/` |
| Level framework | `levelFrameworks[]`: `code`, `kind`, `certification`, `levels[]` | Thuộc một ngôn ngữ; một ngôn ngữ có một hoặc nhiều framework |
| Course | `courses[]`: `code`, `framework`, `levels[]` | Tham chiếu một framework của cùng module và một dãy cấp tăng dần của framework đó |

- Tiếng Anh dự kiến có hai framework: CEFR và IELTS.
- `kind: 'ordinal'` là cấp xếp thứ tự, không có điểm (ví dụ JLPT N5 → N1). `kind: 'band'` có `minScore` và `maxScore` cho từng cấp (ví dụ band IELTS).
- `certification` là boolean: `true` khi các cấp tương ứng một kỳ thi chứng chỉ bên ngoài.
- Người học ghi danh vào course. Enrollment trỏ tới course, course trỏ tới framework, framework thuộc module.

## 3. Giao diện `LanguageModule`

Module do `defineLanguage()` trả về là giá trị thuần. `defineLanguage()` chỉ gán kiểu và đóng băng sâu (deep freeze, gồm cả hàm); nó **không** kiểm tra dữ liệu. Việc kiểm tra thực hiện ở registry và contract suite.

| Trường | Bắt buộc | Kiểu / mô tả |
| --- | --- | --- |
| `sdk` | Có | Dải phiên bản SDK mà module hỗ trợ. Schema chỉ chấp nhận dạng caret `^MAJOR.MINOR.PATCH`, có thể kèm nhãn pre-release, theo SemVer 2.0.0 chặt. |
| `manifest` | Có | `LanguageManifest`, xem bảng bên dưới. |
| `levelFrameworks` | Có | `LevelFramework[]`, ít nhất một. |
| `courses` | Có | `Course[]`, ít nhất một. |
| `skills` | Có | `Skill[]`, mỗi phần tử `{ id }`. |
| `textTools` | Có | `TextTools`: chuẩn hóa, so sánh đáp án, tách token. |
| `vocabFields` | Không | `{ id, required? }[]`: trường bổ sung cho mục từ vựng. |
| `speech` | Không | `{ tags, voiceFilter? }`: thẻ BCP 47 cho giọng đọc và hàm lọc giọng. |
| `exerciseTypes` | Không | `string[]`: mã dạng bài tập riêng của ngôn ngữ. |
| `features` | Không | `Record<string, boolean>`: cờ tính năng riêng của ngôn ngữ. Khóa khớp `^[A-Za-z0-9][A-Za-z0-9_.:-]*$`. |
| `placement` | Không | `{ course, levels[] }`: course và các level bài xếp lớp có thể gán; phải tồn tại trong module. |
| `content` | Không | `() => Promise<unknown>`: tải nội dung khóa học, lazy. Phải resolve ra giá trị khác `undefined` (contract check 17). |
| `i18n` | Không | `Record<locale, () => Promise<Messages>>`. Khóa là thẻ BCP 47 chuẩn tắc; `__proto__` bị từ chối. Mỗi loader resolve ra object thuần có giá trị chuỗi (`Messages`). |
| `tutor` | Không | `Record<string, JsonValue>`: dữ liệu JSON thuần, chưa có hình dạng cho đến phase trợ lý học tập (opaque). Khóa cùng quy tắc với `features`. |
| `dictionary` | Không | `Record<string, JsonValue>`: như `tutor`, cho phase từ điển. |

Trong Phase 1, `vocabFields`, `exerciseTypes`, `features`, `tutor` và `dictionary` là điểm mở rộng trong hợp đồng; chưa có engine nào dùng chúng vì `packages/core` chưa tồn tại.

### Bản chụp (snapshot) mà registry lưu

Registry **không** lưu đối tượng module do bạn truyền vào. Nó lưu bản sao thuần đã qua Zod (`parsed.data`), đóng băng sâu nhưng không đóng băng hàm. Hệ quả cho tác giả module:

- Khóa không có trong schema bị bỏ khỏi bản chụp.
- Đối tượng gốc không bị sửa hay đóng băng bởi registry.
- Các method của `textTools` (`normalize`, `compareAnswer`, `tokenize`) không được dựa vào `this`, vì `textTools` trong registry là bản sao.
- `content()` được gọi với `this` là module gốc; `i18n[locale]()` được gọi với `this` là object `i18n` gốc.
- `get()` và `list()` trả về bản chụp đóng băng.

### `manifest`

| Trường | Kiểu | Mô tả |
| --- | --- | --- |
| `code` | chuỗi | Mã ngôn ngữ, 2–3 chữ cái thường (`^[a-z]{2,3}$`). Là khóa duy nhất của module. |
| `bcp47` | chuỗi | Thẻ BCP 47 ở dạng chuẩn tắc (bằng `Intl.getCanonicalLocales(bcp47)[0]`, contract check 4). |
| `nativeName` | chuỗi | Tên ngôn ngữ viết bằng chính ngôn ngữ đó. |
| `glyph` | chuỗi | Ký tự đại diện hiển thị trên nút chọn ngôn ngữ. |
| `names` | `Record<locale, string>` | Tên ngôn ngữ theo từng locale giao diện. Khóa là thẻ BCP 47 chuẩn tắc (`__proto__` bị từ chối); phải phủ `requiredLocales` (contract check 5). |
| `scripts` | mảng ISO 15924 | Hệ chữ viết, không rỗng, mỗi phần tử dạng `^[A-Z][a-z]{3}$` (ví dụ `Latn`, `Hani`). |
| `direction` | `'ltr' \| 'rtl'` | Hướng viết. |
| `version` | chuỗi SemVer 2.0.0 | Phiên bản của module (không phải của SDK). |

### `levelFrameworks`, `courses`, `skills`

| Trường | Quy tắc |
| --- | --- |
| `levelFrameworks[].kind` | `'ordinal'` hoặc `'band'`. |
| `levelFrameworks[].levels[]` | `{ code, order, minScore?, maxScore? }`; mã level duy nhất trong framework, `order` tăng nghiêm ngặt. `ordinal` không được có trường điểm. `band` phải có cả `minScore` và `maxScore`, với `minScore ≤ maxScore`, các khoảng tăng dần và không chồng lấn. |
| `courses[].framework` | Mã framework phải tồn tại trong cùng module. |
| `courses[].levels` | Mảng mã level của framework đó, không trùng và theo thứ tự `order` tăng dần. |
| `skills[].id` | Mã kỹ năng lõi thuộc `CORE_SKILLS` (`vocabulary`, `grammar`, `reading`, `listening`, `speaking`, `writing`) hoặc mã riêng dạng `<code>:<id>`. Schema chấp nhận mọi chuỗi `<không rỗng>:<không rỗng>`; `validateLanguageModule` siết thêm: `<code>` phải bằng `manifest.code` và `<id>` khớp `[a-z0-9][a-z0-9-]*` (ví dụ `ja:kanji`). |
| `placement` | `course` phải là course của module; mọi `levels` phải nằm trong course đó. |

### `textTools`

| Hàm | Chữ ký (theo `contract/types.ts`) | Yêu cầu |
| --- | --- | --- |
| `normalize` | `(text: string) => string` | Idempotent (`normalize(normalize(x)) === normalize(x)`), không ném lỗi với chuỗi rỗng, khoảng trắng và mẫu Unicode. |
| `compareAnswer` | `(input: string, accepted: readonly string[]) => { correct: boolean; score?: number }` | `compareAnswer(x, [x])` đúng với `x` không rỗng; `compareAnswer('', [x])` và `compareAnswer(x, [])` phải sai; `score` (nếu có) trong khoảng 0 đến 1; không ném lỗi khi rỗng. |
| `tokenize` (tùy chọn) | `(text: string) => string[]` | Kết quả xác định (cùng đầu vào cho cùng đầu ra), không có token rỗng. |

Schema Zod chỉ kiểm tra các trường kiểu hàm là `function` (`typeof v === 'function'`). Chữ ký hàm do TypeScript kiểm tra; hành vi do contract suite kiểm tra. Kiểu dữ liệu viết tay (`contract/types.ts`) và đầu ra của schema được giữ khớp nhau bằng một phép khẳng định lúc biên dịch trong `contract/schemas.ts`.

## 4. Vòng đời registry

```text
discover  →  validate  →  register  →  enable / disable
 (nạp)       (kiểm tra)   (đăng ký)     (trạng thái)
```

Registry tạo bằng `createRegistry({ stateProvider, sdkVersion?, loadTimeoutMs?, logger? })`:

| Tùy chọn | Mặc định | Ghi chú |
| --- | --- | --- |
| `stateProvider` | (bắt buộc) | Nơi lưu trạng thái bật/tắt, xem mục 6. |
| `sdkVersion` | `SDK_VERSION` | Phiên bản SDK dùng để so với dải `sdk` của module. |
| `loadTimeoutMs` | `10000` | Số nguyên trong `[1, 2^31 − 1]`. Áp dụng cho `load()` của nguồn, loader lazy (`content`, `i18n`) và các lời gọi state provider. Giá trị khác làm `createRegistry` ném `RangeError` (lỗi lập trình lúc khởi tạo). |
| `logger` | không có | `{ warn(message, issue) }`, được gọi cho mỗi issue. Lỗi từ logger bị nuốt. |

- **Nguồn (source)** là `{ id, load(): Promise<unknown> }`, do bên gọi truyền vào dưới dạng `Iterable`. SDK không đụng tới hệ thống file. `discoverFromRecord(record)` (trong `registry/discover.ts`) chuyển kết quả của `import.meta.glob` (đường dẫn → loader) thành danh sách nguồn đã sắp theo `id`.
- `discover(sources)` **không bao giờ reject**. Nó thay toàn bộ module đã đăng ký trước đó rồi trả về `{ registered: string[], issues: RegistryIssue[] }`; `registered` gồm cả module đang tắt. `sources` không lặp được, phần tử không phải object, `id` rỗng hoặc không phải chuỗi, `load` không phải hàm, getter ném lỗi: tất cả thành issue `LOAD_FAILED`, các nguồn còn lại vẫn được xử lý.
- Nguồn được xử lý theo thứ tự `id`. `load()` được gọi với `this` là chính nguồn.
- Giá trị `load()` trả về được dùng trực tiếp, hoặc lấy `default` nếu giá trị đó không có khóa `manifest` nhưng có `default` (module ES với `export default`).
- Mỗi nguồn đi qua một pipeline riêng, mỗi bước bọc `try/catch`. Một nguồn lỗi không làm hỏng nguồn khác.

| Bước | Việc làm | Mã lỗi khi thất bại |
| --- | --- | --- |
| 1. Nạp | Gọi `load()` với giới hạn `loadTimeoutMs` | `LOAD_FAILED` |
| 2. Schema | `languageModuleSchema.safeParse`; dùng `parsed.data` làm bản chụp | `SCHEMA_INVALID` |
| 3. Tương thích SDK | So dải `sdk` của module với `sdkVersion` bằng `satisfies()` (`contract/compat.ts`) | `SDK_INCOMPATIBLE` |
| 4. Ngữ nghĩa | Gọi `validateLanguageModule()` (`contract/validate.ts`): trùng mã, `order`, điểm của band, course trỏ framework, kỹ năng, placement | `SEMANTIC_INVALID` |
| 5. Trùng mã | Kiểm tra `manifest.code` chưa bị nguồn khác đăng ký | `DUPLICATE_CODE` |
| 6. Đăng ký | Đóng băng sâu bản chụp (không đóng băng hàm) và thêm vào registry | (không có) |

- Chỉ nguồn đăng ký thành công mới giữ mã ngôn ngữ. Nguồn lỗi ở bước 1 đến 4 không chặn nguồn khác dùng cùng mã.
- Sau khi xử lý mọi nguồn, `discover()` đọc trạng thái bật/tắt từ state provider (mục 6).
- Nếu có lời gọi `discover()` mới bắt đầu khi lời gọi cũ chưa xong, kết quả của lời gọi cũ bị bỏ: nó không ghi đè lời gọi mới, không báo issue nào và trả về `{ registered: [], issues: [], superseded: true }`.

API của registry:

| Hàm | Mô tả |
| --- | --- |
| `discover(sources)` | Nạp, kiểm tra, đăng ký; trả `{ registered, issues, superseded? }`, không reject |
| `refresh()` | Đọc lại trạng thái từ state provider; trả danh sách issue, không reject |
| `list({ includeDisabled })` | Danh sách module; mặc định (`includeDisabled: false`) chỉ trả module đang bật |
| `get(code, { includeDisabled })` | Lấy module theo mã; module đang tắt trả `undefined` trừ khi `includeDisabled: true` |
| `isEnabled(code)` | `false` nếu mã chưa đăng ký hoặc state provider không khả dụng |
| `enable(code)`, `disable(code)` | Lưu rồi đọc lại trạng thái; trả `Result<void>`, xem mục 6 |
| `getContent(code)` | Tải `content` lazy với giới hạn thời gian; trả `Result` (`undefined` nếu module không có `content`); loader trả `undefined` là `LOAD_FAILED`; dùng được cho module đang tắt |
| `getMessages(code, locale)` | Tải `i18n[locale]` lazy; chỉ nhận khóa locale là thuộc tính riêng của `i18n`; trả `Result` (`undefined` nếu module không có locale đó); kết quả loader phải là plain object có mọi giá trị là chuỗi (cùng quy tắc với contract check 17), nếu không thì `LOAD_FAILED`; dùng được cho module đang tắt |

Các hàm trả `Result<T>` (`{ ok: true, value } | { ok: false, issue }`) không ném lỗi. Ngoại lệ duy nhất là `RangeError` của `createRegistry` ở trên.

`getMessages()` trả bản chụp `Messages` có prototype là `null`, do `src/registry/messages.ts` của SDK tạo từ data descriptor mà không gọi accessor. Dùng `Object.hasOwn(messages, key)` để kiểm tra khóa, không gọi `messages.hasOwnProperty(key)`.

## 5. Mã lỗi

| Mã | Khi nào | Hành vi |
| --- | --- | --- |
| `LOAD_FAILED` | `load()` ném lỗi, từ chối hoặc quá `loadTimeoutMs`; nguồn không hợp lệ (không phải object, `id` rỗng, `load` không phải hàm, `sources` không lặp được); `content()` hoặc `i18n[locale]()` ném lỗi, quá hạn hoặc trả giá trị không hợp lệ | Ghi issue và đi tiếp với nguồn khác. Với nội dung lazy, `getContent` và `getMessages` trả `Result` lỗi, không ném. |
| `SCHEMA_INVALID` | Không qua Zod schema | Ghi một issue cho mỗi lỗi, kèm đường dẫn (`path`); không đăng ký. |
| `SDK_INCOMPATIBLE` | Dải `sdk` của module không thỏa `sdkVersion` | Từ chối. Khác major luôn bị từ chối. |
| `SEMANTIC_INVALID` | Sai tham chiếu chéo hoặc bất biến, ví dụ course trỏ tới framework không có | Từ chối. |
| `DUPLICATE_CODE` | Hai nguồn cùng `manifest.code` | Sắp nguồn theo `id`; nguồn đầu thắng, các nguồn sau bị từ chối; issue nêu tên nguồn thắng. |
| `STATE_UNAVAILABLE` | State provider ném lỗi, quá hạn hoặc trả dữ liệu sai dạng (xem mục 6); không lưu được; hoặc đọc `defaultEnabled` bị lỗi | Đọc lỗi: fail closed, coi mọi module là tắt. Lưu lỗi: trả `Result` lỗi. |
| `NOT_REGISTERED` | `enable()`, `disable()`, `getContent()` hoặc `getMessages()` với mã chưa đăng ký | Trả `Result` lỗi; không đổi trạng thái. |

Cả bảy mã nằm trong kiểu `RegistryIssueCode` (`registry/errors.ts`). Mỗi `RegistryIssue` có `code`, `message` và tùy trường hợp `sourceId`, `language`, `path`. Thông báo lỗi được tạo bằng hàm an toàn: giá trị có `toString` ném lỗi vẫn cho ra thông báo cố định.

## 6. Bật/tắt module

**Đã đăng ký không có nghĩa là đã bật.** Đăng ký nói module hợp lệ; trạng thái bật/tắt nói người học có dùng được hay không.

### Cơ chế (Phase 1)

```ts
interface LanguageStateProvider {
  getAll(): Promise<Record<string, { readonly enabled: boolean }>>;
  set(code: string, enabled: boolean): Promise<void>;
  /** Áp cho mã không có trong getAll(). Mặc định false. */
  readonly defaultEnabled?: boolean;
}
```

- Mặc định dùng `createMemoryStateProvider(initial, { defaultEnabled: false })`: module mới đăng ký ở trạng thái tắt cho đến khi được bật.
- Mọi lời gọi `getAll()` và `set()` chịu giới hạn `loadTimeoutMs`.
- Chỉ giá trị `enabled === true` được tính là bật. Mục có `enabled` khác `true` (kể cả không phải boolean) được tính là tắt. Mã không có trong kết quả dùng `defaultEnabled`.
- `defaultEnabled` được đọc một lần khi tạo registry; chỉ `true` mới bật. Nếu getter ném lỗi, dùng `false` và ghi issue `STATE_UNAVAILABLE` ở lần `discover()` hoặc `refresh()` kế tiếp.
- `getAll()` ném lỗi, quá hạn, trả `null`, `undefined` hoặc giá trị không phải object: registry fail closed (mọi module tắt) và ghi `STATE_UNAVAILABLE`.
- `enable(code)` và `disable(code)`: gọi `set()`, rồi đọc lại bằng `getAll()`. Chỉ trả thành công nếu trạng thái đọc lại khớp yêu cầu; nếu không trả `STATE_UNAVAILABLE`. Nhờ đọc lại, một lần `set()` thành công cũng khôi phục registry khỏi trạng thái fail closed trước đó.
- Tắt một module không ảnh hưởng module khác.
- State provider lưu bền (ví dụ trong cơ sở dữ liệu) là việc của phase sau.

### Ngữ nghĩa sản phẩm

| Trạng thái | Ghi danh mới | Ghi danh hiện có | Dữ liệu |
| --- | --- | --- | --- |
| Bật | Cho phép | Học bình thường | Giữ nguyên |
| Tắt | Ẩn khỏi danh sách chọn ngôn ngữ, không nhận ghi danh mới | Chuyển sang chỉ đọc | Không xóa; bật lại thì dùng tiếp |

- Phase 1 chỉ có cờ `enabled` trong registry. Việc áp dụng quy tắc này lên ghi danh thuộc `apps/api` và `packages/core` (dự kiến).
- `getContent` và `getMessages` vẫn hoạt động với module đang tắt, vì ghi danh chỉ đọc và quản trị vẫn cần nội dung. Registry không chặn theo trạng thái bật/tắt; **chính sách này do tầng ứng dụng áp dụng**.
- [Chưa xác minh] Phạm vi chính xác của "chỉ đọc" (xem tiến độ và lịch sử; có cho ôn tập hay không) sẽ chốt khi thiết kế enrollment.

## 7. Mô hình đe dọa và giới hạn

- Module ngôn ngữ là mã **first-party**: do nhóm viết, review, và đóng gói lúc build, chạy cùng tiến trình với ứng dụng.
- Cách ly của registry nhắm tới **lỗi** trong mã đó: ném lỗi, promise bị từ chối, treo bất đồng bộ (quá `loadTimeoutMs`) và dữ liệu sai dạng. Không nhắm tới mã độc.
- Các biện pháp rẻ đã có: bản chụp đóng băng thay vì dùng đối tượng gốc; mọi bước nạp, kiểm tra, lazy loader và state provider đều bọc `try/catch` và giới hạn thời gian; bộ đếm giờ luôn được xóa; lỗi logger bị nuốt; từ chối khóa `__proto__`.
- **Giới hạn đã biết:** vòng lặp đồng bộ vô hạn hoặc việc chặn event loop không thể ngắt trong cùng tiến trình, vì bộ đếm giờ không chạy được khi event loop bị chặn. Các hàm của `textTools` chạy đồng bộ trong tiến trình của người gọi và cũng không được cách ly hay giới hạn thời gian.
- Nếu sau này cho phép module của bên thứ ba, cần cách ly bằng worker hoặc tiến trình riêng. Việc này chưa nằm trong Phase 1 và chưa được thiết kế.

## 8. Thư mục tiền tố `_`

Thư mục trong `languages/` có tên bắt đầu bằng `_` là công cụ phát triển, không phải ngôn ngữ thật:

| Thư mục | Vai trò | Trạng thái |
| --- | --- | --- |
| `languages/_fixture` | Module mẫu (`code: qaa`, thuộc dải mã dành cho dùng riêng của ISO 639) để kiểm thử SDK, registry và contract suite | Phase 1 |
| `languages/_template` | Khuôn để sao chép khi thêm ngôn ngữ mới | Dự kiến |

- Các thư mục này **không được phát hiện** ở production. Test đưa chúng vào registry bằng nguồn tường minh hoặc import trực tiếp.
- Chúng vẫn là workspace npm (`languages/*`) nên `npm install` và `npm test` vẫn xử lý chúng.
- Cơ chế loại trừ nằm ở `discoverFromRecord` (`registry/discover.ts`): mặc định bỏ qua mọi đường dẫn có đoạn (tách theo `/` hoặc `\`) bắt đầu bằng `_`. Tùy chọn `includeUnderscored: true` bật lại chúng; chỉ dùng trong test hoặc dev, không dùng ở production.
- SDK không đụng tới hệ thống file, nên danh sách nguồn do ứng dụng dựng. Ví dụ cho phase sau (dự kiến, chưa chạy thử; [Chưa xác minh] đường dẫn glob phụ thuộc vị trí file ứng dụng):

```ts
// apps/api hoặc apps/web, dự kiến
const modules = import.meta.glob('../../../languages/*/src/index.ts');
const { registered, issues } = await registry.discover(discoverFromRecord(modules));
```

## 9. Các kiểm tra hợp đồng

Contract suite nằm ở `@solo/language-sdk/testing` (public entry `packages/language-sdk/src/testing/index.ts`, logic trong `src/testing/checks.ts` và wrapper trong `src/testing/contract.ts` của SDK):

- `checkLanguageModule(mod: unknown, opts: ContractOptions): Promise<CheckResult[]>` là hàm bất đồng bộ, không import `vitest`, không ném lỗi hay reject và không sửa `mod`. Mỗi kết quả là `{ id, name, ok, message? }`.
- `runLanguageModuleContract(source: unknown, opts: ContractOptions): void` đăng ký một test Vitest cho mỗi kiểm tra. `source` là chính module, hoặc một hàm loader (có thể lazy) trả về module hoặc namespace có `default`. Ví dụ: `() => import('../src/index.ts')`.
- `CONTRACT_CHECKS` liệt kê `{ id, name }` của 20 kiểm tra.

### `ContractOptions`

| Trường | Bắt buộc | Mô tả |
| --- | --- | --- |
| `expectedCode` | Có | Mã ngôn ngữ mà `manifest.code` phải bằng. |
| `requiredLocales` | Có | Locale giao diện mà `manifest.names` phải có. |
| `supportedLocales` | Có | Locale giao diện mà ứng dụng hỗ trợ; khóa của `i18n` phải thuộc tập này. |
| `samples.nonEquivalent` | Có | Ít nhất một cặp `[input, accepted]` mà `compareAnswer(input, [accepted])` phải trả sai. Bắt buộc để một `compareAnswer` luôn trả đúng sẽ không qua được. |
| `samples.equivalent` | Không | Các cặp `[input, accepted]` mà `compareAnswer` phải trả đúng. |
| `samples.text` | Không | Chuỗi bổ sung (ví dụ chữ viết của chính ngôn ngữ) cho các kiểm tra `normalize`, `tokenize`, `compareAnswer`. |
| `timeoutMs` | Không | Giới hạn thời gian cho mỗi lazy loader. Mặc định `5000`. |
| `sdkVersion` | Không | Phiên bản SDK dùng cho kiểm tra 2 và 20. Mặc định `SDK_VERSION`. |

### Quan hệ với schema

- Kiểm tra 1 chạy `languageModuleSchema.safeParse`. Nếu schema lỗi, không kiểm tra nào chạy tiếp: kiểm tra 1 báo mọi lỗi schema; mỗi kiểm tra khác báo các lỗi schema thuộc đường dẫn của nó (ví dụ kiểm tra 6 báo `manifest.direction`, `manifest.scripts`), nếu không có thì ghi "skipped: schema invalid".
- Kiểm tra 6 và 7 hoàn toàn do schema đảm nhiệm: khi schema qua thì chúng qua. Với kiểm tra 2, 3, 4, 5, 8, 10 đến 17, schema lo phần định dạng; phần còn lại do logic riêng của kiểm tra, ghi ở cột "Nội dung".
- Kiểm tra 8, 9, 10, 11, 16 lấy kết quả từ `validateLanguageModule()` theo vùng (`levelFrameworks`, `courses`, `skills`, `placement`).

### Danh sách kiểm tra

| # | Kiểm tra | Nội dung |
| --- | --- | --- |
| 1 | Schema | Module qua Zod schema |
| 2 | Tương thích SDK | Dải `sdk` thỏa `opts.sdkVersion ?? SDK_VERSION` |
| 3 | Mã ngôn ngữ | Định dạng `^[a-z]{2,3}$` (schema) và `manifest.code` bằng `opts.expectedCode` |
| 4 | BCP 47 | `bcp47 === Intl.getCanonicalLocales(bcp47)[0]` |
| 5 | Tên theo locale | `names` có mọi khóa của `opts.requiredLocales` |
| 6 | Hướng và chữ viết | `direction` là `ltr` hoặc `rtl`; `scripts` không rỗng, mỗi phần tử khớp `^[A-Z][a-z]{3}$` (schema) |
| 7 | Phiên bản module | `manifest.version` là SemVer 2.0.0 (schema) |
| 8 | Framework | Ít nhất một framework (schema); mã framework duy nhất; mã level duy nhất; `order` tăng nghiêm ngặt |
| 9 | Điểm số | `band`: có `minScore`, `maxScore`, `minScore ≤ maxScore`, các khoảng tăng dần và không chồng lấn. `ordinal`: không có trường điểm |
| 10 | Course | Ít nhất một course (schema); mã duy nhất; framework tồn tại; `levels` không trùng và tăng dần |
| 11 | Skills | `id` duy nhất; id lõi thuộc `CORE_SKILLS`; id riêng dạng `<code>:<id>` |
| 12 | `normalize` | Với các mẫu cơ bản (rỗng, khoảng trắng, Unicode) cộng mẫu trong `opts.samples`: trả chuỗi, idempotent, không ném lỗi |
| 13 | `compareAnswer` | `compareAnswer('', [])` sai. Với mỗi mẫu `s` không chỉ gồm khoảng trắng (`s.trim()` không rỗng): `compareAnswer(s, [])` sai; nếu `normalize(s)` không rỗng thì `compareAnswer(s, [s])` đúng và `compareAnswer('', [s])` sai. Nếu `normalize(s)` là chuỗi rỗng, bỏ qua hai khẳng định `(s, [s])` và `('', [s])` cho mẫu đó và ghi chú vào `detail` của kết quả (mỗi mẫu chỉ liệt kê một lần). Dạng trả về `{ correct, score? }` với `score` trong 0..1. Theo đúng `samples.equivalent` và `samples.nonEquivalent`. Không ném lỗi. Lỗi nếu `nonEquivalent` rỗng |
| 14 | `tokenize` | Nếu có: xác định, mỗi token là chuỗi không rỗng |
| 15 | `speech` | Nếu có: `tags` là BCP 47 hợp lệ; `voiceFilter` trả boolean với giọng giả |
| 16 | `placement` | Nếu có: mọi tham chiếu tồn tại |
| 17 | Tải lazy | Nếu có: `content()` resolve trong `timeoutMs` ra giá trị khác `undefined`; mỗi loader `i18n` resolve trong `timeoutMs` ra object thuần có giá trị chuỗi; khóa `i18n` thuộc `opts.supportedLocales` |
| 18 | JSON round-trip | `manifest`, `levelFrameworks`, `courses` sau khi `JSON.stringify` rồi `JSON.parse` vẫn bằng bản gốc |
| 19 | Đóng băng | Module đã được freeze sâu (gồm cả hàm); đọc giá trị con qua data descriptor bằng `Object.getOwnPropertyDescriptor`, không gọi getter. Không duyệt phần bên trong hàm |
| 20 | Registry | Đăng ký vào registry mới (state provider trong bộ nhớ) không phát sinh issue nào và module có trong `registered` |

Các kiểm tra 17 và 20 dùng bộ đếm giờ bất đồng bộ, nên cũng không ngắt được vòng lặp đồng bộ (mục 7).

## 10. Ví dụ: Thêm tiếng Nhật (JLPT)

Ví dụ này minh họa cách một ngôn ngữ mới đi vào hệ thống. `languages/ja` **chưa tồn tại** trong repo; mã dưới đây là phác thảo.

- Cả `src/index.ts`, `src/levels/jlpt.ts` và `test/contract.test.ts` đã được kiểm tra kiểu bằng `tsc` (TypeScript 6.0.3, kế thừa `tsconfig.base.json`) và chạy contract suite với SDK ngày 2026-11-02, trong một thư mục tạm bên ngoài repo: không có lỗi kiểu và cả 20 kiểm tra đều qua.
- Điều kiện: `package.json` của module có `"type": "module"`.
- Nếu SDK thay đổi sau ngày này, kiểm tra lại phác thảo trước khi sao chép.

### Cây thư mục

Cây này là ví dụ tối thiểu; khi triển khai module thật, tách `manifest.ts`, `courses/`, `text-tools.ts`, `speech.ts`, `features/`, `exercises/` theo [cấu trúc chuẩn](repository-structure.md#cấu-trúc-chuẩn-của-module-ngôn-ngữ) khi cần.

Thư mục mới nằm trong `languages/`, nên `package.json` gốc (workspaces `languages/*`) đã bao gồm nó.

```text
languages/ja/
├── package.json            # name: @solo/lang-ja; "type": "module"; phụ thuộc @solo/language-sdk
├── tsconfig.json           # kế thừa tsconfig.base.json
├── src/
│   ├── index.ts            # export default defineLanguage({...})
│   ├── levels/
│   │   └── jlpt.ts         # defineLevelFramework: N5 → N1
│   ├── content/
│   │   └── index.ts        # nội dung tải lazy (khi đã có dữ liệu)
│   └── i18n/
│       └── vi.ts           # chuỗi giao diện tiếng Việt, tải lazy
└── test/
    └── contract.test.ts    # runLanguageModuleContract
```

### `src/levels/jlpt.ts`

JLPT là framework `ordinal`: N5 là cấp thấp nhất (`order: 1`), N1 là cao nhất (`order: 5`). Framework `ordinal` không có trường điểm.

```ts
import { defineLevelFramework } from '@solo/language-sdk';

export const jlpt = defineLevelFramework({
  code: 'jlpt',
  kind: 'ordinal',
  certification: true, // các cấp ứng với kỳ thi chứng chỉ bên ngoài
  levels: [
    { code: 'N5', order: 1 },
    { code: 'N4', order: 2 },
    { code: 'N3', order: 3 },
    { code: 'N2', order: 4 },
    { code: 'N1', order: 5 },
  ],
});
```

### `src/index.ts`

```ts
import { defineLanguage } from '@solo/language-sdk';
import { jlpt } from './levels/jlpt.ts';

const normalize = (input: string): string =>
  input.normalize('NFKC').replace(/\s+/g, ' ').trim();

export default defineLanguage({
  sdk: '^0.1.0',
  manifest: {
    code: 'ja',
    bcp47: 'ja',
    nativeName: '日本語',
    glyph: '日',
    names: { vi: 'Tiếng Nhật', en: 'Japanese', ja: '日本語' },
    scripts: ['Hani', 'Hira', 'Kana'],
    direction: 'ltr',
    version: '0.1.0',
  },
  levelFrameworks: [jlpt],
  courses: [
    { code: 'jlpt', framework: 'jlpt', levels: ['N5', 'N4', 'N3', 'N2', 'N1'] },
  ],
  skills: [
    { id: 'vocabulary' },
    { id: 'grammar' },
    { id: 'reading' },
    { id: 'listening' },
    { id: 'speaking' },
    { id: 'writing' },
    { id: 'ja:kanji' }, // kỹ năng riêng: tiền tố <code>:
  ],
  textTools: {
    normalize,
    compareAnswer: (input, accepted) => {
      const given = normalize(input);
      return { correct: given.length > 0 && accepted.some((a) => normalize(a) === given) };
    },
  },
  speech: { tags: ['ja-JP'] },
  content: () => import('./content/index.ts').then((m) => m.default),
  i18n: { vi: () => import('./i18n/vi.ts').then((m) => m.default) },
});
```

- `src/content/index.ts` và `src/i18n/vi.ts` dùng `export default`. `content()` phải resolve ra giá trị khác `undefined`; `i18n.vi` phải resolve ra `Messages` (object thuần có giá trị chuỗi), nên loader lấy `m.default`.
- `compareAnswer` trả sai cho đầu vào rỗng và cho danh sách đáp án rỗng, như contract check 13 yêu cầu.
- Các hàm của `textTools` không dùng `this` (mục 3, bản chụp).
- Quy tắc chuẩn hóa ở trên chỉ là ví dụ tối thiểu (NFKC, gộp khoảng trắng). Cách xử lý Kana/Kanji, furigana và đáp án tương đương là quyết định sản phẩm cho phase `languages/ja`.
- Dùng `export default defineLanguage(...)`: registry lấy `default` khi giá trị nạp không có khóa `manifest`.

### `test/contract.test.ts`

```ts
import { runLanguageModuleContract } from '@solo/language-sdk/testing';

runLanguageModuleContract(() => import('../src/index.ts'), {
  expectedCode: 'ja',
  requiredLocales: ['vi'],
  supportedLocales: ['vi'],
  samples: {
    equivalent: [['ｶﾀｶﾅ', 'カタカナ']],
    nonEquivalent: [['ねこ', 'いぬ']], // bắt buộc, ít nhất một cặp
  },
});
```

### Các bước

1. Sao chép `languages/_fixture` thành `languages/ja`. Khi `languages/_template` và `tools/create-language` có (dự kiến), dùng chúng thay cho bước sao chép.
2. Đổi `name` trong `package.json` thành `@solo/lang-ja` và `manifest.code` thành `ja`. Đổi dải `sdk` cho khớp `SDK_VERSION` hiện hành.
3. Viết `levels/jlpt.ts` bằng `defineLevelFramework()`: N5 `order: 1` đến N1 `order: 5`.
4. Khai báo `courses` tham chiếu framework `jlpt` và dãy cấp theo thứ tự tăng dần.
5. Khai báo `skills`: các kỹ năng lõi cần dùng và kỹ năng riêng dạng `ja:<id>`.
6. Viết `textTools` (`normalize`, `compareAnswer`, tùy chọn `tokenize`) và `speech` nếu có.
7. Thêm `content` và `i18n.vi` dạng tải lazy khi đã có dữ liệu.
8. Viết `test/contract.test.ts` với `runLanguageModuleContract`, truyền `expectedCode: 'ja'` và ít nhất một cặp `samples.nonEquivalent`.
9. Chạy `npm install` (liên kết workspace mới), rồi `npm test` và `npm run check`. Cấu hình `test.projects` của `vitest.config.ts` gốc đã gồm `languages/*`.
10. Khi có ứng dụng (dự kiến), module được registry phát hiện, đăng ký ở trạng thái tắt, và được bật sau khi nội dung sẵn sàng (mục 6).

### Lõi không phải đổi

Thêm tiếng Nhật không cần sửa `packages/core` và `packages/language-sdk`, **miễn là các điểm mở rộng của SDK đủ dùng** cho những gì tiếng Nhật cần.

Nếu thiếu điểm mở rộng:

- Thêm điểm mở rộng tổng quát vào SDK và nâng phiên bản SDK. Thay đổi này dùng chung cho mọi ngôn ngữ, không riêng tiếng Nhật.
- Cập nhật dải `sdk` của các module bị ảnh hưởng và chạy lại contract suite của tất cả module. Registry từ chối module có major không khớp.
- Theo `contract/compat.ts` hiện tại, `^` dùng ngữ nghĩa caret của npm. Khi SDK còn ở phiên bản 0.x, dải `^0.1.0` chỉ chấp nhận 0.1.x; nâng SDK lên 0.2.0 làm mọi module khai báo `^0.1.0` bị từ chối (`SDK_INCOMPATIBLE`) cho đến khi cập nhật dải `sdk`. Bản pre-release của SDK không thỏa dải `^x.y.z`, trừ khi chính dải đó mang pre-release trên cùng `x.y.z`.
- Không viết nhánh theo mã ngôn ngữ trong lõi, ví dụ `if (lang === 'ja')`. Công cụ `check-no-language-literals` cắm cờ các literal ngôn ngữ ở `packages/core/src` và `packages/language-sdk/src` (xem [ADR 0001](../adr/0001-monorepo-language-modules.md)).
- Công cụ cố ý không cắm cờ mã ngôn ngữ trong dấu nháy nằm trong comment hoặc JSDoc; thuật ngữ khung trình độ và ký tự CJK/Hangul trong comment vẫn bị cắm cờ.
