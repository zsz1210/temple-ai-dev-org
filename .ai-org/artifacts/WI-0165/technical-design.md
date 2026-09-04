# WI-0165 Technical Design

## Public ref boundary

The audited object graph is the union of:

- the exact `main` commit;
- every local tag, including Temple Evidence tags and historical semantic-version tags; and
- every GitHub `refs/pull/*/head` ref reported by `origin` at collection time.

`origin/main` must equal local `main`. Local development branches are not included merely because they exist on the maintainer's machine. GitHub pull-request head refs are included because merged or closed pull-request history can become visible with the repository.

The collection step fetches pull-request heads into a temporary `refs/temple-audit/` namespace, records their exact object IDs, runs the audit, and removes that temporary namespace. It does not create, update, or delete any remote ref.

## Blob classification

`audit-git-history-text.mjs` walks the unique objects reachable from the pinned boundary. Every blob receives exactly one content disposition:

- `scanned-text`: valid UTF-8 without NUL bytes and within the bounded scanner size;
- `excluded-media`: an image, document, audio, video, or font extension intentionally excluded by this review;
- `non-text-binary`: other content containing NUL bytes or invalid UTF-8; or
- `inspection-failure`: text-like content that cannot be inspected within the declared bound.

Media and binary bytes are never decoded or rendered. Their counts and total bytes document the exclusion without repeating WI-0160's image review.

## Text rules and redaction

The scanner mirrors Temple's current publication rules for private-key headers, OpenAI/GitHub/AWS/npm token shapes, maintainer home paths, private IPv4 addresses, and private Tailnet hostnames. Email addresses are counted separately as privacy metadata. Synthetic usernames from the Evidence Profile are ignored for home-path matching.

Findings contain rule ID, historical path, line number, blob ID, occurrence count, and a classification. They never contain matched values, source lines, token fragments, email addresses, usernames, or a reversible digest of the value.

Secret-shaped matches are `blocked` unless a separate review proves that the exact occurrence is a deterministic fixture. A low-diversity placeholder in a test or fixture path may be classified `synthetic-fixture`; path location alone is insufficient. `reviewed-secret-fixtures.json` binds any manual fixture disposition to exact blob IDs, paths, rules, and occurrence counts. The scan fails closed if any fact drifts or any reviewed entry is absent.

## Commit identity metadata

Commit author and committer identities are summarized as unique pair counts and occurrence counts. The machine-readable result does not repeat names or email addresses. These identities are public Git metadata and therefore require an explicit retained-metadata disposition, not file normalization.

## Decision boundary

- A credible credential finding makes public visibility a blocker and requires rotation plus a separately approved history-remediation plan.
- Historical local-environment values create a privacy decision. They do not by themselves prove account compromise.
- A history rewrite is never performed by this Work Item. If the owner later chooses it, rewrite, collaborator coordination, tag handling, pull-request effects, force-push recovery, and credential rotation require a new destructive-change plan.
- A clean result does not authorize publication.
