# WI-0174 — Local integration and closeout boundary

- Integration Owner: Mog (`agent-mog`)
- Accepted source candidate: `3cd0e55489be856854105497182d5d7514d3dd06`
- Stack base: WI-0173 local closeout `6d3a87b8b1742ab9096282ac557474452b1c8c5d`
- Main inspected at `44a1c9fc23efa067dcbe1f47beadb6f1b1ed64c8`; this work does not change it.

## Evidence join

The final full suite passed 481/481 with no skips, in 79,979.148 ms. Independent QA separately passed 19/19 and recreated the audit-persistence fault in an isolated fixture, confirming exact Work Item restoration. See `developer-verification-v2.md` and `independent-qa-v2.md` in this directory. Developer Rikku and Independent QA Lulu are distinct identities. Source, tests, docs, distribution files, installed schema and lock match the exact candidate; later changes are lifecycle and evidence records only.

The first candidate's QA failure remains in `independent-qa.md`. WI-0174 itself demonstrated the new same-scope return: the failed worker was ended explicitly, the original candidate and gates were retired, and a new claim, handoff, tests and QA were recorded under the same Work Item ID. There is no candidate-specific unresolved defect after the corrected review.

Final organizational closeout is `done` / `accepted` on the tested source SHA. Both runtime attempts are terminal, the claim is released, and the rebuilt plan has no dispatchable or active worker. Doctor separately passed **37 checks, 0 warnings, 0 failures**. After evidence-only closeout changes, `npm run verify:fast` passed **52/52** (1,140.564 ms); the complete suite was not repeated for those evidence-only changes.

## Limits and retained work

- Caught audit errors are compensated; abrupt termination and a second rollback I/O error are not crash-atomic guarantees.
- Real multi-person/multi-machine validation and measured Token or latency benefits are not established here.
- The general `work-item configure` parser can silently accept unsupported flags such as `--affected-path`. The new rework dispatcher rejects unsupported options, but general CLI option validation remains a separate follow-up.
- First-use/recovery and comparison work remains owned by the other control task. Its branch has historical Work Item/ADR number collisions with main and must be reconciled before integration; do not overwrite existing records or reopen a frozen comparison implicitly.
- Owned-process cleanup remains a later bounded improvement. No generic process kill or branch deletion was performed.
- This is local organizational closeout only. No push, merge, npm publication or external release is authorized by this record. Both WI-0173 and this stacked WI-0174 remain available for explicit integration review.

## Rollback

Before integration, retain the source branch and leave main unchanged. If integrated later, revert the feature commits while preserving the historical QA/rework evidence. Do not restore retired evidence into current gates or rewrite old Work Item history.
