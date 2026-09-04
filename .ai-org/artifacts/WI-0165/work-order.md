# WI-0165 Work Order

## Outcome

Determine what text from Temple's Git history would become reachable if the current GitHub repository later becomes public. The review must distinguish credential risk from optional privacy cleanup and leave the publication decision with the repository owner.

## Approved scope

- Inspect commits reachable from `main`, every Git tag, and every GitHub pull-request head ref present at the review boundary.
- Scan each unique historical text blob once using the credential and local-environment shapes already used by Temple's public Evidence Profile.
- Inventory commit-author metadata separately because names and email addresses are Git history, not file content.
- Retain counts, rules, paths, object identifiers, and classifications without retaining matched values or source-line excerpts.
- Exclude images and other media from content review. Count skipped media and non-text blobs only so the coverage boundary remains explicit.
- Refresh the public-readiness documentation with the evidence-backed result.

## Acceptance criteria

1. The report pins the exact local `main`, tag, and GitHub pull-request ref set used by the audit.
2. Every reachable unique blob is classified as scanned text, excluded media, non-text binary, or inspection failure.
3. Secret-shaped findings are separated into credible credential blockers and demonstrably synthetic historical fixtures.
4. Local paths, private addresses, Tailnet hostnames, and commit identity metadata are quantified without copying their values.
5. The report states whether a history rewrite is technically required, optional for privacy, or not warranted.
6. Repository visibility, tags, Releases, npm state, Git history, and remote refs remain unchanged.

## Risk and rollback

The primary risk is copying the value being reviewed into a new artifact. The scanner therefore emits only value-redacted metadata. The second risk is mistaking local-only branches for public exposure; the boundary includes GitHub pull-request heads but excludes local branches that have never been published. All repository changes are ordinary documentation and evidence files and can be reverted normally.

## Exclusions

- No PNG, JPEG, SVG, PDF, audio, video, or other media content review.
- No Git-history rewrite, force push, ref deletion, visibility change, tag, GitHub Release, npm publication, deployment, or announcement.
- No claim that a text-pattern scan is a complete security certification.
