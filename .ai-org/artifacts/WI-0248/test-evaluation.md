# WI-0248 independent Test evidence

Independent Test slice: **PASS**. No repair-blocking defect was found in the
bounded recovery change. Full acceptance remains dependent on the Integration
Owner joining the full offline verification result for this exact candidate.
This report does not assert formal Independent QA, Release Gate or publication.

## Provenance and scope

- Work Item: WI-0248; Standard workflow and standard risk; stage Test.
- Position: `quality_evaluator`; assigned Agent Identity: Lulu (`agent-lulu`).
  Developer: Rikku (`agent-rikku`). Project assignments and active claim were
  inspected; attribution is self-asserted, not provider authentication.
- Claim: `claim-20260917154023-f287817b`; worker:
  `worker-20260917154023-35507fd7`; runtime: `/root/physical_recovery_test`.
- Exact Developer candidate: `0c1c6f1cc999bcf50a8d8ae0e1e89fe05b991ed7`;
  branch: `codex/readme-alpha33-onboarding`.
- Runtime: Node.js `v24.20.0`, macOS (`darwin`), ARM64.
- Reviewed delta from `e8bb015b5c5ad9c6af55af8af3942c9d676bedaf`:
  recovery module, regression tests and operator guide. Read approved
  `design.md`, Developer evidence and the original recovery implementation.
- Candidate remained HEAD before and after tests; scoped files had no Git diff.
  A separate raw-byte Git-blob computation confirmed candidate equality:
  recovery module `ca0ac390d2aba707abd878cedb3cd646dece14f1`, regression tests
  `b385b39664ebe34c4c8b9f5af91dc04200180bc5`, operator guide
  `1266ee2d15f788576fd31b4e29c97aed545d31d8`.

## Runtime evidence

`node --test test/lean-finish-recovery.test.mjs` exited 0: **16 passed,
0 failed, 0 cancelled, 0 skipped, 0 todo**, duration 78,833.309792 ms.
The run used local temporary Git repositories and real filesystem mutations;
it was an independent rerun, not copied Developer output.

Acceptance and risk coverage observed in that run:

| Requirement or risk | Observed result |
| --- | --- |
| Changed or missing product under either Git index flag | Preview and apply reject; canonical bytes and failed diagnostics retained |
| Unchanged flagged product | Recovery reconciles and preserves the flag |
| Hidden change during diagnostics | Post-diagnostics check rejects settlement |
| Literal names, binary files, executable mode, ignored additions | Unchanged binary with tabs/newlines in a literal directory succeeds; mode drift and ignored file additions reject |
| Leaf and ancestor symbolic links | Unsafe paths reject |
| Existing recovery boundaries | CLI fingerprint, actor, approval, state, policy, journal, receipt, evidence, resource, crash-resume and unrelated-runtime guards pass |

Three additional tests were executed through `node --input-type=module` using
the candidate's existing `cachedFixture`, finish/recovery functions and project
mutation lock. They exited 0: **3 passed, 0 failed, 0 cancelled, 0 skipped,
0 todo**, duration 22,429.883042 ms. Fixtures were cleaned by their registered
cleanup hooks. No repository source or test file was changed.

1. For `--assume-unchanged`, create a failed-diagnostics handoff, flag `app.mjs`,
   preview, then append hidden bytes at recovery's `after-artifact` checkpoint.
   Apply rejects with `Product scope changed`; diagnostics remain `failed` with
   no recovery binding. The retained artifact grants no acceptance. Preview also
   rejects until original bytes are restored; identical-fingerprint retry then
   reconciles.
2. Repeat that entire settlement-boundary probe with `--skip-worktree`:
   the same rejection, retained failure and successful restored retry occur.
3. Scope a committed binary under `product/`, preview, then add an ignored file
   inside that directory. Git status reports no scoped change, but apply rejects
   with `Product scope changed`. Canonical bytes remain equal, diagnostics remain
   `failed`, and no recovery artifact exists.

`git diff --check` also passed. This is a formatting/code check, not runtime
acceptance evidence. The separate parent `npm run verify` result was not yet
available when this report was authored and must be joined explicitly.

## Evaluation and limits

The new raw-blob and filesystem inventory comparison directly addresses the
reproduced index-flag bypass. Source review confirms every preview performs it,
including apply's initial, post-diagnostics and pre-settlement previews. Existing
guards remain in place. The operator guide accurately describes the bounded
route and raw-byte requirement.

Raw-byte mismatch from content transformations and unsupported entries fail
closed. Symlinks, submodules and nonregular entries are intentionally unsupported;
this is not a newly accepted bypass. Runtime evidence covers symlinks, binary
bytes and ordinary SHA-1 fixtures. No separate SHA-256 repository, submodule,
FIFO, huge-tree or hostile concurrent-filesystem test was executed. Code review
alone does not qualify those environments. The checks are local consistency
checks, not protection against an actor able to rewrite all repository state.

Pre-existing D1 remains a nonblocking diagnostic-quality limitation: malformed
unrelated worker data can trigger a raw status-renderer TypeError before Doctor.
The earlier WI-0247 report established fail-closed behavior; that D1 probe was
not rerun here and its historical result is not counted among these 19 tests.

Ordinary `work-item finish` is unchanged and outside this repair. The related
concern about Git-hidden product changes in that path remains unqualified by
this report; successful recovery testing must not be generalized to ordinary
finish. No live recovery, external provider call, merge, release or publication
was performed. Next owner: Integration Owner joins the full exact-candidate
verification before advancing the required Eval and Independent QA gates.
