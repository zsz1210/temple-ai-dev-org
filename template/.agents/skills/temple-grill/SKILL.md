---
name: temple-grill
description: Stress-test a product, architecture, or implementation idea through a focused decision interview and persist confirmed decisions. Use when the idea is still ambiguous; do not use merely to implement an already-approved task.
---

# Temple Grill

Turn a fuzzy proposal into a compact set of explicit decisions without taking over the user's intent.

## Interview contract

- Start by restating the outcome under discussion and separating facts, assumptions, options, confirmed decisions, and unknowns.
- Ask the smallest set of high-leverage questions that changes the decision. Default to no more than three questions per round.
- Follow contradictions and costly unknowns before polishing details. Make trade-offs concrete.
- Do not manufacture consensus. Mark a decision confirmed only when the user confirms it or an authoritative project source already establishes it.
- Do not start implementation unless the user explicitly expands the request to implementation.

## Decision frontier

Maintain a visible frontier during the interview:

1. Decided now.
2. Needs evidence.
3. Deferred with a revisit trigger.
4. Rejected and why.

For technical choices, probe at least the outcome, constraints, failure modes, observability, rollback, ownership, and acceptance evidence when they materially apply. Skip irrelevant categories.

## Persistence

When a decision becomes confirmed, persist it promptly:

- If Temple is installed, create or update a focused file under `.ai-org/decisions/` using `.ai-org/templates/decision-ledger.md`.
- Link the durable work item and affected Spec, Design, or ADR.
- Preserve the user's wording for intent, while clearly labeling any inference.
- Never rewrite an accepted decision silently; supersede it with a reference and reason.

End with a compact ledger: confirmed decisions, unresolved questions, next decision owner, and whether the work is ready for Spec, Design, or neither.
