# Diagnosis — WI-0064

The installed `ThreadStartParams` schema accepts `model` and nullable `serviceTier`, but no reasoning-effort field. `TurnStartParams` accepts the per-turn override as `effort`. `ThreadStartResponse` reports a thread-level `reasoningEffort`; `TurnStartResponse`, `Turn`, and `thread/tokenUsage/updated` do not report the effective turn effort.

Temple correctly sent `effort: max` to `turn/start`, but it registered the earlier thread acknowledgement `xhigh` as the task's observed reasoning value. This is not evidence that the turn ignored `max`, nor is the request proof that `max` was effective. The effective turn effort is unavailable through the inspected protocol.

Required follow-up before large-run reporting:

- retain requested turn reasoning separately from observed thread reasoning;
- represent effective turn reasoning as unknown unless a future Provider event acknowledges it;
- keep model attribution independent from reasoning provenance;
- label the distinction clearly in reports and the human-facing Management Console;
- use `includeTurns: true` for response-content inspection;
- do not retry WI-0064 or reinterpret this partial result as a pass.
