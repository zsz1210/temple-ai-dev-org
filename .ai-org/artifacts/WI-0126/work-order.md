# WI-0126 work order

## Outcome

Make the Temple roadmap a human-readable statement of direction: strengthen the Console-free core operating path first, validate it with bounded evidence, keep optional tools optional, and defer public distribution until the repository owner reopens that decision.

## Reader

The primary reader is a prospective or current Temple adopter who needs to understand:

- what Temple is trying to make possible;
- what is reliable today;
- what the project is improving now;
- how progress will be measured; and
- what is explicitly deferred or outside the critical path.

Detailed Work Item delivery state remains in `.ai-org/work-items/` and generated status views. Detailed experimental evidence remains under `docs/validation/`. Release-specific gates remain in `docs/planning/release-readiness.md`.

## Research basis

- The UK Government Service Manual recommends outcome-oriented, understandable roadmaps that state what is and is not being done, distinguish roadmaps from backlogs, show priorities, and become less certain farther into the future.
- GitHub Projects treats roadmap, board, and table views as adaptable projections over issues and pull requests rather than as the product strategy itself.
- Atlassian describes an agile roadmap as a living connection between product vision, initiatives, and daily work rather than a fixed feature contract.

Sources:

- https://www.gov.uk/service-manual/agile-delivery/developing-a-roadmap
- https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects
- https://www.atlassian.com/agile/product-management/roadmaps

## Current evidence boundary

- `WI-0119` through `WI-0125` completed the provider-neutral, deterministic, read-only Execution Route foundation and its validation hardening.
- `WI-0033` remains at Spec for operator-owned Provider trust.
- `WI-0086` remains blocked and must not drive current development while public release is deferred.
- `WI-0064` and `WI-0067` concluded `no-go`; `WI-0094` is done.
- Wave 5A executed controlled candidates but did not establish a reliable Temple advantage. Wave 5B concluded `inconclusive`. Cross-comparison infrastructure exists; qualified comparative evidence remains incomplete.

## Constraints

- Do not run a model-backed comparison in this Work Item.
- Do not change runtime behavior, package metadata, repository visibility, release state, or the Management Console.
- Do not turn `no-go`, `inconclusive`, missing, or historical evidence into a success claim.
- Keep English, Japanese, and Traditional Chinese roadmaps structurally aligned while writing each language naturally.
- Keep `WI-0086` blocked and preserve its release evidence.
