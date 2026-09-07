# WI-0239 — Instruction comparison: stopped, not a compact-Temple result

## Decision in brief

**The proposed six-subject comparison ran once and stopped after subject 2. We
still cannot say whether compact Temple improves delivery.** Ordinary usage
completed the stable-requirements task; previous Temple reached the predeclared
single-subject Token ceiling. Neither compact-Temple subject started. Preserve
this result, but do not tune routing or advertise an efficiency improvement from it.

The useful findings are narrower: the previous-instruction subject accumulated
substantial reading/administration output, and the comparison's global-stop rule
prevented observation of the treatment we wanted to evaluate. The next step should
be offline design correction, not another unchanged live retry or an arbitrary
increase in the ceiling.

## What actually ran

All planned subjects use **Terra medium**. The task is the same bounded quote /
shipping integration fixture, with stable and changed-requirement conditions.
Current and previous Temple share executable behavior; only four instruction
sources differ. This is a fixed-order diagnostic with one subject per cell, not
a replicated, randomized benchmark.

| Order | Requirements | Method | Product result | Operational Tokens | Attempt elapsed |
| --- | --- | --- | --- | ---: | ---: |
| 1 | Stable | Ordinary usage | Accepted; independent 46-case oracle passed | 31,374, completed-turn observation | 81.175 s |
| 2 | Stable | Previous Temple | Not evaluated; Token stop before accepted final completion | 101,176 observed; final usage incomplete | 242.098 s until stop/cleanup |
| 3 | Stable | Compact Temple | Not run | Unknown / not measured | Not measured |
| 4 | Changed | Compact Temple | Not run | Unknown / not measured | Not measured |
| 5 | Changed | Previous Temple | Not run | Unknown / not measured | Not measured |
| 6 | Changed | Ordinary usage | Not run | Unknown / not measured | Not measured |

Batch elapsed: **324.539 seconds**. Observed candidate usage: **132,550
Operational Tokens**, an incomplete aggregate, not a complete cost total.
Coordinator, preparation and review usage are outside that candidate measure.
Product quality, completion time and usage remain separate outcomes. In
particular, the stopped subject is not a proven product failure, and its elapsed
time is not time to successful delivery.

## Why it stopped

The approved per-subject ceiling was 100,000 Operational Tokens / eight minutes;
the batch ceiling was 600,000 / sixty minutes. Subject 2 triggered the Token stop
at 101,176 observed Tokens. The **1,176 overshoot** shows that event-driven
interruption is a stop threshold, not exact prevention of every Token above it.
Retained metadata cannot establish a precise Token-crossing timeline.

The frozen runner marks this subject's usage `incomplete-observation`, then stops
the entire sequence on unknown final accounting before further subjects or oracle
evaluation. It retains `token-limit` as the first stop reason. An observed terminal
event does not establish a valid completion response or complete final usage.
Both attempted provider processes exited and their background-terminal lists were
empty. Cleanup succeeded; that does not repair the missing final observation.

This was **not account exhaustion**. The available Pro window remained below its
limit; the observed account-wide used percentage moved from 55% to 56%. Those
percentages cannot be converted into this experiment's Token cost. There was no
retry, replacement, fallback, reset, Credits purchase or automatic refill.

## Where the observed cost accumulated

| Measurement | Ordinary, completed | Previous Temple, stopped |
| --- | ---: | ---: |
| Input Tokens | 103,658 | 977,360 |
| Cached input Tokens | 74,752 | 883,712 |
| Uncached input Tokens | 28,906 | 93,648 |
| Output Tokens | 2,468 | 7,528 |
| Operational Tokens: uncached input + output | 31,374 | 101,176 observed |
| Completed command items | 8 | 29 |
| Observed command-output bytes | 3,969 | 74,906 |
| Nonzero command exits | 1 | 4 |

Reasoning-output Tokens (357 and 1,482) are already included in output; they are
not added again. Cached-input fractions are approximately 72.1% and 90.4%.
Higher cache coverage did not eliminate the absolute uncached-input increase.
Of the 69,802 observed Operational-Token difference, 64,742 (92.8%) is uncached
input. This is descriptive arithmetic across a completed and a censored attempt,
not a causal or completed-delivery performance estimate.

