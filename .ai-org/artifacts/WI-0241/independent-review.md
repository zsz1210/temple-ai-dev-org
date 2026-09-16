# WI-0241 independent review

Reviewer: `agent-lulu` (Independent QA / current Quality Evaluator); Developer: `agent-rikku`; Principal: `human`. Confirmed distinct active assignments in `.ai-org/project/assignments.json` and WI claim `claim-20260916045941-006ac443`. Prepared worker `worker-20260916045941-d831ca3a`, runtime `/root/doctor_compiler_qa`. Candidate `bcafc86e27b59207b0ec5ae78c5089e5c3c86b87`; baseline `d3892f6b018c006c28d6cf13590548fed9561f53`. Working implementation/test bytes matched the candidate before and after independent execution. Environment: macOS arm64, Node.js `v24.20.0`, repository-pinned Ajv `8.20.0` and ajv-formats `3.0.1`.

## Verdict

Final Independent QA judgment: **PASS for the scoped Doctor optimization on `bcafc86e27b59207b0ec5ae78c5089e5c3c86b87`**, after the complete unchanged second verification passed all 1,248 tests. This supersedes the initial pending/blocked gate judgment; it does not erase the first failed attempt. No implementation defect was found in the reviewed schema change. No source or test implementation was repaired by this reviewer. An existing intermittent Console notification timeout remains an explicitly unresolved maintenance risk; its root cause is unknown and this change does not claim to fix it.

## Independent evidence

Executed `node /tmp/wi0241-qa-probe.mjs > /tmp/wi0241-qa-probe.log 2>&1` after the parent's full-test/memory-sampling window ended; exit 0. The probe first checks HEAD and implementation bytes, then verifies that its baseline module equals `git show d3892f6b018c006c28d6cf13590548fed9561f53:src/schema-validation.mjs` with import paths as the only normalization. It calls both actual project-validator implementations, not a reimplementation of the new eligibility logic.

The probe uses 34 adversarial schema cases, reversed catalog order, two concurrent roots, replacement schema/catalog content, document-only changes and an unchanged second root. All seven complete API-result comparisons match the baseline after excluding only `generated_at` (172 schema-entry evaluations per implementation). Positive and negative results, full normalized errors, compile failures, checked-document counts and aggregate validity are compared together.

Cases include repeated root IDs with changed types, root/nested and duplicate anchors, dynamic recursive trees, unresolved anchors after another entry defined one, nested schema IDs, relative and absolute external references, empty/fragment IDs, built-in meta identity collisions and noncanonical URI variants, meta aliases/default/unknown dialects, malformed types/regular expressions/null schemas, valid compilation after failure, boolean schemas, email formats, unevaluated properties and schema-looking annotation values. Temporary fixtures were removed in `finally`.

Raw evidence for archival:

| File | SHA-256 |
| --- | --- |
| `/tmp/wi0241-qa-probe.mjs` | `ab4cc573c06e8a80f1b0f66610bc53716b7639fcc4ca54c37e83a495d03251bf` |
| `/tmp/wi0241-qa-probe.log` | `4ffe541499ec1c05ddabadb75ea9a74effc00b85fa9c5e91aaff0f49a741b1a0` |

## Source judgment and memory limits

Reuse is scoped to one `validateProjectSchemas` call. Schema and document reads, meta-schema validation, formats, semantic checks and learning validation retain their existing paths. Fallback compilers never enter shared state. Eligibility traverses even annotations; that can conservatively miss an optimization but does not expand acceptance. Registry/cache removal before each eligible compilation prevents a preceding catalog entry from supplying schema authority. Adversarial order and failure-recovery comparisons found no outcome difference.

Reviewed the pinned Ajv implementation: `removeSchema()` clears user registry/cache entries while preserving meta-schema objects, but code-generation scope retains references to previously compiled schemas/validators until the call-local compiler is unreachable. This is not immediate per-schema memory reclamation. The current lexical lifetime establishes no process-global cache; it is not a long-duration leak proof. Caller count/catalog size and concurrent processes can still affect peak memory.

The parent's retained benchmark uses eight alternating fresh processes, five Doctor calls each. Its healthy check digests match. The reported first-call and RSS medians are descriptive for that fixture/environment; unchanged post-GC live heap does not support a retained-heap reduction claim. The reviewer did not rerun those measurements or infer workstation memory ownership from this microbenchmark.

## Full-verification history and final gate judgment

Inspected `/tmp/wi0241-full.log`: 1,248 tests, 1,247 pass, 1 fail, zero cancelled/skipped, `260461.299042` ms. The failed test is `test/optional-console-collector.test.mjs:133`, `the optional Console emits a bounded refresh signal after canonical state changes`, reporting `Console refresh signal timed out` at line 147 after its 30,000 ms harness deadline. The original failure is retained in `full-attempt-1.log.gz`; it does not count as a passing run.

Read `full-retry-rationale.md` and independently checked the older WI-0230 `rework-01-independent-review.md` and `rework-02-verification.md`. They record this same Console test timeout before the current work. The unchanged focused replay described in the rationale received the actual event but was correctly not used as a replacement full gate. One bounded complete retry followed; no deadline, assertion, concurrency setting or implementation was changed to obtain it.

Independently inspected `/tmp/wi0241-full-attempt-2.log`: `npm run verify` ran repository checks and the complete suite; 1,248/1,248 pass, zero fail/cancelled/skipped/todo, `263941.670083` ms. The actual Console refresh assertion passed in `1620.052334` ms. Raw uncompressed log SHA-256: `90e64a38172d6bbfa71d5d6bde6d5c4e0e00337056ab2f6e21cd66512de44934`. HEAD remains the reviewed candidate, and `git diff HEAD -- src test scripts package.json package-lock.json .github` is empty. This complete successful run, together with the independent source/adversarial review, supports acceptance of the bounded compiler optimization.

Residual limitation: prior occurrence and an unchanged passing retry demonstrate intermittence, not its root cause or absence of a product defect. The first full failure remains visible and the Console notification issue should be investigated in a separately scoped follow-up rather than declared fixed. The reviewer accepts the Doctor change without expanding that acceptance to a Console reliability guarantee, package publication, integration or long-duration memory claim. Next owner: Release Manager/Integration Owner performs the already-authorized canonical closeout using this exact-candidate judgment and retains both verification attempts.
