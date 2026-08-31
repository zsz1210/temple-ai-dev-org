# WI-0077 — Management Console whole-product review

## Owner review order

1. [Product direction](product-direction.md) — what the Console is for and the six operating questions.
2. [Current-state audit](current-state-audit.md) — verified problems and proposed corrections.
3. [Interactive preview](management-console-preview.html) — proposed dark, responsive Management Console.
4. [UI design brief](ui-brief.md) — visual, interaction, accessibility, and responsive rules.
5. [Required state coverage](required-state-coverage.md) — states represented and intentionally deferred.
6. [Validation plan](validation-plan.md) — measurable tasks and comparison method.
7. [Implementation slices](implementation-slices.md) — owner-accepted planning order and the bounded first-slice brief; implementation remains separately authorized.

## Controlled comparison kit

- [Deterministic mixed-state fixture](controlled-usability-fixture.json)
- [Local comparison harness](controlled-comparison-server.mjs)
- [Human usability test and evaluator key](human-usability-test.md)

Run `node .ai-org/artifacts/WI-0077/controlled-comparison-server.mjs --port 0` from the repository root. The harness uses the production renderer for the baseline and the contract-checked design preview for the proposal. It binds to loopback by default and does not mutate project state.

## Supporting evidence

- [Research](research.md)
- [Preview review](preview-review.md)
- [Work order](work-order.md)

## Current boundary

The owner accepted the design direction for Build planning on 2026-09-01. A controlled comparison kit is available, but human task results remain pending. No production Console code, command authority, task dispatch, deployment, release, or publication was changed.
