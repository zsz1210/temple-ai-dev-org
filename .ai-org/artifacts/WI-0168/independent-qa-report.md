# WI-0168 Independent QA Report

## Decision

Pass for Release Gate at exact candidate `a9265f7e10ecb08cec6474adfc8d35050abfca38`.

## Independence

- Developer: Rikku (`agent-rikku`)
- Independent QA: Lulu (`agent-lulu`)
- Checkout: separate detached Git worktree at the exact candidate revision
- Starting state: clean, no branch, dependencies absent before installation

## Reproduction

Independent QA ran:

```bash
npm ci --ignore-scripts
npm run verify
```

Results:

- Dependency install and audit: passed, zero known vulnerabilities.
- Repository, documentation-link, and package-boundary checks: passed.
- Full suite: 449 passed, 0 failed, 0 skipped.
- Package boundary: 384 files, 830,077 packed bytes, 3,284,308 unpacked bytes.
- The release workflow tests passed inside both the fast set and full suite.

## Challenge review

Independent QA confirmed that:

- there is no push, pull-request, merge, tag-only, scheduled, or manual workflow trigger;
- `release.published` covers the intended GitHub stable and prerelease publication action;
- checkout uses the event's exact tag and does not persist Git credentials;
- publication receives only `contents: read` and `id-token: write`;
- no npm token, `NODE_AUTH_TOKEN`, or GitHub repository secret appears in the workflow;
- npm CLI 11.5.1 is enforced before the OIDC publish path;
- stable and prerelease version classifications cannot cross channels;
- the Release `.tgz` must be one regular file and byte-identical to a fresh pack;
- Actions are full-SHA pinned, the release cache is disabled, and no retry or fallback is present;
- the human runbook does not claim that local qualification proves a live OIDC exchange.

## Retained Release Manager checks

GitHub must recognize the pushed workflow and pass branch CI. After merge, the package owner must create the exact npm Trusted Publisher relationship. No new version should be published merely to test configuration; the first live proof belongs to the next separately approved Release.
