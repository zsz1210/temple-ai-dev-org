# WI-0192: Local measurement repair

## Delivered boundary

This is a separate experiment-local successor, not a change to the sealed WI-0191 run or Temple's runtime. It is intentionally unable to execute live subjects. `runner.mjs run` rejects immediately before reading an approval or contacting a provider. The inherited model/limits in protocol.json are historical design inputs, not a new proposal or approval.

- Stop classification now separates observed out-of-scope writes, explicit runtime stops, missing helpers and other incomplete provider results.
- A failed native spawn closes its tool record without inventing a child, allowing parent terminal observation. Installed-schema review corrected the original mocked error-code assumption: bounded agentsStates statuses and message hashes are retained, while root-cause categories remain unknown. See provider-contract-review.md.
- A safely blocked response without helper findings is unmeasurable rather than proof of false acceptance or incorrect TTL logic. Explicit acceptance and actual lifecycle/write violations remain failures.
- Normal-case evaluator tests now emit a structured command-array receipt with output digest and exit status. This proves an evaluator rerun, not subject execution. The existing narrow subject-command observation remains separate and unknown for unrecognized wrappers; no shell-text heuristic can turn a claimed command into execution evidence. Grading consumes the receipt rather than rerunning the same tests twice.
- Both finish arms now create and run app.test.mjs plus added.test.mjs before recording a candidate. The stale arm then introduces only the intended source drift and failed diagnostic. Native test runner children clear inherited NODE_TEST_CONTEXT and assert two executed test files, preventing nested-run skips from appearing successful.
- Exact original authorization bytes are archived with their execution-time hash. The unchanged approval's historical reference is explicitly mapped by authorization-archive.json. The English Markdown rendering grants no authority and cannot replay the spent approval.

## Local evidence

Focused command: `node --test .ai-org/artifacts/WI-0192/measurement.test.mjs`.

Result: 11/11 passed in 13.58 seconds. It constructs all four actual before/after current/stale receipt fixtures, verifies both test files execute, checks applied receipt/diagnostic outcomes, exercises missing-helper grading, preserves failed-spawn terminal tracking, and verifies the eight frozen original files against candidate 85beb7acef3c3f9d8fe2678a66f3c3b10c45b2dd. No model calls were used.

Full `npm run verify`: 632/632 passed in 154.42 seconds; repository, documentation and package checks passed. The framework suite does not discover hidden artifact tests, so the 11 focused tests were run separately on the final successor code. Final publication checks were rerun after report edits. These are Developer checks, not Independent QA or live provider compatibility evidence.

## Remaining work before another live comparison

The root cause of WI-0191's historical spawn rejection is still unknown because its raw provider error was not retained. Do not infer quota, model incompatibility or a Temple defect. The successor's error capture and native cancellation/subscription behavior still need exact installed-provider contract review. Missing helper and injection scenarios remain untested live.

A future protocol must name the changed primary metric explicitly: evaluator-verified product outcome is separate from whether the subject performed its prescribed test command. It must also define mandatory receipt findings separately from optional broader product audits. These changed fixtures/metrics cannot be pooled with the sealed observations as an unchanged experiment. Fresh review and applicable human budget approval must precede enabling the run entrypoint.

No framework policy tuning, extra model run, merge or release is part of this repair.
