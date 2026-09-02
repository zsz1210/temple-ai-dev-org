# WI-0099 Independent QA

## Decision

Pass at exact candidate `36703f375a807303a68fde9487af11ac0364f578`.

## Independent verification

- Created a fresh detached worktree at the exact candidate revision.
- Confirmed Node.js `v24.20.0`, then completed a lockfile-strict `npm ci --ignore-scripts` install.
- `npm run verify` passed all repository checks and 272 tests with zero failures.
- `npm run test:browser` passed Chrome `152.0.7977.65` at mobile, tablet, desktop, and ultrawide sizes across all six primary Management Console views.
- Reduced-motion behavior passed.
- The detached worktree remained clean after verification.

## Acceptance assessment

The candidate consistently requires Node.js 24 or later, constrains ordinary GitHub Actions to one five-minute Node.js 24 job, and keeps the complete integration and browser suites as explicit local gates. The workflow contract tests guard against restoring the Node.js matrix, Node.js 22, the removed scope classifier, or long suites in hosted CI.

## Residual boundary

The first real run of the new bounded GitHub Actions workflow remains pending until the candidate is pushed. Pull-request review and integration approval also remain separate requirements; this Independent QA decision does not authorize a merge.
