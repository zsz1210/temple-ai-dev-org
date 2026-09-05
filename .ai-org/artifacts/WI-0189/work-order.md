# WI-0189 — Single-worker versus parallel-worker delivery POC

## Authorized outcome

The maintainer delegated the choice of a small product and requested one test of fixed decomposition: one Terra Builder versus three Terra workers followed by integration. The subsequent explicit response approved the unchanged seven-stage envelope; see [approval.md](approval.md). The earlier pending envelope remains a historical proposal, not the executable protocol.

The selected product is a JSON sales-report generator. This is a disposable, single-repository experiment, not a new Temple feature or a new ordinary-versus-Temple run.

## Scope and isolation

- Read the common contracts in [product-contract.md](product-contract.md).
- Prepare one competent single-worker arm and one fixed three-worker arm from identical seed bytes.
- Use fresh, isolated actor sessions with `gpt-5.6-terra`, requested effort `medium`, including the integrator and both Verifiers.
- Keep actor repositories and raw observations local-only. Publish no personal paths, credentials, raw prompts, account IDs or hidden reasoning.
- Do not modify framework source, shared experiment runners, old labs, WI-0179/WI-0182 protocols or their consumed approval records.
- Source checkout is pinned at `7c9c1b88b96b8d334c5c0a88bd287f473ce4fc42`; it includes locally accepted, not necessarily merged, work from another task. This POC must not be described as using current main.
- Only this directory and supported canonical Work Item/claim/views are repository write scope. No PR, merge, package publication or release is needed for preparation.

## Experimental treatment

Both arms receive the same prewritten complete product contracts and acceptance criteria. Decomposition is fixed before either arm runs. The baseline may organize its own implementation order; it may not spawn workers. The parallel arm receives the same information plus ownership boundaries.

A: one Builder implements all three modules, tests and exact-revision handoff; one fresh Verifier checks the integrated result.

B: three independent workers implement one module each in separate copies of the same seed. The coordinator joins only the declared candidate files/revisions, retaining join duration and any conflict. One fresh integrator validates the combined product and may make bounded integration repairs inside the original contract. One fresh Verifier then checks the final exact revision.

Both Verifiers use identical instructions, may inspect the implementation and run checks, and may not edit product files. They are not the Builder Identity. Rework within an initially authorized actor turn is measured; restarting an actor, adding a repair actor or falling back to another model is not allowed.

Run A then B once. This fixed order and uncontrolled cache are limitations; no statistical significance or broad speed/cost claim follows from one pair. This tests a sensible fixed decomposition, not an automatic task splitter, learned router, or all benefits of Temple.

## Measurements

- Product correctness: identical frozen public checks and private held-out checks, exact candidate handoff, no Verifier product writes.
- End-to-end arm wall time: actor dispatch through final verification, including joining and integration. Preparation time is reported separately.
- Tokens: sum every Builder/worker, integrator and Verifier. Operational = input minus cached input plus output. Report cache and all Tokens separately.
- Parent/coordinator inference used while running the arms must be measured or explicitly marked unattributed; deterministic orchestration work is not a free model call.
- Record actual overlap intervals for the three workers; requested parallelism alone does not prove concurrent execution.
- Record command counts, returned output bytes, conflicts, repair work, failed checks, human intervention, missing usage and censored stages.
- Never interpret bytes as Tokens, last-observed Tokens as final billing, or unavailable data as zero.

## Proposed ceiling and rationale

The [pending envelope](protocol.pending.json) permits at most seven fresh actor stages. Proposed aggregate ceiling: 600,000 Operational Tokens and 45 minutes; at most three concurrent actors.

Stage ceilings sum to 600,000: 160,000 for the single Builder; 80,000 for each of three module workers; 80,000 for integration; 60,000 for each Verifier. The single Builder receives more capacity because it owns all three modules. Thus this is not an equal-budget model-quality comparison.

For context only, the completed WI-0179 Terra stages used 21,042–51,914 Operational Tokens on a smaller one-function task. Those observations motivate explicit headroom; they do not statistically predict this three-module task or establish optimal limits. These are operational stop thresholds, not financial price limits or expected consumption. Delayed Provider counters can overshoot a threshold, and that must remain visible.

Only existing Pro included allowance is proposed. No Credits purchase/refill, reset, actor retry or fallback. No inherited approval from another Work Item.

## Readiness before any model generation

1. Obtain the genuine response to this experiment's envelope; record it separately from the delegated product choice.
2. Finish the isolated fixture, objective checks and the minimal runner adaptation. Reuse the supported Provider client, Token normalization and sandbox interfaces where suitable; do not assume the old one-function command policy supports this fixture.
3. Validate positive and negative cases without model generation, including parallel aggregation, safe joining, identity separation, timeout/cap interruption, source drift and denied writes.
4. Recheck the installed Provider interface, managed subscription route, model acknowledgement and no-purchase policy. A schema probe is not a candidate turn.
5. Pin actual fixture/prompt/runner/check digests in a frozen protocol. The pending envelope is not an executable-ready protocol or evidence that these checks passed.
6. If any choice exceeds or materially changes the approved seven-stage experiment, stop rather than silently expand it.

## Stop and report

The outer Work Item owns the experiment harness and its isolated subjects. These subjects deliberately receive no Temple installation or lifecycle overhead in either arm: they are measured test actors, not additional framework-development tasks. Their stage graph, individual roots, ownership, shared contract, exact candidates and join owner are frozen in the experiment protocol. The deterministic coordinator is the integration owner; the Integrator is a fresh subject with a distinct runtime, not a second authority over the outer Work Item. Core framework runtime/task registries and other ongoing experiments remain untouched.

One-shot execution ends when both arms are verified or a governing safety, authority, accounting, Provider, time or Token boundary stops the run. Never delete run-once markers or restart under the same approval. Independent remaining work may proceed after an ordinary product-quality rejection only if the frozen protocol explicitly permits it within the same envelope; never after a fatal safety/accounting failure.

Report accepted outcomes and complete-arm costs first; preserve partial outcomes without ranking incomplete arms. Deliver results, limitations and concrete next steps even when no efficiency benefit appears. No automatic follow-on experiment or framework policy change.
