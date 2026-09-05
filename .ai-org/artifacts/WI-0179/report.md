# WI-0179 — Real delivery comparison and improvement priorities

Date: 2026-09-05. Status: **one complete matched pair; the approved matrix stopped early**.

## Conclusion

On this small shipping-quote task, the completed Terra pair passed product and handoff checks in both workflows. Temple used **56.98% more Operational Tokens and 23.00% more stage wall time** than the ordinary workflow. Compact Context and composed delivery were actually used successfully; their presence alone did not make the whole workflow cheaper or faster.

The next pair, GPT-6 Temple-first, stopped at the per-stage Token limit after its Builder had successfully handed off the implementation. No GPT-6 Verifier or ordinary arm ran. Consequently, this run does **not** support a GPT-6 efficiency comparison, a model ranking, or a general Temple efficiency claim.

The useful outcome is a narrower improvement target: reduce unnecessary context and output around verification and make the distinction between a Builder handoff and whole-Work-Item completion clearer. Do not respond by simply increasing the cap and repeating the same run.

## What was compared

Both arms implemented the same synchronous, immutable `quoteOrder` function: validated integer money/quantity inputs, configurable shipping thresholds, overflow protection, and meaningful added tests. Both had to commit an exact candidate and leave delivery/handoff evidence for a fresh Verifier that could not change product files. Public tests stayed unchanged, and a coordinator checked held-out cases.

- **Ordinary:** a competent Git, tests, exact-revision handoff and fresh-verification workflow, without Temple governance files.
- **Temple:** the same product task, plus recorded ownership/lifecycle evidence, compact Context resolution, and the composed `work-item deliver` operation.

This is a small, single-repository delivery diagnostic. It does not measure multi-repository coordination, long-running recovery, human intervention saved, or enterprise collaboration value.

## Execution coverage

| Planned pair | Requested model / effort | Result | Actor stages started |
| --- | --- | --- | ---: |
| Ordinary → Temple | Terra / medium | Complete and comparable | 4 / 4 |
| Temple → Ordinary | GPT-6 / medium | Builder interrupted at Token cap | 1 / 4 |
| Temple → Ordinary | Terra / medium | Not started after matrix stop | 0 / 4 |
| Ordinary → Temple | GPT-6 / medium | Not started after matrix stop | 0 / 4 |

The matrix observed **245,125 Operational Tokens across 5 of 16 authorized actor stages**, over **729.268 seconds** of runner wall time. The aggregate ceilings were 1,280,000 Tokens and 96 minutes; the earlier stop came from the 80,000-Token stage cap, not those aggregate ceilings or an observed account-quota rejection. The protocol deliberately stops the whole matrix when a pair is not comparable. No retries, fallback, reset, Credits purchase or refill were performed.

Usage is the last observed cumulative Provider counter, **not account-final billing**. Coordinator and report-author inference is not attributed to the actor subtotal and is unknown, not zero.

## Terra: the complete current comparison

| Responsibility | Ordinary Tokens | Temple Tokens | Difference | Ordinary time | Temple time |
| --- | ---: | ---: | ---: | ---: | ---: |
| Builder | 42,957 | 51,914 | +20.85% | 167.361 s | 188.784 s |
| Fresh Verifier | 21,042 | 48,554 | +130.75% | 74.281 s | 108.437 s |
| **Combined** | **63,999** | **100,468** | **+56.98%** | **241.642 s** | **297.221 s** |

Time is the sum of each actor stage's wall time, including its Provider/thread startup and tool work. Repository preparation and subsequent coordinator validation are outside this comparison. Ordinary setup was 88 ms and coordinator validation 382 ms; Temple setup was 1,643 ms and validation 410 ms. This is not pure model-generation speed.

All four stages passed product tests, held-out checks, exact candidate handoff and applicable workflow/treatment checks. Temple's Builder reached Test with its claim released; its fresh Verifier completed the bounded acceptance workflow. Both Temple stages used compact Context, and the Builder used non-dry-run composed delivery. Harmless differences between the structured completion's prose summary and the handoff file were retained; substantive evidence fields matched.

