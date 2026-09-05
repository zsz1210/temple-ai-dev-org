# WI-0179 — Ready to run; approval pending

The new comparison is prepared and frozen. **No live candidate stage has started.** The Work Item remains open; test outcomes, comparison analysis and final closeout are still pending.

Frozen matrix: `sha256:1df24908d042b96b736745f9efb0a79415d3bfd66e878a3e565b9db876df511f`.

- [Matrix and aggregate limits](matrix.frozen.json)
- [Design, fairness and stop conditions](design.md)
- [Developer verification](verification.md)
- [Independent readiness QA](independent-qa.md)
- [Digest-bound readiness](readiness-review.json)

## What this run measures

The current optimized Temple flow against the unchanged ordinary Git/test/handoff flow. Both Terra medium and GPT-6 medium have one ordinary-first and one Temple-first pair: 16 fresh Builder/Verifier stages in total. Each stage retains the previous 80,000 Operational Token / six-minute protection cap. The whole matrix is bounded at 1,280,000 / 96 minutes; these are ceilings, not predicted usage.

Report product correctness, exact handoff and actual compact-context/composed-delivery use first. Then report Builder/Verifier latency, operational and all Tokens, cached input, command counts and per-operation output bytes separately. Keep setup and coordinator checks outside actor elapsed comparisons. Two pairs per model and uncontrolled cache cannot establish statistical significance or a broad causal efficiency claim. Old results are historical context only.

## Approval and recovery

The maintainer has been asked to approve this whole matrix, including its requested routes and aggregate limits. The pending question, a selected-but-unsubmitted option, a QA pass, or a structural JSON approval validator is not human approval. Confirm the actual maintainer response before creating an approved record.

Only existing plan allowance is permitted: no Credits purchase/refill, reset, retry or fallback. If Terra-only is approved, prepare and bind a different Terra-only matrix; never run the unapproved GPT-6 pairs or silently alter this frozen matrix.

The private lab locator is under the Git common directory at `temple-comparisons/WI-0179.local.json`. Obtain that directory with `git rev-parse --git-common-dir`. The locator is outside tracked files and contains no approval. Raw labs and temporary runtime scratch are local-only.

Before execution, read the current source and protocol, confirm the matrix digest and genuine approval, recheck source/readiness/provider contracts, fresh lab state and account route, then invoke the existing `run` command with an exact approved matrix record. The exclusive matrix/pair locks prevent repetition. On a stop, retain the result; do not delete locks, replace the lab, or reuse this approval for a retry. Any new scope requires its own decision.

The readiness report's one machine-home path was normalized through the supported publication operation after QA, without changing findings. Original report hash: `7229312f86439147353915f896fec7095a4e79e377e0224ad44272c1177d3c6f`; public report hash: `c0403b2765ca73c79af6fab57b7c43d2812d47c39302e5ffb8640eb1e5c3c328`. The frozen protocols bind the public report bytes. Released claim and completed worker coordinates were also removed through the supported canonical normalization.

PR #57 was merged; its clean, merged worktree and branch were removed. Its history remains in main. The separate historical comparison branch, labs and sealed protocols remain unchanged.
