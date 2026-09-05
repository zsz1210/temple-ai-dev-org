# WI-0168 Developer Verification

## Candidate

- Revision: `a9265f7e10ecb08cec6474adfc8d35050abfca38`
- Branch: `codex/wi-0168-release-only-npm-oidc`
- Developer Agent Identity: Rikku (`agent-rikku`)
- Node.js: `v24.20.0`
- npm CLI: `11.19.0`

## Implemented

- Added a `release.published`-only GitHub Actions workflow with SHA-pinned checkout and Node setup Actions.
- Added a dependency-free fail-closed validator for tag, semantic version, GitHub prerelease classification, repository metadata, package policy, npm CLI version, pack identity, regular files, byte identity, and SHA-256.
- Added deterministic release-policy tests to the bounded pull-request suite.
- Added ADR-0050, an npm release runbook, corrected current Alpha.30 publication facts, and aligned the three README installation entry points.
- Added `package.json` to the realized write scope only to include the 50 ms release-policy test in `test:fast`; no version, dependency, package file allowlist, or publication default changed.

## Verification

- `npm run verify`: passed, 449 tests, 0 failures.
- Repository checks: passed, 110 overlay files and 10 Positions.
- Documentation links: passed.
- Package boundary: passed, 384 files, 830,077 packed bytes, 3,284,308 unpacked bytes.
- Exact-candidate release validator: passed for `v0.1.0-alpha.30` as prerelease -> `next`.
- Byte-identical local asset simulation: passed; archive SHA-256 `a66f38cabb25898540d945cad84e4ffdc9913f9e9ec4e4b035cda687905df577`, size 830,077 bytes.
- Negative tests rejected wrong tag, crossed Release channel, repository mismatch, changed package publication policy, npm CLI below 11.5.1, pack identity drift, and archive byte drift.

## External-action boundary

No GitHub Release, npm publish, npm trust change, token creation, deployment, or announcement was performed. The local archive simulation is test evidence only and is not the Alpha.30 published archive.

## Remaining proof

GitHub must accept and run the merged workflow syntax. The npm Trusted Publisher relationship can be created only after `publish-npm.yml` exists on the default branch. End-to-end OIDC publication can be proven only by the next deliberately approved new Release.
