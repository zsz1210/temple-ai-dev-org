# Phase 4B Completion Validation

- Work Item: `WI-0017`
- Scope: local App Server attachment reliability and usage qualification
- External model calls or artificial tasks: none
- Canonical lifecycle mutation by this implementation: none

## Implemented boundary

The Codex Provider treats `thread/read` and `thread/resume` as separate App Server operations. Registered tasks are classified by static eligibility and by an observed attach result. Known unsupported, invalid, and App-Server-store failures produce bounded reason codes. Non-retryable failures are suppressed for the failed operation across provider reconnects; a history-read failure does not block an otherwise supported live resume.

Detailed usage continues to come only from `thread/tokenUsage/updated`. Missing Token fields remain `null`; text, elapsed time, and account-wide activity are never used to estimate per-task usage. Account usage remains unallocated and cannot qualify the project baseline.

Longitudinal qualification requires at least ten distinct, completed, revision-current Work Items across at least two task shapes. A low-confidence exploratory model candidate additionally requires two models with at least two accepted Work Items each inside the same task shape. This is unmatched observational evidence, not a model-quality or savings claim.

## Safety invariants

An exploratory candidate is read-only and records all of the following explicitly:

- automatic routing is false;
- no model switch was performed;
- a budget cannot skip gates;
- context remains required;
- Developer evidence remains required;
- Independent QA remains required;
- human approval remains required;
- release authority is not granted;
- model-quality and routing claims remain disallowed.

## Focused evidence

`test/control-plane-live.test.mjs` covers successful read/resume, terminal history-only reconciliation, unsupported history with successful resume, App Server session-store degradation, bounded reason codes, secret exclusion, and no resume retry churn after reconnect.

`test/phase-4b.test.mjs` covers zero and partial Token fields, exact and mismatched task correlation, stale revisions, Position mismatch, ten completed qualified Work Items, deterministic within-shape candidate selection, and fail-closed authority flags. Existing Solo, Collaborative, and High-Assurance policy fixtures remain part of the same focused suite.

## Read-only self-host observation

On 2026-08-30, `node ./templew.mjs usage preflight . --json` read the existing local Provider state without an account probe or model call. It reported the Provider registry as `ready`, three terminal registered tasks, zero live-resumable tasks, detailed status `no-live-registered-task`, zero detailed observations, and baseline `not-qualified` with ten qualified completed Work Items still required.

`node ./templew.mjs usage report . --no-write --json` reported `insufficient-data`, zero observations, `total_tokens: null`, zero qualified completed Work Items, and no recommendation. Both commands reported no canonical state change or external action. This is the truthful local result; no task or paid call was created to manufacture a qualifying sample.

## Deliberate limits

- Active-thread Token notifications can be observed only by the connected provider process.
- A Desktop-owned task may be readable, resumable, both, or neither from a separate App Server process.
- The full attach-outcome list is runtime Provider state. A bounded 100-task summary is exposed through the Provider registry and can be persisted with normal control-plane state; the journal stores only bounded failure observations and available history.
- The exploratory candidate compares naturally completed Work Items and is confounded by task difficulty. It cannot authorize routing until a future matched evaluation supplies representative quality evidence.
- Monetary cost remains unknown without a separately approved, versioned price source.
