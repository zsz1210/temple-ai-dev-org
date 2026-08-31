# WI-0066 approved scope

## User-visible outcome

Temple operators can define a small, bounded validation program across several local repositories, inspect it before execution, resume from durable wave checkpoints, and build one cross-repository usage report without confusing observations with proof of savings, quality, enterprise readiness, or lifecycle completion.

## Required behavior

1. A versioned manifest declares participants, waves, turns, allowed paths, requested model settings, and every resource ceiling.
2. Validation rejects escaped paths, duplicate identities, unknown participants, unsupported models, network access, mutable approval policy, retries, fallback, and waves that exceed concurrency or contain two simultaneous turns for one repository.
3. The runner persists a manifest-bound checkpoint and append-only events, launches each turn at most once, resumes without relaunching completed turns, and stops before new work when any hard limit is reached.
4. A running turn can report cumulative Token usage and request interruption at its per-turn or program hard ceiling.
5. Repository inspection records exact revision, dirty paths, disk delta, and allowlist conformance.
6. Cross-repository reporting composes only repository-local qualified usage samples and leaves unsupported totals and claims explicitly unavailable.
7. CLI inspection and report generation are read-only unless the operator omits `--no-write`; no generic live-run command is exposed in this slice.

## Out of scope

- Starting live model turns during WI-0066.
- Measuring billing, monetary cost, causal productivity savings, output quality, or enterprise readiness.
- Replacing participant lifecycle state, QA, release gates, or external trackers.
- Automatic model selection, retry, fallback, remote commands, deployment, or release.

## Acceptance evidence

- Pure unit and fixture tests for every hard-stop and resume invariant.
- Four-participant fixture with ten distinct qualified completed Work Items and at least two task shapes.
- Fresh self-host installation, schema validation, full local verification, Doctor, and distinct Independent QA on one exact candidate.
