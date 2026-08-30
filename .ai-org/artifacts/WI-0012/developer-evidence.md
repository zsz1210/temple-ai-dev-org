# Developer evidence — WI-0012

- Position: Developer
- Agent Identity: Rikku
- Candidate revision: `3872ac71630e8a52d69f1b624793bfa6e7cf5475`
- Result: pass to Quality & Evaluation

## Exact-revision verification

- The primary checkout was clean and resolved to the exact candidate revision before verification.
- `npm run verify` passed repository checks, documentation-link checks, and all 160 tests with zero failures.
- The 16 focused Control Plane tests passed stable reconciliation identity, bounded history, live-event behavior, terminal-history projection, Provider handshake, Dashboard labeling, and privacy cases.

## Live self-host observation

- The old generated journal contained 7,229 retained events after repeated history reconciliation. `control-plane rebuild` preserved it in the local archive and reconstructed 169 canonical repository events.
- The first real Codex Provider startup retained 390 events: 169 canonical events plus one bounded provider-history snapshot.
- A second startup observed upstream history growth and retained 395 events: one changed snapshot summary plus four new history events. It did not append the whole 200-item window again.
- After both starts, `codex-local` remained `ready` with no degraded reason.
- The only registered task was `completed`, projected as `history-only` with `historical` provenance, `live=0`, `history_only=1`, and no current runtime-failure attention.
- The live snapshot reported zero firing conditions. The one unknown condition remained the intentionally unconfigured Token budget, not a Provider failure.

## Limits and rollback

This pass proves stable replay for equivalent snapshots and bounded incremental growth when the upstream snapshot changes. It does not prove a production retention policy, remote observability, cross-clone consensus, or active-task usage attribution. Revert candidate revision `3872ac71630e8a52d69f1b624793bfa6e7cf5475` to roll back code. Generated telemetry can be rebuilt, and the pre-rebuild journals remain in the local archive.
