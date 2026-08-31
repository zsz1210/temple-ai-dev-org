# Work order — WI-0063

## Requested outcome

Correct Temple's Provider-observed model attribution before another live model call. The repository owner authorized the work to continue through a bounded revalidation and, only if its strict gate passes, into the separately governed large local validation.

## Current evidence

- Codex CLI: `0.151.0-alpha.7.2`
- The installed `ThreadStartResponse` schema requires top-level `model` and may return top-level `reasoningEffort` and `serviceTier`.
- Temple currently reads `thread.model`, which is not the response location defined by the installed schema.
- The installed schema and official App Server documentation expose `model/rerouted` with `threadId`, `turnId`, `fromModel`, `toModel`, and `reason`.
- WI-0062 therefore retained the requested model but correctly left the observed model unknown.

## Stop boundary

This Work Item changes and verifies local framework code only. It performs no model turn, retry, API purchase, usage reset, external write, push, deployment, publication, release, or four-repository execution. A live revalidation requires a new Work Item after this candidate passes its local gates.
