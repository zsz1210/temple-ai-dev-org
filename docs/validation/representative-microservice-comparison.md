# Representative multi-Agent microservice comparison

- Status: WI-0136 fixture and lifecycle preparation pass; the first live protocol was superseded before generation, and a focused context-routing ablation is being frozen before the main comparison
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

WI-0136 now supplies that separate execution boundary. Its generation-free preparation uses:

```bash
node scripts/run-representative-microservice-comparison.mjs setup
node scripts/run-representative-microservice-comparison.mjs freeze
node scripts/run-representative-microservice-comparison.mjs preflight
```

The current preflight verifies two arms with identical product revisions, four failing starting service tests per arm, a failing public integration path, a failing held-out compatibility path, a fully passing evaluator-only golden implementation, 31 retained fixture and revision checks, the installed Codex App Server contract, and a complete no-generation Temple lifecycle rehearsal across all five repositories. It must still report `exact-human-approval-required` until the frozen protocol envelope is approved.

## Context and model diagnostic

Prompt inspection found an avoidable confound before any candidate generation: the Temple condition loaded `TEMPLE.md` before resolving a known Work Item's Context Capsule. The intended framework route resolves the capsule first, opens only routed sources, and treats `TEMPLE.md` as a recovery fallback.

The diagnostic compares four otherwise identical prepared Temple recovery repositories:

| Condition | Model and effort | Retrieval order | Question isolated |
|---|---|---|---|
| Terra full-load | Terra medium | Read `TEMPLE.md` in full, then resolve and follow the Context Capsule | Full-load baseline |
| Terra routed | Terra medium | Resolve the Context Capsule first and use `TEMPLE.md` only as fallback | Context-routing effect |
| Sol routed medium | Sol medium | Same routed prompt and repositories | Same-effort model effect |
| Sol routed xhigh | Sol xhigh | Same routed prompt and repositories | User's quality-first effort effect |

Every condition uses one fresh read-only turn, the same exact Git revisions, the same output schema and tool policy, zero retry, and zero fallback. The result reports objective recovery, exact revisions, contract and slice recovery, safe next action, input, cached-input, output, reasoning-output, gross, and operational Tokens, session setup, turn duration, time to first activity, time to first command, effective output Tokens per second, explicit prompt bytes, normalized context-command order, and reported tool-output bytes.

OpenAI documents Sol as the flagship GPT-5.6 model for complex professional work and Terra as the balanced intelligence-and-cost option. The documentation does not provide a fixed Codex task duration for this workload, so the diagnostic reports observed timings rather than assuming a speed ranking.

Generation-free preparation uses:

```bash
node scripts/run-representative-microservice-comparison.mjs ablation-setup
node scripts/run-representative-microservice-comparison.mjs ablation-freeze
node scripts/run-representative-microservice-comparison.mjs ablation-preflight
```

The diagnostic determines whether routed context preserves recovery quality, whether Token or context-volume reduction is observed, how Terra and Sol differ at medium effort, and how Sol xhigh changes the observed tradeoff. One attempt per setting is directional only: it is not a Temple-versus-baseline result, does not establish a stable model-routing policy, and makes no statistical claim.

The exact-approved v2 attempt stopped after one completed condition when Terra routed selected the safe repository-inspection command `git ls-tree`, which the recovery allowlist had omitted. V2 was not retried and produced no valid model comparison. V3 adds that bounded read-only prefix, retains completed normalized condition records on any future stop, rebuilds fresh matched repositories, and requires a new exact approval under protocol `c5e0b069880a079de6fd8030fda3818cee92c809bd834999db2a04ca32be147a`.

After exact diagnostic approval, the bounded commands are:

```bash
node scripts/run-representative-microservice-comparison.mjs ablation-run --approval .ai-org/artifacts/WI-0136/context-ablation-approval.json
node scripts/run-representative-microservice-comparison.mjs ablation-report
```

After the ablation, the main live execution shape remains ten candidate turns and one blind evaluator turn: one Sol xhigh design turn, three concurrent Terra medium implementation slices, and one fresh Terra medium cold-integration turn per arm, followed by one Sol xhigh evaluator. Its replacement safety envelope and protocol digest must be regenerated after the routed prompt is frozen. Earlier limits remain historical preparation evidence, not current approval authority.

After that replacement main protocol receives its own exact approval, the bounded commands are:

```bash
node scripts/run-representative-microservice-comparison.mjs run --approval .ai-org/artifacts/WI-0136/account-approval.json
node scripts/run-representative-microservice-comparison.mjs evaluate --approval .ai-org/artifacts/WI-0136/account-approval.json
node scripts/run-representative-microservice-comparison.mjs report
```

The runner refuses a second candidate or evaluator attempt in the same lab. A stopped run remains evidence and requires a new protocol revision and Work Item rather than a hidden retry.

## Stop and interpretation rules

- Stop the pair after any protocol mismatch, missing exact revision, lost usage correlation, retry request, fallback request, evaluator contract mismatch, or score unseal before freeze.
- Preserve the stopped outcome once. Correcting the harness requires a new protocol revision and a new Work Item, not a hidden retry.
- Report objective correctness even when subjective evaluation is inconclusive.
- Report operational and gross Token counters separately.
- Do not convert Tokens to cost without an authoritative versioned billing source.
- With one scenario and one pair, report descriptive effects and failure modes only; do not claim statistical generalization.

The live run remains a later, explicitly bounded validation action. This document and its validator authorize no model generation, external write, deployment, release, or Credits purchase.
