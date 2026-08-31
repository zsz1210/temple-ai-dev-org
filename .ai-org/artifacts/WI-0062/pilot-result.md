# WI-0062 instrumentation pilot result

## Outcome

The one approved Provider-owned attempt completed as **partial** in 8.013 seconds.

Temple created one durable Codex thread, registered `task-0002` before generation, completed one `gpt-5.6-luna` `max` turn, and retained one detailed Provider Token observation correlated to the synthetic project, `WI-0002`, Developer Casey, the task, the Provider turn, and launch revision `402fb3e97dfba0fd6531752cc1a9c453830db5e0`.

The observation reported 23,239 total Tokens: 23,159 input, 9,984 cached input, 80 output, and 22 reasoning output. The Token warning and stop thresholds were not reached. No interrupt, retry, fallback, service-tier override, network access, product-code change, paid API credential, external write, push, deployment, publication, or release occurred.

## Why the result is partial

The Provider notification did not report an effective model. Temple therefore retains `gpt-5.6-luna` only as the canonical requested model and does not relabel it as observed execution. A read-only `thread/read` check also did not expose a verifiable turn response through the inspected connection, so the structured response contract remains unverified. Both missing observations remain unknown rather than inferred.

The task-level Token path itself worked: a subsequent read-only `usage preflight` over the isolated state found one detailed observation, one correlated observation, and zero uncorrelated observations. That does not satisfy the proposal's stricter minimum correlation gate because the effective or Provider-observed model is missing.

## Resource and safety result

| Boundary | Result |
|---|---|
| Provider-owned tasks | 1 of 1 |
| Launch attempts | 1 of 1 |
| Model turns | 1 of 1 |
| Retries | 0 of 0 |
| Elapsed task time | 8.013 seconds, below 15 minutes |
| Provider-reported total Tokens | 23,239, below 40,000 warning and 60,000 stop |
| Additional local disk | 160 KiB, below 250 MiB |
| Non-organization repository changes | none |
| Company or production data | none |
| Monetary cost | unknown; not inferred from Tokens |

## Decision boundary

This run proves that the corrected Provider-owned path produced task-correlated detailed Token telemetry once. It does not prove savings, price, model quality, routing preference, microservice coordination, enterprise readiness, or the ten-Work-Item longitudinal threshold. The approved minimum gate remains incomplete, so the four-repository experiment must not start from this result.
