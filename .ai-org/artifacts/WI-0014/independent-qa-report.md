# Independent QA report — WI-0014

- Position: Independent QA
- Agent Identity: Lulu
- Candidate revision: `23768e74ceb35a15589e194e0929f70914e8f407`
- Verdict: pass with retained operational limit

## Independent setup

- QA used a fresh detached worktree at the exact integrated candidate.
- `npm ci` installed 6 packages, audited 7 packages, and reported 0 vulnerabilities.
- QA did not modify the candidate or use the Developer's execution as test evidence.

## Reproduction

- Focused `node --test test/phase-4b.test.mjs`: 8/8 passed with zero failures, skips, or todos.
- Full `npm run verify`: repository checks passed for 90 overlay files and 10 Positions, documentation links passed, and 165/165 tests passed.
- An independent in-memory adversarial probe passed 14/14 assertions for an exact pair, a mismatched pair, and an unknown task.
- `node ./templew.mjs doctor . --json`: healthy, 35 pass, 1 warning, 0 fail. The sole warning is the stale generated parallel plan.
- The worktree remained clean, detached, and exactly at `23768e74ceb35a15589e194e0929f70914e8f407`.

## Semantic review

QA confirmed canonical/provider provenance separation, exact task-pair correlation, per-field unknown handling, deterministic coverage, read-only `--no-write`, privacy boundaries, explicit qualification gaps, and disabled savings, cost, model-quality, and routing claims.

## Retained operational limit

During the active QA turn, `task-0003` was the only live-resumable task, but the Provider again returned `Codex App Server thread/resume failed (-32600)`. Detailed observations remain zero, Token fields remain unknown, and ten correlated Work Items remain required. The candidate reports this truthfully; it does not solve the host/provider bridge.

No push, publication, deployment, external tracker write, model switch, or spending occurred.
