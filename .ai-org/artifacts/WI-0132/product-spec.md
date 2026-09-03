# Product specification — WI-0132

## User outcome

The repository owner can see whether Temple's native Lean process, targeted Luna escalation, or a Sol capability ceiling changed correctness, resource use, or delivery time on the two corrected frozen cases.

## Accepted scope

- Use the WI-0131 candidate construction, acceptance contracts, fixture digests, context accounting, and four conditions.
- Execute eight isolated candidate turns and one independent arm-neutral evaluator turn.
- Treat objective held-out tests as primary and the blind score as secondary.
- Report per-case and aggregate correctness, blind score, operational Tokens, gross Tokens, latency, context bytes, changed paths, and protocol deviations.
- Keep the three comparisons separate: process effect, Luna escalation bundle, and Sol ceiling bundle.
- Produce evidence-backed improvement recommendations without changing the active routing policy.

## Acceptance criteria

- All six Temple candidates are native `lean`, `bounded`, `low`, and start at `build`.
- Product task and acceptance-contract components are byte-identical across all four conditions for each case.
- Normalized Temple context is identical across Terra, Luna, and Sol for each case.
- The exact installed Codex App Server schema and availability of Terra medium, Luna max, Sol xhigh, and Terra high are verified before generation.
- Exact owner approval binds the protocol digest, eight candidate turns, one evaluator turn, allowed models, resource ceilings, no retry, and no fallback.
- Candidate repositories permit only `src/` and `test/` changes; network and dependency installation are disabled.
- Evaluator packages hide condition, model, Token, latency, repository path, and Agent identity until scores are frozen.
- The final report does not claim statistical superiority, pure model effect, billing cost, framework-wide effectiveness, or automatic-routing authority.

## Excluded

- Purchased Credits or automatic Credits reload.
- Automatic routing, deployment, publication, or release.
- Repeating a stopped or failed candidate.
- Treating operational Tokens as a monetary ceiling.
- Expanding the sample beyond the two frozen cases.
