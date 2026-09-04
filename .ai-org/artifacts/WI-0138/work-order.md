# WI-0138 work order

## Purpose

Determine whether the stage- and purpose-aware Context Capsule introduced by WI-0137 reduces unnecessary context during a cold handoff without reducing objective task correctness.

This is an ablation of context composition, not a general Temple-versus-no-Temple comparison and not a model-routing experiment.

## Matched project shapes

The experiment contains two independently reported shapes:

1. **Single repository** — a bounded implementation handoff with product rules, architecture material, operational notes, and unrelated capabilities in one repository.
2. **Coordinator-led multi-repository** — a bounded integration handoff across the retained representative service fixture, with the coordinator as the lifecycle authority and component repositories as implementation scopes.

Each shape has two matched conditions:

- `legacy-expanded`: unscoped route material plus the full operating contract, representing the avoidable expansion observed before WI-0137;
- `stage-aware`: Context Capsule v2 resolved for the exact lifecycle stage and purpose, opening only the selected canonical sources and using `TEMPLE.md` solely as an explicit recovery fallback.

The condition changes context treatment only. Repository revisions, task contract, requested model, requested reasoning effort, command policy, output schema, per-condition limits, retry count, fallback count, and evaluator rules must remain matched.

## Measurements

Correctness is primary. The retained record will report, per shape and condition:

- public and held-out objective checks;
- required facts recovered and omissions;
- selection digest, selected source count, measured source bytes, and source categories;
- input, cached-input, output, and operational Tokens when the Provider exposes them;
- elapsed time and reported tool-output bytes;
- human interventions, retries, fallbacks, rework, and stop reason;
- exact repository revisions and clean-tree status.

Source bytes are not Tokens, price, or model cost. Missing Provider telemetry remains unknown rather than zero.

## Safety and readiness

Before any Provider generation, a generation-free rehearsal must verify:

- fixture identity and matched starting revisions;
- a real and observable difference between the two context treatments;
- schema validation for every Provider output;
- command and path allowlists;
- per-condition and whole-run interruption behavior;
- stopped-run evidence preservation and cleanup;
- zero retry and zero fallback;
- an exact protocol digest and exact approval record.

The current project usage policy has no configured Credits budget. Generation therefore stays disabled until the user approves the exact frozen protocol and its maximum operational Tokens and elapsed time. No Credits purchase, automatic refill, reset use, or fallback may be inferred.

## Interpretation boundary

One matched pair per shape is diagnostic evidence only. Report the two shapes separately before any aggregate. Do not claim statistical significance, population-wide Token savings, price savings, model superiority, or automatic routing authority.

## Stop condition

This preparation slice stops when the frozen protocol, fixtures, analyzer, tests, and generation-free readiness record all pass. It must then return for exact live-run approval. It does not continue into Provider generation, framework release, publication, or unrelated product work.
