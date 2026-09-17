# WI-0249 bounded independent Test/Evaluation

## Candidate and provenance

- Framework candidate: `360b1b86266692aadda590b18419d3c3f004c352`.
- Comparison base: `1bbb14bdbe78e27c13a934615eedef163c9b4f22`.
- Branch: `codex/finish-physical-product-check`.
- Position: `quality_evaluator`; resolved Identity `agent-lulu`, Principal `human`.
- Developer Identity: `agent-rikku`.
- Active claim: `claim-20260917160948-3e6c3915`.
- Prepared worker: `worker-20260917160948-5466d2ac`.
- Runtime: local macOS, Node.js `v24.20.0`; offline disposable Git/CLI fixtures.
- Authority: current Work Item and `design.md`; effective workflow/risk are Standard.

The exact HEAD matched the Developer candidate. A post-test
`git diff --exit-code 360b1b86266692aadda590b18419d3c3f004c352 -- src test docs/operations/lean-finish-recovery.md`
exited 0; source, fixtures, and scoped operator instructions matched that candidate.
Organization state/evidence edits were present and are not product modifications.
`git diff --check` also exited 0 before this report was added.

## Acceptance-derived runtime checks

The primary risk is successful terminal acceptance of changed or missing product
whose Git index flags conceal the working tree difference. The selected matrix
checks both completion actors, both index flags, read-only preview, exact-plan
apply, refusal without canonical writes, and restored unchanged controls.

Command:

```sh
node --test --test-name-pattern='Finish (Verifier|Developer) rejects hidden product drift under|Lean finish Verifier matches individual operations|Direct deliver also rejects hidden product drift' test/lean-finish.test.mjs
```

Result: exit **0**, **6 passed**, 0 failed/cancelled/skipped/todo,
**56,395.192834 ms** total runner duration. The six selected cases were:

| Executed case | Duration (ms) | Result |
| --- | ---: | --- |
| Verifier individual-operation equivalence, preview and historical replay | 12,098.731792 | pass |
| Developer hidden change/missing file, assume-unchanged | 8,508.428292 | pass |
| Developer hidden change/missing file, skip-worktree | 8,853.149584 | pass |
| Verifier hidden change/missing file, assume-unchanged | 11,424.136959 | pass |
| Verifier hidden change/missing file, skip-worktree | 11,372.030083 | pass |
| Direct deliver hidden drift without canonical writes | 3,695.609875 | pass |

Unchanged flagged controls passed and preserved the flags. Both altered binary
content and deletion were rejected despite empty scoped Git status. The matrix
checked canonical bytes, absent pending journals/diagnostic records after refusal,
and final `test` (Developer) or `done` (Verifier) only after restoration.

## Independent functional failure and post-completion replay probe

A separate inline Node assertion harness imported the existing
`test/helpers/lean-delivery-fixture.mjs` fixture and invoked the candidate CLI.
It used a fresh isolated repository, completed Developer delivery, claimed the
exact fixture revision as Verifier, and configured only synthetic fixture policy
and evidence. Its generated product candidate was
`441b02bf5ab23122c3acb519e521b785ccc3385a`; this is separate from the framework
candidate above.

1. `node --test app.test.mjs` passed (exit 0).
2. Set `git update-index --assume-unchanged app.mjs` and replaced its contents with
   `export function parseCount(value) { return 0; }`.
3. The actual product test failed (exit 1, assertion `0 !== 12`) while
   `git status --porcelain -- app.mjs` was empty.
4. Verifier `work-item finish` exited 1 with
   `Temple error: Product scope changed: actual bytes or mode differ from candidate`.
   The Work Item remained `test`; all canonical fixture bytes matched the
   pre-refusal snapshot.
5. Restored original bytes. The product test passed (exit 0); the identical
   completion request returned `success: true` and the Work Item became `done`.
6. Reintroduced the same functional failure (product test exit 1), then replayed
   the already completed request. It returned `status: already_applied`,
   `success: true`, `diagnostics.historical: true`, `next_stage_ready: false`;
   canonical bytes remained unchanged. This confirms that historical success
   must not be interpreted as fresh product acceptance.

All harness assertions passed; process exit 0; measured harness elapsed time
**12,145.211083 ms**. This was an independent assertion harness, not an additional
counted `node:test` case (its imported helper printed a zero-test footer).
The fixture was cleaned up. No external service or production data was used.

## Code inspection and boundaries

Code inspection, separate from runtime results, confirmed the physical checker
is shared from `src/lean-delivery.mjs`; recovery imports and awaits it. All three
`assertCandidate` callers await it: ordinary preparation, workflow preparation,
and completion snapshot validation. Journal application validates before writes;
finish validates snapshots before and after diagnostics. The physical check
compares raw blob hashes, executable mode, and literal scoped inventory.

Passed diagnostic receipts still return historical results before fresh snapshot
validation, consistently with the explicitly preserved receipt contract. The
runtime post-completion probe above verifies that limit rather than assuming
every successful replay rechecks product bytes.

No failure was found in this bounded independent evaluation. Interrupted-journal,
diagnostics-time drift, directory inventory, unsafe links and recovery controls
were inspected in the existing tests and Developer report; this evaluator did
not independently rerun those cases. Workflow-stage routing was inspected but
not independently exercised here. No hostile concurrent-filesystem guarantee,
checkout transformation support, whole-repository scope, live provider behavior,
multi-machine behavior, or release approval is inferred.

## Decision and remaining gate work

**Pass for the bounded checks above. Full acceptance remains pending** the
integration owner's join of the exact-candidate `npm run verify` result and the
separate Independent QA responsibility. The Developer's reported 60/60 focused
suite result is supplementary evidence, not this evaluator's own measurement.
The full suite was already running under the parent; it was not duplicated.

This report does not declare formal Independent QA, record a lifecycle transition,
or approve release. Next owner: integration owner to join the complete local
verification result, then route the remaining Standard gates with exact evidence.
