# WI-0239 independent acceptance review

Judgment: **PASS** for the bounded local test-only candidate. No implementation defect or missing scoped acceptance requirement was found. This judgment does not approve integration, publication, further consumers or another optimization wave.

Reviewer: `agent-lulu`, runtime `/root/shared_fixture_qa`, worker `worker-20260916012820-b3d2b660`, claim `claim-20260916012820-3b0e5229`. Developer: `agent-rikku`. The current assignments file independently confirms these distinct Agent Identities; context resolution selected Lulu through the active claim and pinned the Developer handoff below. The work uses Standard workflow and standard risk; it is not High-Assurance.

Exact candidate: `aef4f2e35439637fded508e7edf3862aff724adf`. Baseline: `91b454705e9503701d507506eb07408d3ec26646`. Environment: macOS / Darwin arm64, Node `v24.20.0`. Before and after the independent probe, HEAD remained the candidate and `git diff --exit-code <candidate> -- test src scripts package.json package-lock.json` passed. Concurrent changes were lifecycle and evidence administration. The reviewer did not modify implementation, canonical JSON or commits.

## Independent source findings

- Each of the four consumer diffs changes only the fixture import to an explicit cached alias. All original scenario bodies and assertions remain byte-for-byte unchanged. The complete test inventory increases from 1238 to 1242 because four fixture controls were added; no tests were deleted in this candidate.
- The default `fixture()` still performs real initialization, synthetic product execution, Git creation, Work Item creation, transitions and claim. Its extracted preparation and claim operations preserve the original commands; failure cleanup now covers both phases. Unqualified callers retain this path.
- The opt-in pool shares only initial Build state with no active or historical claim. Each allocation copies the complete temporary tree, including independent Git files and configuration, clones the returned item object, then executes the actual CLI claim. The seed's initial synthetic developer observation is reused fixture data tied to identical committed bytes, not a newly executed product verdict. The receipt explicitly identifies copied setup and source revision.
- Workflow profile and ordered affected paths form the key; input options are cloned before the first asynchronous suspension. Concurrent first users await one preparation promise. Failed preparation evicts its promise, failed copy or claim removes the allocated directory, and pool cleanup waits for active allocations before deleting seeds. Returned copies remain caller-owned.
- Selected consumers do not change process environment before fixture creation. Later mutations, Git commits, claims, verification commands, negative cases and recovery scenarios remain real operations against separate copies. This compatibility review does not qualify other consumers or environment-dependent cache keys.

## Runtime evidence and attribution

| Evidence | Result | Duration |
| --- | --- | --- |
| Developer fixture controls | 4 passed; no failures, skips or cancellations | 12740.718916 ms |
| Developer four-consumer focused run | 85 passed; no failures, skips or cancellations | 79730.043833 ms |
| Baseline complete suite | 1238 passed; no failures, skips or cancellations | 626213.369708 ms |
| Candidate `npm run verify` | Repository, Markdown links and package checks passed; 1242 tests passed; no failures, skips or cancellations | Test runner: 292532.891375 ms |
| Independently executed claim-failure probe | 1 passed; no failures, skips or cancellations | 3029.914125 ms |

The reviewer consumed the actual complete logs and timing summaries instead of rerunning the full suite. Candidate `npm run verify` forwards the same two reporters to the same default-concurrency `node --test` command as the baseline. The reported suite durations are Node runner measurements, excluding npm's preceding repository checks. The recursive `node:test` warning already exists in the baseline and is not introduced by this change.

The independent probe ran only after the complete measurement ended. It injects a valid existing active claim into one copied Work Item, requires the real CLI to reject it as already claimed, verifies removal of that failed allocation and byte-identical seed/sibling preservation, then obtains a successful new claim from the same pool. A second injection substitutes an unknown Developer selection during fresh preparation; the real CLI rejects that identity and the fresh temporary root is removed. These exercise claim-failure paths not duplicated by the four committed controls. All monkey patches are restored in `finally`; successful fixtures and the pool are cleaned by test hooks.

Command: `node --test /tmp/wi0239-qa-claim-failure.test.mjs`. The probe source and raw log are handed to the coordinator for durable preservation. Probe stdout reports `tests 1`, `pass 1`, `fail 0`, `cancelled 0`, `skipped 0`, `todo 0` and `duration_ms 3029.914125`.

## Performance judgment

The developer's alternating fresh/pool helper probe reports 11 direct synchronous subprocesses for fresh or cold pooled setup and one actual claim subprocess for each warm pooled allocation. Warm observations are approximately 254-259 ms versus 1257-1268 ms for fresh allocations. Source inspection supports that structural reduction; the count excludes nested subprocesses within CLI execution. The reviewer did not repeat that benchmark concurrently with measurement.

The full-suite observation falls from 626.213 s to 292.533 s, approximately 53.29%. This is an observed pair, **not a demonstrated causal or repeatable 53.29% speedup**. Unchanged files also improve substantially: `continuity-fixture.test.mjs` changes from 477.911 s to 225.610 s and `cli.test.mjs` from 215.954 s to 92.560 s. Reduced contention, scheduling and external machine load cannot be separated by this one pair. Read-only source review occurred concurrently; no reviewer tests or benchmarks overlapped it. File durations overlap and must not be summed as elapsed time.

The four opted-in file observations are context-enter 415.533 to 135.501 s, lean-finish 297.369 to 142.006 s, mechanical-completion 186.584 to 94.851 s, and context-packet 177.642 to 47.119 s. Their original cases pass. The acceptance basis is preserved behavior, fresh ownership, independent failure/isolation evidence, structurally fewer setup operations and a passing full candidate measurement. Evidence is sufficient to retain this bounded candidate; a precise performance guarantee remains unproven.

## Evidence integrity

SHA-256 values refer to the reviewed raw files before any archival compression:

| Raw file | SHA-256 |
| --- | --- |
| `/tmp/wi0239-baseline.log` | `3200fb0643c671ba5710c2b6368cbaf9d1d7d95b575d8e90e107110a6edff6ba` |
| `/tmp/wi0239-candidate.log` | `676004a573d96258908f816df0e8abffefde77b471939e6365d74a67d68ec71b` |
| `/tmp/wi0239-baseline-timing.jsonl` | `ffca8b4161298cd1798c65f9d7d569ff9b2157b787479a234fe056e0cf2b118e` |
| `/tmp/wi0239-candidate-timing.jsonl` | `54ad07f3af1c86f39139368fb94c77c8176c5ea4474bf20918c304ed42e14817` |
| `/tmp/wi0239-controls.log` | `35e8fe60bf2b005182a09a245c3cb7e9644b575c4a76522fb151ef9df0f56783` |
| `/tmp/wi0239-focused.log` | `6d802acc3330958f25bb4b58355ea1ba1cac9d605f5df50160adc30764565b95` |
| `/tmp/wi0239-bench.json` | `43935c2c946aa2ff3fbfed0f7b75f5496374cf39d34b8ab5f2a0a72fbbef685b` |
| `/tmp/wi0239-qa-claim-failure.test.mjs` | `82a4c6565c608550fa4f3d8ae4ab3c14fbda716e26a6ab01ca92d2b114318a10` |
| `/tmp/wi0239-qa-claim-failure.log` | `fb2bcd9126565cb1f55aaaa41a4fb9b355c246a9aa13b655345fd7d0fa7e4552` |

Unresolved implementation findings: none. Remaining coordinator responsibilities are preserving evidence, canonical closeout, Doctor and required checks for subsequent evidence-only changes. Recommended next action is to complete that closeout and report the structural gain with the timing limitation, without automatically widening the optimization scope.
