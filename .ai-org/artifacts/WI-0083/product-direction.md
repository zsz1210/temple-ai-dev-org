# Product Direction — Matched Model Advisory

## User problem

A person coordinating AI-assisted development can choose a model manually, but Token totals alone do not show whether a cheaper-looking run was comparable or whether quality, rework, latency, and human intervention changed. Repeatedly interpreting raw usage by hand does not scale, while automatic switching before comparable evidence exists can silently reduce delivery quality.

## Intended outcome

Temple should turn a project-owned set of representative, matched evaluation results into an explainable recommendation for one exact task shape. The recommendation helps the human or coordinating Agent choose a model profile; it does not execute the choice.

The product promise is:

> Find the least resource-intensive approved profile that still satisfies the declared quality requirement for the same kind of work.

It is not:

> Always choose the run with the fewest Tokens.

## Confirmed language

### Exact task shape

The complete comparison identity declared by project policy: Position, lifecycle stage, task kind, risk class, and Context Profile digest. A fallback identity such as `developer:build` is useful for descriptive reporting but cannot qualify a matched recommendation.

### Matched evaluation

A project-owned evaluation set in which every candidate profile attempts the same declared evaluation cases, quality rubric, task-shape identity, input revision or content digest, and measurement contract. Naturally completed Work Items are observational evidence, not a matched evaluation.

### Quality gate

The declared minimum result that every recommendable candidate must satisfy. Resource measures cannot compensate for a failed quality gate.

### Shadow recommendation

A low-confidence observation shown for learning and diagnosis. It is based on naturally occurring completed work, does not claim matched quality, and cannot be treated as a preferred profile.

### Advisory recommendation

A read-only, explainable profile recommendation supported by a valid matched evaluation and the project's configured decision contract. It may influence a later human or coordinator choice but does not change a task, model, policy, or lifecycle state.

### Automatic routing

A future execution capability that would apply a qualified profile without a per-task choice. It is outside `WI-0083`; advisory qualification must not imply that an executor exists.

## Required user-visible result

For each evaluated task shape, Temple reports:

- whether the evaluation is `qualified`, `not-qualified`, `stale`, or `invalid`;
- the recommended profile when qualified;
- the declared quality gate and each candidate's pass or rejection reason;
- the comparable measures used after quality qualification: Tokens, latency, rework, and human intervention;
- evidence coverage, confidence, source revision or digest, and evaluation time;
- the Seed Policy fallback;
- explicit statements that automatic routing and model switching remain disabled.

## Product rules

1. Quality is evaluated before resource efficiency.
2. Candidates are compared only inside one exact task shape and one evaluation contract.
3. Every candidate must cover the same evaluation-case IDs; missing or duplicated cases fail closed.
4. Requested and effective model or reasoning values remain distinct. Missing effective evidence cannot be silently filled from a request.
5. Unknown data remains unknown. Missing values are never treated as zero.
6. Evaluation records contain structured outcomes and provenance, not prompts, responses, hidden reasoning, credentials, or raw provider payloads.
7. An expired model mapping, changed rubric, changed task-shape digest, superseded policy, or revision mismatch makes the recommendation stale or invalid.
8. A human's explicit task-level choice still wins inside the approved authority and budget boundary.

## Out of scope

- launching an evaluation through a live model provider;
- selecting a model for an active task;
- changing Codex task settings;
- rewriting `usage-policy.json` from evaluation results;
- learning across projects or organizations;
- deriving Credits or money from Token counts;
- claiming causal savings from unmatched Work Items;
- replacing lifecycle evidence, Independent QA, or release approval.

## Acceptance examples

- If Terra and Luna both pass the same quality gate and Luna uses fewer Tokens with no worse declared tie-breakers, advisory may recommend the Luna profile.
- If Luna uses fewer Tokens but fails one required quality case, it is rejected and cannot win.
- If one profile is missing a case, uses another Context Profile digest, or reports a different source revision, the comparison is not qualified.
- If evaluation evidence is valid but policy mode remains `shadow`, Temple may report the qualified result without presenting it as an active advisory choice.
- No successful evaluation changes `automatic_routing: false`, `execution_status: not-implemented`, or `model_switch_performed: false`.

## Evidence still needed after implementation

Repository fixtures can prove schema validation, deterministic comparison, privacy filtering, fail-closed behavior, and read-only output. They cannot prove that one real model profile is better for Temple. Real representative evaluations remain project evidence to be collected separately under an explicitly authorized provider and budget boundary.
