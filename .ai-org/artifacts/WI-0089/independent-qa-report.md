# WI-0089 Independent QA Report

## Independence

- Developer: Rikku (`agent-rikku`)
- Independent QA: Lulu (`agent-lulu`)
- Candidate revision: `86b0cdf462f995efdaf93fa0e8eb173be000bc35`
- Verification used a second fresh detached worktree rather than the Developer or Quality working environment.

## Positive control

Under Node.js `v24.20.0`, a clean install completed with zero reported vulnerabilities and all 27 focused workflow and orchestration tests passed. These tests exercise title generation, registry reconciliation, task metadata preservation, idempotence, lifecycle output, and parallel dispatch suggestions.

Quality had already reproduced the complete 270-test suite on the same exact candidate in a separate clean environment. Independent QA reviewed that evidence rather than treating it as its own execution.

## Negative control

Independent QA changed only the disposable worktree's complete-title budget from 58 to 80 code points, then ran the title-related workflow tests. The suite failed nonzero on the expected contract:

- expected: `WI-0001 · Reconcile legacy - … · Developer (Fixture Devon)`;
- actual under the injected defect: `WI-0001 · Reconcile legacy - task titles · Developer (Fixture Devon)`.

This proves the regression gate rejects a longer repository suggestion instead of merely executing a green path. The complete disposable worktree, dependencies, and injected change were removed afterward; candidate files and the main worktree were untouched.

## Challenge findings

- The first live app check exposed and corrected the unsupported 48-code-point goal assumption before QA.
- The repository command remains unable to rename or archive a Codex task, and its result states that boundary.
- Historical inaccessible tasks remain unchanged, which matches the explicit non-goal.
- The 58-code-point limit is observed-product behavior and is correctly retained as a revalidation risk rather than an official guarantee.
- The stale parallel-plan warning is unrelated because WI-0089 was intentionally sequential and no worker dispatch used that plan.

## Decision

Pass. Developer and Independent QA are different Agent Identities, the exact candidate passed positive and adversarial checks, and the Work Item may advance to Release Gate for local repository integration only. No push or release is authorized.
