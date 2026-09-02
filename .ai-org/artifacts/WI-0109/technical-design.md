# WI-0109 technical design

## Shared interpretation layer

Create `src/app-server-protocol-replay.mjs` with small pure functions for:

- validating the structured `commandActions` list against an explicit command-prefix allowlist;
- normalizing detailed Token usage without inventing missing values;
- classifying terminal state and Provider structured-output rejection;
- recognizing model reroute and runtime permission requests;
- validating the bounded structured completion record;
- replaying an ordered array of JSON-RPC notification/request envelopes into one deterministic result.

The live runner imports these helpers. It remains responsible for App Server transport, interruption, filesystem checks, tests, commits, and blind-package export.

## Replay precedence

Only events matching the configured turn participate. The first policy violation is retained. A policy violation outranks terminal completion; otherwise a non-completed terminal, missing terminal, or missing detailed usage fails closed in that order. A successful replay requires a completed terminal, detailed usage, and valid structured completion.

## Fixtures

Store arm-neutral synthetic envelopes under `.ai-org/artifacts/WI-0109/fixtures/`. Fixtures include only method names and bounded protocol fields needed by the state machine. Tests must prove the replay module performs no I/O and the fixture set contains the required positive and negative cases.
