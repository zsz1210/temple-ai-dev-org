# WI-0160 Work Order

## Outcome

Turn the public-profile audit's retained-legacy text findings and binary-review queue into a complete, value-redacted publication review. The result must say what can remain, what needs normalization, and which decisions still belong to the repository owner.

## Approved scope

- Reconcile every current text finding by rule, path class, record count, occurrence count, and recommended disposition without copying matched private values into the new report.
- Bind every tracked PNG to a SHA-256 digest, dimensions, byte size, content group, visual-review result, OCR privacy scan, and metadata result.
- Distinguish maintainer runtime history, first-party fixtures, vendored fixtures, and publishable visual evidence.
- Recommend the smallest provenance-preserving follow-up sequence.
- Refresh the validation index and release-readiness page with the review result.

## Acceptance criteria

1. The text inventory reconciles 330 retained-legacy finding records and 334 occurrences across 112 files.
2. The binary inventory reconciles all 68 tracked PNGs and records a digest-bound disposition for each one.
3. The review retains no matched private value, credential, raw prompt, raw response, or live account state.
4. Automation-safe remediation is separated from decisions that require Human authority.
5. Full repository verification and Independent QA pass at the same exact candidate revision.

## Risk and rollback

The main risk is treating an audit classification as proof that content is safe, or erasing provenance while trying to normalize it. This Work Item therefore records review evidence but does not rewrite legacy records, Git history, or vendored code. Its repository changes can be reverted normally.

## Exclusions

- No normalization of legacy findings in this Work Item.
- No Git-history rewrite, force push, visibility change, version change, tag, GitHub Release, npm publication, or announcement.
- No inference that a current-tree review resolves already-shared historical Git objects.
