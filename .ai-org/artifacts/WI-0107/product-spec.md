# WI-0107 product specification

## Outcome

Produce a reproducible feasibility result for the Wave 5A experiment mechanism. The result must show whether four matched candidates can be launched, bounded, correlated, tested, anonymized, and scored without leaking the condition before quality scores are frozen.

## Cases and order

Use the two fixture cases and their fixed condition order from `WI-0106`:

1. `idempotent-command`: Temple, then minimal;
2. `compatible-event-evolution`: minimal, then Temple.

Each candidate receives the same case-specific `TASK.md`, product tree, model, reasoning effort, sandbox, network boundary, tool restrictions, and one-attempt limit. The Temple arm adds the pinned Temple organization and one routed Developer Work Item. The minimal arm adds only the pinned concise `AGENTS.md` instructions.

## Acceptance

- Four fresh candidate repositories start from clean, exact revisions.
- No candidate starts before the no-new-payment confirmation record exists.
- Every candidate uses Luna Max, network off, approval policy `never`, one attempt, and no fallback.
- The runtime enforces the `WI-0106` Token, time, disk, and write-scope controls and reports that Token interruption is reactive.
- Public and hidden acceptance tests are recorded after each candidate.
- The blind package omits condition, revision, paths, organizational identity, task identity, timestamps, and usage until quality scores are frozen.
- The final report is labelled feasibility evidence and names all missing or invalid evidence.

