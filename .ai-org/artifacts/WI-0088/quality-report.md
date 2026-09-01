# WI-0088 Quality Report

## Independent environment

- Candidate revision: `1a82106c9fdc61efaa3aa502be320432c0bf82bf`
- Environment: fresh detached Git worktree
- Node.js: `v24.20.0` (supported LTS lane)
- Dependency install: `npm ci --ignore-scripts`; 8 packages audited, 0 vulnerabilities
- Browser: installed Google Chrome `152.0.7977.65`
- Browser automation: exact `playwright-core@1.62.1`

## Results

| Check | Result |
| --- | --- |
| Repository, documentation, and package boundary | Pass |
| Complete Node.js test suite | 268 passed, 0 failed in 50.9 s |
| Mobile 390x844 | Six primary views passed |
| Tablet 768x1024 | Six primary views passed |
| Desktop 1440x1000 | Six primary views passed |
| Ultrawide 3440x1440 | Six primary views passed |
| Reduced-motion behavior | Pass |
| Runtime schema | 109 documents against 28 schemas; valid |
| Doctor | 35 pass, 1 unrelated stale-plan warning, 0 fail |
| Exact-candidate worktree | Clean after verification |

The browser run used the real loopback Control Plane and repository-backed Console. It found no document-level horizontal overflow, primary-text clipping, named high-level overlap, primary-navigation failure, browser console error, uncaught page error, mobile-sidebar failure, organization-tab keyboard failure, or reduced-motion failure.

## CI and cost boundary

The workflow contract retains one `verify` job matrix. Only the Node.js 24 full lane requires `npm run test:browser`; Node.js 22 and both narrow scopes do not launch the browser. The test uses the runner's installed Chrome and contains no browser installer. A hosted run cannot be observed until a later authorized push, so this report proves the checked-in condition and exact local behavior rather than claiming hosted execution or billing.

## Quality decision

Pass. The candidate is ready for evaluation and Independent QA. This decision does not authorize a push, public release, package publication, or restoration of the stale Alpha.29 release candidate.

