# First provider-owned live Token proof result

## Outcome

The one-shot proof is classified **`fail`**. The real Codex App Server rejected `thread/start` before a Provider thread, canonical Temple task, or turn existed.

This is a completed experiment under the approved product specification: `pass`, `partial`, and `fail` are all terminal classifications when recorded honestly. The classification does not authorize a retry.

## What happened

- Exact candidate: `5de1ae88304d7c6d7876d28f2518c812f0443f65`
- Requested route: `gpt-5.6-luna` with `max` reasoning
- Attempt count: `1`
- Elapsed time before rejection: `2628 ms`
- Provider state before launch: `ready`
- Provider thread: not created
- Temple task: not registered
- Provider turn: not started
- Approved instruction: not sent
- Automatic retry: not performed
- Token or wall-clock interrupt: not needed
- Repository before and after: clean
- Detailed Token observation: unavailable because no turn started
- Effective model, service tier, and Desktop/list visibility: unknown

No Token, cost, savings, quality, or routing conclusion is inferred from the absence of a turn.

## Root cause

The installed App Server v2 schema defines `SandboxMode` as:

- `read-only`
- `workspace-write`
- `danger-full-access`

Temple's Provider-owned bridge currently sends the internal policy label `readOnly` directly as the `thread/start.sandbox` protocol value at `src/codex-app-server-provider.mjs:1197`. The bridge already converts that label to the separate sandbox policy object used later for the turn, but it does not convert the thread-start field.

The local mock tests asserted that the field was present and retained `readOnly`; they did not validate the request against the installed App Server schema. This explains why repository verification passed while the real protocol rejected the request.

The bridge also replaced the bounded RPC rejection detail with a generic launch error. Future remediation should preserve a safe rejection code and validate protocol enums before opening a thread.

## Safety boundary result

The failure remained within the approved safety envelope:

- exactly one launch attempt;
- zero automatic retries;
- zero turns and no model instruction delivery;
- no canonical phantom task;
- no repository mutation by a model;
- no network access by a model;
- the regular home-LAN read-only Temple Workspace was restored at `http://192.168.79.5:41741/`;
- no push, deployment, publication, or release occurred.

## Next separately authorized slice

Before another live proof, correct and test the protocol translation, add schema-derived request validation or an equivalent contract test, preserve bounded Provider rejection evidence, and rerun the full repository verification. A second real launch remains a separate experiment and requires explicit approval.
