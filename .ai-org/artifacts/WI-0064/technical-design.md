# Technical design — WI-0064

## Preflight

1. Confirm the main and synthetic repositories are clean and pin their exact revisions.
2. Regenerate the installed Codex App Server v2 schema and verify the required `thread/start` response, `model/rerouted`, and Token-usage structures against recorded hashes.
3. Perform a no-generation App Server initialize and `model/list` handshake; require Luna with `max` reasoning support.
4. Create and claim one new synthetic Work Item, then commit its launch boundary before starting the Provider.

## Execution

Use the repository's corrected `startCodexAppServerProvider` implementation with an isolated temporary telemetry directory. Register the canonical task before the turn begins. Ask for one compact JSON identity response, with tools and network prohibited. Poll only the correlated task records.

At 40,000 total Tokens record a warning. At 60,000 total Tokens, or after 15 minutes, issue one interrupt through the existing command boundary. Never relaunch or select a fallback model.

## Attribution

Initial effective model, reasoning effort, and service tier come only from the top-level `thread/start` acknowledgement. A uniquely correlated `model/rerouted` event may replace the effective model before later usage attribution. The result requires the final canonical task and the usage event to agree.

## Privacy and failure behavior

Retain only bounded identifiers, status, resource counters, model dimensions, and Token aggregates. Do not retain instructions, response bodies, hidden reasoning, tool payloads, or Provider errors. Any protocol drift, ambiguous thread match, mutation failure, disallowed model, missing strict field, or resource breach fails closed and blocks the next phase.
