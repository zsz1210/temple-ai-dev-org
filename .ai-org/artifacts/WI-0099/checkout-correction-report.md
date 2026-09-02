# WI-0099 checkout correction verification

## Trigger

Bounded GitHub Actions run `33591053632` completed quickly but failed Doctor because the workflow used the checkout action's shallow-history default. Historical revision-bound evidence therefore appeared unavailable in the runner even though it remained valid in the repository.

## Correction

Candidate `c3246b6496430d24c18b82ed7c880d9741544f23` sets `fetch-depth: 0` and adds a contract assertion for that requirement. The job remains one Node.js 24 runner with a five-minute timeout and does not execute the complete or browser suite.

## Local exact-candidate result

- Fresh detached worktree under Node.js `v24.20.0`.
- Lockfile-strict dependency installation passed with zero known vulnerabilities.
- `npm run verify`: 272 passed, 0 failed.
- `npm run test:browser`: four viewports, six primary views, and reduced motion passed in Chrome `152.0.7977.65`.
- The detached worktree remained clean.

The corrected bounded hosted result and pull-request review remain pending. No merge, release, or publication is authorized by this result.
