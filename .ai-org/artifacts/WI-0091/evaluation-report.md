# WI-0091 Evaluation report

## Acceptance evaluation

| Acceptance criterion | Evidence | Decision |
| --- | --- | --- |
| Historical data plus an unavailable Provider is not labelled active capture | Focused state tests and current `historical-only` real projection | Pass |
| Usage exposes current capture state, last capture time, completed-work coverage, and recovery guidance | Real desktop/mobile runtime review and browser matrix | Pass |
| Private/local layouts remain responsive and reduced-motion safe | Four-viewpoint Chrome gate across six primary views | Pass |
| One bounded real observation proves that totals can advance | `task-0006` added 24,293 correlated Tokens with one turn and zero retries | Pass |
| Missing account allocation, price, cost, savings, and routing authority remain unavailable | Usage projection, documentation, and runtime proof | Pass |

## Interpretation

Before this change, the presence of an old detailed observation could make the data appear generally observed even when no Provider was running. The new projection separates historical evidence from current capture readiness. The bounded proof then demonstrated the complete lifecycle: Provider ready with one live task, a correlated Token notification, task completion, Provider stop, and truthful return to historical-only state with the new data retained.

The 24,293-Token sample is evidence that capture works, not a recommended budget or a representative project average. Two observations across two Work Items remain far below the framework's diagnostic and statistical qualification boundaries.

## Residual limitations

- Temple still observes only eligible Provider-owned or live-attached registered tasks; it cannot reconstruct missed Codex Desktop work.
- The current viewer does not allocate account-wide usage to a project.
- Cost remains unknown without a separately approved, versioned price source.
- Continuous background capture and startup supervision remain separate operational work.

## Evaluation decision

`pass`

Advance to Independent QA. Do not claim universal capture, savings, cost, routing superiority, or public-release readiness.
