# Assurance and recovery

Read for High-Assurance work, failed review, Release Gate, or an operation failure.

## Evidence and closeout

Follow the effective workflow and applicable policy, not a shortened list inferred from Context. Standard retains Test, Eval, distinct-Identity Independent QA and Release Gate. For High-Assurance, read `.ai-org/core/high-assurance.json`: retain risk tier, normalized revision-matched evidence, qualified/sponsored identities, distinct Human Principals where required, and rollback evidence.

At `release_gate`, `close` requires a decision, exact tested revision, rollback procedure, gate evidence and approval record. `--approval not-required` is valid only when no governing trigger requires approval. Organizational closeout never authorizes publication or deployment.

For a rejected candidate within approved scope, the active eligible reviewer may use `work-item rework --same-scope` with the exact rejected revision, reason and repository findings. Finish runtime workers first. The Developer then needs a new claim, corrected candidate and fresh attempt-specific evidence. Rework neither broadens scope nor reopens terminal work or Release Gate.

## Failed operations

New delivery and compact Context JSON failures report `code`, `mutation_status` and `next_action`. They do not execute a retry:

| Code | Response |
|---|---|
| `INVALID_INPUT` | Correct the named argument within the authorized operation; use command help. |
| `STALE_PREVIEW` | Refresh Context and preview. Reconcile changed scope/authority before using a new digest. |
| `PENDING_RECOVERY` | Inspect the pending operation; resume only its identical request. |
| `GUARD_REJECTED` | Investigate the guard; repair approved work/evidence if authorized, and ask when authority or scope is missing. |
| `EXECUTION_UNCERTAIN` | Inspect receipt, journal and current files before retrying. Unknown is not no-write or success. |

After a bounded correction, revalidate once. If the same unexplained failure repeats, stop and report evidence rather than looping. This does not authorize model-experiment retries. Existing text-only errors require conservative inspection; do not infer a machine classification from wording alone.

Never fabricate passing tests, reuse retired evidence, alter approvals, steal a claim, remove a pending journal or hand-edit canonical JSON to bypass a guard. Claim conflicts, changed authority, invalid checksums or unexpected partial writes require reconciliation, not automatic fallback.
