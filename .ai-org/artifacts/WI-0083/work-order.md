# Work Order — WI-0083

## Authorized outcome

Turn Temple's current project-local usage observation into an evidence-backed, read-only model advisory capability. The new capability must compare candidate model and reasoning profiles on representative matched work, put quality before Token reduction, explain why a candidate is or is not qualified, and never execute a model change.

## Confirmed product decision

The repository owner accepted the staged direction on 2026-09-01:

1. retain the existing observation and shadow baseline;
2. add a project-owned matched quality evaluation contract;
3. add deterministic advisory recommendations only after that contract is satisfied;
4. defer automatic model switching, cross-project learning, and adaptive self-modifying policy.

The intended optimization target is the least resource-intensive approved profile that still satisfies the task shape's quality and risk requirements. Lowest Token use alone is never a winning condition.

## Current evidence

- `WI-0069` implemented the cold-start Seed Policy, diagnostic observation threshold, shadow recommendation, project-local privacy boundary, and exception-only autonomy envelope.
- `.ai-org/project/usage-policy.json` still reports `cold-start`, `shadow`, and unconfigured statistical qualification.
- `src/usage-attribution.mjs` exposes unmatched observational candidates but always reports `matched_evaluation: false`, `automatic_routing: false`, and `execution_status: not-implemented`.
- `DEC-0002` records Temple's current manual GPT-5.6 profile choices and explicitly keeps routing manual until representative evidence exists.

## Required delivery boundary

- No live model generation, provider call, Credits spend, deployment, publication, external write, or automatic model switch.
- No prompt, response body, hidden reasoning, credential, or raw provider payload in the evaluation record.
- No universal sample-size claim and no causal savings claim from naturally different Work Items.
- Unknown, stale, incomparable, mixed-task-shape, revision-mismatched, or incomplete evidence must fail closed to the Seed Policy.
- Existing `WI-0069` and `WI-0082` evidence remains revision-bound and unchanged.

## Delivery sequence

`Spec → Design → Build → Test → Eval → Independent QA → Release Gate`

The Work Item may proceed sequentially in the current task. Developer and Independent QA must use different Temple Agent Identities and exact candidate revisions. Organizational closeout does not authorize a release or push.
