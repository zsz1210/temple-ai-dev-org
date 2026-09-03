# Developer test observation

- Subject: WI-0136 generation-free representative microservice comparison harness
- Revision under test: uncommitted preparation on `codex/wi-0136-representative-microservice-comparison`
- Outcome: pass with one non-blocking Doctor warning
- Model generation performed: no

## Commands and observations

| Check | Observation |
|---|---|
| `node --check scripts/run-representative-microservice-comparison.mjs` | Pass |
| `node --check scripts/analyze-representative-microservice-comparison.mjs` | Pass |
| `node --test test/representative-microservice-comparison.test.mjs` | 5 passed, 0 failed |
| `node scripts/run-representative-microservice-comparison.mjs setup` | Matched product inputs and golden acceptance path created |
| `node scripts/run-representative-microservice-comparison.mjs freeze` | Protocol frozen at `858f296e1582b5d5570882c85a3c5a773457a7c054ad3d8f194be68855dd6c83` |
| `node scripts/run-representative-microservice-comparison.mjs preflight` | Fixture, Provider contract, required model settings, and five-repository lifecycle rehearsal pass; approval remains the only blocker |
| Unapproved `run` with the template record | Refused; no live-result artifact created |
| `npm run verify` | 364 passed, 0 failed, 0 skipped, 0 cancelled |
| `git diff --check` | Pass |
| `node ./templew.mjs doctor . --json` | 36 pass, 1 warning, 0 fail |

The stale generated parallel-plan warning must be resolved before using that generated plan for repository dispatch. It is not evidence of a failure in the WI-0136 participant federation or no-generation lifecycle rehearsal.
