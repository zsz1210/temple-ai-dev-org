# WI-0210 completed comparison

## Outcome

The repaired experiment completed all six deliveries and twelve fresh actor stages. All twelve public-test, oracle and quality checks passed; all eight Temple treatment checks passed. Independent QA (Lulu, separate from Developer Rikku) verified the complete manifest/run/Git seal, source and request bindings, accepted Builder/Verifier pairs, usage sums and provider exits. No inconsistency was found.

Total last-observed Operational Tokens: **576,272**. Overall elapsed time: **1,435.016 seconds (23.92 minutes)**. Summed actor time: 1,431.189 seconds; orchestration accounts for the remaining 3.827 seconds. There were no actor retries, fallbacks, resets, purchases, automatic refills or additional model judges. All stage and aggregate ceilings were met.

This completes the authorized diagnostic experiment, not a release or a claim of general Temple superiority.

## Design and repair

Each delivery used a fresh Builder followed by a fresh Verifier. All twelve requested and acknowledged gpt-5.6-terra; requested and observed thread reasoning were medium. Effective per-turn reasoning was unavailable and must not be inferred from thread configuration.

The three arms were ordinary execution, prior Temple context material, and slim Temple task material with eligible source reuse. Order was ordinary/prior/slim/slim/prior/ordinary. Source and prompts were frozen before collection; no product tuning occurred between samples.

The common runner now accepts an empty trailing separator for already-allowlisted Git read operations, such as `git diff --`, while retaining restrictions on options, revisions, paths and shell composition. Installed-Git equivalence checks and negative controls covered this change. The previous rejected command's exact text was unavailable: this repair addresses independently reproduced legitimate counterexamples, not a reconstructed exact command.

Local verification before launch passed **653/653 tests**, with no failures, skips or cancellations. Independent readiness also passed. Earlier stopped WI-0208/0209 attempts remain separate and are not pooled into these averages.

## Complete delivery results

Operational Tokens are the experiment's observed input-minus-cached-input plus output measure. Cached input is not represented as zero provider cost by this metric. Usage is last-observed, not account-final billing. Times below sum Builder and Verifier actor elapsed time, not token-generation speed.

| Order | Arm | Operational Tokens | Actor seconds | Context/exploration output bytes | Context-entry output bytes |
| --- | --- | ---: | ---: | ---: | ---: |
| 1 | Ordinary | 63,247 | 180.314 | 12,266 | 0 |
| 2 | Prior | 110,211 | 264.098 | 310,865 | 198,072 |
| 3 | Slim | 110,469 | 273.697 | 280,580 | 159,428 |
| 4 | Slim | 108,060 | 238.910 | 276,826 | 159,447 |
| 5 | Prior | 113,756 | 269.212 | 334,942 | 198,075 |
| 6 | Ordinary | 70,529 | 204.958 | 6,798 | 0 |

Every row passed the same product acceptance checks. One Builder in each arm encountered an initial failing local product test and repaired it within its original stage. These were in-stage development cycles, not actor retries. No quality advantage was observed for either Temple arm on this fixture.

| Arm, two deliveries each | Mean Operational Tokens | Mean actor seconds |
| --- | ---: | ---: |
| Ordinary | 66,888 | 192.636 |
| Prior | 111,983.5 | 266.655 |
| Slim | 109,264.5 | 256.304 |

Slim versus prior: **2.43% fewer Operational Tokens and 3.88% less actor time** on the observed averages. This was not consistent across repetitions: the first slim delivery was slightly more expensive and slower than the first prior delivery; the second was cheaper and faster.

Slim versus ordinary: **63.35% more Operational Tokens and 33.05% more actor time**. This bounded task does not demonstrate that Temple saves effort overall.

## Where the difference occurred

| Stage | Prior mean Operational Tokens | Slim mean Operational Tokens | Prior mean seconds | Slim mean seconds |
| --- | ---: | ---: | ---: | ---: |
| Builder | 63,968 | 58,809 | 178.214 | 165.008 |
| Verifier | 48,015.5 | 50,455.5 | 88.441 | 91.296 |

Task material reduced mean context-entry output from 198,073.5 to 159,437.5 bytes (**19.51%**) and all measured context/exploration output from 322,903.5 to 278,703 bytes (**13.69%**). All four slim entries were eligible task-material entries and recorded two caller-attested source reuses each. This is evidence that the smaller material path ran, not independent proof of comprehension.

The payload reduction did not translate proportionally into end-to-end savings. Builder tokens fell by about 8.1%, while Verifier tokens rose by about 5.1%. Total mean input tokens, including cached input, fell by only about 0.9%. Repeated model context, cache behavior and subsequent work therefore matter alongside entry size. These observations locate the next investigation; they do not isolate a causal attribution to any one command or rule.

## Recommended improvement direction

1. Keep the tested compatibility repair and preserve this completed baseline. Do not launch another unchanged comparison merely to obtain a better number.
2. Inspect Verifier material and operation traces for duplicated reads, repeated administrative work and information unrelated to acceptance. Preserve independent verification and authority boundaries; do not simply remove QA to reduce its tokens.
3. Make small-task governance proportional: keep necessary scope, authorization, acceptance, exact-revision handoff and recovery evidence, while avoiding repeated full organizational material when unchanged sources are legitimately available.
4. Change one material/workflow variable at a time. Only after a specific intervention is implemented should the same acceptance fixture be rerun, with quality, complete-delivery time and usage reported separately.
5. Do not update automatic model-routing thresholds or publish broad efficiency claims from these two observations per arm. A later continuity or coordination experiment must measure those benefits explicitly, rather than using their possible value to explain away this fixture's cost.

## Limits

There are only two observations per arm, one bounded task, one model/thread-effort setting, and uncontrolled cache behavior. The order balances direction but does not establish statistical significance or causal savings. Observed bytes are not token attribution; actor elapsed time includes tools. Ordinary execution lacks the same organizational receipts, so this comparison measures the end-to-end overhead of the configured workflows, not whether every difference is unnecessary. Long-term recovery, multi-person coordination and avoided incidents were not measured.

## Reproduction and evidence identity

- Frozen candidate: `a12f3473d2bb05679b7cdb860f3776b4e137133d`.
- Prior treatment source: `87d68a189d03df33a61df753f441acdb387c7835`.
- Protocol: `sha256:e66ff6a1c7a55a4847637b4e317a02080f03d08839181310416f998f3506c128`.
- Instrument: `sha256:5c6bcbe66aa6b38b2017174ca01cba484731e25b454a539dbe4002cd9af2eb52`.
- Sandbox: `sha256:e095d2ed911175e3fd901431736de70716343b4369fa097c2980704e24bf7970`.
- Local sealed lab: `/tmp/temple-wi0210-matrix-20260906-v1` (canonical `/private/tmp` alias). Temporary evidence is local, not guaranteed durable repository storage.
- Whole-lab check: `node scripts/context-material-comparison.mjs verify-seal /tmp/temple-wi0210-matrix-20260906-v1` returned `passed: true` after process exit zero; independently repeated by QA.
- Launch readiness: [launch-readiness.md](launch-readiness.md); approved design: [design.md](design.md).

The numeric tables above preserve the aggregate observations in repository-readable form without publishing raw actor prompts or reasoning. Independent final audit found matching source/request bindings, all twelve confirmed provider exits and accepted six candidate pairs. Its PASS is scoped to experiment integrity and completion, not broad product benefit.
