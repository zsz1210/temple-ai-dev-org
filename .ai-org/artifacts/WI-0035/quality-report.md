# WI-0035 Quality Report

- Position: Quality & Evaluation Engineer
- Agent Identity: Lulu (`agent-lulu`)
- Integrated revision under test: `5db98cf25ff62cd73356f114e6cb15dee9474818`
- Original Developer candidate: `0b02e1c5de3d10aedc0f0ec64cb96af4d9de1e72`
- Result: pass for Test

## Acceptance checks

| Acceptance boundary | Result | Evidence |
| --- | --- | --- |
| Governance and behavior remain visible | Pass | Workflow contract tests require `always()` on installation, governance, schema, Doctor, and both behavioral paths. The summary and final aggregation remain separate, and the failed Node.js 24 behavioral lane in run `33520595751` still reported the completed governance result before failing the job. |
| Narrow evidence/state verification | Pass | Run `33524235169` selected `evidence-state-only`; Node.js 22 and 24 both ran repository checks, schema, Doctor, and focused contracts while skipping the full suite. |
| Fail-closed classification | Pass | Eleven classifier/workflow tests cover empty or invalid ranges, rename, copy, deletion, mode changes, executable files, unknown paths, mixed scopes, workflow, package, schema, source, and test changes. Every unsafe or ambiguous case selects full verification. |
| Full behavior remains blocking | Pass | Run `33523312535` selected full verification and passed 262 tests on both Node.js 22 and 24. Earlier run `33520595751` failed when the Node.js 24 full suite exposed the Linux cleanup race; the final aggregation did not hide it. |
| Hosted timing is measured | Pass | Job start and completion timestamps were read from the GitHub Actions run records for exact revisions. |
| Actual account charge is known | Not verified | The Actions timing endpoint returned `billable.total_ms = 0`, but the current credential cannot read the account billing ledger. Zero in this endpoint is not treated as proof of zero allowance use or zero charge. |

## Hosted comparison

| Scope and run | Node.js 22 job | Node.js 24 job | Sum of job runtime | Workflow wall time |
| --- | ---: | ---: | ---: | ---: |
| Full — `33523312535` at `420049e` | 402 s | 332 s | 734 s | 407 s |
| Evidence/state — `33524235169` at `5db98cf` | 56 s | 47 s | 103 s | 60 s |

The narrow run reduced observed aggregate runner time by 631 seconds (86.0%) and workflow wall time by 347 seconds (85.3%) relative to the measured full run. The comparison uses the same workflow structure, GitHub-hosted Ubuntu runners, and Node.js 22/24 matrix. It is operational evidence for this repository, not a universal benchmark.

GitHub documents that private-repository jobs on GitHub-hosted runners consume plan minutes and that each job's billable time is rounded up to the next minute. Under that published rule, these observed durations correspond to a potential allowance effect of 13 rounded job-minutes for the full run versus 2 for the narrow run. This is an estimate from public billing semantics, not an observed invoice. The authoritative account value remains the GitHub billing and usage page.

References:

- <https://docs.github.com/en/actions/how-tos/monitor-workflows/view-job-execution-time>
- <https://docs.github.com/en/billing/concepts/product-billing/github-actions>
- <https://docs.github.com/en/billing/how-tos/set-up-budgets>

## What the data does and does not justify

- Keep all 262 tests. The expensive part is when they run, not that they exist.
- Keep the full Node.js 22/24 matrix for executable, package, schema, workflow, source, test, unsafe, or ambiguous changes while both LTS majors are part of the public compatibility promise.
- Use local focused tests during development; use the hosted matrix as integration and supported-platform evidence.
- The current narrow lane already provides a large measured reduction for strict lifecycle/evidence changes.
- A mixed documentation plus evidence/state change still fails closed to full. Run `33523312535` demonstrates the cost of that conservative rule, but changing it requires a separately designed regression boundary rather than weakening this Test-stage item.
- A hard GitHub Actions budget can prevent paid overage after included usage is exhausted, but it is an account setting and was not changed by this Work Item.

## Quality conclusion

WI-0035 meets its bounded acceptance criteria on hosted GitHub Actions. Hosted runtime is now verified, and the difference between measured execution time, estimated rounded allowance minutes, and unavailable account billing data is explicit. The item is ready for Evaluation and Independent QA without deleting tests or weakening the fail-closed full lane.
