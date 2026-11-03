# Chinese mockup content extraction

Source version: `bc95722`. This pack contains only self-authored mockup data.
License: `LicenseRef-SoloLanguages-Proprietary`.
Attribution: © SoloLanguages. All rights reserved.
Extraction timestamp: `2026-11-02T08:40:09.589Z` (shared by all 94 records).
Every record includes the source file, declaration, declaration line, and item selector.

The roadmap targets **GF0025-2021**, as directed by the owner. Counts are preserved
from the mockup and have **not** been checked against that standard: each count
bundle has `verified: false`. Hours are system estimates. No third-party word
lists, exam syllabuses, or stroke databases were imported.

## Where each mockup dataset went

| Mockup dataset | Destination | Source → extracted |
| --- | --- | ---: |
| `course-workspace.js` / `zhBank` | `vocab`; per-record `zh:topic`, `zh:collocation-translations` | 8 → 8 vocabulary entries |
| `course-workspace.js` / `pool` Chinese branch | `assessments` | 3 → 3 questions |
| `language.js` / `chars` | pack extension `zh:characters` | 6 → 6 characters |
| `language.js` / `tones` | `zh:tones[].variants` | 4 → 4 source variants |
| `language.js` / `zq` | `quests`; per-record `zh:icon`, `zh:reason`, `zh:character-ids` | 5 → 5 quests |
| `language.js` / `zl` | `lessons` with plain blocks and nested questions | 4 → 4 lessons + 4 questions |
| `language.js` / `zl.vocab.learn` | lesson `vocabIds`; per-record `zh:variants` on the vocabulary | 3 → 3 source variants of existing headwords |
| `language.js` / `hskNames` | `stages` | 8 → 8 stages |
| `language.js` / `inlineWriting.samples` | per-record `zh:writing-samples` on the lesson | 7 → 7 writing references |
| `hsk-roadmap.js` / `bands` | per-record `zh:roadmap-band` on the stage | 8 → 8 bands |
| `hsk-roadmap.js` / `stages` | pack extension `zh:roadmap` (`groups`) | 4 → 4 stage groups |
| `onboarding-course.js` / `bands` | per-record `zh:onboarding-band` on the stage | 8 → 8 source descriptions |
| `onboarding-course.js` / `quiz` | `placement`; per-record `zh:category-label` | 8 → 8 questions + 8 category labels |
| `onboarding-course.js` / `propose` return-array literal | pack extension `zh:placement-routing` | 1 → 1 metadata record; 5 stage references |
| `chinese-foundation.js` / `tones` | pack extension `zh:tones` | 4 → 4 tones |
| `chinese-foundation.js` / `guided` | pack extension `zh:tone-exercises`, guided mode | 3 → 3 exercises |
| `chinese-foundation.js` / `checks` | pack extension `zh:tone-exercises`, check mode | 5 → 5 exercises |

One additional provenance-bearing wrapper (`zh:roadmap:hsk`) records the standard and
count status. English datasets in the inventory are outside this module's scope.

## Conventions

- **Ids** are stable ASCII, `zh:<kind>:<slug>`, and never depend on array position.
  Vocabulary slugs are toneless pinyin of the source reading (`zh:vocab:ni-hao`,
  `zh:vocab:xiexie`); the u-umlaut is written `v`, the standard ASCII spelling.
  Stages are `zh:stage:foundation` and `zh:stage:hsk1` … `zh:stage:hsk7-9` (the
  lowercase level code). Characters use toneless pinyin, placement questions their
  category, assessments a short topic slug, tone exercises `<mode>-<pinyin>-<tone>`.
  Tone ids use the tone number (`zh:tone:1` … `4`), which is the tone itself, not a
  position. The generator rejects any id that is not lowercase ASCII or is repeated.
- **Stages belong to a course.** Every stage has `courseCode: 'hsk'` and the
  `hsk-3.0` framework. Foundation has `levelCode: null`; the others carry the level
  code derived from the mockup label (`HSK 7–9` → `HSK7-9`). Lessons, vocabulary and
  quests reference `zh:stage:foundation`: the mockup presents them as the level-0
  foundation (for example the tone lesson is tagged "LEVEL 0"). Roadmap groups are not
  levels.
