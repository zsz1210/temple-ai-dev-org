# WI-0143 technical design

## Experiment profile

The existing harness remains the single implementation, but accepts an explicit supported Work Item profile. The default profile is the sealed WI-0141 experiment so existing imports and retained tests do not change meaning. The WI-0143 profile changes only experiment identity, isolated output paths, matched-block order, and the predeclared cache-control record.

Unknown Work Item IDs fail closed. An existing live or stopped observation seals only that profile's artifact root.

## Process-only comparison

Both treatments use `gpt-5.6-terra` at `medium` reasoning because this is the project's approved standard route and the model must not become a second experimental factor. The two task shapes and two repetitions yield eight candidate turns and no model evaluator. Correctness is checked from exact typed facts against fixture-owned expected values.

WI-0143 uses adjacent counterbalanced blocks:

1. single repository: Routed Context, then Full-load Context;
2. multi repository: Full-load Context, then Routed Context;
3. single repository: Full-load Context, then Routed Context;
4. multi repository: Routed Context, then Full-load Context.

This reduces time-dependent cache drift between paired arms without pretending that a fresh task disables Provider caching.

## Cache-control rule

The local Codex App Server contract reports cached-input usage but exposes no acknowledged per-turn cache-disable control. WI-0143 therefore uses `matched-cache-share`, not `provider-cache-disabled`.

The retained WI-0141 first-wave pairs differed by 0.10 and 0.50 percentage points when the paired observations were near each other; later non-adjacent pairs differed by 11.42 and 14.86 points. WI-0143 predeclares a two-point maximum per adjacent pair. The fourfold margin over the largest near-pair pilot difference is intentionally practical and conservative, but remains diagnostic rather than statistically calibrated. Exceeding it invalidates routing-only efficiency attribution; it does not erase the observation.

## Evidence and privacy

The runner retains normalized structured completions, objective checks, component Token counts, timing, bounded acquisition classifications, intervention/rework counters, and protocol digests. It does not retain raw prompts, raw responses, hidden reasoning, raw commands, raw command output, absolute acquisition paths, or temporary repositories in Git.

The generation-free sequence is `prepare -> rehearse -> preflight`. Preflight verifies the installed Provider handshake, exact harness digest, sealed predecessor evidence, laboratory integrity, schema compatibility, cache rule, and approval record. Before approval, `exact-approval` must be the only remaining blocker.

## Stop and interpretation rules

- Stop the run on aggregate time or Operational Token ceilings, Provider contract drift, repository mutation, malformed output, or a run-scoped terminal failure.
- Do not retry, reroute, or fall back.
- Report each shape separately before any diagnostic aggregate.
- Report human intervention as zero only when no in-run human action was requested or supplied; report rework as zero only when retry/fallback counts remain zero and no corrective candidate turn is added.
- A valid result is allowed to be negative or inconclusive. The harness must not tune the cache threshold after observations are visible.

## Risks

- Provider caching is observable but not directly controllable; the causal conclusion may remain blocked.
- Eight turns provide a bounded engineering comparison, not population-level statistical proof.
- App Server fields may drift after a Codex update; the frozen handshake must fail before generation.
- The run may consume Pro allowance even though Token counts are not a billing ledger; live execution needs separate exact approval.
