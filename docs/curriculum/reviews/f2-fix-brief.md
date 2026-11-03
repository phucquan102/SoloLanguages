You are the content developer for the English module. Fix unit F2 based on the independent review.

Read first:
- docs/curriculum/reviews/f2-review.md
- docs/curriculum/authoring-guide.md (sections A and B)
- languages/en/src/content/general/f2.ts
- languages/en/src/content/general/f1.ts (the approved template)
- languages/en/src/content/answer-forms.ts
- languages/en/src/grading.ts
- languages/en/test/**

Fix every MUST FIX item (1, 2, 3, 5, and the restructure in item 4) and the minor items where reasonable.

Grader changes (shared files, keep F1 green):
- Add "here's" and "tomorrow's"/"colour's"-style 's contractions to the contraction pairs in answer-forms.ts.
- Make internal sentence punctuation between two short commands tolerant: "Please listen, please repeat" and "Please listen please repeat" must match "Please listen. Please repeat." Either do this in the default comparison, or split the item into two questions. Choose the safer option and say which.
- Narrow the case-sensitive mode: it must check only the capitalisation of the target words (I, English, weekday names, names). A lowercase sentence start must not fail. Make the targets explicit per question, for example through an extension listing the words that must be capitalised. Update F1 questions that use the mode if they need it.

Do NOT change the frozen manifest (manifest/general.ts). For "are" (owned by a1-u1), keep it out of F2 vocabIds and do not test it as a target in F2.

Add regression tests for each grader fix: the answers listed in the review must now pass, and no false accept may be introduced (for example a lowercase weekday must still fail).

STRICT FILE SCOPE: languages/en/** only. Another task is reviewing languages/zh (read-only) at the same time. Never touch packages/, tools/, languages/zh/, docs/, root files, or mockup/. Do not run npm install. No git state changes.

Verify:
- npx vitest run --root languages/en --configLoader native --pool threads
- node node_modules/typescript/bin/tsc -p languages/en/tsconfig.json

Final message: a finding-by-finding status table with file:line, the grader changes, test counts, and command results.
