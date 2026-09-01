# WI-0035 Independent QA Report

- Position: Independent QA
- Agent Identity: Lulu (`agent-lulu`)
- Developer Agent Identity: Rikku (`agent-rikku`)
- Candidate revision: `5db98cf25ff62cd73356f114e6cb15dee9474818`
- Environment: fresh detached worktree; supported Node.js `v24.20.0` used for the independent full behavioral run
- Result: pass

## Independent reproduction

- Fresh `npm ci --ignore-scripts`: pass; zero known dependency vulnerabilities reported by npm audit.
- Repository and documentation checks: pass.
- Package boundary: 305 allowed files; 630,710 bytes packed and 2,541,834 bytes unpacked.
- Full supported-runtime behavior: 262 tests passed on Node.js 24, zero failed, skipped, cancelled, or TODO.
- Schema validation: 108 documents through 28 schemas, zero errors.
- Doctor: 35 pass, one known stale parallel-plan warning, zero fail.
- Hosted run `33524235169`: evidence/state lane passed on Node.js 22 and 24 and skipped the full suite as designed.
- Hosted run `33523312535`: full lane passed all 262 tests on Node.js 22 and 24.

An additional diagnostic full run under the host's unsupported Node.js 25 also passed, but it is not used as support evidence. The public contract remains Node.js 22 and 24 LTS.

## Challenge checks

| Challenge | Result |
| --- | --- |
| Narrow scope silently accepts source, package, workflow, schema, test, executable, rename, deletion, or unknown changes | Not observed; adversarial cases select full verification. |
| A failing behavior lane is hidden by successful governance | Not observed; run `33520595751` failed and retained separate governance and behavioral outcomes. |
| The optimization deletes or disables tests | Not observed; the exact candidate passes the unchanged 262-test suite. |
| Hosted timing is inferred only from local runs | Not observed; job and workflow timestamps come from GitHub Actions run records. |
| `billable.total_ms = 0` is presented as proof of no cost | Not observed; the report explicitly retains account billing as unknown. |
| Developer and Independent QA are the same Agent Identity | Not observed; Developer is Rikku and Independent QA is Lulu. |

## Remaining boundary

The current credential cannot inspect the owner's authoritative Actions allowance or invoice, so no monetary saving is claimed. GitHub's documented rounded-minute rule supports an estimate, while the repository owner must use the GitHub billing and usage UI for actual account consumption. Changing an account budget remains a separate Human Principal action.

## Conclusion

Independent QA passes WI-0035. The implementation provides a measured repository-specific reduction for strict evidence/state changes, keeps the full supported-runtime suite available and blocking, and states the billing uncertainty honestly. It may proceed to Release Gate with no external release or account-setting action.
