# WI-0138 Independent QA

- Tested revision: `87d0f8e2c4d1ab62e646a3bd76c8ee4409aed3c2`
- Position: Independent QA
- Agent Identity: Lulu (`agent-lulu`)
- Result: pass with an inconclusive effectiveness outcome

## Independent environment

The candidate was checked from a fresh detached Git worktree at the exact handoff revision. The temporary checkout used the main repository's installed development dependencies through a disposable `node_modules` link; tracked candidate files remained unchanged and the worktree was removed after verification.

## Reproduction

- Repository, documentation-link, and package-boundary checks passed.
- Context Capsule ablation tests passed 5/5.
- The analysis was recomputed directly from the frozen protocol and live observation and matched the retained analysis exactly.
- Four completed conditions and 106,300 Operational Tokens were reproduced.
- Both per-shape outcome labels reproduced as `inconclusive`.

## Findings

The runner completed the approved program once with no retry or fallback and retained adequate evidence for reproduction. Static source selection and tool-output reduction are supported for these fixtures. Operational Token and latency improvement are not supported by this sample.

The correctness gate is working as frozen but is unsuitable for the two narrative fields: equivalent punctuation and correct explanatory text fail byte-exact comparison. The same mismatch occurs in both treatments. Independent QA does not override or normalize the observed results after the fact.

The requested `medium` effort was not confirmed as effective: Provider telemetry observed `high` thread effort and left effective turn effort unavailable. Do not market this as a Terra-medium benchmark.

## Independent QA decision

Pass the integrity and reproducibility of the experiment, with the product conclusion explicitly retained as inconclusive. A successor must first prove typed evaluator fields and effective-effort reporting without generation; it requires a new protocol and approval if another Provider run is proposed.
