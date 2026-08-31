# WI-0066 developer report

- Candidate revision: `ab212c0f74106a011bfdcf6fedcf230dbfc84d03`
- Developer identity: Rikku (`agent-rikku`)
- Model turns started by WI-0066: 0
- External actions, spend, API keys, usage resets, deployment, and publication: none

## Delivered

- Added the reusable `temple.validation-program/v1` semantic validator and fail-closed runner.
- Added durable manifest-bound turn and wave checkpoints, cumulative usage callbacks, abort signals, timeout controls, disk measurement, clean-start checks, revision inspection, and path allowlists.
- Added a four-repository-capable usage aggregator that composes only locally qualified completed Work Items and retains explicit no-claim authority.
- Added `experiment inspect` and `experiment report`; no generic live-run CLI exists.
- Added managed schemas and a starter template while keeping initialized manifests project-owned and reports generated.
- Added human-facing operating guidance and updated the retained commerce validation plan.

## Developer verification

- `npm run verify`: 246 passed, 0 failed, 0 skipped.
- `node --test test/validation-program.test.mjs`: 12 passed, including semantic rejection, path containment, concurrency, resume, ambiguous attempts, Token, time, disk, and write-scope limits.
- `node ./templew.mjs schema validate . --json`: valid; 86 documents and 26 schemas.
- `node ./templew.mjs doctor . --json`: healthy; 35 pass, 1 unrelated stale generated-plan warning, 0 fail.
- `git diff --check` and `node --check src/validation-program.mjs`: pass.

## Known limits

- An execution adapter must honor the abort signal; the runner cannot prove that an arbitrary third-party process actually terminated.
- The report is descriptive and cannot establish cost, savings, quality, routing, enterprise readiness, or release authority.
- Runtime checkpoint data must be kept out of Git; the retained commerce fixture will explicitly ignore `.ai-org/runtime/`.
- WI-0064 remains blocked; its evidence was not rewritten.
