# WI-0086 Public Release Blockers

- Latest local checkpoint: `cbd8f2aadd1f5bfe9ef4b961ec24b6fbc3eb5b57`
- Candidate version: `0.1.0-alpha.29`
- Proposed tag: `v0.1.0-alpha.29`
- Technical status: verified
- Public decision: NO-GO

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
