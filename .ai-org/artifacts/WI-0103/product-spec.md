# WI-0103 evidence-product specification

## Reader need

A maintainer deciding what to test next must be able to answer three questions without reconstructing old conversations:

1. Which coordination behaviors were exercised by live Agents?
2. Which behaviors exist only as deterministic tests or disposable simulations?
3. Which claims still require other people, machines, hosted Git controls, or paid model work?

## Required result

The Wave 2 record must use a consistent evidence vocabulary:

- **demonstrated** — observed in a retained live Agent or project run;
- **verified implementation** — exercised by deterministic automated tests;
- **simulated** — exercised with controlled local clones or fixtures rather than the named real environment;
- **not run** — no qualifying evidence for the named claim.

Each row must name the behavior, classification, strongest retained source, supported conclusion, and limit. Summary prose must not silently promote one class into another.

## Decision rule

Do not add a new experiment when an existing source already proves the same bounded behavior at an equal or stronger evidence level. A broader real-environment claim remains a future test even if a narrower implementation or simulation passes.

## Acceptance

- The live IdeaDock run is used for live worker, join, stale-plan, and shared-resource observations.
- Alpha.16 and Alpha.17 remain implementation evidence rather than live-runtime evidence.
- Alpha.28 remains a one-host simulated collaboration result.
- Temple self-host handoffs may support repository-state continuity but cannot establish multi-human behavior.
- The retained real collaborative test remains `not_run`.
- The next wave is identified without authorizing Docker installation, external writes, model spend, deployment, or release.
