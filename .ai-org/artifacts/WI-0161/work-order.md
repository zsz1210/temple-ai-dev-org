# WI-0161 Work Order

## Outcome

Give Temple projects a supported way to remove machine-local execution coordinates from completed canonical records without hand-editing lifecycle JSON or weakening its evidence trail.

## Approved scope

- Add a deterministic, value-redacted normalization preview for canonical Work Items, runtime workers, tasks, and Evidence details.
- Require an exact plan digest, an active governing Work Item, and explicit confirmation before mutation.
- Minimize only released claims, terminal workers, terminal tasks, allowlisted Work Item description fields, and local-environment values nested below Evidence `details`.
- Preserve lifecycle identity, revisions, branches, timestamps, Evidence IDs, artifact references, artifact digests, and event history.
- Dogfood the operation on Temple's current canonical state and record reproducible evidence.

## Acceptance criteria

1. Unchanged inputs produce the same plan digest, and the preview emits no matched value or source-line content.
2. Apply refuses stale plans and active execution coordinates, requires explicit confirmation, and writes only the planned fields.
3. A successful apply is schema-valid, atomic, event-bearing, and idempotent.
4. Temple's 245 canonical-state publication occurrences fall to zero without changing Evidence identity or artifact digests.
5. Full repository verification and Independent QA pass at one exact candidate revision.

## Risk and rollback

The main risk is destroying provenance or invalidating an active executor while removing local details. The operation therefore fails closed on sensitive active coordinates, snapshots every intended file plus the event journal, validates the entire project after writing, and restores the snapshots on failure. Ordinary Git revert remains the repository-level rollback.

## Exclusions

- No retained-artifact rewrite, test-fixture cleanup, vendored dependency edit, or Git-history rewrite.
- No repository visibility, version, tag, Release, npm publication, deployment, or announcement change.
