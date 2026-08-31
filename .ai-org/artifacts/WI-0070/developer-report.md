# Developer report — WI-0070

- Candidate revision: `a5f3860a0a4cef5cd54260b75a74f0f6391d787f`
- Developer: Rikku (`agent-rikku`)
- Result: **pass to Quality Evaluation**

## Change

The provider-owned launch fixture now acknowledges `turn/start` first and emits the turn, reroute, and usage notifications asynchronously on the next event-loop turn. The test subscribes to the telemetry journal before launch, resolves only after the exact durable usage record for the Work Item exists, and stops the provider afterward.

The subscription helper closes the subscribe/read race by subscribing before checking retained records. Its timeout can only fail the test; elapsed time never satisfies the expectation. Every completion path clears the timeout and unsubscribes.

`src/codex-app-server-provider.mjs` is byte-unchanged from base revision `7f0b0ca6b64bf7cb947021fb8d185a4887f1be9f`. Agent Commands and operator-owned provider trust are outside this candidate and unchanged.

## Verification

- focused scenario: pass;
- repeated focused scenario: 48/48 passed with concurrency eight in 14,224 ms;
- full `npm run verify`: 246/246 passed;
- schema validation: 91 documents matched 27 schemas with zero errors;
- Doctor: 35 pass, one known stale parallel-plan warning, zero failures;
- diff checks: pass, including an empty production-provider diff against the base revision.

No live Codex provider, model generation, external network action, Agent Command, credential access, push, deployment, publication, release, or paid action occurred.