- **Per-record extensions** hold data that belongs to one record, so nothing is joined
  by id. Pack-level extensions are only the datasets that stand alone (`zh:tones`,
  `zh:characters`, `zh:tone-exercises`, `zh:roadmap`, `zh:placement-routing`). The
  roadmap band and onboarding description sit on their stage; the band and onboarding
  names equal the stage label, so they are not repeated (the generator stops if they
  ever differ).
- **Questions** are all `kind: 'choice'`. No mockup question expects typed input: every
  one, including the fill-in-the-blank placement items, is answered by tapping an
  option, so no `typed` question was created. Placement questions keep the tier in
  `group` and the stable kind in `category`; the Vietnamese label is the
  `zh:category-label` extension. Options in the target language (Han, pinyin, digits)
  stay plain strings; options that are Vietnamese glosses are localized.
- **Quest skill labels** ("Pinyin", "Thanh điệu", …) are module UI strings and live in
  `i18n/vi.ts` as `skill.<id>`, not in the content. `i18n/vi.ts` is written by hand:
  skills, course, framework and level labels only, using the mockup wording.
- **Tones** use the more detailed foundation dataset, retaining the older descriptions,
  curves, and glosses as variants. In particular, `cây gai` and `gai` remain intact.
- The writing quest references the three characters named in its title, 人, 口, 大.
  Its `lessonIds` is empty because the source has no separate writing lesson.
- The six stroke drawings retain their 100×100 coordinates, names, and order.
  `simplifiedMockData: true` and `verified: false` preserve the source's explicit
  warning that these are simplified shapes, not real stroke-order data. The
  extension schemas accept either boolean, so verification can change without a
  schema change.
- Lesson HTML was replaced with plain instructional blocks and target-language
  examples. UI controls, audio buttons, rendering, progression, and scoring are
  excluded. No lessons for higher levels were created.
- One sentence was edited to remove a layout reference: "Bạn có thể viết thử hai chữ
  ngay bên dưới." (in the pinyin lesson, pointing at a control placed below the text)
  became "Bạn có thể viết thử hai chữ u và ü." Every other string is verbatim.

## Checks

`test/content.test.ts` validates the pack with `validateContentPack` and the module's
extension validators in one call, audits it with `checkContentHygiene`, reconciles each
dataset with the counts above, and checks that every localized and target-language
string occurs verbatim in the mockup file its record cites (the one edit above is the
only exemption).

## Re-extraction

Run `node languages/zh/scripts/extract.mjs` from the repository root. It parses
literal data using TypeScript's AST and rejects nonliteral expressions. It never
executes mockup JavaScript. All writes stay under `languages/zh/src/content`; each run
uses a fresh extraction timestamp, so update the timestamp above when re-running.
The module and its content loaders use only the committed extracted data; they do
not access `mockup/`, the filesystem, the DOM, or the extraction script at runtime.

## Curriculum records (stream D0, after the mockup extraction)

The mockup-extracted vocabulary (8), lessons (4), lesson questions (4), quests (5), assessments (3), vocabulary
variants (3) and writing samples (7) were replaced by self-authored curriculum content. Overlapping ids are kept:
`zh:lesson:pinyin`, `zh:lesson:tone`, `zh:lesson:vocab`, their quests, and the eight legacy vocabulary ids (now built
from `manifest/hsk.ts`). The mockup radical lesson and the write and radical quests are superseded by the eight side
lessons, which `foundation/side.ts` will author. Stages, placement, tones, tone exercises, characters, roadmap and
routing keep their mockup provenance (60 records, version `bc95722`).

Authored records use provenance version `curriculum-v1`, one `retrievedAt`, owner decision O1, and
`review.status: "ai-draft"`. Layout: `foundation/n1.ts` (12 main lessons, schedule table, Daily Tests, quests, days),
`foundation/side.ts` (stub), `hsk1/h1.ts` to `h4.ts` (stubs); `pinyin.ts` and `grading.ts` hold the answer modes;
`authoring-checks.ts` holds `zhCurriculumOptions`.
