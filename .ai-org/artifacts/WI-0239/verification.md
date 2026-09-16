# Shared fixture verification

Developer: agent-rikku. Candidate: `aef4f2e35439637fded508e7edf3862aff724adf`. Baseline: `91b454705e9503701d507506eb07408d3ec26646`.

The helper retains fresh initialization by default. Four explicit consumers use a per-process pool of unclaimed Build seeds. Every allocated copy gets separate product/organization/Git files, a cloned returned item object and a real new CLI claim. Original scenario bodies are unchanged. Four new behavioral controls cover concurrent isolation, keys and option snapshots, copy failure recovery, setup failure cleanup and closing during pending allocation. They pass: 4/4, 12740.718916 ms.

An alternating-order, four-allocation local helper probe measured fresh setup at 11 direct synchronous subprocesses (4 Temple CLI, 6 Git, 1 synthetic product test). Cold pool setup also uses 11; subsequent allocations use 1 actual CLI claim. The probe excludes nested child processes inside the CLI. Warm allocation observations are approximately 254-259 ms versus fresh 1257-1268 ms. Copied developer-test output is provenance-bearing fixture data for identical seed bytes, not new execution evidence.

New baseline complete suite: 1238 pass, zero failures/skips, 626213.369708 ms. Node v24.20.0, default concurrency, dual spec and read-only per-file timing reporters. Four consumer focused checks passed: 85/85, zero failures/skips, 79730.043833 ms. Final candidate `npm run verify` passed all three repository checks and 1242/1242 tests, zero failures/skips/cancellations, 292532.891375 ms. All production, script, package and test bytes still match the named candidate. Independent judgment is recorded separately in `independent-review.md`; this Developer report is not that judgment.

The final `npm run verify` forwarded the same two reporter arguments to its unchanged `node --test` command. Argument forwarding was confirmed with `--help` (not counted as a test run). This combined required complete verification and candidate measurement without a duplicate full run. No production source/package/policy/test discovery/timeouts were changed. No paid model call, quota check, merge or publication was performed.

## Complete observed comparison

| Surface | Baseline seconds | Candidate seconds | Original tests |
| --- | ---: | ---: | ---: |
| Complete runner | 626.213 | 292.533 | 1238 retained, 4 new pool controls |
| context-enter, opted in | 415.533 | 135.501 | 19 retained |
| lean-finish, opted in | 297.369 | 142.006 | 34 retained |
| mechanical-completion, opted in | 186.584 | 94.851 | 14 retained |
| context-packet, opted in | 177.642 | 47.119 | 18 retained |
| continuity-fixture, unchanged | 477.911 | 225.610 | 33 retained |
| cli, unchanged | 215.954 | 92.560 | 32 retained |

The whole runner was 333.680 seconds (53.29%) shorter in this observed pair. Unchanged suites also improved substantially; the measurement cannot separate fixture savings, reduced scheduling contention, workstation load and run-order effects. Do not present 53.29% as the isolated or guaranteed benefit of this change. The direct subprocess reduction and correctness controls are stronger evidence for retaining the scoped improvement. The current longest file remains continuity-fixture. A second optimization wave is not part of this work order.

## Measurement method and limits

The source comparison verified that replacing only `cachedFixture as fixture` with `fixture` makes each of the four consumer files byte-identical to baseline. The four new controls are additional coverage for the introduced pool; no old case or assertion was deleted.

The helper probe alternated fresh/pool block order across four samples; the first pool allocation included seed creation. All four allocations totaled 5048.595584 ms and 44 direct child processes fresh, versus 2117.203293 ms and 14 pooled (16 versus 7 actual Temple CLI calls). This is a 58.1% observed helper-time reduction including cold setup, not whole-suite speed or AI token savings. Warm setup alone uses 1 versus 11 direct processes. Synthetic initial product execution happens once per seed, never substitutes for the tested scenario's later commands. Benchmark probes did not overlap full-suite measurements.

Baseline and candidate use identical Node runner flags and default concurrency. The candidate wraps the runner in the mandatory repository/package checks, so compare the runner's root `duration_ms` with the baseline runner; do not mix that with whole npm command wall time. File summaries overlap, include different scheduling/load conditions and cannot be summed as wall time. A separate QA runtime performs source review during the candidate run and waits to execute its adversarial probe until timing ends. Normal workstation processes remain uncontrolled. A historical 342.6-second run of the same baseline behavior was much shorter than this new 626.2-second baseline; this alone shows elapsed-time noise and limits causal claims from one before/after pair.

The baseline's longest file was `continuity-fixture.test.mjs` (477910.801625 ms), which does not use this helper. This scoped change optimizes four qualified slow consumers, not every full-suite bottleneck. No follow-on optimization, merge or publication is implied by acceptance.

Raw gzip logs, JSONL file summaries and helper observations are preserved next to this record. `measurement-inputs.json` records SHA-256 of both raw and compressed bytes. `file-timing-reporter.mjs` and `helper-probe.mjs` preserve exact measurement code. The probe contains the observed checkout/output paths; adapt those explicitly when reproducing elsewhere. Reproduction of full timing uses `node --test --test-reporter=spec --test-reporter-destination=stdout --test-reporter=<absolute-reporter-path> --test-reporter-destination=<absolute-output-path>`; final verification prefixes the same arguments with `npm run verify -- --`.

## Final closeout

Independent Lulu review passed the exact candidate, including the separately executed real claim-denial cleanup probe (1/1, 3029.914125 ms). Its source and log are archived with the other hashed observations. The completed worker was joined, Standard Eval and Independent QA recorded, and Release Manager Mog closed WI-0239 with decision `go`, exact candidate and rollback. This is local organizational acceptance, not integration or external release.

Final plan has zero selected, active, dispatchable or blocked items; WI-0239 is accepted/done with no active claim or unresolved items. Full Doctor: 37 pass, 1 pre-existing warning, 0 fail. The warning is the absent actor-policy field retaining legacy verification requirements; it was not changed or bypassed for test optimization. Evidence-only final `npm run verify:fast`: all repository checks and 53/53 tests pass, zero failures/skips/cancellations, 1345.172416 ms. Later changes contain only canonical closeout, archived measurement material and reports; delivery code/test/package bytes remain the fully verified candidate.

Recommended next step: integrate the reviewed test cleanup and setup improvements as a bounded change before pursuing the separate continuity-fixture bottleneck. Integration still requires its own maintainer instruction.
