# WI-0072 rollback procedure

1. Revert the integrated implementation commit that changes `src/evidence.mjs`, `src/cli.mjs`, the focused tests, and the evidence documentation.
2. Run `npm run verify` on the reverted candidate before merging the rollback.
3. Retain both `temple/evidence/<sha>` tags. They preserve historical audit objects and remain necessary for the pre-existing Evidence Registry even when the new CLI behavior is rolled back.
4. Confirm a fresh clone still resolves `27d735d89d30915ee2399f80f85ad563477d420c` and `0b02e1c5de3d10aedc0f0ec64cb96af4d9de1e72`.
5. Do not delete or move an evidence tag unless the historical evidence is intentionally migrated through a separately approved process.

This rollback changes repository code only. It does not publish a release, modify repository visibility, or remove evidence history.
