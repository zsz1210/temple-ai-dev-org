# WI-0229 corrected candidate verification

Candidate: `e9c9ade27195923efcd7f58b2735a1dace193e5a`.
This supersedes the acceptance suitability of [report.md](report.md), not its
historical observations. [qa.md](qa.md) retains the rejected candidate and cause.

## Repair

The exact managed ownership check now requires the real `managed_files` array
and compares its entries' `path` fields. Missing or malformed inventories reject.
The regression preserves the installed array format and directly asserts the
managed-content error before checking that CLI rejection leaves canonical state
unchanged. It cannot pass merely because the edited lock is dirty or Doctor fails.
The reviewer source-rechecked this repair and found no remaining narrow blocker.

## Fresh verification

Developer ran `npm run verify` on Node.js 24.20.0 at the exact candidate:
**712 passed, 0 failed, 0 skipped, 0 cancelled, 0 todo**, 71 test files,
175766.686709 ms. Repository and documentation checks passed. Package boundary:
415 files, 895603 bytes packed, 3510029 bytes unpacked.

The earlier focused ownership regression passed 1/1 in 2823.1335 ms. The complete
run includes all 14 mechanical completion tests and the existing temporary
init → Doctor → Status → idempotent re-init test, normal Lean distinct-Verifier
checks, upgrade preservation and recovery regressions. Formal independent
acceptance remains separately recorded by the reviewer.

## Scope and disposition

The original opt-in, exact-text, Solo/low-risk and no-Independent-QA-claim limits
remain unchanged. The feature is not enabled in this repository; no Skill or
initialization default changed. No live generation, publication, dependency
installation, Credits or reset occurred. No Token-efficiency claim is made.

The initial rework command safely rejected because the reviewer claim had already
been released. The local repair was applied before that error was collected;
ownership was then reconciled by reacquiring the reviewer claim, using supported
same-scope rework and acquiring the Developer claim before committing the new
candidate. No canonical JSON was manually rewritten and no guard was bypassed.
