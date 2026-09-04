# WI-0154 Work Order

## Problem

The public Evidence Profile currently reports `review-required`, but a raw count of 402 does not tell the maintainer what is duplicated historical environment context, what is a binary visual artifact, or what decision is actually needed before publication.

## Approved scope

- Run the public-profile repository and package audit against the current exact revision.
- Reconcile every review-required occurrence by rule and repository path without storing matched values.
- Inventory every binary file and classify it by artifact purpose and format.
- Review binary visual evidence in bounded contact sheets for obvious private data or credentials.
- Separate current-tree cleanup recommendations, accepted Git-history exposure, future automated gates, and the later Human publication decision.
- Do not delete or normalize evidence, rewrite history, modify hosting settings, publish npm, or create a release.

## Acceptance criteria

1. Aggregated findings reconcile exactly to the machine-readable audit totals.
2. The report accounts for all text and binary review obligations without reproducing sensitive values.
3. Any visual artifact that cannot be confidently cleared is listed for direct Human review.
4. Recommendations are actionable but remain proposals; they do not imply publication approval.

## Risk review

The review is read-only and stores only redacted paths, rule IDs, counts, and conclusions. Temporary contact sheets stay outside the repository. The primary risk is accidentally copying a matched value into the report, so no source line or raw match will be persisted.
