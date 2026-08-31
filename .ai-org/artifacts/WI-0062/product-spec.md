# Product specification — approved instrumentation execution

## User outcome

The repository owner receives one trustworthy, bounded answer to whether the corrected Provider-owned path produces task-correlated Token telemetry in a real Codex turn.

## Required observations

- project, Work Item, canonical task, Position, Agent, execution origin, Provider, and launch revision;
- requested model and Provider-observed effective model when available;
- reasoning effort and service tier when available;
- Provider turn outcome;
- numeric total Tokens greater than zero with observation time and provenance;
- elapsed time, launch and retry counts, repository state, local footprint, and cleanup disposition.

Missing optional values remain unknown. Account-wide usage cannot substitute for task correlation.

## Result classes

- `pass`: the one turn reaches a terminal state and all minimum correlation fields, including numeric Provider-reported total Tokens, are present.
- `partial`: the attempt boundary holds and the task or turn is truthfully correlated, but one or more minimum telemetry fields remain unavailable.
- `fail`: the Provider cannot start the thread or turn, correlation conflicts, the effective model violates the approved profile, the repository is modified unexpectedly, a privacy or authority boundary is crossed, or a stop rule fails.

## Excluded conclusions

One sample cannot prove cost savings, Token savings, model quality, routing preference, microservice effectiveness, enterprise readiness, or the longitudinal ten-Work-Item threshold.
