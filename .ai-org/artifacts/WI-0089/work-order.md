# Work Order — WI-0089

## Outcome

Make Codex task names useful human navigation: show the bounded outcome before the responsibility and Agent Identity, while stable Work Item and thread IDs remain canonical.

## Accepted conventions

- Ordinary work: `WI-#### · short goal · Position (Agent)`
- Project control task: `Project · control scope · Primary Position (Agent)`
- The short goal is derived deterministically from the canonical Work Item title.
- A title never grants authority, advances lifecycle state, or replaces repository evidence.

## Boundaries

- Add an explicit registry refresh operation; do not silently rename Codex app tasks.
- Preserve thread IDs, task IDs, status, model evidence, revisions, claims, and archive readiness.
- Apply the accepted convention to currently accessible Temple tasks only after repository verification.
- Do not create, archive, fork, message, or release a task.

## Evidence required

- Deterministic normalization and length tests.
- Registration, handoff, orchestration, refresh idempotence, and field-preservation tests.
- Self-host upgrade and managed-file checksum validation.
- Current registry before/after evidence and actual app-title mutation results.
- Complete verification and Independent QA.
