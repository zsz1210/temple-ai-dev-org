# WI-0138 approved product scope

## Question

When a fresh Agent takes over a known Work Item, does Context Capsule v2's stage- and purpose-aware selection reduce context and execution overhead while preserving exact recovery quality, compared with the legacy expanded route?

## Experimental unit

One experimental unit is one fresh, read-only Codex model turn over one clean fixture copy. A turn receives one frozen task contract and may inspect only the fixture paths allowed by the runner. It returns one schema-validated recovery record and performs no lifecycle mutation, implementation, network request, deployment, or external write.

## Project shapes and conditions

| Shape | Legacy condition | Stage-aware condition |
|---|---|---|
| Single repository | Context Map routes are unscoped and the operating contract is loaded before task sources | Context Map v2 selects only the current stage and `primary` purpose; the operating contract remains fallback-only |
| Coordinator-led multi-repository | Coordinator recovery opens the full unscoped route set and operating contract | Coordinator Context Capsule v2 selects the integration-stage contract, handoff, and component identities only |

All four candidate turns use `gpt-5.6-terra` with requested `medium` reasoning. The model is held constant because this experiment tests context treatment, not model selection.

The runner uses one fixed interleaved order and fresh model threads so one condition cannot inherit another condition's conversation. Each condition has one attempt, zero retry, zero fallback, and no model reroute. A stopped condition remains evidence and is never silently replaced.

## Frozen task outcomes

### Single repository

The candidate must recover exact product behavior, governing decision, current implementation revision, test status, unresolved risk, and the one safe next action. The expected values are frozen outside the candidate-visible package and checked after completion.

### Coordinator-led multi-repository

The candidate must recover the exact coordinator contract, component revisions, completed slices, unresolved integration risk, authority owner, and the one safe next action. Component repositories remain implementation sources; the coordinator remains lifecycle authority.

## Measurements

Correctness gates every efficiency interpretation. If the stage-aware condition does not pass all objective checks for a shape, that shape cannot support a context-efficiency improvement.

For each condition retain:

- objective fields passed, failed, and omitted;
- selected source paths by category, selected source count, measured source bytes, and selection digest;
- requested and acknowledged model plus requested, observed, and effective effort when available;
- non-cached input, cached input, output, operational, and gross Tokens when available;
- elapsed model time, time to first activity, command count, tool-output bytes, and `TEMPLE.md` reads;
- retry, fallback, reroute, intervention, rework, and stop status;
- exact starting and ending revisions, tree cleanliness, and path-policy result.

Operational Tokens equal non-cached input plus output. Gross Tokens include cached input and describe Provider throughput only. Repository bytes are a separate deterministic measure. None of these values is converted to money.

## Analysis

The analyzer reports each shape independently and then a clearly labelled diagnostic aggregate. It calculates absolute and percentage deltas only when both matched conditions are complete and the denominator is known and non-zero.

Outcome labels per shape:

- `supported`: both conditions pass and stage-aware uses fewer operational Tokens or less latency without increasing either metric by more than 5%;
- `quality-regression`: stage-aware fails an objective check passed by legacy;
- `overhead-regression`: both pass, but stage-aware increases operational Tokens or latency by more than 5% without an offsetting reduction in the other metric;
- `neutral`: both pass but the registered support or regression boundary is not reached;
- `inconclusive`: a condition stops, telemetry is unavailable, or legacy correctness differs in a way that prevents the registered comparison.

These labels apply only to this diagnostic sample. They do not authorize a framework-wide policy change.

## Provider envelope

The preparation target is four candidate turns and no model evaluator:

- single-repository legacy: maximum 40,000 Operational Tokens;
- single-repository stage-aware: maximum 40,000 Operational Tokens;
- multi-repository legacy: maximum 80,000 Operational Tokens;
- multi-repository stage-aware: maximum 80,000 Operational Tokens;
- aggregate maximum: 240,000 Operational Tokens;
- wall-clock maximum: 40 minutes;
- retry: 0;
- fallback: 0.

These limits are safety ceilings derived from the retained WI-0135 bounded-work observations and WI-0136 multi-repository recovery observations; they are not expected usage or price estimates.

The project has no configured Credits budget. The frozen protocol must remain `generation_ready: false` until an exact approval binds its digest, conditions, model, effort, limits, Pro-included-only boundary, no-purchase boundary, and no-reset boundary.

## Privacy and retention

Retain normalized metrics, objective outputs, source manifests, exact digests, stop evidence, and reports. Do not retain raw prompts, raw model responses, hidden reasoning, credentials, home-directory paths, or temporary fixture repositories in Git.

## Acceptance criteria

1. Both shapes are created from deterministic, clean, content-addressed fixtures.
2. Static rehearsal proves that matched conditions have identical task truth and different context selections.
3. The runner validates the installed Provider protocol and all output schemas before generation is permitted.
4. Every stop path preserves normalized completed and partial telemetry and cleans temporary processes and repositories.
5. Preflight publishes the exact protocol digest and refuses absent, stale, or non-exact approval.
6. Analysis keeps correctness primary and reports unknown data as unknown.
7. Independent QA can reproduce every retained calculation from the frozen observation.

## Exclusions

- changing Context Capsule implementation during the live run;
- comparing models or reasoning efforts;
- automatic model or context routing;
- statistical or monetary claims;
- Management Console changes;
- framework release, publication, deployment, or external service mutation.
