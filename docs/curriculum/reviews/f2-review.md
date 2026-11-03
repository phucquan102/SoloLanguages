# F2 content review (Claude Sonnet) — FIX FIRST (no blockers, 5 majors)

Line numbers refer to languages/en/src/content/general/f2.ts. Grader probe: scratchpad/f2probe.mts.

MAJOR
1. a/an by sound barely practised (95-124, 534-550): "umbrella" is the only "an" noun in practice; "a U" only in example/mistake, never in a question; the Day-4 test has one a/an item (an M), the other lesson-a items (your notebook, my umbrella, a chair / a window) do not test the rule. Fix: add letter-name items from F1 (an F / an L / an H / a U / a B) to lesson 1 and the Day-4 test; replace the "your notebook" item (538).
2. Lesson 2 never makes the learner choose this vs that (176-187): typed items answer "It is a chair/door" (tests "it"); distance tested by two choice items only, one a plain translation (172). Fix: typed "This is a …" / "That is a …" items where distance decides the word, plus a choice item on distance alone.
3. Vietnamese prompt does not match key (559-562): "Có một chiếc ô ở đây" = "There is an umbrella here" but key is "Here is an umbrella." Milder at 185, 264. Fix: reword (e.g. "Bạn đưa chiếc ô cho bạn, nói: Đây, một chiếc ô") and accept "Here's".
4. F1 number review is real but bolted on (125-139, 188-202): 6 of 20 lesson questions are 8–11-word number drills unrelated to the lesson topic, repeated in the Day-4 test; violates guide A12 (review in a new context). Fix: one contextual item per lesson (e.g. "ba mươi hộp, mười bốn quyển sách…").
5. Grader false rejects:
   - "Please listen please repeat" / "Please listen, please repeat" rejected (332) — internal full stop significant. Split into two questions or add accepted variants.
   - "Here's my pen" / "Here's an umbrella" / "Here's my green notebook" rejected (185, 559, 264). Add "here's" to contraction pairs in answer-forms.ts.
   - "Tomorrow's Monday" (465), "What colour's your notebook?" (258) rejected (minor).
   - Case-sensitive items (462, 467, 487, 642, 651) reject a lowercase sentence start ("open the white boxes on Tuesday") — beyond the weekday-capital target. case-sensitive mode should check only the capitalisation of I, English and weekday names (the objective), not sentence-initial capitals.

MINOR
- 352-357: final-s sounds (books /s/, pens /z/, boxes /ɪz/) not taught; Vietnamese learners drop final s. Add a tip and a real "two book" error; the mistake block bundles three errors.
- 78: "âm y" ambiguous → "âm /j/ như y trong 'yêu'".
- 96, 100, 104, 109, 113, 117, 233, 238, 243, 247: labels "một bút / một sách / một cặp" lack classifiers → chiếc/quyển as in examples.
- 122 ("umbrella a"), 536 ("M an"), 268 ("Ha / Ha"), 406 ("Bao / Bao") implausible distractors (A4) → plausible contrasts like "a umbrella".
- 301 "Open the your book" not a typical error → "Open book" (dropped determiner). 439: add "in Monday".
- 479 "Read the colour" unnatural → "Say the colour". 270-273 use how/spell only passively.
- 460-469, 640-653: test repeats the practice frame with only the weekday changed (A13). 466 context redundant.
- "are" is owned by a1-u1 in the manifest (manifest/general.ts:166) but used in ~13 F2 items (taught as a chunk in lesson 5) [Unverified whether A4 accepts]. Fix: do NOT change the frozen manifest; avoid relying on "are" as a tested target in F2, or treat it strictly as a chunk inside a taught phrase without vocabIds.
- Workload may exceed 25-30 min on days 4 and 6 [Unverified].

PASSED: a umbrella / Phan rejected; lowercase weekdays rejected; color accepted; oh / double oh accepted in phone mode; "90 12"/"9012" rejected for "9 0 12"; no false accepts found.

MUST FIX: 1, 2, 3, 5 and the item-4 restructure. Re-run grader probes after.
