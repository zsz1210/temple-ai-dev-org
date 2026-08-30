# WI-0006 Independent QA Report

- Position: Independent QA
- Agent Identity: Lulu (`agent-lulu`)
- Candidate revision: `7b6a7abe67e5c274161f7ceab1c475a3ddb2ccfe`
- Environment: fresh detached Git worktree with lockfile-strict dependency installation
- Result: pass

## Reproduction

1. Created a detached worktree at the exact candidate revision.
2. Installed dependencies with `npm ci --ignore-scripts`.
3. Ran `npm run verify` without using the Developer working tree.
4. Repository checks and local documentation-link checks passed.
5. All 137 behavioral tests passed with 0 failures, cancellations, skips, or TODO tests.

## Acceptance findings

- The design labels Phase 4 implementation and automatic routing as not delivered.
- Provider-reported metadata is the preferred exact usage source; model-assisted counting is prohibited solely for measurement.
- Usage-driver analysis includes Work Item, Position, stage, task, attempt, model, context digest, provenance, and outcome dimensions without requiring raw prompt retention.
- Position-based defaults are constrained by capability, risk, privacy, context, availability, and spending policy.
- Requested and effective routes plus fallback reasons remain observable.
- Budgets cannot weaken context, evidence, QA, approval, or spending boundaries.
- ADR and documentation links resolve at the exact candidate.

## Retained limits

- This verifies the design documents and existing repository behavior, not Phase 4 runtime implementation.
- Token savings, cost savings, automatic model routing, cross-project reporting, durability recovery, and federation remain unverified until their later Work Items execute the accepted contracts.