**The Verifier accounts for 27,512 of the 36,469 additional Tokens: 75.44% of the difference.** That is the strongest quantitative reason to inspect verification context before concentrating only on Builder speed.

### Token components

Operational Tokens are `(input − cached input) + output`. Reasoning output is reported separately as a subset of output, not added again.

| Stage | Input | Cached input | Non-cached input | Output | Operational | Input + output |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Ordinary Builder | 422,768 | 385,280 | 37,488 | 5,469 | 42,957 | 428,237 |
| Ordinary Verifier | 212,139 | 192,768 | 19,371 | 1,671 | 21,042 | 213,810 |
| Temple Builder | 650,136 | 603,904 | 46,232 | 5,682 | 51,914 | 655,818 |
| Temple Verifier | 545,418 | 499,456 | 45,962 | 2,592 | 48,554 | 548,010 |
| GPT-6 Temple Builder, interrupted | 671,181 | 593,536 | 77,645 | 3,013 | 80,658 | 674,194 |

Cache was uncontrolled. Neither cached nor uncached counters establish which particular file or command caused a cost difference. Requested effort and observed thread effort were `medium`; acknowledged model IDs matched requests. **Effective per-turn effort and the model release revision were not exposed** and remain unknown.

### Observable command and reading work

| Stage | Completed shell commands | File-read output (`cat`) | Compact Context output | Composed delivery output |
| --- | ---: | ---: | ---: | ---: |
| Ordinary Builder | 15 | 2,936 bytes | Not applicable | Not applicable |
| Ordinary Verifier | 9 | 7,642 bytes | Not applicable | Not applicable |
| Temple Builder | 17 | 29,124 bytes | 3,992 bytes | 658 bytes |
| Temple Verifier | 16 | 49,075 bytes | 4,470 bytes | Not applicable |
| GPT-6 Temple Builder, interrupted | 17 | 39,580 bytes | 3,992 bytes | 658 bytes |

These are observed returned bytes, not prompt Tokens, unique source bytes, or proof that every read was unnecessary. Some command outputs are unavailable; their totals are marked incomplete in [results.json](results.json), not silently treated as known zero. A failing test followed by passing tests may be a normal red–green development cycle, not automatically rework or a product defect.

## GPT-6: what stopped, and what still worked

The Builder was interrupted at a last observed **80,658 Operational Tokens**, after 188.975 seconds of stage wall time. The 658-Token overshoot reflects notification-driven observation and interruption: the configured 80,000 threshold is not an exact Provider-enforced hard ceiling. The interrupt was acknowledged, with no unmatched shell or patch starts.

The retained command sequence shows:

1. Compact Context, implementation, tests and an exact candidate commit.
2. Successful composed delivery: 658 output bytes; Work Item entered Test, claim released, exact handoff recorded.
3. A full Status call: **17,974 output bytes**.
4. A Doctor call: **5,594 output bytes**.
5. The observed Token-cap interruption, before structured completion and fresh verification.

The two post-delivery diagnostics returned **23,568 bytes**. This is a concrete output-volume and stopping-boundary concern. However, only the last cumulative Token counter is retained: we cannot assign an exact Token increment to either command or prove these outputs alone caused the overrun.

The current Skill says to rebuild/inspect Status and run Doctor before claiming completion. It also says composed delivery only hands Build to Test. That combination deserves a stage-specific clarification; this observation does **not** authorize removing assurance checks or asserting that the model ignored instructions.

### Separate post-stop product diagnostic

A read-only, zero-actor rerun of deterministic checks against sealed candidate `2aa1ab6418ac43f76f0f93ff6fd3124d7dfd8dcf` passed **9/9 public and added tests** and the held-out oracle. Candidate bytes matched Git, the exact handoff was present, and the retained archive digest was unchanged before and after the diagnostic.

This is [post-stop diagnostic evidence](post-stop-diagnostic.json), **not a resumed actor, original-stage acceptance, or a substitute for the unstarted fresh Verifier**. The original GPT-6 stage remains interrupted and the pair remains non-comparable.

## Comparison with the earlier lane

The separate historical lane was left unchanged. Its [numeric-only projection](historical-reference.json) is context, not a causal control for this source version.

