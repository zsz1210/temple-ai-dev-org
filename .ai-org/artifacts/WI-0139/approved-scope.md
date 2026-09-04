# WI-0139 approved scope

## Problem

WI-0138 recovered the required repository state, but its evaluator rejected correct answers when harmless punctuation or an explanatory contract description differed from the frozen prose. That makes the quality gate measure wording conformity instead of recovery correctness.

## Required behavior

The successor experiment asks candidates for canonical facts that have stable meanings:

- identifiers for requirements, decisions, contracts, risks, actions, and authority;
- integer test totals rather than a formatted status sentence;
- exact Git revisions and repository-relative paths;
- unique, order-insensitive lists of completed slice identifiers.

The output schema may constrain types, formats, lengths, and uniqueness. It must not contain answer-bearing `const` or `enum` values. Expected facts remain evaluator-only data derived from the frozen fixture.

## Historical regression

The four retained WI-0138 completions are inputs to a compatibility-only regression. A deterministic adapter may extract their already-visible semantic values to prove that `18 passed` and `18 passed.` represent the same test totals, and that `OrderPlaced/v2` remains the same contract identifier when followed by a correct explanation. This does not modify, rescore, replace, or upgrade WI-0138's official conclusion.

## Reasoning evidence

The harness must record:

1. the requested model and effort;
2. the configured model and effort acknowledged before the turn;
3. effective execution telemetry only if the Provider exposes it.

The first two must match the frozen protocol before generation. If the third is unavailable, it stays `null`, and reports describe the arm as requested-and-acknowledged Terra medium rather than proven effective Terra medium.

## Acceptance

- all correct typed facts pass;
- wrong IDs, test totals, revisions, missing slices, duplicate slices, wrong authority, and wrong actions fail;
- both historical false-negative shapes normalize to the same typed facts without model generation;
- protocol preparation and rehearsal consume zero Operational Tokens;
- a new approval template refers only to the new WI-0139 protocol;
- the retained `.ai-org/artifacts/WI-0138/**` tree is byte-unchanged.

## Exclusions

No live Provider turn, statistical claim, automatic model-routing change, merge to `main`, release, publication, external write, or purchase is authorized in this slice.

