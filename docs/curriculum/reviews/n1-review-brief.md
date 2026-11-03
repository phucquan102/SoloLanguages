You are an independent senior reviewer on the team. You know Mandarin Chinese, pinyin orthography and Chinese pedagogy for Vietnamese learners.

READ-ONLY: do not modify any repo file. You may run read-only node/tsx probe scripts if you put them in a temporary folder  .

Another model (Claude Sonnet) built the Chinese module structure and authored the pilot unit N1 (12 Nen tang lessons). It will become the template for about 44 more Chinese lessons, so flaws here multiply.

Read:
- docs/curriculum/authoring-guide.md (sections A and C)
- docs/curriculum/plan-foundation-level1.md (sections 2c, 3, 7)
- languages/zh/src/content/foundation/n1.ts
- languages/zh/src/pinyin.ts
- languages/zh/src/grading.ts
- languages/zh/src/content/authoring-checks.ts
- languages/zh/test/content/curriculum.test.ts
- languages/zh/test/grading.test.ts
- languages/zh/src/content/manifest/hsk.ts

For comparison, the approved English template is languages/en/src/content/general/f1.ts.

Review and report concrete defects with file:line:

1. Chinese accuracy:
   - pinyin orthography: tone-mark placement, iu/ui/un, ü after j/q/x/y, y/w rules, apostrophe
   - tone descriptions
   - neutral tone
   - third-tone sandhi and bu/yi sandhi (verify each sandhi answer: zhánlǎn, méihǎo, shuíjǐng, yúsǎn, yónggǎn, láoshǔ, xiángfǎ, yí bàn, yí cì)
   - readings and glosses of every example hanzi, polyphones in particular
   - Han-Viet statements
   Mark anything you are not sure about as [Unverified].
2. Pedagogy for Vietnamese learners:
   - articulation analogies (b, p, d, t, zh/ch/sh/r vs z/c/s, e, ü, -n/-ng): helpful or misleading?
   - every task requires the target skill rather than copying
   - exactly one correct answer per question
   - distractor plausibility
   - Daily Tests use new surface forms
   - workload of about 26 min/day
3. Grading:
   - probe gradeAnswer on realistic learner inputs: "ni3 hao3", "nǐhǎo", "nǐ hǎo", "ni hao" (pinyin mode → reject), "lv4", "lü4", "lu4" for lǜ, "ju4" vs "jü4", "xie4xie" vs "xiè xie" vs "xie4 xie5" vs "xie4 xie0", hanzi with and without the full-width full stop, traditional characters
   - pinyin-sandhi mode: is it clearly signposted?
   - look for false accepts and false rejects
4. Template fitness:
   - Does the structure mirror the English template?
   - Will it scale to HSK1 units (vocab-heavy, hanzi input) and to the side lessons (strokes, radicals)?
   - Is the zh:listening convention (hanzi stored for TTS, hidden until submit) sound, or should it be a schema-level field?
   - Are the generic checks really applied to all hsk stages?

Output:
- findings ranked blocker / major / minor, each with file:line and a concrete fix
- verdict: APPROVED / APPROVED WITH CHANGES (must-fix list) / NOT APPROVED as the Chinese template

Keep it under 800 words.
