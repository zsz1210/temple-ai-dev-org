# Decision Ledger

## Decision

- ID: DEC-0006
- Status: accepted
- Date: 2026-09-01
- Owner position: Product Manager and Tech Lead
- Work item: WI-0083

## Context

Temple can already correlate some Work Items with their observed model and Token use, display calibration blockers, and produce a low-confidence shadow candidate after a diagnostic threshold. It cannot compare model quality on the same representative work, so it cannot distinguish a genuinely more efficient profile from an easier task. It also has no routing executor.

The repository owner asked whether Temple should add automatic learning for Token and model selection, then accepted a staged implementation that preserves quality and human authority.

## Options considered

1. Stop at observation and leave every model choice manual. This avoids routing risk but leaves the human responsible for interpreting growing evidence and does not close the operational learning loop.
2. Select the lowest-Token observed model and switch automatically. This is simple but confounds task difficulty with model performance, can silently reduce quality, and gives an unmatched observation more authority than it deserves.
3. Add representative matched evaluation and deterministic advisory recommendations first, then consider a separately governed executor only after repeated evidence and a safe fallback exist.

## Decision and rationale

Adopt option 3.

Temple will accept project-owned matched evaluation records that compare approved model and reasoning profiles within one exact task shape and one declared quality rubric. Quality is a qualification gate, not a score that can be traded away for fewer Tokens. Among candidates that satisfy the same quality requirement, Temple may recommend the least resource-intensive profile using declared measures such as Token use, latency, rework, and human intervention.

The result is advisory and explainable. It reports the selected profile, evidence coverage, confidence, observed trade-offs, rejected candidates, blockers, staleness, and fallback. It does not change a model, launch a task, rewrite project policy, or treat a recommendation as permission.

Raw prompts and hidden reasoning remain excluded. Project observations remain local by default. A human's exact task-level choice continues to take precedence within the authorized provider, budget, and risk boundary.

## Rejected alternatives

- Token-only optimization.
- Automatic routing in the same delivery slice.
- A framework-wide universal statistical threshold.
- Silent cross-project pooling or transfer of private telemetry.
- A router that modifies its own qualification rules.

## Consequences and follow-up

- Files or work items affected: `WI-0083`, Usage Policy and evaluation schemas, usage reporting and preflight, focused tests, validation documentation, and the three public READMEs.
- Open questions: which project-specific quality rubrics and statistical decision methods prove useful across real task shapes; whether advisory acceptance and override history later justifies an opt-in executor.
- Revisit trigger: representative matched evaluations across more than one task shape show stable quality, deterministic recommendations survive Independent QA, overrides and regressions are observable, and a rollback-tested executor can stay inside the approved autonomy envelope.
