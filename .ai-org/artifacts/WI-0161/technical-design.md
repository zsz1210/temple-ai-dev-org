# WI-0161 Technical Design

## Command boundary

`temple publication normalize-plan` is read-only. It reads four canonical surfaces, builds their exact after-documents in memory, and reports only file paths, field classes, counts, before/after digests, retained active-coordinate counts, and one deterministic plan digest.

`temple publication normalize-apply` requires `--work-item`, `--expected-plan`, and `--confirm-normalization`. The governing Work Item must have an active claim, and the actor must be that claim's Agent Identity, its Human Principal, or `human`.

## Eligible fields

- Work Item `claim.worktree` and `claims[].worktree` when the claim status is `released`.
- Work Item `scope`, `acceptance_criteria`, and `unresolved` description arrays.
- Runtime-worker `worktree` when status is `completed`, `failed`, or `cancelled`.
- Task `worktree` when status is `completed` or `archived`.
- String values recursively nested below Evidence `entries[].details`; home-directory prefixes, private IPv4 values, and private Tailnet hostnames become stable typed placeholders.

Active claim, worker, or task coordinates are never rewritten. Work Item path/ref fields, artifact paths, Evidence IDs, scope revisions, and artifact digests are outside the eligible field set. If a sensitive active coordinate exists, apply fails before writing.

## Stale safety and atomicity

The plan digest binds every candidate file's before and after SHA-256 digest and the value-redacted change summary. Apply recomputes the plan under the project mutation lock and rejects any mismatch. It snapshots all candidate files and the event journal, writes atomically, validates the complete schema catalog, appends one value-redacted audit event, and restores the snapshots if any step fails.

After a successful application, the same plan command returns zero changes. A zero-change apply performs no mutation and emits no event.

## Verification

- Unit fixtures cover redaction, determinism, stale rejection, confirmation, actor authority, active-coordinate refusal, preservation, rollback, and idempotence.
- Dogfood records the exact pre-apply plan and apply result without matched values.
- The public-profile audit must show no remaining canonical-state local-environment findings.
- `npm run verify` and Independent QA must pass at the exact candidate revision.
