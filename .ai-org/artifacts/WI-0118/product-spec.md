# Product specification — WI-0118

## Problem

Temple currently sends every Work Item through one complete lifecycle and records release-gate no-go outcomes as `blocked`. This creates two misleading effects:

1. bounded low-risk work carries stages intended for consequential delivery; and
2. completed experiments remain visible as actionable work even when their approved scope ended honestly with a no-go or inconclusive result.

The validation program also produced many pass counts and repeated model turns without yet producing a qualified causal answer about Temple's value. Temple needs to turn those observations into operating choices before running another comparison.

## User outcome

A user can choose a delivery profile that matches the known task risk, understand why Temple escalated it, see completed no-go experiments in history rather than in the active queue, and inspect model guidance without confusing advice with automatic routing or proven savings.

## Delivery profiles

Every new Work Item records one effective delivery profile.

| Profile | Intended use | Lifecycle | Required assurance |
| --- | --- | --- | --- |
| Lean | Bounded, reversible, local work with clear acceptance and no recorded escalation signal | `Intake → Build → Test → Done` | One eligible delivery brief, developer evidence, test evidence, and a lean closeout |
| Standard | Ordinary product and engineering delivery | Existing full lifecycle | Test, evaluation, Independent QA, and Release Gate remain required |
| High-Assurance | High-consequence work under the existing High-Assurance collaboration contract | Standard lifecycle plus risk-tier controls | Existing distinct Human Principals, revision-matched evidence, rollback, and approval rules |

Standard is the backward-compatible default. High-Assurance is selectable only when the repository's High-Assurance collaboration prerequisites are active.

Lean does not mean unplanned or untested. It combines Work Order, approved scope, acceptance criteria, technical design, risk review, and profile eligibility into one reviewable delivery brief before Build. It removes the separate Spec, Design, Eval, Independent QA, and Release Gate stages for eligible work; it does not remove implementation evidence, independent quality evaluation at Test, or a recorded closeout. Standard or High-Assurance work retains the fuller responsibility chain.

## Lean eligibility and escalation

Lean selection is explicit and auditable. The Work Item records the requested profile, effective profile, selection rationale, and any risk signals.

The following recorded signals make Lean ineligible and deterministically raise the minimum effective profile:

- external write or publication, schema or data migration, a shared cross-repository contract, unresolved scope, or a required Independent QA stage raises the floor to Standard;
- deployment, production release, destructive or difficult-to-reverse behavior, credential or personal-data handling, and security or authorization boundary changes raise the floor to High-Assurance; and
- an explicitly high or critical risk tier raises the floor to High-Assurance.

A regulated or critical-risk requirement must use High-Assurance and therefore fails closed until its collaboration prerequisites exist. Temple does not infer these signals from filenames or use unqualified numeric thresholds. A human or responsible Position records them from the actual scope, and the CLI computes the highest required profile from the recorded risk tier, scope class, and triggers.

Changing an active Work Item's profile is allowed only before Build. Escalation after Build creates an explicit blocked/resolution boundary before work continues under the stronger profile.

## Outcome semantics

`blocked` and `concluded` have different meanings:

- `blocked`: delivery is unfinished and may resume when a named blocker is resolved;
- `concluded`: the approved attempt is finished, no further execution is implied, and its outcome is historical.

A release-gate `go` closes as `done`. A release-gate `no-go` closes as `concluded` with a terminal outcome of `no-go` or `inconclusive`. The closeout reason remains visible as an outcome note but does not create active attention merely because it exists.

Legacy reconciliation is narrow: only a `blocked` Work Item with `previous_state: release_gate`, `release_gate_result: no-go`, and retained release evidence may be concluded through the CLI. Other blocked work remains actionable.

Observer, status, task eligibility, stale-evidence handling, conditions, external-tracker completion checks, and the Management Console must use the configured terminal states rather than independent hard-coded lists.

## Model guidance

Temple records guidance, requested model, effective model, reasoning effort, and observed usage separately. It does not switch models automatically in this Work Item.

- GPT-5.6 Sol: consequential planning, architecture, security reasoning, migration decisions, and independent evaluation where an error materially changes the outcome.
- GPT-5.6 Terra: ordinary implementation, debugging, documentation integration, and routine review.
- GPT-5.6 Luna: bounded mechanical or high-volume work whose contract and acceptance are already stable.

Reasoning effort is selected independently. Higher effort is justified by measured quality gain on representative work, not by habit. The same model route must be used in both arms of a process comparison so model choice does not contaminate the result.

This guidance follows current official OpenAI positioning for Sol, Terra, and Luna and its recommendation to compare quality, required evidence, total Tokens, latency, and cost on representative tasks. It is not evidence that the same routing is optimal for every Temple project.

## Evidence retrospective

The retrospective must, at minimum, reproduce:

- objective task correctness by candidate and pair;
- gross and operational-budget Tokens with their distinct meanings;
- candidate and program latency;
- retries, fallback, manual approvals, and intervention points;
- protocol or runner failures that prevented a qualified result; and
- disk/runtime overhead when the retained evidence supports it.

It must distinguish observations, interpretations, hypotheses, and unsupported claims. Test count is supporting integrity evidence, not a product outcome.

## Next representative benchmark

The next benchmark is specified but not executed in this Work Item. It must compare a minimal responsible workflow with Temple under matched model routing on a multi-Agent, multi-repository microservice change. It measures:

- cold-task recovery accuracy and time;
- task-boundary quality and overlapping-write conflicts;
- shared-contract propagation and repository convergence;
- rework and defect escape;
- Human intervention and approval waits;
- operational Tokens, latency, and captured disk/runtime overhead; and
- objective correctness plus an independently defined quality rubric.

Before any Provider turn, local fixtures must prove that both arms start from equivalent revisions, seeded defects are detectable, metrics and score schemas reject malformed data, arm-neutral packages exclude condition labels where practicable, and stop rules fail closed.

## Acceptance

The Work Item acceptance criteria in `.ai-org/work-items/WI-0118.json` are authoritative. A passing implementation must also preserve existing Standard and High-Assurance behavior for Work Items that do not opt into Lean.
