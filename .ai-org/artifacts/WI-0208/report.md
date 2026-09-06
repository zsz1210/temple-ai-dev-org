# WI-0208 diagnostic experiment report

## Outcome

**Inconclusive: the approved attempt ran, but the three-arm comparison did not complete.** Two of twelve planned stages passed. The third stage was interrupted by the instrument's `forbidden-item` guard; nine stages never started, including every slim Temple stage. No retry, fallback, reset, purchase or additional judge was used. This is not evidence that slim Temple saves Tokens, takes longer or fails product requirements.

The first ordinary delivery passed Builder and fresh Verifier checks, including public tests, added tests, the held-out oracle, exact candidate agreement and the required delivery records. The partial prior-Temple stage performed two successful reads and no observed implementation patch before interruption. It did not reach product-quality assessment.

## Observed results

| Arm / stage | Outcome | Operational Tokens | Actor wall time | Commands completed |
| --- | --- | ---: | ---: | ---: |
| Ordinary / Builder | Passed | 53,641 | 140.622 s | 11 |
| Ordinary / Verifier | Passed | 29,073 | 66.430 s | 9 |
| Prior Temple / Builder | Instrument interrupted | 21,738 | 16.169 s | 2 |
| Remaining stages | Not run | Not measured | Not measured | Not measured |

The single accepted ordinary delivery used **82,714 observed Operational Tokens and 207.052 seconds** of summed actor wall time. Whole attempt: **104,452 observed Operational Tokens, 224.872 seconds**, three attempted stages, two accepted stages. Aggregate time includes orchestration. These are last-observed counters, not final account billing. `usage_complete` is false because the matrix stopped; the partial attempt must not be presented as a completed total comparison.

| Stage | Input | Cached input (subset) | Noncached input | Output |
| --- | ---: | ---: | ---: | ---: |
| Ordinary Builder | 312,960 | 263,936 | 49,024 | 4,617 |
| Ordinary Verifier | 207,378 | 179,712 | 27,666 | 1,407 |
| Prior Builder, interrupted | 40,755 | 19,200 | 21,555 | 183 |

Operational Tokens here mean noncached input plus output; cached input is not added again. Requested and acknowledged model: gpt-5.6-terra. Requested and observed thread effort: medium. Effective turn effort remains unknown. Coordinator preparation/inference, readiness diagnostics and instrument development are excluded from actor figures; this report does not claim an end-to-end development cost saving.

## Failure analysis

The stop was **not a Token or wall-time limit**: the interrupted stage was below 80,000 Tokens and six minutes; the aggregate was below 960,000 Tokens and 72 minutes. The runtime requested and received an interruption acknowledgment.

The guard rejects an item missing from its allowed item types. The retained event has an ID but `item_type: null`: the sanitizer replaces nonallowlisted types with null and does not retain a safe rejection classification for non-command items. Consequently, the actual type cannot be established from retained observations. It would be speculation to call it a planning event, malicious action, provider schema change or Temple product defect. This is a confirmed diagnostic limitation, not a confirmed cause for the actor's behavior. Do not broaden the allowlist just to obtain a completed run.

Preparation passed 640/640 local checks and distinct-Identity launch review, including generation-free sandbox entry/reuse and outside-write refusal. Those checks did not establish coverage of every item a real model might emit. The earlier readiness timeout and malformed output are retained in `independent-readiness.md`; their cost and existence are not erased by a later passing probe.

## Evidence integrity

Candidate: `5f0195114c76f0ffbd0ccdd1cb61f42df2c249da`. Protocol: `sha256:e91c8a041d467aac16f8e032d382e9790856ff56b3c4b8a870b3fdac3f2d1c28`. The original consumed lab, run record and seal remain unchanged.

Independent inspection verified the run-record digest and protocol binding, and reproduced the figures above. **The whole-lab artifact digest does not match the stored seal.** No inspected file modification time was later than the seal timestamp; many Node compile-cache files in runtime scratch were flushed during the interval between writing the final run record and the seal. A concurrent scratch flush is plausible but unproven because the original seal has no per-file manifest. The mismatch is unresolved: do not claim the entire lab is independently integrity-verified, overwrite the old seal, or use this as qualified efficacy evidence. The verified run record supports a bounded failure report only.

## Improvements before another live run

1. **Safe failure diagnosis:** retain schema-enumerated item type or a bounded unknown category and rejection rule, without prompts, reasoning or raw tool payloads. Replay every installed item variant and missing/malformed cases. Keep unknown tools fail-closed.
2. **Readiness diagnostics:** check command exit status, output presence and timeout category before JSON parsing. Preserve bounded structural diagnostics. A transport error must not collapse into an unexplained JSON exception.
3. **Stable evidence sealing:** define subject evidence versus runtime scratch, ensure writers stop before snapshot, and persist a per-file manifest. Excluding nondeterministic scratch must be declared before a new run, never retroactively applied to repair this seal. Independently verify all exact hashes.
4. **Scope the next experiment explicitly:** preserve the original ordinary result as historical partial evidence, not a reusable matched baseline for new candidates. Any new comparison needs a new frozen protocol and approval. Do not spend leftover WI-0208 allowance automatically.

Step 5 scenario design is supplied in `step-5-design.md`. It covers fresh-session recovery, approved requirement changes and shared-contract integration. It remains design-only and makes no efficiency claim. The approved live attempt is stopped; the intended three-arm measurement remains incomplete.
