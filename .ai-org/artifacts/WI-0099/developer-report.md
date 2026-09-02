# WI-0099 developer verification

## Candidate

- Exact revision: `36703f375a807303a68fde9487af11ac0364f578`
- Runtime floor used for verification: Node.js `v24.20.0`
- npm: `11.19.0`
- Environment: fresh detached Git worktree with lockfile-strict install

## Results

- `npm run verify`: 272 tests passed, 0 failed, 0 skipped, and all repository, documentation-link, and package-boundary checks passed.
- `npm run test:browser`: installed Chrome `152.0.7977.65` passed mobile, tablet, desktop, and ultrawide layouts across six primary views plus reduced-motion behavior.
- Exact hosted-command simulation: dependency install, repository checks, schema validation, Doctor, and 25 fast contracts passed in 20.43 seconds locally.
- Schema validation: 121 documents matched 29 schemas.
- Doctor: 36 pass, one existing stale generated-plan warning, and zero failures.
- Package boundary: 313 allowlisted files; the repository's self-host state, tests, development scripts, and screenshots remain excluded.

## Contract checks

- The ordinary GitHub workflow has one job named `Verify (Node.js 24)` and a five-minute timeout.
- No Node.js matrix, Node.js 22 setup, `npm run test:full`, `npm run test:browser`, or changed-path classifier remains in the workflow.
- `npm run verify` and `npm run test:browser` remain explicit local commands and are protected by tests and documentation.
- `package.json`, `package-lock.json`, `src/bootstrap.mjs`, and `temple.lock` agree on `>=24.0.0`.

## External boundary

GitHub Actions run `33589295734` was cancelled at the user's request before this candidate was created. No repository setting, protection rule, billing setting, tag, release, publication, or merge was changed. A short Node.js 24 hosted run remains required after this candidate is pushed.
