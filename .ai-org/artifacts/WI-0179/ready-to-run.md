# WI-0179 — Frozen preparation and execution record

The maintainer approved the v2 matrix, and its one-shot execution has ended at the protocol's stop condition. **Five actor stages ran: one complete Terra pair and one interrupted GPT-6 Builder.** The matrix is not fully complete. See the [measured report and improvement priorities](report.md), [selected results](results.json), and [approval](approval.v2.json). No retry or continuation is authorized by the consumed approval.

Current frozen matrix: `sha256:3aea9b81ed834faebccffa6376a3eb1df7a5c0d40604dbda549376ad7ab4b183`.

- [Current matrix and aggregate limits](matrix.v2.frozen.json)
- [Design, fairness and stop conditions](design.md)
- [Original harness verification](verification.md) and [current test-prerequisite verification](../WI-0180/verification.md)
- [Original independent harness QA](independent-qa.md) and [separate exact-candidate prerequisite evaluation](prerequisite-evaluation.v2.md)
- [Current digest-bound readiness](readiness-review.v2.json)

## Why there are two preparations

The initial matrix `sha256:1df24908d042b96b736745f9efb0a79415d3bfd66e878a3e565b9db876df511f` remains retained unchanged in [its original file](matrix.frozen.json) and private lab. It was never approved or run. WI-0180 then corrected one test's optional installed-Codex/zsh prerequisite declaration for hosts such as the npm Release runner. That changes the source digest, so the unused initial matrix is superseded rather than overwritten or silently reused.

The current source is candidate `64d5c94a2fd5213c464bef054e53f401247680ce`, digest `sha256:fb8c249ec8641487477ade184a208159a2edde672ad9f86e19a3e5dec0fe7c1e`. The process contract, actor requests, ordinary control, product fixture and budgets are unchanged. The original independent QA covers the unchanged harness behavior. A different runtime from the Developer freshly evaluated the exact test-only delta; its report explicitly distinguishes fresh checks from reused full-suite and sandbox evidence. This supplemental Lean evaluation is not a new formal Independent QA lifecycle transition.

Current verification: 568/568 local tests, no skips; a source-matched generation-free installed sandbox replay of four stages/81 operations/two denied writes; and independent missing-Codex and explicit-request negative checks. The v2 readiness record binds the supplemental report and the current sandbox report. These checks support preparation only; no live model performance or human approval is inferred.

## What this run measures

The current optimized Temple flow against the unchanged ordinary Git/test/handoff flow. Both Terra medium and GPT-6 medium have one ordinary-first and one Temple-first pair: 16 fresh Builder/Verifier stages in total. Each stage retains the previous 80,000 Operational Token / six-minute protection cap. The whole matrix is bounded at 1,280,000 / 96 minutes; these are ceilings, not predicted usage.

Report product correctness, exact handoff and actual compact-context/composed-delivery use first. Then report Builder/Verifier latency, operational and all Tokens, cached input, command counts and per-operation output bytes separately. Keep setup and coordinator checks outside actor elapsed comparisons. Two pairs per model and uncontrolled cache cannot establish statistical significance or a broad causal efficiency claim. Old results are historical context only.

## Approval and recovery record

The maintainer's actual response to the exact matrix, requested routes and aggregate limits was recorded in [approval.v2.md](approval.v2.md). The pending question, a selected-but-unsubmitted option, a QA pass, or a structural JSON approval validator would not have been human approval.

Only existing plan allowance is permitted: no Credits purchase/refill, reset, retry or fallback. If Terra-only is approved, prepare and bind a different Terra-only matrix; never run the unapproved GPT-6 pairs or silently alter this frozen matrix.

The private lab locator is under the Git common directory at `temple-comparisons/WI-0179.local.json`. Obtain that directory with `git rev-parse --git-common-dir`. The locator is outside tracked files; its reference to the recorded approval is navigation, not a new grant. Raw labs and temporary runtime scratch are local-only.

Execution rechecked source/readiness/provider contracts, the exact matrix and genuine approval, fresh lab state and account route. The exclusive matrix/pair locks are now consumed and prevent repetition. Retain the stopped result; do not delete locks, replace the lab, resume the unstarted pairs, or reuse this approval for a retry. Any new scope requires its own decision.

The original readiness report's one machine-home path was normalized through the supported publication operation after QA, without changing findings. Original report hash: `7229312f86439147353915f896fec7095a4e79e377e0224ad44272c1177d3c6f`; public report hash: `c0403b2765ca73c79af6fab57b7c43d2812d47c39302e5ffb8640eb1e5c3c328`. The initial protocols bind those public report bytes; the v2 protocols instead bind the current supplemental report named above. Released claim and completed worker coordinates were also removed through the supported canonical normalization.

PR #57 was merged; its clean, merged worktree and branch were removed. Its history remains in main. The separate historical comparison branch, labs and sealed protocols remain unchanged.
