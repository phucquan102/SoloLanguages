# English curriculum pilot

F1 is fully authored for Vietnamese learners. F2, A1-U1–U4 and IELTS I1–I4
are unit records with empty authoring collections. Each unit file exports
`unit`, `lessons`, `quests`, `assessments`, `days`, `tests`, and the same object
as its default export. Course barrels assemble those files in curriculum order.

## Sources and review

The two frozen manifests are the sole dictionary source: 228 general entries
and 123 new IELTS entries. IELTS reuses the 87 general ids in its manifest;
the dictionary never duplicates them. `vocab.ts` has one builder. It copies
headword, IPA and glosses without changing the manifests. For authored words,
translated examples come from their introducing lesson's example blocks.
Future dictionary entries have no examples or stage assignment until their
introducing lesson exists. A manifest's `exampleHint` is a planning hint,
not a reviewed, translated example.

`authored(file, declaration, item)` records the actual repository-relative
authored file, version `curriculum-v1`, owner decision O1's proprietary licence
and attribution, and the fixed run timestamp `2026-11-03T09:00:00.000Z`.
Every authored record, including nested questions and edited onboarding
vocabulary records, has review status `ai-draft`, no reviewer roles, and date
`2026-11-03`. Dictionary provenance points to the manifest that authors its
headword/IPA/gloss; lessons and their derived quests/tests point to the unit file.
Retained extraction records keep their original provenance and timestamp.

## F1 inventory

| Lesson slug | Examples | Choice / typed | Introduced words |
| --- | ---: | ---: | --- |
| f1-alphabet-a-m | 6 | 4 / 4 | alphabet, letter, English, learn |
| f1-alphabet-n-z | 6 | 4 / 4 | spell, name, surname, how |
| f1-greetings | 6 | 4 / 6 | hello, hi, goodbye, please, thank you, sorry, yes, no, nice, meet |
| f1-my-name | 6 | 4 / 4 | my, your, what, I, you, am, is |
| f1-numbers-0-20 | 6 | 5 / 5 | zero through twenty (21 words) |
| f1-numbers-phone | 6 | 6 / 4 | thirty, forty, fifty, sixty, seventy, eighty, ninety, hundred, phone, number |

Totals: 56 introduced words, 36 translated examples, 54 practice questions
(27 choice, 27 typed), 30 independent Daily Test questions.

| Day | Main lessons | Test split | Typed | Review |
| --- | --- | --- | ---: | --- |
| 1 | alphabet-a-m + alphabet-n-z | 4 / 3 / 3 | 5 | same-day retrieval; no earlier day exists |
| 2 | greetings + my-name | 4 / 3 / 3 | 5 | day 1 vocabulary |
| 3 | numbers-0-20 + numbers-phone | 4 / 3 / 3 | 5 | days 1–2 vocabulary |

Each day has two main lesson quests (10 XP each), one optional shadowing
activity (10 XP) and a Daily Test quest (20 XP on the first pass that day).
Daily Tests require .85: with ten equally weighted questions, at least nine
correct answers pass. The shared authoring XP constants also reserve 30 for
future unit checkpoints and 0 for repeats/review quizzes; this pilot contains
three Daily Tests, as requested, and no checkpoint.

The `en:test-policy` quest extension links a Daily Test to its two prerequisite
quests and declares first-pass/repeat rewards. Test quests are separate from
`Day.mainQuestIds`, which contain exactly two lesson quests. `en:activity`
holds the side quest instructions. These extensions have validators and
module tests for references. Runtime unlocking and XP accounting belong to
the later quest engine; this pack supplies the policy data.

## Early-course review

The D-3/D-7 review slots do not exist at the start of the course. Day 1 uses
same-day retrieval in its three review slots; day 2 uses D-1; day 3 uses D-1
and D-2. Lesson 4 is on day 2, so its earliest available review is day 1.
From day 3, lessons can review material two days old. This is the startup
interpretation of the plan's spaced-review targets, not a claim that those
intervals already exist.

All day 1 words are genuinely revisited on later days, including lesson 4
and lesson 5. All day 2 words are revisited on day 3. Review ids are backed
by review questions; listing unrelated ids is not used to satisfy recycling.
The pilot curriculum test uses `truncateAtScheduleEnd: true`; remove it when
the general course schedule is complete. A negative test confirms that
truncation still rejects missing recycling when later days exist.

British spelling and broad British IPA are the default. F1 has no words
whose British and American spellings differ. The shared `acceptedForms`
helper expands manifest American variants and optional final punctuation;
tests cover colour/color, favourite/favorite and per cent/percent for future
units. Explicit accepted answers cover contractions, curly apostrophes via
the module normalizer, and common spelling separators. No global grading
normalization was changed; wrong grammar and missing leading phone zeros
remain incorrect.

## Replacement and retention

- Replaced all six extracted lessons/quests and their six practice questions;
  the plan's six F1 slugs supersede the old sample slugs.
- Replaced the three copied assessment questions with 30 new Daily Test
  questions, using distinct prompts and transfer tasks.
- Replaced the 13-word extracted dictionary and its source variants with
  manifest records. Preserved overlapping ids hello/name/book/student/learn.
  The eight advanced sample headwords outside the manifests are removed.
- Kept all 11 stage ids and their course/framework/level/order mapping.
  Authored the Foundation, A1 and IELTS Foundation stage labels and provenance;
  later stages retain their extraction provenance. IELTS belongs to course
  `ielts`, never CEFR; the 7.5+ route retains band 7.5.
- Kept all 12 placement questions, categories, groups and answer keys.
- Kept six onboarding orientation tiers and their general-course routes.
  The C1 tier still has no IELTS stage link. Advanced vocabulary previews are
  now null because their words are outside this curriculum's manifests; their
  edited nested records carry authored provenance and draft reviews.
  The A1 preview still references hello/student. Legacy extension parsers for
  source variants and source-question links remain tested for compatibility.

## Editorial review priorities

- Confirm all hypothesised learner mistakes with teachers; none is presented
  as an empirically established error frequency.
- Native EN: letter-name IPA (especially G/J, E/I, R and Z), naturalness of
  name/surname fields and greeting exchanges, phone zero/oh conventions,
  and the distinction between isolated -teen/-ty stress and connected speech.
- Vietnamese editor: register of greetings, “Yes, please” in context,
  clear descriptions of spelling, surname order and /θ/ articulation.
- Both: workload for the frozen 21-word number lesson and the grouped number
  tasks; whether the startup review intervals suit complete beginners.
- Audio review: text/IPA and optional browser speech are illustrative only.
  The listening-labelled lessons do not claim validated audio comprehension.
- Verify the deliberately limited formula support before its grammar lessons:
  do/you in “How do you spell ...?” and to/you in “Nice to meet you”.
  The example-load test counts these explicitly taught chunks as support,
  excludes letter symbols/example names, and caps unfamiliar words at 10%.
- Review vocabulary IPA/glosses for all future units separately. Their presence
  in the dictionary does not mean those units are authored or approved.

No third-party textbook, exam question or descriptor has been copied. The
release gate is intentionally closed: automated checks cannot approve drafts.