| Terra observation | Ordinary Tokens | Temple Tokens | Temple overhead | Ordinary time | Temple time |
| --- | ---: | ---: | ---: | ---: | ---: |
| Earlier process v5 | 92,005 | 120,844 | +31.35% | 246.322 s | 287.326 s |
| Current process v6 | 63,999 | 100,468 | +56.98% | 241.642 s | 297.221 s |

Current Temple Tokens are lower than the earlier observation, but ordinary Tokens also fell substantially, and Temple's relative overhead grew. This does **not** prove that the optimization caused a saving or regression. Source/process changes, stochastic behavior, uncontrolled cache and one completed pair prevent that inference. The planned reverse-order pair did not run.

Earlier GPT-6 completed both arms (ordinary 52,664 Tokens / 224.755 s; Temple 87,663 / 346.377 s). There is no complete current GPT-6 pair to compare against it. Do not put the interrupted 80,658-Token Builder next to an earlier full Builder-plus-Verifier total as if they were equivalent.

## Recommended improvements, in order

| Priority | Change to design next | Evidence and acceptance target |
| --- | --- | --- |
| 1 | Clarify stage completion versus whole-work completion | After a successful Build handoff, name the remaining Builder obligations and explicit return condition. Preserve required checks and failures; do not silently treat handoff as acceptance. Test successful, stale, failed and uncertain receipts locally. |
| 1 | Make verification context and passing diagnostics concise | Inspect why the fresh Temple Verifier read 49,075 bytes and used 27,512 more Tokens. Route the minimum required authority plus exact candidate/test/handoff evidence. Run required checks, but offer compact pass summaries and detailed actionable failures instead of full organization dumps. Verify the same gates still run. |
| 2 | Add bounded per-operation usage attribution | Record cumulative numeric counters/deltas, operation class and timestamps with unknown intervals retained. Avoid raw prompts, private paths and hidden reasoning. Demonstrate reconciliation to stage totals before attributing savings or adjusting budgets. |
| 2 | Separate expected budget censoring from fatal matrix stops in a future protocol | Source drift, unsafe writes, authority and accounting failures remain hard stops. Consider whether a single budget-censored actor should prevent independent, already-budgeted pairs from running. Freeze and approve any new policy before execution; do not change this completed attempt. |

These are proposals derived from a small diagnostic, not new framework-wide rules or an automatic routing-policy update. First run generation-free regressions for the bounded changes. Any further live comparison needs a newly frozen protocol and its own approval; no cap increase, fallback or retry is implied here.

## Evidence, reproducibility and limits

- [Approval](approval.v2.json), [matrix](matrix.v2.frozen.json), [design](design.md), and [full selected measurements](results.json).
- Current source digest: `sha256:fb8c249ec8641487477ade184a208159a2edde672ad9f86e19a3e5dec0fe7c1e`.
- Current matrix digest: `sha256:3aea9b81ed834faebccffa6376a3eb1df7a5c0d40604dbda549376ad7ab4b183`.
- Process contract v6: `sha256:96977af8fa19b6aa1e79d31ff9a60415165b4ec98d871362e765565df3abdd69`.
- Installed actor interface: Codex 0.153.1, Node 24.20.0, managed ChatGPT subscription authentication. No Platform API-key route was used.
- Both attempted pair run hashes and retained-artifact seals were rechecked after interruption and analysis. The unused pairs have no `run.json`; their results are unknown, not zero-cost completed outcomes.
- [Recalculation script](analyze-results.mjs): `node .ai-org/artifacts/WI-0179/analyze-results.mjs PRIVATE_MATRIX_ROOT` validates the retained seals, reconciles counters and prints the selected JSON. It performs no model calls or writes. Raw labs remain local; public reports omit machine paths, credentials, account identifiers and Provider session IDs.
- Original harness Independent QA and the exact-candidate test-prerequisite evaluation support readiness only. This report's recalculation is not a newly performed Independent QA review or proof the 16-stage matrix passed.

The outcome remains **one complete small-task comparison plus an informative stopped attempt**. It is enough to prioritize a bounded improvement, not enough to claim general efficiency, statistical significance, model superiority, or measured financial savings.
