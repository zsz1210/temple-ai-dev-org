# Evaluation report — WI-0062

## Acceptance evaluation

| Criterion | Result |
|---|---|
| Contract and model availability checked before launch | Pass |
| At most one new Work Item, task, launch, turn, and zero retries | Pass |
| Resource, privacy, authority, and stop results recorded | Pass |
| Minimum correlation including observed effective model | Partial — Provider-observed model unavailable |
| Structured response contract | Partial — read-only history check did not expose a verifiable turn response |
| Synthetic repository retained; no external write or release | Pass |

## Final experiment classification

`partial` is the truthful terminal classification. The task-level Token instrumentation path worked once, but the stricter gate for the four-repository experiment did not pass. No retry or automatic remediation is authorized.
