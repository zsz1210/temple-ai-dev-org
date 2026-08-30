# Quality test report — WI-0012

- Position: Quality & Evaluation Engineer
- Agent Identity: Lulu
- Candidate revision: `3872ac71630e8a52d69f1b624793bfa6e7cf5475`
- Verdict: pass

## Acceptance coverage

1. Equivalent snapshots observed at different times generate identical reconciliation IDs and append as duplicates. A changed snapshot changes only its summary identity and any genuinely new or changed history events.
2. A terminal task with reconciled Provider records projects as `history-only`, uses `historical` provenance, contributes zero live tasks, and has no current runtime-failure attention.
3. Live notifications for an eligible active task remain `live`; disconnected unobserved tasks remain `unknown`; ready unobserved tasks retain `registered-only`.
4. The Dashboard exposes a separate History only metric and visual badge styling.

## Evidence reviewed

- 16 focused Control Plane tests: 16 passed, 0 failed, 0 skipped, 0 todo.
- Exact candidate full suite: repository and documentation checks passed; 160 tests passed.
- Real self-host restart: Provider ready after both starts; first retained 390 events, second retained 395 after four new upstream items; no repeated 200-item window append.

## Limits

The generated journal remains capped by configured retention rather than compacting every thread to a permanent 200-item union. The pass covers idempotent equivalent replay and proportional changed-snapshot growth, not production retention or remote telemetry.
