# Quality report — WI-0063

- Position: Quality & Evaluation Engineer
- Agent Identity: Lulu (`agent-lulu`)
- Exact candidate: `c44bbdf5b680244311b1aa8205b8581f1cd0a391`
- Environment: detached local Git worktree with an offline, script-disabled dependency install

## Result

Pass. The candidate keeps requested and Provider-observed model data separate, processes a correlated reroute before later Token attribution, leaves malformed or uncorrelated observations unable to mutate another task, and preserves the zero-retry and privacy boundaries.

## Evidence

| Gate | Result |
|---|---|
| Control-plane suite | 20 passed, 0 failed |
| Full repository verification | 234 passed, 0 failed |
| Repository Doctor | 35 passed, 1 warning, 0 failed |

The Doctor warning concerns a stale generated parallel-plan projection. It is expected after canonical lifecycle changes and must be rebuilt before future parallel dispatch; it does not invalidate this sequential candidate.

## Evaluation

- Top-level `thread/start` acknowledgement is the only initial effective-model source.
- Missing acknowledgement remains unknown rather than falling back to the requested value or nested thread data.
- A uniquely correlated `model/rerouted` event updates the canonical task before subsequent usage attribution.
- Uncorrelated reroutes remain bounded observations and do not mutate a registered task.
- Stop and reconnect drain the serialized notification queue within a fixed timeout.
- No automatic retry, fallback model selection, raw Provider payload retention, model launch, paid API call, external write, deployment, publication, or release was introduced.

The candidate is suitable for Independent QA. Passing this gate does not authorize the one-turn live revalidation or the four-repository rehearsal by itself.
