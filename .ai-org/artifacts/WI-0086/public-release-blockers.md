# WI-0086 Public Release Blockers

- Exact local candidate: `02cc9228a6b9d20e4875d3f7f7352aab0b7012dd`
- Candidate version: `0.1.0-alpha.29`
- Proposed tag: `v0.1.0-alpha.29`
- Technical status: verified
- Public decision: NO-GO

The current package checkpoint passed the complete local release requalification recorded in `post-observer-final-requalification.md`: 276 tests on Node.js 22 and 24, the Node.js 24 browser gate, 115 schema documents, Doctor with 36 pass and no warning or failure, both dependency audits, a 309-file exact tarball, and clean consumer smoke under both supported Node.js majors. A fresh hosted result for this exact package candidate is pending the private push.

Historical hosted run `33576741884` correctly rejected an evidence-artifact digest mismatch even though both earlier 270-test lanes and the Node.js 24 browser gate passed. The correction is recorded in `hosted-ci-evidence-digest-failure.md`. Corrected evidence/state run `33577330137` and full run `33577411806` passed at the preceding integration head `650f1aa2c13695be324f40f07bb0f44b66a6c9f3`; they remain historical evidence, not qualification for `02cc922`.

WI-0092 and corrective WI-0093 are closed. The managed-local Observer remains running by user request, its private viewer is read-only and path-redacted, and the measured snapshot latency and payload remain visible as non-blocking follow-up WI-0094.

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
