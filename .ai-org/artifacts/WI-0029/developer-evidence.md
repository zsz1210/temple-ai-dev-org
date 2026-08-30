# Developer evidence — WI-0029

- Position: Developer
- Agent Identity: Rikku
- Candidate revision: `38a185eb9c501803d138e1a325dfd1f31450b2fc`
- Result: pass to Quality & Evaluation

## Implemented boundary

- Added an `agent_commands` configuration that defaults to disabled and has a bounded instruction limit.
- Added a loopback-only Human Inbox route for `new-turn`, `steer`, and `interrupt` against existing registered local tasks.
- Bound the operations only to Codex App Server `turn/start`, `turn/steer`, and `turn/interrupt`, with exact task, Work Item, provider-thread, task-state, Work-Item-state, and active-turn checks.
- Persisted command state before dispatch, used durable idempotency, retained only a bounded redacted preview plus length and digest, and prohibited automatic retry after ambiguous delivery.
- Added the code-first Dashboard flow with exact target preview, transient complete instruction preview, explicit confirmation, textual transport and execution states, destructive interruption styling, and responsive layouts.
- Documented the opt-in configuration, eligible-target boundary, storage policy, delivery states, protocol mapping, and excluded capabilities.

## Protocol and deterministic verification

- The locally bundled `codex-cli 0.151.0-alpha.7.2` generated App Server types with `codex app-server generate-ts --experimental`; the implemented request shapes use the observed `turn/start`, `turn/steer`, and `turn/interrupt` contracts, including required `expectedTurnId` for steering.
- Focused Control Plane verification passed 16/16 tests. It covers disabled configuration, bounded input, explicit confirmation, successful dispatch, exactly-once duplicate handling, terminal correlation, provider rejection, stale target and turn rejection, disconnect or timeout as `delivery-unknown`, interruption, remote-host rejection, terminal task and Work Item rejection, loopback Origin/session protection, and non-retention of the complete instruction.
- `npm run verify` passed repository checks, documentation-link checks, and all 197 tests with zero failures, skips, cancellations, or TODOs.
- `node ./templew.mjs schema validate . --json` passed 48 documents against 24 schemas.
- `node ./templew.mjs doctor . --json` reported 35 pass, one nonblocking stale generated parallel-plan warning, and zero failures. WI-0029 is explicitly sequential and no dispatch was taken from that projection.
- `git diff --check` passed.

## Code-first runtime visual review

The real Dashboard ran in a headed browser against an isolated temporary Temple project and deterministic fake Codex App Server. The review covered disabled, idle, active, confirmed-preview, turn-started, provider-accepted, completed, provider-rejected, interrupted, and delivery-unknown states. Desktop and 420-pixel narrow layouts remained legible; native controls, visible labels, confirmation clearing, character count, redacted history, and the no-retry warning were observable. The browser console reported zero errors or warnings.

Artifacts:

- `output/playwright/wi-0029-disabled-desktop.png`
- `output/playwright/wi-0029-idle-desktop.png`
- `output/playwright/wi-0029-confirmed-preview.png`
- `output/playwright/wi-0029-command-history-desktop.png`
- `output/playwright/wi-0029-command-history-narrow.png`

## Retained validation boundary and rollback

No command was sent to a real Codex task. Real execution remains a separately authorized validation boundary requiring a safe disposable eligible registered task; it is not inferred from deterministic fake-provider evidence. This work performed no remote or cross-host control, new task creation, background task spawning, model switch, automatic retry, release, publication, or external write.

Rollback is to leave `agent_commands.enabled` false or revert candidate revision `38a185eb9c501803d138e1a325dfd1f31450b2fc`. Generated local Control Plane state can be rebuilt without changing repository authority.
