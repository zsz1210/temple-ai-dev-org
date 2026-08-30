# Alpha.27 private release checkpoint

- Version: `0.1.0-alpha.27`
- Governing Work Item: `WI-0028`
- Intended tag: `v0.1.0-alpha.27`
- Scope: private GitHub checkpoint only

## Why this checkpoint exists

The Phase 4 local implementation is complete, but local evidence alone does not prove that another checkout can reproduce it. This checkpoint converts the reviewed repository state into a traceable private release boundary: exact commit, matching CI, clean remote clone, Independent QA, and an immutable annotated Git tag.

The tag is a reproducible milestone for later pilots and framework upgrades. It is not a public launch, npm publication, production deployment, or claim of enterprise qualification.

## Gate status

| Gate | Status | Evidence |
| --- | --- | --- |
| Version, licensing, provenance, dependency, CI, and secret-pattern preflight | Passed locally | `.ai-org/artifacts/WI-0028/release-preflight.md` |
| Minimum declared Node.js major | Passed: Node.js 20.20.2, 195/195 | `.ai-org/artifacts/WI-0028/release-preflight.md` |
| Exact private-origin push and matching GitHub CI | Pending | Added after the matching run completes |
| Clean remote-clone reproduction | Pending | Added after the exact pushed revision is reproduced |
| Independent QA | Pending | `.ai-org/artifacts/WI-0028/independent-qa-report.md` when complete |
| Final annotated tag | Pending | Verified remote tag and peeled commit when complete |

## Supported conclusion

When every pending gate above passes, `v0.1.0-alpha.27` may be used as the private, reproducible baseline for Temple pilots and upgrades. Only the environments and commands recorded by this checkpoint are covered.

## Retained limits

- public repository and npm-release readiness;
- a narrowed package allowlist and public security-reporting process;
- protected-branch enforcement unavailable under the current private-repository plan;
- Windows and other untested operating systems;
- production, regulated, statistically meaningful efficiency, and real multi-machine qualification.

The retained items stay visible and are not silently reclassified as passing evidence.
