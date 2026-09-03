# Rollback plan — WI-0119

## Current local branch

No remote push, merge, package publication, deployment, Provider configuration, or external release has occurred. Before integration, rollback means abandoning `codex/wi-0119-adaptive-execution-routing`; no external state requires repair.

## After a future Git integration

If this candidate is integrated later and a regression is found, create a reviewed Git revert of the integration commit or of the WI-0119 commits in reverse order. The revert must remove the managed execution schemas, resolver and CLI integration, the project-owned seed introduced by this Work Item, projections, tests, and documentation together so that `temple.lock` and installed managed files remain consistent.

After the revert, run:

1. `npm run verify`;
2. `node ./templew.mjs schema validate . --json`; and
3. `node ./templew.mjs doctor . --no-write --json`.

Do not delete or overwrite a downstream project's edited `.ai-org/project/execution-policy.json`. A future installed-project rollback must first inspect ownership and preserve project-owned bytes.

## Boundary

This plan is recorded evidence only. It does not authorize a revert, force push, deployment, publication, or any other external action.
