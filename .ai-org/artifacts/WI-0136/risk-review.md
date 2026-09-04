# WI-0136 risk review

## Classification

Standard, cross-system, local-only experiment. It can consume material Provider quota and can produce misleading product claims if fairness or evidence integrity fails. It touches no production or external service state.

## Risks and controls

- **Strawman baseline:** give the minimal-responsible arm normal scope, ownership, Git, tests, review, handoffs, and integration controls; validate parity before generation.
- **Unmatched product inputs:** pin common product-source commits and content digests independently from the Temple organizational commit.
- **Hidden-test leakage:** keep held-out source outside candidate repositories and include only normalized results in blind packages.
- **Condition leakage:** remove arm, framework, Agent, model, usage, latency, and repository-path fields from evaluator inputs and reject forbidden keys recursively.
- **Provider or schema drift:** regenerate and hash the App Server schema and require exact model and effort availability before generation.
- **Unbounded usage:** require exact Human approval, stage-specific per-turn limits, aggregate operational Token and wall-clock stops, zero retry, zero fallback, and no reset or payment authority.
- **Parallel race:** concurrent slice turns own disjoint repositories; coordinator and shared contract files are read-only during the wave.
- **False recovery success:** score exact revisions, contract authority, completed slices, unresolved work, owner, and next action from repository evidence and compare against ground truth.
- **Self-reported metrics:** derive Git, tests, usage, timing, and footprint mechanically; model completion is supporting evidence only.
- **System burden:** use local Node processes and Git repositories only; no Docker, VM, published port, daemon, or network service is required.
- **Overclaiming:** one scenario produces descriptive evidence only. Correctness failure blocks every efficiency claim.
- **Context-loading confound:** unconditionally loading `TEMPLE.md` for a known Work Item tests a workflow Temple does not recommend and can inflate input. The main protocol remains blocked until routed-context behavior is frozen and a focused ablation preserves objective recovery quality.
- **Ablation overclaiming:** one full-load versus routed pair is diagnostic only. Even if routed context uses fewer Tokens, it cannot establish a population effect or Temple effectiveness.

## Rollback

The lab is disposable and contains synthetic data only. Before generation it may be removed and recreated. After generation, preserve the observation and start any corrected attempt under a new versioned protocol instead of rewriting history.
