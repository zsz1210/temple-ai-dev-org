# Developer evidence

Rikku implemented the provider-owned Codex observability bridge at exact candidate revision `42044e99856c138a93f526a8ad1b364723a08dac`.

## Implemented

- Added the bounded `thread/start -> canonical task registration -> turn/start` launch sequence.
- Kept `requested_model` separate from `effective_model`; unavailable effective model and service tier remain unknown.
- Preserved execution origin, Provider identity, launch revision, current revision, and claim base as distinct task metadata.
- Registered the new task in the live correlation set before generation begins and did not call `thread/resume` for the new Provider-owned thread.
- Stopped before `turn/start` when canonical registration fails.
- Retained a truthful attention state and performed no retry after a Provider turn rejection or uncertain delivery.
- Kept the instruction in memory only and added no Dashboard command route or remote mutation path.
- Preserved existing Codex-host-owned task registration and degraded observation behavior.

## Verification

- Focused suite: `node --test test/workflow.test.mjs test/control-plane-live.test.mjs test/phase-4b.test.mjs`
  - 46 passed, 0 failed.
- Full suite: `npm run verify`
  - repository checks passed;
  - documentation links passed;
  - 227 tests passed, 0 failed.
- Doctor at the candidate checkout:
  - 35 passed, 1 warning, 0 failed;
  - the warning is the pre-existing stale generated parallel plan and does not affect this sequential Work Item.

## Boundaries

- Verification used only the fake App Server fixture.
- No real `codex` process, thread, turn, or model call was started.
- No Token spend, Dashboard control, push, publication, deployment, or release occurred.
- Codex Desktop visibility and real `thread/tokenUsage/updated` delivery remain unverified and require a separately authorized live proof.
