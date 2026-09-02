# WI-0108 product specification

## Outcome

Produce a reproducible feasibility result for the corrected Wave 5A experiment mechanism. Determine whether all four matched candidates can be launched, bounded, correlated, tested, anonymized, and packaged without leaking their condition before quality scoring.

## Cases and order

Use the pinned WI-0106 fixtures and fixed order:

1. `idempotent-command`: Temple, then minimal;
2. `compatible-event-evolution`: minimal, then Temple.

Every candidate receives the same case-specific task, product files, Luna Max model profile, sandbox, network boundary, tool restrictions, and one-attempt limit. The Temple arm adds only the pinned organization and routed Developer Work Item; the minimal arm adds only the pinned concise instructions.

## Acceptance

- A fresh external lab contains four clean candidate repositories at exact revisions.
- The runner binds the approval and preflight records to WI-0108 and rejects the unsupported `uniqueItems` schema keyword before generation.
- Every launched candidate uses `gpt-5.6-luna` with Max reasoning, network off, approval policy `never`, one attempt, and no fallback.
- The program stops on the first invalid attempt and reports reactive Token-limit behavior honestly.
- Each completed candidate has correlated numeric usage, elapsed time, bounded changed paths, passing public and hidden tests, a clean committed revision, and an arm-neutral blind package.
- The result remains feasibility evidence and makes no billing, causal-savings, Temple-superiority, model-routing, release, or publication claim.
