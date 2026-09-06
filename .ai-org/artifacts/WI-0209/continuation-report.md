# WI-0209 fresh-attempt diagnostic report

## Decision summary

The renewed experiment produced **two completed deliveries, not a completed three-arm comparison**. Ordinary and prior Temple passed; slim Temple's Builder passed, but its Verifier was interrupted by the command-shape guard. No second repetition ran. Do not rerun automatically or advertise an efficiency improvement.

The useful signal is mixed: task-scoped material reduced returned context volume, but the observed slim Builder used more Tokens and time, with a failed product test followed by correction. Context reduction alone is not yet an accepted-outcome efficiency result.

## Scope and evidence qualification

Live source: `62081f70cd850a103cd37a033438fa24a41dc992`. Protocol: `sha256:12e774cde96a01c879eb23cd38a5c823cd0b053de80a8c774aab5ce64add5d83`. All six started stages requested gpt-5.6-terra / medium. No retry, fallback, reset, purchase, refill or extra judge occurred. All six owned provider processes confirmed exit.

The new lab's original seal is **invalid**, not repaired. Independent audit found that only `run.json` differed from the manifest: finalization's error handler added `archive_failure` and changed elapsed time after sealing. Restoring those two fields in memory exactly reproduced both original recorded hashes; every other file and all six Git-safety digests matched. The numbers below are therefore retained, independently reconstructed diagnostic observations, not a valid completed sealed comparison. See [precise findings](continuation-findings.md).

## Observed results

| Variant | Stage | Quality outcome | Operational Tokens | Actor seconds |
|---|---|---|---:|---:|
| Ordinary | Builder | Passed | 30,665 | 141.669 |
| Ordinary | Verifier | Passed | 35,117 | 75.712 |
| Prior Temple | Builder | Passed | 56,628 | 134.810 |
| Prior Temple | Verifier | Passed | 56,140 | 107.789 |
| Slim Temple | Builder | Passed after local correction | 64,306 | 173.010 |
| Slim Temple | Verifier | Interrupted; not assessed | 34,767 | 48.521 |

Ordinary completed delivery: **65,782 Tokens / 217.381 seconds**. Prior completed delivery: **112,768 / 242.599 seconds**, respectively **71.4% more Tokens and 11.6% more actor time** in this one sample. These are within-run descriptive comparisons, not estimated population effects. Slim's partial 99,073 Tokens is not a delivery cost and must not be ranked against the completed totals.

All attempted stages consumed **277,623 last-observed Operational Tokens**. Original recorded whole-run elapsed before the erroneous catch update was **683.596 seconds** (about 11.4 minutes). Operational Tokens here are non-cached input plus output; reasoning output is included, not added again. Measurements are not account-final charges or a conversion to Credits. Coordinator, preparation, offline review and full local verification are outside actor measurements.

| Stage | Input | Cached input | Output | Cached share of input |
|---|---:|---:|---:|---:|
| Ordinary Builder | 271,203 | 245,504 | 4,966 | 90.5% |
| Ordinary Verifier | 165,943 | 132,352 | 1,526 | 79.8% |
| Prior Builder | 666,664 | 614,144 | 4,108 | 92.1% |
| Prior Verifier | 593,883 | 540,416 | 2,673 | 91.0% |
| Slim Builder | 804,092 | 744,704 | 4,918 | 92.6% |
| Slim Verifier, interrupted | 190,430 | 156,928 | 1,265 | 82.4% |

Caches were uncontrolled. Do not attribute the full Token or latency difference to routing, material size, or model reasoning alone.

## What the context change did

For Builder, the `context enter` returned output decreased from **103,163 to 83,780 bytes (-18.8%)**. All classified context/exploration command output decreased from **160,575 to 141,857 bytes (-11.7%)**. Slim recorded task material and reuse declarations for the two already-read governing files, so the intended route was observed.

Despite that, slim Builder used **13.6% more Operational Tokens and 28.3% more actor time** than prior Builder. It made three patches versus two, and its observed product-test exits were `[1, 0]` versus prior's `[0, 0]`. This is evidence of different execution/rework behavior, not proof of how many Tokens the extra correction caused. Command output bytes are neither unique context bytes nor model inference-token attribution. Per-operation inference attribution is unavailable.

## Why execution stopped

The slim Verifier's read-only Git command was classified as `git-diff`, rejected with `argument-shape`, and subsequently reported command exit zero. This guard observes commands and interrupts the run; it does not prevent every command from starting. The exact command text was intentionally not retained, so the report cannot identify it from its HMAC.

Independent local reproduction found valid harmless examples that this policy rejects: `git diff --` and `git diff --stat --`. Those counterexamples establish a compatibility gap, **not the exact live command**. There is no evidence here that the model attempted a dangerous write.

Separately, finalization compared canonical `/private/tmp` subject paths with a lexical `/tmp` lab path. That always failed containment in this lab. Its catch then modified already-sealed run evidence. Neither defect justifies altering the historical archive.

## Improvement order

1. **Fix finalization offline:** compare real paths, reject actual outside targets, and record archive errors outside immutable evidence. This narrow correction is implemented separately from the live-tested source; verify it with alias/containment/post-seal-failure tests and independent review.
2. **Review read-only Git grammar before any further model run:** support documented equivalent separators narrowly, retain path/revision/option restrictions, and add safe structural diagnostics for rejected shapes. Do not permit arbitrary commands or claim an unrecorded live argument.
3. **Reduce remaining material deliberately:** more than 140 KB of context/exploration output still reached slim Builder. Investigate duplicated metadata, generated receipts and task-irrelevant fields with deterministic payload measurements before another inference comparison. Preserve required governing content and ownership checks.
4. **Separate rework from material effects:** keep product failures, patch counts, context volume, total input/cache, Operational Tokens and completed outcome time as distinct columns. Use a fixed read-only acquisition replay for material-size effects and live complete deliveries for end-to-end effects.
5. **Only then consider another bounded experiment:** use a fresh protocol and applicable authority, retain every stopped attempt, and do not reinterpret this partial run as one of the missing repetitions. Step 5's broader experiment remains design-only.

## Local validation status

Before this attempt, the unchanged full suite passed **650/650** in 153056.26225 ms. The earlier optional Console refresh timeout remains recorded; no source regression or exact timing cause was established, and no Console deadline was relaxed. Independent prelaunch checks are recorded in [continuation readiness](continuation-readiness.md).

Offline finalization correction `55a2a56fb77290a6ace4aa8720e34c869973be7a` passed **652/652 full verification**, zero failures/skips/cancellations, 153216.637792 ms, and independent focused/adversarial review. It has not been used for another model run and does not repair the historical seal. See [independent review](continuation-independent-review.md). No push, merge or release occurred in this slice.
