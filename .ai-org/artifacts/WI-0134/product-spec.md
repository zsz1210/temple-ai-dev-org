# Accepted scope and acceptance criteria - WI-0134

## User problem

Two unused historical evidence entries bind updated observation bytes to earlier Git revisions. Doctor correctly reports the mismatch, but the framework has no governed way to declare such a record unusable while retaining its audit history.

## Required behavior

1. `temple evidence invalidate` targets one existing Evidence ID.
2. It requires a non-empty reason and a valid actor.
3. An optional replacement Evidence ID must exist, belong to the same Work Item, differ from the invalidated record, and remain current.
4. The operation records `invalidated_at`, `invalidated_by`, `invalidation_reason`, and replacement metadata without deleting the record.
5. The mutation and its audit event are atomic from the caller's perspective.
6. Repeated invalidation fails closed instead of silently changing history.
7. Invalidated evidence remains structurally validated and visible to Observer, cannot satisfy gates, and is excluded from artifact-health enforcement.
8. Active evidence retains the existing exact-revision artifact checks.

## Repository repair

Invalidate these entries only:

- `EVID-20260903T070838Z-903FABE9` from WI-0130.
- `EVID-20260903T075942Z-C6F47254` from WI-0131.

Both entries are unused by their Work Items' current gate-evidence maps. No replacement is required because later valid test and Independent QA evidence supersede the malformed records.

## Acceptance

- Focused regression tests cover authorization, replacement validation, atomic rollback, Observer visibility, gate rejection, and active-versus-invalidated artifact checking.
- Full repository verification and schema validation pass.
- Doctor reports `healthy: true`; a stale generated parallel plan may be rebuilt but must not be treated as lifecycle authority.