Previous Temple's classified reading, context-navigation and administration account
for 14 command items and 57,709 output bytes (77.0% of its observed output).
Post-stop read-only repository inspection also found two new normalized evidence
registrations: a Git candidate and a developer-test observation. The eligible Lean
finish path accepts a repository evidence artifact without requiring those two
separate registrations; see `currentEvidencePaths` in `src/lean-delivery.mjs` and
the previous instruction's Lean execution reference. These extra registrations
are a concrete candidate for reducing fixed overhead, not proof that all observed
administration was unnecessary or the sole cause of the Token stop.

The retained previous-Temple Work Item had reached Test, released its claim and
recorded a Developer-to-Evaluator handoff for candidate
`48dd95b4245c7feaf1c36370b51c8ead9ac6ff7c`. However, bookkeeping files remained
uncommitted, no accepted final completion was parsed and no independent product
oracle ran for it. These post-stop facts **do not upgrade the frozen result** to
a completed/accepted delivery. The actor's own passing-test record is not an
independent oracle result. No retrospective test or repair was performed.

## What the observations cannot explain

- The classifier labels 12/29 previous-Temple commands and 7/8 ordinary commands
  unknown. Unknown does not mean useless. Observed output bytes are not Tokens
  consumed by the model, and no per-command Token attribution is available.
- Three extra exact-command-signature occurrences and four nonzero exits in the
  previous subject identify investigation targets, not proven waste. Raw commands
  are not retained in this export; we cannot responsibly assign exact causes.
- Authored user text was 1,070 vs 2,107 bytes; developer text was 624 bytes and the
  output schema 678 bytes in each. Native and total model-context sizes are unknown.
  These are deliberately different methods, not a prompt-byte-matched comparison.
- The previously measured instruction-body reduction (27,200 to 15,934 bytes)
  remains an offline size result. This batch supplies **no live compact-Temple
  observation** and no changed-requirement result.

## Recommended improvement order

1. **Correct experiment survivability offline.** Distinguish subject-level budget
   censoring from shared instrument, isolation, cleanup or accounting failures.
   A future protocol may continue independent remaining subjects only under an
   explicitly reviewed rule with reliable final accounting and confirmed cleanup.
   Merely ignoring `incomplete-observation` is not an acceptable fix. Test the
   stop/continuation decision using replayed events before another live batch.
2. **Protect comparative coverage.** Predeclare ordering and budgets so that an
   expensive historical control cannot consume the entire opportunity to observe
   the compact treatment. This run establishes that the old control can exceed
   100,000; it does not establish a sufficient new cap. Choose a matched,
   feasible scope and stopping rule rather than silently replacing failed cells.
3. **Audit optional administration before adding instructions.** Trace why the
   old subject registered separate Git/test evidence when local artifact evidence
   was eligible. Compare the already-written compact contract against that exact
   ambiguity, preserving real tests, authority and handoff requirements. Do not
   assume compact instructions fix it until they are observed.

These are proposals, not changes made to this frozen experiment. No new model
default, approval bypass, source edit or subsequent experiment is included in this
closeout. Archive this batch as inconclusive and review the offline design before
spending more candidate Tokens.

## Evidence and provenance

- [Execution authority and boundaries](design.md).
- [Body-free numeric export and seal](comparison.json), including all six rows,
  cleanup flags, command categories and missing-data markers.
- [Verification and evaluation](verification.md).
- [Distinct-Identity Independent QA](independent-qa.md).
- [Accepted source verification](../WI-0238/verification-r1.md) and
  [frozen proposal](../WI-0238/comparison-proposal.md).

Executable/instruction source: `af5a984aee6706ab308c693d95e138134162d5d6`;
evidence parent: `a69a5080978b28ef482753ba70dea8d0b6960748`.
Protocol: `sha256:dafc7fa80cdb274770c8bb339df2bb74a5067f615ce783c02856e80b5804cd27`.
Sealed run: `sha256:f989e35cd9e0f22c67623397434ebd5603a8a38493b076fd77b8ea2d4e216bd3`,
sealed 2026-09-07 13:07:48.755 UTC. Raw provider data and local host coordinates
remain private. The public export is not a substitute for the retained raw seal.
