# WI-0176 — Integration join

Integration Owner: Mog (`agent-mog`).
Behavioral candidate: `a59f62ce70697a5d38d588225b723d856a474844`.

## Accepted evidence

- The original false-success shutdown was reproduced with a TERM-resistant test-owned child.
- Six focused regression tests passed, including explicit inability-to-terminate failure and an unrelated responsive sibling.
- Complete offline verification passed **490/490**, zero skipped, on Node.js 24.20.0; repository, links and package boundary checks passed.
- Separate Independent QA passed 6/6 focused tests, 25/25 immediate-close race probes and 20/20 pending-timeout cleanup probes. No acceptance finding remains open.
- Fast checks passed 52/52. The source/test diff from the behavioral candidate is empty; subsequent changes are lifecycle records and evidence only.

## Boundary

The user authorized push and PR submission after passing checks. Organizational go does not authorize this PR's merge, release or npm publication. Rollback is reverting the implementation commit while preserving historical evidence.

The fix owns only the ChildProcess created by the RPC helper. Descendant cleanup, parent crash recovery, arbitrary Node cleanup and live-provider validation remain outside this slice. No existing Codex, AiPet, model server or unrelated service was stopped. PR #54 was separately merged under the user's explicit administrator-merge approval; its source branch was cleaned after confirming history was retained on main.

The comparison task owns its prepared live-test protocol and prior branch history. Its reported preparation/QA pass is not a new live comparison result; its increased generation bounds require its own exact approval. Do not overwrite colliding historical Work Item/ADR IDs or treat this lifecycle closeout as permission to run that experiment.
