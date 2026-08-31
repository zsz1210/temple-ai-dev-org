# Developer report — WI-0063

- Position: Developer
- Agent Identity: Rikku (`agent-rikku`)
- Exact base revision: `122f97f51a5cf49612e4cdb4357ceb0d4924dd7d`
- Candidate form: bounded working-tree changes on the exact base revision; no Git history mutation

## Implemented

- Read `model`, `reasoningEffort`, and `serviceTier` from the top-level `thread/start` result while retaining nested `thread.id` and lifecycle fields as the thread boundary.
- Kept requested model and reasoning input separate from Provider acknowledgement. Missing or malformed acknowledgement remains `null`; nested `thread.model` is not used as a fallback.
- Normalized `model/rerouted` as bounded telemetry containing thread, turn, canonical correlation when unique, `from_model`, `to_model`, and Provider reason without retaining raw payload content.
- Updated only the exactly correlated canonical task to a valid Provider `toModel`, through the ordinary task mutation boundary, before appending the reroute event.
- Serialized Provider notification processing so a later `thread/tokenUsage/updated` observation reads the rerouted effective model deterministically.
- Added a bounded notification-queue drain to stop and reconnect. Buffered stdout notifications remain readable until Provider process exit, and both operations await the current queue without an unbounded hang.
- Preserved zero automatic retry, no fallback model selection, Provider degradation on correlated task-update failure, and existing telemetry privacy rules.
- Updated the operating and validation documentation to keep local correction, one-turn revalidation, and the later four-repository rehearsal as separate authorization boundaries.

## Verification

| Command | Result |
|---|---|
| `node --test --test-name-pattern='provider-owned|model reroute' test/control-plane-live.test.mjs` | Pass — 5 tests, 0 failures |
| `node --test test/control-plane-live.test.mjs` | Pass — 20 tests, 0 failures |
| `npm run verify` | Pass — repository checks passed for 93 overlay files and 10 Positions; documentation links passed; 234 tests passed with 0 failures |

The exact tests cover top-level acknowledgement, a nested-model trap, requested-versus-effective separation, acknowledged reasoning effort and service tier, correlated reroute ordering before usage attribution, stop-time queue drain, uncorrelated reroute non-mutation, malformed or missing acknowledgement, bounded retained data, and zero retry after rejection.

## Boundary and remaining gates

- No model was launched and no Provider, paid API, external system, Git history, push, deployment, publication, release, lifecycle state, claim, task, evidence registry, or four-repository rehearsal was mutated.
- Repository Doctor and Independent QA remain for the next Positions before organizational closeout.
