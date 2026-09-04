# WI-0160 Technical Design

## Review boundary

The public Evidence Profile remains the source of classification. The review consumes its current repository and package results, but does not copy matched values into new artifacts. Counts are reconciled at three levels: audit finding record, matched occurrence, and unique path.

## Text inventory

`text-inventory.json` groups findings by repository area and rule. Each affected path records line numbers, counts, and a disposition class, but not the matched value or source-line content.

The disposition classes are:

- `normalize-through-canonical-migration`: project-owned lifecycle or registry data that must not be hand-edited;
- `normalize-with-provenance`: retained evidence whose current-tree copy may be normalized only while preserving revision-pinned provenance;
- `replace-first-party-fixture`: synthetic tests that should use clearly non-maintainer fixture values;
- `review-vendored-fixture`: pinned third-party test content that should not be edited as if it were project-owned.

## Binary inventory

`binary-review.json` binds every tracked PNG to its current SHA-256 digest, dimensions, byte size, and content group. Review combines:

- contact-sheet visual inspection of all 68 images;
- original-size inspection where text density or content warranted it;
- Apple Vision OCR followed by privacy-pattern classification;
- PNG chunk inspection for text or EXIF payloads.

The inventory stores scan categories and counts, not recognized text. A warning word such as `secret` is not treated as a secret value.

## Decision boundary

Digest-reviewed images may remain in the current tree. Text normalization requires separate implementation because canonical Work Items and registries need supported Temple mutations, while retained evidence needs provenance manifests. Git-history treatment and public visibility remain Human decisions.

## Verification

- reproduce the public-profile audit totals;
- verify every binary digest and dimension against the tracked file;
- validate that the inventories contain no absolute home path, private address, Tailnet hostname, email address, or credential value;
- run `npm run verify` at the exact candidate;
- require Independent QA by an Agent Identity different from the Developer.
