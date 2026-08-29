# Alpha.18 evidence and Observer validation

- Date: 2026-08-30
- Result: `passed_with_limits`
- Scope: Local repository evidence capture and generated Observer projection

## Verified

- Init creates an empty project-owned Evidence Registry and upgrade can seed a missing registry without managing later project content.
- Git evidence resolves a supplied local ref to an exact commit.
- Test and runtime observations validate required fields, preserve provenance, and hash their observation and artifact files.
- Evidence capture leaves Work Item `gate_evidence` and lifecycle state unchanged.
- Unverified claims, failed test/runtime evidence, open high risks, stale exact-revision evidence, pending approval, and runtime failure produce explicit Observer attention.
- `observe --no-write` creates no view; normal observation writes only generated JSON and static HTML.
- `doctor` rejects missing or content-drifted evidence artifacts.
- All adapters report `external_action_performed: false`.

## Limits

The tests use local Git repositories and supplied observation documents. They do not execute a production runtime, external CI provider, deployment, external tracker mutation, or multi-machine contention scenario. A recorded observation is traceable but still requires responsible review and Independent QA where the lifecycle requires it.
