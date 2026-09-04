# WI-0162 Work Order

## Outcome

Remove the remaining current-tree local-environment text findings without erasing Temple's retained development evidence, weakening security checks, or modifying the pinned Archify source.

## Approved scope

- Add a deterministic, value-redacted, stale-safe plan/apply operation for tracked files below `.ai-org/artifacts/`.
- Normalize only maintainer home-directory prefixes, private IPv4 values, and private Tailnet hostnames in those retained current-tree copies.
- Replace literal local-environment values in Temple-owned test fixtures while preserving the exercised behavior.
- Add a narrowly constrained, exact-digest disposition for a reviewed local-environment fixture inside a provenance-verified installed adapter.
- Re-run repository, package, adapter-integrity, schema, and full verification checks.

## Acceptance criteria

1. The artifact plan is deterministic, contains only paths, rule counts, and before/after digests, and retains no matched values.
2. Apply requires an active claimed Work Item, explicit confirmation, and the exact current plan digest; stale input or validation failure leaves files unchanged.
3. Apply is idempotent and records a value-redacted event while Git history remains untouched.
4. Temple-owned fixtures still cover private-address, path-redaction, and Tailnet behavior without literal audit matches.
5. A reviewed vendored fixture is allowed only when its path and SHA-256 are present in an installed adapter's provenance manifest; secrets, package findings, changed bytes, and unrelated paths remain blocked.
6. The final public-profile audit has zero blocked text findings and zero unresolved text review findings. Binary review stays separate and remains review-required.

## Risk and rollback

The main risks are damaging retained evidence, silently weakening publication checks, or invalidating the pinned adapter. The operation binds exact before/after hashes, never changes Git history, rolls back partial writes, validates changed JSON and JavaScript, and leaves vendored bytes unchanged. A Git revert is the repository-level rollback.

## Exclusions

- No Git-history rewrite or pull-request-history rewrite.
- No repository visibility, version, tag, GitHub Release, npm publication, deployment, or announcement change.
- No blanket path, directory, regex, or filename allowlist.
- No exception for credentials, local-only data, package contents, unreadable files, or binary files.
