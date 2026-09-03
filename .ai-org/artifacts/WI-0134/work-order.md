# Work order - WI-0134

## Outcome

Restore truthful repository evidence health without rewriting historical artifacts or weakening validation for active evidence.

## Scope

- Add a repository-pinned CLI operation that explicitly invalidates one evidence record.
- Preserve actor, timestamp, reason, optional replacement reference, and an audit event.
- Keep invalidated evidence visible but unusable for gates.
- Stop invalidated records from failing historical artifact-integrity checks.
- Invalidate only `EVID-20260903T070838Z-903FABE9` and `EVID-20260903T075942Z-C6F47254` after confirming neither is current gate evidence.

## Exclusions

- Do not rewrite the two historical observation files.
- Do not change valid WI-0130 or WI-0131 gate evidence.
- Do not call a model Provider, push, merge, deploy, publish, or release.

## Stop condition

The invalidation path is tested, the two malformed unused entries are invalidated through the CLI, Doctor is healthy, and independent QA reproduces the result.
