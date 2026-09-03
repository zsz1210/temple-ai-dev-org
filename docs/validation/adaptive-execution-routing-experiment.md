# Temple effectiveness and adaptive-routing experiment

- Status: design only; no live Provider run is authorized
- Purpose: determine whether Temple and its Adaptive Execution Route create enough measurable value to justify their overhead
- Prior evidence: Wave 5A and 5B are protocol and mechanism evidence, not a qualified product-effect result

## Two decisions, not one mixed comparison

The next evaluation separates two interventions:

1. **Framework effect:** does Temple improve delivery compared with a competent conventional workflow?
2. **Routing effect:** inside the same Temple workflow, does the Adaptive Execution Route improve the quality and resource trade-off compared with one fixed safe route?

Mixing both changes in one A/B pair would make the result uninterpretable. A better result could come from Temple's work boundaries, from the model choice, or from both.

## Three matched arms

| Arm | Process | Execution route | Comparison purpose |
| --- | --- | --- | --- |
| A — conventional | Clear scope, version control, tests, review, and an integration decision, without Temple artifacts | Fixed, pre-registered safe route | Credible baseline |
| B — Temple fixed | Temple Core Path, Work Items, responsibility, handoffs, evidence, recovery, and closeout | The same fixed route as Arm A | Isolate Temple's process effect: A versus B |
| C — Temple adaptive | Identical Temple process and acceptance contract to Arm B | Per-step route resolved from the frozen Execution Policy | Isolate routing effect: B versus C |

The conventional arm must remain responsible and usable. Temple is not compared with a deliberately disorganized or unsafe baseline.

## Representative task families

Freeze the task set before any live run. It should include at least:

- one bounded, low-risk, single-repository correction;
- one ordinary implementation task with a specification and a held-out regression; and
- one multi-repository contract change with a planned interruption and fresh-context recovery checkpoint.

Use at least two independent matched cases per selected task family, with every case run through all three arms, for diagnostic coverage. That pilot does not establish statistical superiority. Use its observed variance and baseline distribution to pre-register a minimum meaningful effect, confidence method, power target, and required sample size before any broader claim.

## Frozen controls

Within each matched comparison, keep these inputs identical unless the named intervention requires otherwise:

- product outcome, starting revisions, task digest, specifications, public tests, and held-out tests;
- available tools, repository access, network policy, retry policy, stopping limits, and human authority envelope;
- evaluator rubric, score range `0..1`, output schema, and blind-package fields;
- Provider protocol version, usage fields, correlation IDs, and effective-model evidence; and
- order randomization or counterbalancing so one arm does not always benefit from learning first.

For A versus B, the effective model and reasoning profile must match at every compared step. For B versus C, the Temple process remains fixed and the route is the only intended change.

## Measures

Quality is the entry gate. Resource savings do not count when the candidate fails required behavior.

| Outcome | Evidence |
| --- | --- |
| Correctness | Public and held-out tests at exact candidate revisions |
| Product quality | Arm-blind rubric frozen before condition mapping is revealed |
| Recovery | Time and accuracy for a fresh Agent to identify authority, current state, and the safe next action |
| Boundary quality | Scope violations, conflicting writes, duplicate work, and unsafe parallel attempts |
| Rework | Reverted work, repeated attempts, regression cycles, and discarded changed lines |
| Human intervention | Reason-coded questions, approvals, corrections, and conflict resolution; waiting time reported separately |
| Usage | Provider-reported operational and gross Tokens by task, stage, attempt, model, and outcome |
| Time | Model time, coordinator overhead, evaluation time, and end-to-end elapsed time |
| Footprint | Artifact bytes, telemetry growth, and bounded local CPU/RSS observations where available |

Missing observations remain unknown. Do not convert Tokens to monetary cost without an authoritative, versioned billing source.

## Validity gates

A pair is excluded from effect analysis when any of these conditions occurs:

- starting revision, input, tools, permissions, or fixed-route settings differ unexpectedly;
- effective model or reasoning evidence is missing for a model-dependent comparison;
- a public or held-out acceptance gate required for the comparison fails;
- the evaluator sees the arm mapping before its score is frozen;
- the evaluator output violates the pre-registered schema or `0..1` range;
- usage correlation, exact candidate revision, or intervention recording is incomplete; or
- an unplanned retry, fallback, or cross-arm information leak occurs.

Retain an excluded run once as protocol evidence. Repair the harness under a new revision; do not silently retry until the result looks favorable.

## Decisions the data must trigger

### A versus B — Temple process

- If Temple preserves correctness and materially improves recovery, boundary quality, rework, or human coordination, retain the responsible mechanisms for that task family and report their measured overhead.
- If Temple produces no meaningful improvement while adding consistent time, Token, or artifact overhead, simplify or remove the responsible step.
- If Temple lowers correctness or creates more intervention or rework, stop recommending that path until its design changes and a new comparison passes.
- If evidence is incomplete or mixed, report `inconclusive` and narrow the next hypothesis; do not claim Temple is effective.

### B versus C — Adaptive Execution Route

- If the adaptive route meets the same quality gate and improves a pre-registered resource or reliability outcome beyond the minimum meaningful effect, retain the preference for that exact Task Shape.
- If quality and resources are effectively equivalent, prefer the simpler fixed route and do not add automatic routing.
- If the adaptive route is worse, revise or remove the responsible rule instead of collecting more favorable runs.
- Never promote a result from one project or Task Shape into a framework-wide model rule.

## Execution sequence

1. Finish and independently verify the human Core Path.
2. Build the three-arm fixture without generation and contract-test the exact installed Provider schema.
3. Run a no-generation handshake and validate blind-package isolation.
4. Record pilot thresholds and sample-size method from baseline and pilot data.
5. Request one bounded authorization for the complete live matrix and its stop limits.
6. Freeze scores, unseal mappings, analyze A versus B and B versus C separately, and publish negative or inconclusive results unchanged.
7. Change Temple only when the evidence points to a specific mechanism or routing rule, then repeat the affected comparison rather than the entire program.

OpenAI's current model guidance recommends comparing representative tasks on success, required evidence, total Tokens, latency, and cost, and changing one instruction, tool, or configuration group at a time. This protocol applies that principle to Temple instead of assuming the largest model, highest reasoning effort, or most elaborate process is best. See [OpenAI model guidance](https://developers.openai.com/api/docs/guides/latest-model).

This document does not authorize Provider generation, Credits use, automatic routing, deployment, publication, or release.
