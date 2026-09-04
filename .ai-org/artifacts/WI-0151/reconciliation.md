# WI-0151 Historical Work Item Reconciliation

## Purpose

Remove stale active-state noise without erasing evidence or converting a deferred, superseded, or inconclusive attempt into successful delivery. This is organizational closeout only; it performs no code change, Provider call, publication, or external action.

## Dispositions

| Work Item | Retained evidence | Disposition | Reason |
| --- | --- | --- | --- |
| `WI-0033` | Operator-owned Provider trust scope and unresolved product decision | Cancelled | Provider execution remains optional and outside the narrow Alpha. A future decision should open a new, current Work Item instead of keeping this 2026-08-31 specification active. |
| `WI-0086` | Alpha.29 package, hosted, QA, and blocker history | Cancelled | No Alpha.29 release occurred. The candidate and external-friend gate are superseded by the current release-readiness plan and clean-room rehearsal. |
| `WI-0136` | Frozen four-repository matched comparison and Independent QA | Accepted | The bounded experiment completed and is reproducible. Both arms passed and scored 8/8; Temple used 3.51% fewer Operational Tokens and 2.72% less model latency in this single pair, but used 14.94% more gross Tokens, 18.70% more integration latency, and about 11.6 times the artifact footprint. The accepted deliverable is the mixed descriptive result, not a superiority claim. |
| `WI-0137` | Stage-aware Context Capsule implementation, complete verification, and Independent QA | Accepted | The approved routing and measurement foundation shipped and passed exact-revision QA. It enables measurement but does not prove Token or latency savings. |
| `WI-0138` | One matched pair per project shape, retained telemetry, recomputed analysis, and Independent QA | Inconclusive | The diagnostic is valid, but byte-exact narrative fields made both correctness gates false. Static source selection was smaller, while Operational Tokens and latency did not improve materially. A typed-fact successor must be proven generation-free before another live run. |

## Evidence and claim boundaries

- `WI-0136`: `.ai-org/artifacts/WI-0136/representative-main-v16-findings.md` and `.ai-org/artifacts/WI-0136/representative-main-v16-independent-qa.md`.
- `WI-0137`: `.ai-org/artifacts/WI-0137/independent-qa.md`.
- `WI-0138`: `.ai-org/artifacts/WI-0138/evidence-backed-findings.md` and `.ai-org/artifacts/WI-0138/independent-qa.md`.
- `WI-0086`: `.ai-org/artifacts/WI-0086/public-release-blockers.md`, superseded by `docs/planning/release-readiness.md`.
- `WI-0033`: `.ai-org/artifacts/work-orders/WI-0033.md`; no approved Provider trust design or implementation exists.

Accepted organizational closeout never authorizes a product release, automatic routing, Provider execution, or a generalized efficiency claim. Cancelled and inconclusive states preserve the existing artifacts for later study without keeping them in current work queues.

## Rollback guidance

- Lifecycle records are append-only evidence. If a disposition is later found factually wrong, open a corrective Work Item rather than rewriting history.
- Reopening Provider execution requires a new product decision and a new Work Item based on current Provider contracts.
- A future context-effectiveness run must use a new frozen protocol and approval; it must not rescore `WI-0138` post hoc.
- Reverting the stage-aware routing implementation requires reverting its implementation lineage beginning at `94d8ceb987ecce2bd444c2ca98209fd4f1a6f66d` and rerunning compatibility, context, and upgrade tests.
