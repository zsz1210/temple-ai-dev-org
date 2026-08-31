# WI-0050 work order

## Outcome

Produce an independently reviewable plan for proving how Temple behaves across several authoritative repositories and for measuring its operational effects without overstating Token savings, speed, or model quality.

## Authorized scope

- Classify every currently nonterminal Work Item without changing its lifecycle state.
- Design a local-first experiment with one coordination repository and three service repositories.
- Define repository authority, contract ownership, cross-repository rollout, role participation, task registration, and at least ten varied completed Work Items.
- Define a measurement protocol for Token usage, elapsed time, context recovery, coordination, rework, QA, and completion outcomes.
- State the privacy, cost, human-approval, failure-injection, and stop boundaries before execution.
- Add one human-facing planning document under `docs/planning/` and retain supporting evidence under this Work Item.

## Not authorized

- Creating or mutating service repositories, GitHub repositories, pull requests, issues, Projects, or hosted CI.
- Starting new Codex tasks, generating model traffic for the experiment, or spending against an experiment budget.
- Sending instructions through the Agent Command Gateway.
- Changing lifecycle states of the pre-existing Work Items reviewed here.
- Publishing, deploying, releasing, or preparing an open-source release.
- Claiming that Temple saves Tokens, time, money, or defects before a qualified comparison exists.

## Human decision gates

Execution requires a later decision for each of these boundaries:

1. approve the experiment design and its stop conditions;
2. approve the local repository locations and any sample-domain content;
3. approve the Token and compute budget before creating real Codex tasks;
4. separately approve private GitHub resources, hosted CI, or multi-machine participation;
5. separately approve any sensitive, company, public, production, or paid environment.

## Evidence expected

- A complete nonterminal-ledger review.
- A product specification that separates an instrumentation pilot from a causal effectiveness evaluation.
- A technical design with topology, authority boundaries, task matrix, measurements, failure injections, and stop conditions.
- Repository verification and Independent QA of the planning artifacts themselves.
- No evidence entry that implies the experiment was run.

