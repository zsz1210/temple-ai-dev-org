# Rollback plan — WI-0124

## Current local branch

No remote push, merge, package publication, deployment, Provider execution, model invocation, automatic route application, or external release occurred. Before integration, rollback means abandoning the local `codex/wi-0120-harden-execution-route-schema` branch.

## After a future Git integration

If candidate `0e32149b98e5984b45dac15ec33e8fa99d98e63c` is integrated later and a regression is found, create a reviewed Git revert covering the cumulative WI-0120 through WI-0124 resolver-closure commits. Keep the runtime, both managed schemas, both overlay copies, tests, and `temple.lock` synchronized as one unit.

After the revert, run:

1. `npm run verify`;
2. `node ./templew.mjs schema validate . --json`; and
3. `node ./templew.mjs doctor . --no-write --json`.

Preserve every failed Independent QA attempt as historical evidence; do not delete or rewrite it.

## Boundary

This plan is readiness evidence only. It does not authorize a revert, push, merge, deployment, publication, Provider call, model run, or release.
