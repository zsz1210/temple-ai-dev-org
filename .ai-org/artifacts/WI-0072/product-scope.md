# WI-0072 approved scope and acceptance

## User-visible problem

A local Temple checkout can validate evidence that references a worker-only commit while GitHub CI cannot obtain that commit. The result is a delayed failure after integration, and a user cannot tell whether the code failed or the audit trail became incomplete.

## Required behavior

- Temple keeps the original evidence revision authoritative. Patch-equivalent integration commits do not replace it.
- An evidence revision is locally durable when it is an ancestor of `HEAD` or the exact target of `refs/tags/temple/evidence/<40-character-sha>`.
- `temple evidence preserve --revision <ref>` creates that deterministic local tag only when the resolved commit is already referenced by the Evidence Registry.
- Repeating preservation for the same revision is idempotent. A conflicting tag fails closed.
- Doctor reports an unpreserved evidence revision separately from a completely unavailable revision.
- Git candidate capture refuses to describe an exact candidate while a declared affected path has uncommitted changes. Unrelated project governance changes remain allowed and are reported as such.
- Documentation makes the local-versus-remote boundary explicit: Temple never pushes the preservation tag automatically.

## Acceptance evidence

1. Focused tests cover ancestral, preserved, unpreserved, unavailable, idempotent, conflicting-tag, affected-dirty, and governance-only-dirty cases.
2. Full `npm run verify` passes on the exact candidate.
3. A fresh clone from GitHub resolves both historical revisions after the two explicitly authorized tags are pushed.
4. GitHub CI passes without suppressing Doctor.

## Non-goals

- Automatic remote writes or background pushes.
- Rebinding existing evidence to patch-equivalent commits.
- Hosted-provider-specific tag protection configuration.
- Release publication, public-repository preparation, or Dashboard work.
