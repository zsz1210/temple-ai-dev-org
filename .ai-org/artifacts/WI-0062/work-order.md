# Work order — WI-0062

## Outcome

Run the one approved local Provider-owned instrumentation attempt and determine whether Temple can correlate a real `gpt-5.6-luna` `max` turn to its project, new synthetic Work Item, canonical task, Position, Agent, Provider, launch revision, outcome, and numeric Provider-reported Token usage.

## Approved boundaries

The governing decision is `.ai-org/artifacts/WI-0061/human-approval.md`; the full resource and stop limits are `.ai-org/artifacts/WI-0061/pilot-proposal.md`.

- one retained local synthetic repository;
- one new synthetic Work Item for this attempt;
- one Provider-owned task, one launch attempt, one turn, and zero retries;
- `gpt-5.6-luna` with `max` reasoning, no fallback, and no service-tier override;
- network disabled and no product-code write request;
- 40,000 Token warning and 60,000 Token reactive stop;
- 15-minute task ceiling, 45-minute complete-pilot ceiling, and 250 MiB additional-disk ceiling.

## Terminal classification

`pass`, `partial`, or `fail` is a valid terminal result when reported honestly. No classification authorizes a second turn, alternate model, retry, cleanup, four-repository execution, or another product feature.
