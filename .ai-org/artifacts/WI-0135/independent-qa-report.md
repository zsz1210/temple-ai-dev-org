# Independent QA report - WI-0135

## Decision

Pass for the exact candidate revision `00ea3a4731bc27bd89084be3bd3660618e431da9`.

Independent QA reproduced the complete repository gate and challenged the experiment's protocol, retained evidence, and interpretation. No blocking defect or unsupported positive claim was found.

## Reproduction

- `npm run verify`: 359 / 359 tests pass, including repository checks, documentation links, package boundary, the frozen four-arm regression, and the new Terra A/B analysis test.
- `node ./templew.mjs doctor . --json`: healthy, 36 pass, zero fail, with only the expected stale generated parallel-plan warning before the final rebuild.
- Exact protocol digest: `2e8b3053beed780c9851027382675b5aecea658aa4d7231d412e3ce96bcdf071`.
- Exact owner approval: accepted; existing Pro allowance only; purchased Credits, automatic refill, reset, retries, fallback, and network access prohibited.
- Preflight: 20 checks pass, zero fail; CLI and ten App Server schemas match; Terra medium and high are available.
- Retained analysis: independently recomputed from local evidence and equal to the repository record after excluding only the added source digest.
- Resource accounting: 126,755 candidate plus 23,227 evaluator operational Tokens equals 149,982, below the 209,000 combined ceiling.
- Quality: all four candidates pass public and held-out tests; four blind scores of 100 were frozen before mapping unseal.

## Challenge findings

1. The optimized process does not satisfy the Token-improvement threshold. The `neutral` classification is correct even though latency improved.
2. The report clearly separates same-run controlled evidence from cross-run context and avoids treating the earlier baseline drift as causal.
3. The report does not claim monetary savings, statistical qualification, universal effectiveness, or routing authority.
4. The candidate turns requested medium reasoning, but the provider exposed thread-level high and no effective turn value. This remains a disclosed measurement limitation, not a hidden Terra-medium claim.
5. No PDF, raw prompt, raw response, hidden reasoning, credential, or candidate repository is retained in Git.

## Residual limitations

The sample is too small and narrow to establish general effectiveness. A future representative validation should measure organizational outcomes such as duplicate-work avoidance, cold-task recovery, handoff quality, review findings, human intervention, and rework across multi-Agent and multi-repository work.
