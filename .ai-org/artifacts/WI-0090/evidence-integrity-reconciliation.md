# WI-0090 Evidence Integrity Reconciliation

After organizational closeout, Doctor correctly rejected two normalized evidence relationships:

- the registered Quality observation pointed to `quality-report.md`, which had later been edited to append hosted CI results;
- the registered Independent QA observation pointed to a release-validation document that already existed with different bytes at the technical candidate revision.

The correction preserved the test outcomes while restoring immutable evidence boundaries:

1. `quality-report.md` was restored byte-for-byte to the content registered by evidence `EVID-20260901T232515Z-A389D52C`.
2. Hosted CI remains recorded in the separately committed Independent QA report, release validation, readiness report, and Release Manager review.
3. The Independent QA observation now references only its immutable observation, QA report, and Developer verification artifacts; its registry digest was reconciled to the corrected observation bytes.
4. No test result, candidate revision, hosted job conclusion, package content, lifecycle result, or public-action boundary changed.

Post-correction Doctor reports 35 pass, one known stale generated-plan warning, and zero failures. Runtime schema validation reports 111 documents valid against 28 schemas.
