# Quality test report — WI-0070

- Tested candidate revision: `a5f3860a0a4cef5cd54260b75a74f0f6391d787f`
- Quality identity: Lulu (`agent-lulu`)
- Verdict: **GO — pass to Independent QA**

## Independent Quality reproduction

Quality used a fresh detached worktree at the exact candidate revision. The deliberately asynchronous provider-owned scenario passed 64/64 times with concurrency eight in 19,498 ms. The complete `test/control-plane-live.test.mjs` file then passed 20/20, covering handshake, launch, reroute, usage, rejections, Agent Commands, history, and resume behavior.

Schema validation passed 91 documents against 27 schemas. Doctor reported 35 pass, one known stale parallel-plan warning, and zero failures. Diff and whitespace checks passed.

## Contract evaluation

- The telemetry subscription is created before launch and checked against retained records only after subscription, so an event cannot be lost between read and subscribe.
- The passing condition is the exact durably appended usage record for the Work Item. The timeout only rejects; elapsed time and provider shutdown cannot create a pass.
- The fixture returns `turn/start` first, then emits its notifications on the next event-loop turn, proving that launch acknowledgement is not treated as usage evidence.
- The model-reroute record remains ordered before usage, and usage keeps the rerouted effective-model attribution.
- `src/codex-app-server-provider.mjs` is byte-identical to the base revision. WI-0029 Agent Commands and WI-0033 provider-trust policy are unchanged.

No blocking counterexample was found. No live provider, model generation, external network action, command delivery, push, deployment, publication, release, or paid action occurred.
