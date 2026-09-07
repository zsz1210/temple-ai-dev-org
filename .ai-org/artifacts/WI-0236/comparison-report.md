# Minimum delivery comparison — WI-0236

## Conclusion

The improvement is independently reviewed and available in [PR #78](https://github.com/zsz1210/temple-ai-dev-org/pull/78), but it is **not merged into main**. The minimum diagnostic attempted **three of four planned subjects**, then stopped under its frozen candidate-validity rule. There was no retry, replacement, fallback, reset or Credits purchase.

The completed stable-requirement pair does **not** show an efficiency gain: both products and handoffs passed, while Temple used **3.91 times** the Operational Tokens and **2.61 times** the measured turn time. The changed-specification pair is incomplete and supports no ordinary-versus-Temple comparison.

The new completion schema no longer penalized honest declarations of downstream QA work in the three returned reports. Both Temple subjects produced a formal finish receipt, handoff and released claim. These are useful semantic/administrative observations, not evidence of lower cost or greater reliability.

## What was actually tested

Each subject was a fresh Codex session using `gpt-5.6-terra`, `medium`, with the same bounded quote/shipping problem, product facts, public tests and independent oracle within each pair. The ordinary arm used repository reading, Git, tests and a structured handoff without Temple. The Temple arm additionally used its installed instructions, Lean claim/completion route and durable organization records. This is a controlled baseline, not a survey of all ordinary Codex usage.

Stable scope completes unfinished shipping integration at threshold 3000. Changed scope updates the old 3000 threshold to the current approved 5000 requirement without treating historical green tests as current evidence. Both preserve the accepted discount implementation and protected files. The isolated product oracle covers 46 cases.

Only Developer Build/takeover was measured; downstream independent review was deliberately not performed by subjects. Coordinator work, reviewer Tokens, repository-wide verification and full framework adoption cost are outside subject Token totals. Setup/qualification was generation-free; this does not make its wall time or coordinator cost zero.

Source: `1f922e99508d76455a645a1b8683df34e7b7616d`. See [protocol](protocol.md), [verification](verification.md), and [public result data](comparison.json).

## Per-subject results

| Condition | Arm | Product/candidate result under frozen protocol | Handoff structure | Temple administration | Operational Tokens | Turn time | Unique command items |
| --- | --- | --- | --- | --- | ---: | ---: | ---: |
| Stable | Ordinary | Pass, 46 cases | Pass | Not applicable | 19272 | 135.652 s | 8 |
| Stable | Temple | Pass, 46 cases | Pass | Complete | 75433 | 354.102 s | 12 |
| Changed specification | Temple | Rejected before product cases: candidate not current | Pass | Complete | 74246 | 274.750 s | 12 |
| Changed specification | Ordinary | Not run: batch already stopped | Not observed | Not applicable | — | — | — |

Three model turns completed with observed final usage and confirmed cleanup. This is **not** four accepted deliveries. Original strict acceptance is 2/3 attempted subjects; the fourth has no fabricated zero-cost or pass result. The batch stop reason is `candidate-production-unverified`, not a Token/time limit, provider crash or account exhaustion.

Total observed subject Operational Tokens: **168951**. Overall harness elapsed time: **769.032 seconds** (12 minutes 49 seconds). The aggregate is an all-attempt cost, not a balanced arm comparison.

## Stable-pair cost analysis

| Measurement | Ordinary | Temple | Temple versus ordinary |
| --- | ---: | ---: | ---: |
| Uncached input Tokens | 16855 | 70034 | +53179 |
| Output Tokens | 2417 | 5399 | +2982 |
| Operational Tokens | 19272 | 75433 | +56161, +291.4% |
| Measured turn time | 135.652 s | 354.102 s | +218.450 s, +161.0% |
| Observed command-output bytes | 4442 | 70469 | 15.86 times; Temple has one unavailable output field |
| Authored user-request bytes | 1070 | 1846 | +776 bytes |

**94.7% of the measured extra Operational Tokens is uncached input**, rather than output. That arithmetic identifies which Token component to investigate; it does not prove which file, command or instruction caused it. Native context, repeated provider prefixes, cache behavior and total model context are not fully observed. The request text difference alone cannot explain the total as a measured causal claim.

Cached input was 87808 versus 347648 Tokens; total provider-reported input was 104663 versus 417682. Reasoning output was 316 versus 1872 and is already part of output, not an extra charge to add again. Operational Tokens are uncached input plus output, not Credits or account allowance. The provider's internal cache was not controlled. Service variation may affect elapsed time; this one pair cannot establish a general speed ratio.

For orientation only, historical WI-0234 stable Temple means were 74033 Operational Tokens and 160.253 seconds across two subjects. This new subject is not an improvement over that Token mean. Different runs and reporting contracts, uncontrolled cache/service conditions and tiny samples prevent attributing the difference to the changed recipe. Historical v2 scores remain unchanged; there is no before/after statistical claim.

## Why subject 3 stopped

The actor reported product candidate `d049f9e1e1ffe8e6ac7dbd2fd1277dbd6114d7b9`, then committed the handoff records as `9f8a29a4bafa4e016300254644303851e60668f9`. Its final message explicitly identified the later record commit. The frozen oracle requires `HEAD === candidate_revision`, so it rejected the earlier product SHA before running product cases. The batch conservatively stopped and did not launch subject 4.

Read-only Git inspection after sealing confirmed:

- The reported product candidate is the parent of the final record commit.
- The later commit changes exactly seven paths: the work item, events, two generated views, and three item artifacts (test evidence, finish receipt and handoff).
- `quote.mjs`, `discount.mjs` and all test contents have no difference between the two revisions; the final worktree is clean.
- The canonical Developer candidate and handoff still reference the product SHA; administration is complete.

A separate **post-hoc, generation-free** isolated oracle check of final HEAD passed all 46 product cases. This establishes that the retained final product works under that check. It does **not** replace the original failure, validate the original candidate contract retroactively, complete the missing pair or authorize a replacement model run.

The likely design issue is that the experiment uses one field for two meanings: tested product revision and final repository revision containing delivery records. The common prompt asks for an exact product candidate and the Temple recipe records that candidate before completing administration; it does not explicitly resolve a later record-only commit. Merely telling the model to report final HEAD could contradict the canonical handoff's earlier tested revision. This is an instrument/workflow-contract mismatch to resolve, not evidence that the quote code failed or a reason to weaken revision checks indiscriminately.

## Observation limits actually encountered

All **32/32** completed command items across the three subjects were classified `unknown`; the narrow lexical classifier cannot interpret the native shell-wrapped command format. Therefore the new category breakdown did **not** achieve its intended purpose on this runtime. Its known limitation was recorded in offline review and is now confirmed by real observations. This should have a native-format fixture before another attribution experiment.

Unique counts and byte coverage remain usable: zero duplicate or unidentified events, no item-limit or byte-cap hits, one unavailable output field. Observed outputs total 149723 bytes and are a lower-bound coverage observation, not complete context. A finish receipt and a single durable handoff per Temple subject demonstrate administration, but cannot prove the model invoked an idempotent command only once or never repeated a read/diagnostic.

## Recommended improvement order — no new batch authorized here

1. **Resolve revision semantics offline first.** Represent tested product revision and final delivery revision separately. Require an ancestor relationship, exact equality of all non-bookkeeping bytes/modes, candidate-matched tests and valid bounded administration before accepting a record-only descendant. Reject changed product/tests, unrelated history, stale evidence, missing records, protected-file drift and arbitrary path exceptions. Preserve this failure as a regression fixture. Do not remove exact-revision validation or silently rescore this run.
2. **Make the observation contract fit the native runtime.** Add a sanitized recorded/well-defined native shell-wrapper fixture; parse only explicitly supported forms without executing text. Keep complex/mixed commands unknown. Verify coverage, deduplication and privacy offline before spending another subject on category attribution. No per-command Token causality claim follows from command labels.
3. **Prioritize input-side fixed overhead.** Inspect actual required native/project instructions and routed output size, then remove repeated metadata/body output where the same authority and acceptance evidence can be preserved. Both Temple subjects emitted roughly 70–75 KB of observed command output versus 4.4 KB for the ordinary stable subject. That is an investigation target, not proof that all those bytes were unnecessary. Do not substitute a cheaper model, delete safety gates or add a new permanent role to hide the overhead.

Only after those offline checks should a separately approved comparison be considered. The missing ordinary changed-spec subject must remain missing in this protocol; it must not be silently backfilled or paired with a result from a different frozen design. No broad savings, routing-policy or marketing claim is supported here.

## Evidence integrity and delivery status

Protocol digest: `sha256:91cdbcc310e3679f0d781a484c7acc6e05bb02de033c1690611c9d4d61205898`.

Original sealed run digest: `sha256:6ce9ace40d9b4aa73c3b3194aa249f58d486c206ad05c9b6fc5e6c328dc31203`, sealed `2026-09-07T09:29:14.488Z`. The private full protocol/run and all actor repositories are retained. Public data intentionally omits raw paths, commands, outputs, prompts, reasoning and account identifiers. Post-hoc inspection did not edit the sealed result or actor repository.

WI-0235 independent review is complete. PR #78 was submitted and its initial required CI passed in 18 seconds. Main integration still requires the repository's review policy; no admin bypass or protection change occurred. The four-subject plan is **incomplete by its own stop rule**, with this partial result and diagnosis delivered. No further model calls, npm publishing or release are included.
