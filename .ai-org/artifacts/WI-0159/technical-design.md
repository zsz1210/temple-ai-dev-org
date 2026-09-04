# WI-0159 Technical Design

## Revision-pinned provenance

The affected normalized Evidence entries already name immutable `scope_revision` values. Temple validates those artifacts with `git cat-file` at the recorded revision and compares their recorded SHA-256 digests. It does not substitute the current working-tree bytes when the historical artifact exists.

Current files may therefore be privacy-normalized without invalidating the original test observations. The original commits, Evidence IDs, and digests remain unchanged.

## Current-tree normalization

Concrete machine paths become semantic placeholders:

- disposable project locations become `<DISPOSABLE_PROJECT>`;
- the frozen package location becomes `<FROZEN_TARBALL>`.

The replacement removes machine identity while retaining the meaning required to interpret the experiment.

## Redaction manifest

`redaction-manifest.json` records each affected file's source revision, original Git blob ID, original SHA-256, replacement SHA-256, fields or lines normalized, and replacement class. It intentionally does not retain the original path string.

## Publication boundary

The public-profile audit evaluates the current tracked tree and package surface. A zero-blocker result does not scan or sanitize every historical Git object. Whether to accept the already-shared historical path exposure or perform a destructive history rewrite remains a separate Human decision before visibility changes.

## Verification

- run the public-profile audit for both repository and package surfaces;
- run Doctor and schema validation to prove historical Evidence remains healthy;
- run `npm run verify` at the exact candidate;
- have Independent QA reproduce the checks under an Agent Identity different from the Developer.
