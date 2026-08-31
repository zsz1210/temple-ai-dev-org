# WI-0052 work order

## Outcome

Establish a race-free local execution bridge for Codex App Server tasks that Temple owns from thread creation onward. The bridge must create a thread, persist the exact Temple task correlation, and only then begin the first model turn.

This slice makes the bridge locally testable. It does not create a real Codex thread or turn and does not claim that an App Server thread appears as an ordinary Codex Desktop sidebar task.

## Problem being solved

The `WI-0051` instrumentation pilot registered a Codex task after the host had already created it. Temple could correlate history, but the observing App Server could not establish live ownership and no `thread/tokenUsage/updated` notification was observed. The task registry also omitted the requested model, reasoning effort, and a distinct task-launch revision.

## Authorized scope

- Add one provider-owned launch operation to the existing local Codex App Server provider.
- Preserve the order `thread/start -> canonical task registration -> turn/start`.
- Record bounded execution provenance and model configuration without retaining the instruction body.
- Keep existing host-owned registrations compatible and explicitly non-provider-owned.
- Validate success, registration failure, correlation, privacy, and compatibility with a fake App Server.
- Update the operating documentation with the new boundary and retained live-proof requirement.

## Excluded actions

- No real `thread/start`, `turn/start`, model generation, Token consumption, or App Server account probe.
- No Dashboard command form, remote write surface, automatic retry, or automatic model routing.
- No claim that provider-owned threads are visible in Codex Desktop.
- No ten-task qualification run, cost estimate, savings claim, deployment, release, push, or publication.

## Stop condition

Stop after the fake-server contract, repository verification, Doctor, and fresh detached-worktree Independent QA pass. Retain one real provider-owned proof as a separately approved experiment with an explicit model and Token budget.

## Authority

The user's explicit instruction to follow the proposed bounded approach authorizes this local framework implementation. It does not authorize a live model call or external release.
