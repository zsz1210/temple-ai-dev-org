# WI-0159 Work Order

## Outcome

Remove machine-identifying absolute paths from the current tracked evidence surface without erasing or rewriting the historical evidence that supports WI-0155 and WI-0156.

## Approved scope

- Replace the four maintainer home-directory values with non-identifying placeholders.
- Normalize the two concrete disposable tarball paths in the same retained records so the current files describe their role rather than one machine's location.
- Keep the original evidence verifiable at its already recorded Git revisions and SHA-256 digests.
- Add a machine-readable redaction manifest that records source revisions, Git blob IDs, original and replacement digests, and replacement classes without repeating the private values.
- Refresh the public audit and release-readiness wording.

## Acceptance criteria

1. The current tracked repository and package surfaces contain no blocked public-profile findings.
2. Existing normalized Evidence for WI-0155 and WI-0156 remains healthy because its immutable `scope_revision` content is unchanged.
3. The redaction manifest is complete, non-identifying, and machine-readable.
4. Documentation distinguishes the current-tree result from the separate full-history decision.
5. Full verification and Independent QA pass at an exact candidate revision.

## Risk and rollback

The main risk is making retained evidence appear to have been rewritten without traceability. The implementation therefore leaves the historical commits and normalized Evidence entries unchanged and records a verifiable mapping from historical blob and digest to the normalized current digest. Rollback is a normal revert of this Work Item's commits; no history rewrite is permitted.

## Exclusions

- No Git-history rewrite, force push, visibility change, tag, GitHub Release, npm publication, or announcement.
- No invalidation or re-certification of the original WI-0155 or WI-0156 test outcomes.
- No claim that a clean current tree makes historical commits private.
