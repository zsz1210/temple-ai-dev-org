# WI-0168 Quality Evaluation

## Result

Pass for Independent QA at candidate `a9265f7e10ecb08cec6474adfc8d35050abfca38`.

## Acceptance evaluation

| Criterion | Result | Evidence |
| --- | --- | --- |
| Only a published GitHub Release can trigger publication | Pass | Static workflow test requires exactly `release: types: [published]` and rejects push, pull request, manual, and scheduled triggers. |
| Release identity and channel fail closed | Pass | Unit tests cover prerelease -> `next`, stable -> `latest`, and rejection of crossed flags, tag drift, repository drift, package-policy drift, old npm CLI, and pack identity drift. |
| Exact GitHub Release asset is published | Pass | The workflow fresh-packs the checked-out tag, downloads the uniquely named Release asset, then requires equal regular-file size and bytes before `npm publish`. |
| No long-lived npm write credential | Pass | Workflow permissions are exactly `contents: read` and `id-token: write`; tests reject npm token, `NODE_AUTH_TOKEN`, and repository secret references. |
| Supply-chain dependencies remain pinned and bounded | Pass | Both Actions use existing full commit SHA pins, the release cache is disabled, checkout credentials are not persisted, and the job has a 15-minute timeout with no retry or fallback. |
| Human guidance matches shipped behavior | Pass | ADR-0050 and the npm release runbook explain the trigger, one-time trust relationship, draft preparation, channel mapping, failure response, immutable-version rollback, and first-live-proof boundary. README copy states the narrower difference between npm CLI installation and source-based guided setup. |

## Independent checks at Test stage

- `npm run verify:fast`: 39 passed, 0 failed.
- `node --check scripts/validate-npm-release.mjs`: passed.
- `git diff --check`: passed.
- Complete Developer verification: 449 passed, 0 failed.
- Local exact-archive simulation: 830,077 bytes and SHA-256 `a66f38cabb25898540d945cad84e4ffdc9913f9e9ec4e4b035cda687905df577`.

## Retained limitations

- GitHub-hosted execution has not run until the branch is pushed and recognized by GitHub.
- npm OIDC acceptance cannot be tested without configuring the package trust relationship and intentionally publishing a new version.
- The current Alpha.30 package is not republished and does not contain this workflow or documentation revision.
- The workflow deliberately fails if a Release is published without its exact `.tgz` asset.

These limitations are visible and do not invalidate local policy qualification. They remain Release Manager checks rather than hidden success claims.
