# Representative multi-Agent microservice comparison

- Status: protocol specified and locally rehearsed; no live model generation authorized
- Purpose: measure where Temple changes delivery outcomes, not accumulate another pass count
- Comparison: Temple versus a minimal responsible workflow under matched inputs and model routes

## Decision question

For one realistic, bounded change spanning four service repositories, does Temple improve recovery, task boundaries, contract convergence, correctness, rework, or human coordination enough to justify its Token, latency, and artifact overhead?

The result may be positive, negative, mixed, or inconclusive. The protocol is useful only if all four answers remain possible.

## Scenario

Freeze four repositories at exact starting revisions:

1. an API gateway or coordinator;
2. a catalog service;
3. an order service; and
4. a notification service.

The task changes a versioned order event used by all four repositories. It includes one public acceptance path and one held-out compatibility defect. The work requires separate Product, Technical Design, implementation, quality, and integration responsibilities; at least two implementation slices can run in parallel after the shared contract is stable.

Both arms receive the same business outcome, repository revisions, service contract, acceptance tests, hidden tests, tool allowlist, time boundary, and model route. Condition labels are absent from candidate-visible inputs where practicable.

## Arms

| Arm | Required controls |
|---|---|
| Minimal responsible | Clear scope, responsible owners, version control, tests, review, and an integration decision; no deliberately negligent baseline |
| Temple | The same controls plus Temple Work Items, context routing, claims, safe parallel preparation, handoffs, evidence, and lifecycle closeout |

The baseline is intentionally competent. Comparing Temple with an unsafe or disorganized process would answer the wrong question.

## Matched model route

The live Work Item must freeze one route before arm assignment and apply it symmetrically:

- Sol xhigh for one consequential decomposition/design decision and one independent final evaluation;
- Terra medium for ordinary implementation and integration work; and
- no model, or the same Luna setting in both arms, for purely mechanical fixture operations.

If a model or reasoning setting changes, both arms are invalid unless the change is applied before execution and the entire matched pair restarts under a new protocol revision. Temple does not automatically route models in this experiment.

## Measures

| Outcome | Measure |
|---|---|
| Cold recovery | Time and rubric score for a fresh Agent to identify current revisions, contract authority, open work, owner, and safe next action |
| Boundary quality | Unplanned affected-path overlap, conflicting edits, and rejected parallel preparations |
| Contract convergence | All four repositories use the intended event version and pass compatibility checks at exact candidate revisions |
| Correctness | Public and held-out test results plus an arm-blind rubric frozen before mapping unseal |
| Rework | Reverted commits, repeated implementation attempts, regression failures, and changed lines not retained in the accepted candidate |
| Human intervention | Reason-coded questions, approvals, recoveries, and manual conflict resolutions; waiting time is reported separately |
| Usage | Provider-reported operational Tokens by Work Item, Position, stage, attempt, model, and outcome; missing attribution remains unknown |
| Time | Candidate work time, coordinator/runtime overhead, evaluation time, and end-to-end elapsed time |
| Footprint | Artifact bytes, telemetry growth, peak local processes, and bounded CPU/RSS samples where available |

Test count is integrity evidence, not the headline result.

## Local no-generation rehearsal

Before any Provider turn, run:

```bash
node scripts/validate-representative-microservice-protocol.mjs \
  --input .ai-org/artifacts/WI-0118/representative-microservice-protocol.json
```

The validator rejects:

- missing or duplicate arms;
- unequal source revisions, task digests, tests, tool policy, or model routes;
- a missing detection command for the seeded compatibility defect;
- an evaluator scale other than 0 through 1;
- retry or fallback allowances;
- missing intervention, rework, usage, latency, footprint, and correctness measures; or
- any protocol that claims generation happened during rehearsal.

The rehearsal validates protocol consistency only. It does not prove the repositories build, the seeded defect is detectable, the Provider works, or Temple is effective. The separate live Work Item must create and run the exact frozen fixture checks before its first model turn.

## Stop and interpretation rules

- Stop the pair after any protocol mismatch, missing exact revision, lost usage correlation, retry request, fallback request, evaluator contract mismatch, or score unseal before freeze.
- Preserve the stopped outcome once. Correcting the harness requires a new protocol revision and a new Work Item, not a hidden retry.
- Report objective correctness even when subjective evaluation is inconclusive.
- Report operational and gross Token counters separately.
- Do not convert Tokens to cost without an authoritative versioned billing source.
- With one scenario and one pair, report descriptive effects and failure modes only; do not claim statistical generalization.

The live run remains a later, explicitly bounded validation action. This document and its validator authorize no model generation, external write, deployment, release, or Credits purchase.
