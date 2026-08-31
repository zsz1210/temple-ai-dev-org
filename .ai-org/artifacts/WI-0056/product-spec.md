# Product specification: corrected bounded live observability proof

## Question

After correcting Temple's internal-to-wire policy mapping, can the Provider-owned bridge create exactly one real thread, register it before generation, complete exactly one fixed-output turn, and retain detailed Token usage correlated to the exact Work Item and task?

## Outcome classification

- `pass`: the only turn completes with the exact fixed marker, the canonical task and Provider IDs correlate, at least one detailed Provider Token observation is retained, the stop boundary holds, and the repository remains unchanged by the model.
- `partial`: the one-thread and one-turn boundary holds and some real Provider stages succeed, but exact output, terminal completion, canonical correlation, detailed usage, or visibility is incomplete or unavailable.
- `fail`: the thread or turn cannot start, registration becomes untruthful, more than one thread or turn is created, a retry occurs, the model changes repository state, or a privacy/attribution invariant is violated.

Every classification ends this experiment. `partial` and `fail` do not authorize another attempt.

## Required observations

- installed schema digests and exact payload validation;
- current `model/list` support for Luna Max;
- canonical task, stable Provider thread ID, Provider turn ID, and terminal state;
- exact-marker match without retaining arbitrary output;
- requested and observed model, reasoning effort, and service tier when available;
- detailed input, cached-input, output, reasoning-output, and total Tokens when available;
- attribution, launch revision, duration, and interrupt state;
- supported thread visibility observation;
- repository diff before and after model execution;
- restoration of the normal private-LAN Dashboard.

## Prohibited claims

This proof cannot establish Token savings, price, model quality, routing superiority, or overall framework effectiveness. Account-wide usage is not attributed to WI-0056.

