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
| Corrected candidate Quality gate | Passed: `5e90ba2871124c047b57bcdb515ea8f652cc0045` | `.ai-org/artifacts/WI-0028/quality-test-report.md` |
| Exact private-origin push and matching GitHub CI | Passed: [run 33305884720](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33305884720) | `.ai-org/artifacts/WI-0028/quality-test-report.md` |
| Clean remote-clone reproduction | Passed: 195/195, schema 47/24/0, launcher Alpha.27 | `.ai-org/artifacts/WI-0028/quality-test-report.md` |
| Independent QA | GO at the exact candidate, including Node.js 20 | `.ai-org/artifacts/WI-0028/independent-qa-report.md` |
| Final annotated tag | Post-commit gate | Create only after the closeout commit itself passes matching CI and a fresh remote-clone reproduction; verify the remote tag object and peeled commit |

## Supported conclusion

After the post-commit tag gate passes, `v0.1.0-alpha.27` may be used as the private, reproducible baseline for Temple pilots and upgrades. The annotated tag and its peeled remote commit are the durable external evidence for that final step. Only the environments and commands recorded by this checkpoint are covered.

## Final release-manager sequence

1. Commit the organizational closeout and generated views once.
2. Fast-forward that exact commit to the private `main` branch.
3. Require the matching GitHub Actions run to succeed.
4. Clone the private origin again and reproduce that exact commit with lockfile installation, repository checks, 195/195 tests, schema validation, Doctor, launcher, and a clean worktree.
5. Confirm repository visibility is still private and the tag is still absent.
6. Create one annotated `v0.1.0-alpha.27` tag at that exact commit, push only that ref, and verify both the remote tag object and peeled commit.

Failure at any step stops the sequence without a tag. The tag is immutable after publication.

## Retained limits

- public repository and npm-release readiness;
- a narrowed package allowlist and public security-reporting process;
- protected-branch enforcement unavailable under the current private-repository plan;
- Windows and other untested operating systems;
- production, regulated, statistically meaningful efficiency, and real multi-machine qualification.

The retained items stay visible and are not silently reclassified as passing evidence.
