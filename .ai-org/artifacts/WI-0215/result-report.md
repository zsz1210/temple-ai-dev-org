# Full versus model format: stopped diagnostic

## Outcome

The live run started and stopped at the approved per-stage operational-Token ceiling. It did **not** complete the format comparison: one Builder completed, the first Verifier was interrupted, and the remaining six stages were not started. Neither Model-format delivery ran. No claim that the model format saves Tokens, improves latency or preserves end-to-end delivery quality can be made from this run.

The implementation remains independently verified and optional. Generation-free sandbox measurements showed unchanged source bodies and full output of 84529 bytes versus model output of 79542 bytes (5.90% smaller) in all four prepared fixtures. This establishes only a representation-size reduction.

## Executed stages

| Subject | Format | Stage | Outcome | Operational Tokens | Actor milliseconds |
| --- | --- | --- | --- | ---: | ---: |
| 1 | Full | Builder | Completed; product tests, hidden oracle and Temple handoff checks passed | 69725 | 163912 |
| 1 | Full | Verifier | Interrupted at stage Token ceiling; final delivery assessment not completed | 80151 | 66420 |
| 2–4 | Model, Model, Full | Builder + Verifier | Not started | Unavailable | Unavailable |

Observed operational usage: **149876 Tokens**. Run elapsed: **230619 ms (3.84 minutes)**. Both attempted actors acknowledged gpt-5.6-terra; requested effort and observed thread effort were medium, effective turn effort was unavailable. Counters are last-observed, not account-final billing. Operational Tokens equal input minus cached input plus output; cached Tokens are not asserted free.

The overall 640000-Token/48-minute ceiling was not reached. The first stop was the Verifier's 80151 observed operational Tokens against the 80000 stage ceiling. Event-driven interruption cannot guarantee stopping at an exact Token count; the observed overshoot was 151. Interruption was acknowledged and provider termination confirmed for both actors. There was no retry, fallback, reset, purchase, refill or extra judge.

## What happened before interruption

The Builder ran the complete product tests once, wrote delivery evidence and successfully completed the bounded handoff. The Verifier ran the complete product tests once with exit code zero, wrote an `accept` verification record for exact candidate `51e13a3538963a65e8d32f447774229bad474894`, and read that record back. It had not completed `work-item finish` or its final model response when interrupted. The record is a partial observation, not completed Verifier acceptance under this protocol; the harness did not run the post-stage final quality assessment for that interrupted stage.

No rejected command or observed failing product-test exit caused the stop. There was no observed repeat of product tests after the evidence-only write in the executed portion. The Builder's single-test completion is consistent with the repaired wording; this one sample does not prove a general prompt effect, and an interrupted Verifier cannot prove what it would have done next.

## Token diagnosis, not a matched performance claim

| Verifier observation | Previous WI-0210 slim subject 3 | Previous WI-0210 slim subject 4 | Current Full, interrupted |
| --- | ---: | ---: | ---: |
| Total input Tokens | 514750 | 460300 | 349493 |
| Cached input Tokens | 466176 | 412416 | 271104 |
| Cached/input ratio | 90.56% | 89.60% | 77.57% |
| Non-cached input Tokens | 48574 | 47884 | 78389 |
| Output Tokens | 2198 | 2255 | 1762 |
| Operational Tokens | 50772 | 50139 | 80151 |
| Completed commands | 13 | 11 | 10 |
| Complete product-test executions | 2 | 2 | 1 |
| Cat output bytes | 62931 | 63847 | 41851 |
| Context entry output bytes | 75648 | 75667 | 76190 |

The current actor emitted less read-command output and accumulated fewer total input Tokens, but more non-cached input Tokens. Non-cached input accounts for 97.80% of its observed operational usage. Cache reuse therefore matters materially to this accounting metric. The evidence does not identify why cache reuse differed, establish per-command inference cost, or prove that the prompt/format caused the difference. Historical actors completed under different source/prompt revisions; the current actor was censored by interruption. These rows explain why a previous mean did not reliably predict the ceiling, not which treatment is better.

## Recommended next decision

Do not rerun this consumed protocol, resume its interrupted actor, or start the unexecuted subjects as if the original schedule were intact. Keep the optional representation and refrain from making it default or advertising efficiency gains.

Review experiment stopping design before another comparison. The inherited 80000 per-stage hard stop cut off a progressing Verifier after tests and evidence writing, despite ample aggregate allowance. A future protocol could retain the same aggregate Token ceiling, no-spend constraints and six-minute stage timeout while treating 80000 as an observation warning instead of a hard stop. That is a proposed authority change, **not implemented or authorized by this run**. It requires deliberate approval and offline stop/accounting tests. Do not select a new numeric hard ceiling from a single censored observation.

If a new comparison is approved, retain fresh counterbalanced subjects and identical source/model/prompt conditions. Report total input, cached input, non-cached input and output separately alongside operational Tokens, quality and latency. Preserve uncontrolled-cache and two-sample limitations. The objective is one interpretable bounded comparison, not repeated attempts until favorable.

## Evidence and verification

- Source: `dbcced471e9fc47fd4a422135c7e9eeae3c6e858`.
- Protocol: `sha256:e40436e50df05a1037341fc5418d52867a99a8f4930b10e69ce6f10645472cc1`.
- Sealed run: `sha256:2bbaed2ab9b16defc87688d49e1890948719371e8a4387544ea4dcd75ef17acc`.
- Evidence manifest: `sha256:6ece096310869d57acc21583a852cce7298998cc7abb0ac8503cba0df2af6b61`.
- Seal verification passed after termination. The previous WI-0210 seal also passed without modifications.
- Harness full verification: 663/663; independent readiness tests: 71/71; evidence-only fast verification: 54/54. These are software/readiness checks, not completed live-delivery samples.
- [Approved scope](design.md), [approval binding](approval.json), [readiness review](readiness-review.md), [harness verification](verification.md).

Raw experiment files remain in the local immutable laboratory; this report intentionally omits host paths, raw commands, prompts and hidden reasoning. No release or merge is implied.
