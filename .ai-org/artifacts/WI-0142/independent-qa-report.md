# WI-0142 independent QA

## Verdict

Pass WI-0142 to the Release Manager for organizational closeout. The implementation repairs the bounded acquisition classifier, prevents uncontrolled cache differences from becoming causal efficiency claims, and preserves a reusable evaluation method for later process and model comparisons.

This verdict does not authorize a Provider run, automatic model routing, publication, or an external release. Independent QA was performed as `agent-lulu`, distinct from Developer `agent-rikku`.

## Acceptance review

| Requirement | Result |
|---|---|
| Supported sanitized App Server action shapes classify privacy-safe control-package reads | Pass |
| Ambiguous, multi-file, wrong-working-directory, and unsafe actions remain `unknown` | Pass |
| Raw commands, outputs, and prompt bodies are not retained | Pass |
| Gross input, cached input, non-cached input, output, and cache share are reported separately | Pass |
| A causal efficiency claim is blocked when cache control is absent, undeclared, unsupported, or failed | Pass |
| Process-only, model-only, and factorial experiments have a reusable non-executable protocol template | Pass |
| The guide covers future model launches without treating a new model name as a valid experimental contract | Pass |
| Retained WI-0141 artifacts remain unchanged | Pass |
| No model generation or external action occurred | Pass |

## Independent reproduction

Independent QA checked detached revision `567da1996df5d47a10cb66677b4fa467c41060f3`.

- focused Context Capsule ablation tests: 11 passed, 0 failed;
- complete repository verification: 411 passed, 0 failed;
- repository, documentation-link, and package-boundary checks: passed;
- WI-0141 artifact diff from `496a9490ea05462ddc738b4320554c8f11a949ac`: none;
- model invocations: 0;
- external actions: 0.

The first detached attempt stopped before testing because the temporary worktree had no dependency installation. After linking the existing lockfile-compatible `node_modules`, the same detached revision passed both focused and complete verification. This was an environment-preparation issue, not a candidate failure.

## Reproduced interpretation

- Single-repository routed context remains a supported diagnostic result, but not a causal efficiency result because cache control was not declared before the retained run.
- Multi-repository routed context remains a diagnostic tradeoff and is subject to the same causal block.
- The retained aggregate projection reports gross input, cached input, non-cached input, output, Operational Tokens, and latency separately instead of hiding cache sensitivity in one total.
- Historical acquisition records are not relabelled. The new classifier applies to future normalized evidence and sanitized fixtures.

## Release recommendation

Close WI-0142 as a local framework improvement. Keep the guide and template as the starting point for future workflow revisions and newly released model comparisons. Require a new frozen protocol and explicit execution approval before any live Provider experiment.
