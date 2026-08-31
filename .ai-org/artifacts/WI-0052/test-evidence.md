# Quality test evidence

Lulu evaluated exact implementation candidate `42044e99856c138a93f526a8ad1b364723a08dac` against the approved scope and acceptance criteria.

## Passed

- The focused provider, task-registry, workflow, and usage-attribution suite passed 46/46.
- Full `npm run verify` passed repository checks, documentation links, and 227/227 tests.
- Doctor reported 35 pass / 1 warn / 0 fail and `healthy: true`.
- Fake App Server evidence proves `thread/start` precedes canonical registration and that `turn/start` occurs only after registration.
- Registration failure sends no turn; Provider rejection creates attention state without retry.
- The fake usage notification correlates to the exact Work Item, task, Position, Agent, Provider, launch revision, model, and reasoning setting.
- Requested and effective model remain distinct, and missing service-tier or effective-model values remain unknown.
- Existing Codex-host-owned task behavior remains compatible.
- The unique instruction marker is absent from canonical task state and telemetry projections.

## Warning classification

The single Doctor warning is the pre-existing stale generated parallel plan. WI-0052 is explicitly sequential, has no worker dispatch, and does not depend on that generated view.

## Result

Pass for the fake-server implementation slice. Real Codex thread visibility, real usage notification delivery, model quality, Token cost, and routing behavior remain outside this Work Item and are not claimed.
