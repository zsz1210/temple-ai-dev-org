# WI-0237 R1 Quality Evaluation re-review

Outcome: **PASS for the bounded R1 correction on
`e88f3274645b497b08d1a359e7617247791a25c4`.** The missing-record counterexample is
resolved. No other confirmed defect was found in this re-review. This is Test/Eval
evidence, not formal Independent QA, a lifecycle transition, or release approval.
The original [failed review](independent-review.md) remains unchanged and is not
reclassified as a passing review.

## Identity and candidate provenance

- Reviewer: Lulu (`agent-lulu`), `quality_evaluator`, Principal `human`, resolved
  from project assignments and the active WI-0237 Test claim.
- Claim: `claim-20260907111455-9bf1a383`; worker:
  `worker-20260907111455-30fe8c80`; attached runtime:
  `/root/wi0237_r1_review`. The claim remains with the coordinator for handoff.
- Exact candidate: `e88f3274645b497b08d1a359e7617247791a25c4`; rejected predecessor:
  `3cb439c55edf213acab9a144e6791a7109ec00fb`; branch:
  `codex/evaluation-reliability-review` in `temple-wi0237-reliability`.
- Runtime: Node.js `v24.20.0`, macOS arm64,
  `/opt/homebrew/Cellar/node@24/24.20.0/bin/node`, 2026-09-07 UTC.
- Before testing, HEAD matched the candidate and there was no working-tree diff
  from it under `scripts`, `test`, `src`, package manifests, or `temple.lock`.
  Concurrent changes were coordinator-owned records, reports and generated views.
  Reviewer writes are limited to this report and the named worker's CLI status.

## Code inspection

The complete behavioral delta from the rejected predecessor is two added lines
and one removed line in `scripts/continuity-fixture.mjs`, plus seven added lines
in `test/continuity-fixture.test.mjs`.

At the final presence loop, record-descendant mode now iterates `deliveryTree`
and requires every committed delivery file on disk. This includes records added
after the product revision. The preceding walk still validates existing files'
bytes and safety constraints; the new loop covers files that the walk cannot see
because they were deleted. With no delivery tree, the original product-tree and
bookkeeping conditions remain in place. This inspection explains the correction;
the execution below supplies the observed behavior.

## Fresh offline runtime evidence

Command run from the candidate checkout:

```bash
node --test --test-name-pattern='real claim' test/continuity-fixture.test.mjs
```

Captured result: exit 0, **1 passed, 0 failed, 0 skipped, 0 cancelled, 0 todo**;
`11665.050209` ms total reported duration. The focused test uses the real installed
claim, product-test and finish CLI, commits a separate delivery revision, and
accepts the intact product against 46 oracle cases. It also retains the legacy
exact-HEAD rejection and the existing product/test drift, missing/stale committed
evidence, arbitrary artifact, changed scope, foreign event, dirty evidence and
unrelated-history negative controls.

The five new isolated, uncommitted deletions each rejected with `missing-source`:
candidate-citing evidence, Work Item, events, handoff, and finish receipt. These
are assertions within the one focused test, not five separately counted tests.
An initial invocation's result was lost to combined tool-output truncation; only
the captured rerun above is counted as evidence.

An additional reviewer subprocess imported the exact candidate's fixture helpers,
created a fresh changed-spec pair, and ran `recordContinuityControl(pair)`. The
intact copy passed all 46 oracle cases. Two separate copies then supplied controls
beyond the Developer's five assertions:

| Uncommitted deletion | Expected | Observed |
| --- | --- | --- |
| `.ai-org/views/status.md` | Reject absent delivery view | `missing-source` |
| Entire `.ai-org/artifacts/WI-0001` directory | Reject absent delivery records | `missing-source` |

Each call used
`assessContinuityCandidate(copy, pair, 'temple', control.revision, {allowRecordDescendant:true})`
and asserted the rejection reason. Subprocess exit 0; **2/2 negative controls**;
`6054.701625` ms measured duration. Synthetic product revision:
`3c4bad0140b51889e45585c71cbbac460077f83a`; synthetic delivery revision:
`66e74a363b536b89bd70f47c24f6fddb5deef408`. These are generated test inputs, not the
reviewed repository revision. The exclusively created temporary copies were
removed after execution; no user data was removed.

## Acceptance and evidence boundaries

| Approved claim | Evidence and limit |
| --- | --- |
| Real record-only descendant, unchanged product, and negative controls | Fresh focused run and two reviewer deletion controls above resolve R1. The default exact-HEAD rejection still passes. |
| Native shell observations and typed continuation decisions | The prior review's 41-test offline run covered these paths, whose source/tests are unchanged by R1. The corrected candidate also has fresh Developer full-suite evidence. This re-review does not claim a new native provider run or independent rerun of every unchanged path. |
| Required-input audit | The fresh focused run reproduced 27,200 instruction bytes, 1,400 product-fact bytes, 74,626 selected-body bytes, 103,664 optional-entry JSON bytes, 4,827 compact-navigation JSON bytes, and 20,526 lock bytes. It reported no generation/mutation and null provider Tokens, actual read sequence and treatment effect. |
| Historical results retained | The candidate diff from `f61f755d` has no changes to WI-0234/WI-0236 artifacts or `scripts/continuity-codex-adapter.mjs`. R1 changes no model, gate, workflow profile, or historical outcome. |
| Complete final-candidate verification and comparison decision | [R1 Developer evidence](verification-r1.md) records `npm run verify`, exit 0, 763/763, no failures/skips/cancellations/todos, `168762.120917` ms. This is Developer provenance, reused for the exact unchanged behavioral bytes under the testing policy; this reviewer did not rerun the complete suite. The [report](report.md) explicitly concludes no-go for another live comparison and makes no efficiency-improvement claim. |

The report's byte counts are input inventory, not provider Token attribution,
proof of reading, or demonstrated delivery improvement. Its no-go is consistent
with the [approved stop criteria](design.md): no justified new treatment was
identified. Offline controls and simulated observations do not establish live
provider qualification, statistical efficiency, production safety, or release
readiness.

Next action: the coordinator may use this exact-candidate report for the assigned
Test/Eval work under the normal gates. Formal Independent QA and Release Gate
remain unperformed. No source/test edit, model experiment, install, commit, PR,
merge, or release operation was performed by this reviewer.
