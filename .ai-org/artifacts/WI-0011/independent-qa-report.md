# WI-0011 Independent QA Report

- Position: Independent QA
- Agent Identity: Lulu
- Candidate revision: `25a979e5bde887b00b30a94d5c26fe9403c7a558`
- Result: pass with retained limits

## Independent setup

Independent QA created a fresh detached Git worktree at the exact candidate revision. It installed dependencies with `npm ci`, ran only committed candidate content, verified the checkout remained clean, and removed the temporary worktree after the run.

## Reproduction

- `git rev-parse HEAD` returned exactly `25a979e5bde887b00b30a94d5c26fe9403c7a558`.
- `npm ci` installed six packages, audited seven packages, and reported zero vulnerabilities.
- Repository and documentation-link checks passed for 90 overlay files and 10 Positions.
- `npm run verify` passed all 160 tests with zero failures, skips, or todos.
- `doctor` returned 35 passes, one expected stale generated parallel-plan warning, and zero failures.
- A read-only preflight independently reproduced one terminal task, zero live-resumable tasks, zero observations, `no-live-registered-task`, `not-qualified`, account `not-probed`, disabled routing, no model counting call, and no canonical or external action.
- Deterministic tests independently reproduced live-resume preservation, terminal-history-only behavior, account-probe success and sanitized failure, raw-value exclusion, and fail-closed attribution.

## Decision

The exact candidate may proceed to Release Gate for the bounded Alpha.26 scope. This result does not establish live per-Work-Item Token measurements, a ten-Work-Item longitudinal baseline, Token or cost savings, model-recommendation quality, automatic routing, or production/regulated readiness.
