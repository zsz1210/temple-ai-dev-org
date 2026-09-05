# Sanitized integration lineage

The maintainer approved a separate sanitized lineage for unpublished commits. Original local branches, `main`, and PR #58 are preserved. No force push, deletion, experiment retry, package publication, or merge is part of this operation.

## Mechanical transformation

The retained public base is `9ef5d331858f30b2fd78fdac0e93fdc126396bd5` (PR #58). Of the 33 subsequent commit trees, only the design-intake tree originally identified by `17f39f6` changed: exactly two local checkout fields in `.ai-org/work-items/WI-0183.json` were normalized to null. Parent references were then remapped without changing commit messages, author metadata, or other tree contents. No signed commit required stripping or replacement.

All other commit trees remain identical, including all three proposed PR boundaries and the candidate with full verification. `sanitized-revisions.json` translates original historical references to sanitized commits and records both tree IDs. It contains hashes only, not the removed path. Original test/QA reports and canonical historical revision references remain unchanged; the map does not fabricate a new test execution or automatically repin lifecycle authority.

| Purpose | Original | Sanitized |
| --- | --- | --- |
| WI-0188 tested candidate | `6346e02656347feed6b1bfd211562ff3ba6818cf` | `04732da7a0c454885755b4fdc9e2f67f90c2ad5a` |
| Lean chain PR head | `7c9c1b88b96b8d334c5c0a88bd287f473ce4fc42` | `c2982c53ad4687c1c596ff60666adc93710c1ffd` |
| Retained POC PR head | `b15b741aeaa2e099e7e822808454088e0f2e29d0` | `4c6a23213516eaabc4b4e184ca60115e7ab3bc21` |
| WI-0190 tested candidate | `50ae4f50fcf74d8468e09956e44e1eb9da99ef71` | `f9332bdca3264eebfd071607c00d7c3415f77d24` |
| Sanitized integration snapshot | `653e6b5c96fe80f8f8cd140cc49ea81742a5949b` | `8504040a1604c82fb536e0d5d57303aba2c9ebe5` |

## Publication inspection

A scan of all newly reachable text objects after the public base inspected 324 text blobs and 33 commit objects, with zero new binary objects. It found no matches for the configured private-key, OpenAI/GitHub/npm/AWS credential, home-directory, private-IP, and tailnet-host patterns. This is bounded pattern coverage, not a universal guarantee that every secret format is detectable. Existing images were not re-reviewed. Current-tree publication audit retained zero blocked findings and the 68 preexisting binary review items.

## Integration limits

Fresh local `npm ci --ignore-scripts && npm run verify` passed on sanitized snapshot `8504040a1604c82fb536e0d5d57303aba2c9ebe5`: repository/docs/package checks and **632/632 tests**, zero failures/skips/cancellations, test-runner duration **151099.61975 ms**. Concurrent changes were this handoff's organizational claim/evidence records only; tested source, tests, templates, scripts and lock remained unchanged. This is a fresh regression result, not a new independent QA or live-model comparison. The original candidate's distinct QA remains scoped to its original SHA and the documented identical tree.

Publish new branches only, then review the chain from PR #58 through Lean improvements, retained POC evidence, and proportionate routes. WI-0189 still lacks outer QA; its PR remains draft and does not claim accepted parallel delivery or efficiency improvement. Dependent PRs must not be merged out of order. Recheck the actual integration candidate after a base or source change. Original local branches remain recovery evidence and must not later be pushed accidentally.

Historical references that no longer resolve in a fresh public clone must be interpreted using the map and original report scope; they are not fresh canonical pinning. This document supersedes the publication-hold portion of `integration-handoff.md` only after the listed sanitized refs are used; it does not clear the original branches for publication.
