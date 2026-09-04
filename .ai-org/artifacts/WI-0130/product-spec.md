# Product specification — WI-0130

## Decision to support

The owner needs evidence for two separate questions:

1. Does Temple improve bounded AI-assisted delivery compared with a competent conventional workflow when both use the same model and reasoning setting?
2. Within an otherwise identical Temple workflow, does the current Adaptive Execution Route improve the quality/resource trade-off over a fixed safe route?

## Pilot scope

Run two independent frozen bounded implementation cases through all three conditions:

| Condition | Process | Execution profile |
| --- | --- | --- |
| A — conventional fixed | Minimal responsible repository instructions, version control, tests, and review evidence | GPT-5.6 Terra, medium |
| B — Temple fixed | Current Lean Core Path with a pinned `standard` Execution Profile | GPT-5.6 Terra, medium |
| C — Temple adaptive | The same Lean Core Path with advisory resolution for a bounded low-risk Build step | Expected `lightweight-quality`: GPT-5.6 Luna, max |

A versus B estimates the process effect. B versus C estimates the route effect. No A versus C result may be presented as one attributable effect.

## Acceptance

- All six candidates start from byte-matched case content and clean, independent Git repositories.
- A and B match model and reasoning. B and C match Temple state, approved scope, routed context, tool policy, candidate instruction, tests, and stopping rules.
- The adaptive route is resolved from the pinned project policy rather than hard-coded as the claimed result.
- Public tests and coordinator-held acceptance tests run at exact candidate revisions.
- Blind packages exclude condition, Agent, Work Item, usage, time, repository path, and revision fields until scores are frozen.
- The evaluator returns one bounded `0..100` integer score and decision for every package; invalid output excludes the blind-quality comparison and cannot be silently retried.
- The report retains gross and non-cached operational Tokens, latency, test outcomes, changed paths, changed-line counts, retry/fallback counts, intervention counts, disk growth, and protocol violations.
- Negative, neutral, invalid, and inconclusive outcomes remain visible and map to a concrete retain, simplify, redesign, or remove decision.

## Evidence boundary

Two cases provide a diagnostic pilot for the selected bounded task family. They cannot establish statistical superiority, generalize to other developers or projects, qualify automatic routing, or prove value for ordinary, multi-repository, security, UI, or recovery work.

The live matrix requires a separate exact owner approval record because the project Usage Policy has no configured Credits budget. No conversion from Tokens to Credits or money is permitted without an authoritative versioned billing source.
