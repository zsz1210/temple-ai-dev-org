# WI-0086 Public Release Blockers

- Exact package source: `b8d5ef34a9ef18cb1a9e1f597b520d5311c08e97`
- Verified integration head: `296e16eb3528a050cff3f47e191774f3815583a3`
- Candidate version: `0.1.0-alpha.29`
- Proposed tag: `v0.1.0-alpha.29`
- Technical status: verified
- Public decision: NO-GO

The final technical checkpoint is reconciled in `final-package-and-hosted-reconciliation.md`. The exact package contains 309 files and has SHA-256 `0cb912f37796642c844b5c1da6e661e57a0690c82bc0192dd80c95ed8bf89bbc`; clean consumers under Node.js 22 and 24 passed version, install, init, idempotent re-init, launcher override, status, and Doctor with 36 pass, no warning, and no failure. GitHub Actions run [`33583589078`](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33583589078) passed both supported Node.js jobs at the evidence-bearing integration head, including all 276 tests and the Node.js 24 browser gate.

Historical hosted run `33576741884` correctly rejected an evidence-artifact digest mismatch even though both earlier 270-test lanes and the Node.js 24 browser gate passed. The correction is recorded in `hosted-ci-evidence-digest-failure.md`. Later hosted runs exposed a managed Observer platform-test mismatch and an unrelated Phase 4B cleanup race; WI-0095 and WI-0096 corrected and closed both issues. Those failures remain retained rather than waived, while run `33583589078` is the current passing hosted qualification.

WI-0092, WI-0093, WI-0095, and WI-0096 are closed. The managed-local Observer remains running by user request, its private viewer is read-only and path-redacted, and the measured snapshot latency and payload remain visible as non-blocking follow-up WI-0094.

## Completed Human evidence

- **Private conduct-reporting route** — the Human Principal approved and successfully tested `zsz1210+oss.temple@gmail.com`. `CODE_OF_CONDUCT.md` names the route and `SECURITY.md` uses it as the transition and fallback security route.

## Human evidence still required

1. **Genuinely independent public-instructions test** — a person without Temple development history must follow only the public instructions and retain their result. Maintainer automation and another maintainer-controlled agent do not satisfy this gate.
2. **Separate public-action approval** — repository visibility, tag creation, and the GitHub Release remain distinct approvals.

## External configuration still required

The repository is currently private. The current GitHub plan returns `403` for repository rulesets while private, and the private-vulnerability-reporting endpoint is not available in the present state. Before or immediately with public visibility, explicitly approve and verify:

- required CI on `main` through a branch rule or ruleset;
- review and force-push/deletion policy appropriate to the Solo-maintainer Alpha;
- private vulnerability reporting;
- secret scanning and push protection, where GitHub makes them available;
- continued operation of the approved private moderation route.

## Separately approved public actions

Only after the evidence above is complete:

1. change repository visibility to public;
2. create immutable tag `v0.1.0-alpha.29` at the approved exact revision;
3. create the GitHub Release and attach or link the reviewed source distribution;
4. make any announcement.

npm publication remains deferred and `private: true` must remain unchanged.
