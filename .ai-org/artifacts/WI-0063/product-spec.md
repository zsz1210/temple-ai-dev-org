# Approved scope — WI-0063

## Problem

Temple must distinguish the model requested by its launch policy from the model acknowledged or rerouted by the Provider. WI-0062 proved Token correlation but could not satisfy its minimum model-correlation gate because Temple read the wrong `thread/start` response location and ignored the Provider's reroute event.

## Required behavior

1. A successful Provider-owned `thread/start` records the response's top-level `model` as `effective_model` before `turn/start`.
2. Top-level `reasoningEffort` and `serviceTier` are retained when the Provider returns them; missing values remain `null`.
3. `model/rerouted` produces bounded telemetry containing the correlated thread, turn, task, Work Item, `from_model`, `to_model`, and reason.
4. A correlated reroute updates the canonical task's `effective_model` to the Provider's `toModel` before later Token usage is attributed.
5. An uncorrelated reroute remains observable but cannot modify an unrelated task.
6. Raw prompts, responses, hidden reasoning, Provider error bodies, and credentials remain excluded.

## Acceptance boundary

The code and exact contract tests must pass locally and under Independent QA. Passing this Work Item authorizes only a separate one-turn revalidation; it does not itself qualify the instrumentation path or start the large rehearsal.
