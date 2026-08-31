# Corrected Provider-owned live Token proof result

## Decision

`pass`

The corrected wire mapping created exactly one durable Provider thread and one turn. The turn completed with the exact fixed marker, the thread remained visible through `thread/list`, the canonical Temple task was registered before generation, and detailed Provider Token usage correlated to WI-0056.

## Correlation

- Task: `task-0005`
- Work Item: `WI-0056`
- Position / Agent: Developer / Rikku
- Provider thread: `01a056c7-0e93-7e10-9925-afdcd243a203`
- Provider turn: `01a056c7-0f13-7570-9def-073f5f09aeec`
- Launch revision: `247a78155d23c02485ad005dbf775d22e7c590c7`
- Requested route: `gpt-5.6-luna`, `max`
- Terminal state: `completed`
- Duration: 5,041 ms
- Thread/list visibility: observed
- Attempts: one thread/start, one turn/start, zero retries

## Output proof

A no-generation `thread/read` found one `agentMessage`. Its text matched `TEMPLE_PROVIDER_OWNED_LIVE_PROOF_OK` exactly; no non-exact marker-containing Agent message existed. Raw model content was not copied into Temple telemetry or this artifact.

## Provider-reported usage

| Dimension | Tokens |
| --- | ---: |
| Input | 23,400 |
| Cached input | 9,984 |
| Output | 33 |
| Reasoning output | 16 |
| Total | 23,433 |

The Provider supplied a 258,400-token model context window. It did not supply a model version, service tier, context-capsule digest, or capability-set digest, so attribution quality remains `partial`. Monetary cost remains unknown because no approved price source was used.

## Reactive stop behavior

The first detailed usage notification already reported 23,433 total Tokens. The 20,000 threshold evaluator entered its interrupt path once, but the Provider's completion timestamp preceded that usage observation and the completed notification arrived seven milliseconds later. The runner did not retain a `turn/interrupt` acknowledgement, so interrupt delivery is `unknown`; the truthful terminal status is `completed`.

This confirms the documented limitation: a reactive threshold is not a hard cap. No second attempt was made.

## Repository and Dashboard

The model produced no repository changes, and no `.ai-org`-external diff appeared after execution. Restarting the normal Control Plane exposed a separate telemetry append race: concurrent notifications produced repeated cursors in the 4,938-line journal. Temple's built-in rebuild archived that journal unchanged with SHA-256 `af32cd123e67beb0b0c128cc00306f13c128978c3e6e76cdf15eaae9d93da1`, rebuilt from 1,237 canonical events, and restored the home-LAN Dashboard at `http://192.168.79.5:41741/` with both Providers ready.

The cursor race is a separate framework defect. It does not invalidate the archived live observations or authorize another model attempt.

## Claim boundary

This one observation proves the corrected local Provider-owned path and correlated Token capture for this environment. It does not prove Token savings, price, routing superiority, large-scale reliability, or overall framework effectiveness.

