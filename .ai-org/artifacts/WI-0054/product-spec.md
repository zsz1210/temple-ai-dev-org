# Product specification: bounded live observability proof

## Question

Can the locally tested Provider-owned bridge create a real durable Codex thread, register it before generation, receive a real completion, and retain a detailed Token notification correlated to the exact Temple Work Item and task?

## Success classification

- `pass`: the single turn completes or is safely interrupted, the task is canonical, and at least one correlated detailed Token observation is retained with the expected Work Item, task, Position, Agent, Provider, and launch revision.
- `partial`: the one-turn boundary is honored and canonical correlation is correct, but detailed Token delivery, effective model, service tier, or Desktop/list visibility is unavailable.
- `fail`: the thread or turn cannot start, the task cannot be registered truthfully, the stop boundary fails, the model modifies repository state, or privacy/attribution invariants are violated.

Any classification completes the experiment when it is recorded honestly. A `partial` or `fail` result does not authorize a retry.

## Required observations

- launch request and response status;
- canonical task and stable Provider thread ID;
- Provider turn ID and terminal state;
- requested and observed effective model when available;
- requested reasoning effort and service tier when available;
- detailed input, cached-input, output, reasoning-output, and total Tokens when available;
- attribution and scope revision;
- wall-clock duration and whether an interrupt was requested;
- whether the thread appears in Provider `thread/list` or another supported local listing;
- repository diff before and after model execution.

## Prohibited claims

One observation cannot establish savings, price, model quality, routing preference, or framework effectiveness. Account-wide usage cannot be assigned to this Work Item.
