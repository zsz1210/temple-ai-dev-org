# WI-0136 product specification

## Scenario

The fictional commerce system currently publishes `OrderPlaced` version 1. The requested change introduces a version 2 envelope while supporting a rolling deployment:

- Catalog exposes an inventory revision used by Orders.
- Orders publishes the version 2 envelope with a nested order payload, inventory revision, locale, and timestamp.
- Notifications consumes both retained version 1 events and new version 2 events without duplicate delivery.
- Gateway returns a stable checkout response and exposes the published event version.

The visible task emphasizes version 2 delivery and rolling compatibility. A held-out contract test catches the likely failure in which the consumer accepts the new envelope but no longer accepts retained version 1 events. The starting fixture must fail the final contract suite, and a conforming candidate must pass it.

## Experimental arms

### Minimal responsible

The arm receives clear product scope, responsibility assignments, Git repositories, public tests, a design record, slice handoffs, and an integration checklist. It is not intentionally disorganized and must not be deprived of normal engineering controls.

### Temple

The arm receives the same engineering inputs plus Temple's project-owned Work Items, Positions and Agent Identities, affected-path declarations, context resolution, claims, handoffs, exact-revision evidence, lifecycle gates, and cold recovery entrypoint.

Temple-generated or project-owned organizational files are the intervention. Product source and tests must start from the same content digests in both arms even when the organizational commit differs.

## Execution shape

Each arm runs the following fresh, isolated model turns:

1. Design — Sol xhigh defines the shared contract, rollout order, slices, acceptance mapping, and integration risks.
2. Orders and Catalog build — Terra medium owns only those two service repositories.
3. Notifications build — Terra medium owns only the Notifications repository.
4. Gateway build — Terra medium owns only the Gateway repository.
5. Cold integration and recovery — a fresh Terra medium context reconstructs state from repository evidence, verifies exact revisions, integrates the four services, fixes only an integration-owned issue if required, and records the safe next action.

One fresh Sol xhigh evaluator receives only arm-neutral correctness and retained engineering evidence after every candidate is frozen. It cannot use tools and freezes scores before the arm mapping is revealed.

## Measures

- **Correctness:** public tests, held-out tests, end-to-end checkout, retained v1 replay, v2 delivery, and duplicate-event behavior.
- **Cold recovery:** whether the integrator identifies exact revisions, governing contract, completed slices, unresolved work, owner, and safe next action; elapsed time and operational Tokens are retained.
- **Boundary quality:** changed paths outside declared slice ownership, overlapping writes, rejected preparation, and unresolved conflicts.
- **Contract convergence:** all four accepted revisions implement the same registered event contract and compatibility window.
- **Rework:** reverted commits, repeated attempts, failed integration checks, and changed lines not retained in the accepted candidate.
- **Human intervention:** reason-coded questions, approvals, manual recoveries, conflict resolutions, and waiting time. The one account approval is reported separately from workflow intervention.
- **Usage and time:** Provider-reported operational and gross Tokens per arm, stage, and turn; candidate, evaluator, and end-to-end latency.
- **Footprint:** source, organizational artifact, telemetry, and result bytes plus bounded process observations where available.

## Interpretation

Correctness is primary. A lower-resource arm that fails held-out behavior is not efficient. With one scenario, effect sizes are descriptive and can reveal failure modes or justify another experiment; they cannot establish broad superiority or an automatic routing decision.
