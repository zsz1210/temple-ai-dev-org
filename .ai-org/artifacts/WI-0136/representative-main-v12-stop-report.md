# Representative comparison v12 stop report

## Outcome

The exact-approved v12 run stopped fail-closed during the first arm's parallel Build wave. No arm completed and the evaluator did not start.

- Protocol digest: `94fb522ec92b9f76694d2a1a0d457d9da0e2422ef33d40d0c5463e5ef962dbd0`
- Candidate turns completed: 1 of 10
- Candidate Operational Tokens observed: 119,084
- Retry count: 0
- Fallback count: 0
- Generated repositories: all 10 clean after stop

## Observed stop

Minimal Responsible Design completed with 50,602 Operational Tokens. During the three-way Terra Build wave, Notifications followed an ambient Codex Memory instruction and requested a read from `/Users/zsz1210/.codex/memories/MEMORY.md`. The experiment runner rejected the absolute path because it is outside the generated arm, interrupted and awaited the sibling turns, and retained their partial telemetry before stopping.

This is not a Temple-versus-Minimal result. Allowing that read would expose project and prior WI-0136 history outside the matched fixture, creating uncontrolled context contamination between the experiment and the user's long-lived Codex environment.

## Required correction

Do not retry v12 and do not widen the filesystem allowlist. A successor must prove that every candidate receives an experiment-local memory environment or that ambient memory lookup is disabled before generation. It must add a generation-free replay which rejects personal-memory access and verifies that an isolated memory lookup cannot expose repository-external history. Freeze a new protocol digest and bind any live run to that exact environment contract.
