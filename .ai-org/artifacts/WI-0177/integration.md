# Integration and validation report

Integration owner: Mog / `agent-mog`.
Source candidate: `c8fc420da7ef570c80419bc8ff771fddb22f45dc`.

## Result

The first instruction-correction batch is complete. Effective Lean/Standard/High-Assurance guidance matches the existing workflow, task naming uses the CLI suggestion, and known-work context starts with a bounded read-only preview. Recovery and unread/changed authority remain explicit. No lifecycle implementation, profile floor, model policy, benchmark harness, or dependency changed.

| Evidence | Result | Meaning |
|---|---|---|
| Developer focused Skill/context/workflow tests | 40/40; 26.294 s | Real CLI compatibility plus narrow instruction-contract guards |
| Full `npm run verify`, Node 24.20.0 | 492/492; 0 skipped; test phase 79.859 s | Repository, document links, package boundary, and full local regression |
| Independent QA | 3 Skill + 37 context/workflow tests passed | Separate runtime reproduced the exact candidate and reviewed boundaries |
| Doctor after replanning | 37 pass, 0 warn, 0 fail | Canonical state, managed ownership, and generated plan consistency |
| Post-closeout `npm run verify:fast` | 54/54; 0 skipped; test phase 1.104 s | Final evidence-only changes retain repository/package/link and fast-check validity |
| Candidate-source equality | Passed after organizational evidence updates | Later evidence writes did not alter tested instructions, code, tests, docs, or lock |
| Concurrent comparison preservation | Same commit, clean checkout, all three frozen digests unchanged | No mutation to the comparison lane |

The full suite includes the temporary `init, doctor, status, and idempotent re-init succeed` test, plus pending-bootstrap and checksum-preserving upgrade tests. No additional live model experiment was needed for this local compatibility check. Package dry-run succeeded: 390 files, 847,725 packed bytes, 3,341,049 unpacked bytes. It did not publish to npm.

## What is not established

- No Token or latency improvement is measured. The Skill is 1,295 bytes longer and overlay AGENTS 215 bytes longer to state formerly ambiguous boundaries. Fewer repeated reads may offset this, but only a controlled execution can establish that.
- The independent synthetic walkthrough retained sequencing imprecision and one mistaken CLI-output attribution; see `independent-qa.md`. It is not seven passing execution trials.
- The other branch's existing result is preserved, not relabeled as the exact control for this source revision. A follow-up must pin a common harness, task, model/effort, starting code, accounting, and quality criteria, changing only the intended instruction treatment. Historical results remain immutable and cannot by themselves establish causality for this patch.
- The Solo per-checkout Work Item ID collision with the comparison lane remains explicitly branch-qualified in `work-order.md`. Integrating that lane later requires deliberate history reconciliation, not replacing same-numbered records.

## Stop and follow-up

This report authorizes only the accepted organizational closeout and PR submission. Main integration, release, npm publication, broad instruction deduplication, and another quota-consuming comparison remain outside this batch. Next, review the focused PR and define the optimized comparison condition against the preserved baseline. Do not rerun or overwrite the completed comparison just to obtain a new label.
