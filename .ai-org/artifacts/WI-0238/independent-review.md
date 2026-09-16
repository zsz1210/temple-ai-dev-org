# WI-0238 independent test setup review

Reviewer: agent-lulu, Principal human, runtime `/root/setup_performance_qa`.
Canonical active assignments explicitly separate Developer agent-rikku from Independent QA / Quality Evaluator agent-lulu. Work Item claim `claim-20260916005447-a59e9909` and worker `worker-20260916005447-8c1c7065` identify this review. This is Standard work, not High-Assurance authentication evidence.

Exact candidate: `472c167396c676c7feb0695729f03707be581854`.
Baseline: `e4ea52ace541df2bf44602ad2135e5d3850763f1`.
Environment: Node v24.20.0, Darwin arm64. Test file SHA-256: `5db21b1ca2f0e5f1a91857c78d8f1ee116fea2afa47ca5ea4550373dac0497b3`.

Decision: **PASS** for Test, Evaluation and Independent QA of this exact candidate and the authorized local test-setup optimization. No blocking defect remains. Canonical Release Gate closeout is the Release Manager's responsibility and this verdict does not authorize merge or publication.

## Coverage and isolation

An independent byte comparison reconstructed the baseline by removing the new cache helper and isolation case and restoring only the original `run` setup block. The reconstructed file equals the entire baseline byte for byte. Thus all original scenario bodies, actor functions and shell operations, substantive assertions, skip prerequisites, timeouts and cleanup remain. The focused results are 35 original results plus one meaningful isolation result. No production source, scripts, fixture definitions, package, CI or test discovery changed.

The cache is local to one enclosing test, indexed by serialized exact arm order. It starts with the original pristine preparation and creates the other order at most once. Every actor scenario gets a distinct recursive filesystem copy including Git metadata. Returned manifests correspond to copied data; the protocol derives both manifest digest and arm order from that same preparation. Protocol fault injection uses a structured clone, so it cannot mutate the shared manifest order. There is no cached verdict, completed repository, persistent cache, actor subprocess substitution or cross-test mutation.

The new isolation case changes product bytes, Temple Work Item bytes and Temple Git configuration in one clone, then checks the pristine preparation and another clone in both orders. The parent cleanup still removes the entire temporary tree. The deliberate final fixture-drift mutation occurs after all copy consumers; no later scenario can inherit that poisoned template. The full actor checks still exercise actual CLI claim/finish, independent verification, exact candidates, both-order scope failures, public-file protection, invalid approval, source/provider drift, incomplete usage and interruption outcomes.

## Independent counterexamples

The reviewer extracted the exact candidate helper and new isolation body into a disposable harness, supplying a minimal preparation fixture with the same arm mapping and files. This tests copying and keying without rerunning expensive actor lifecycles. An additional independent check compares the returned default-order manifest with the copied manifest file. Actual filesystem operations run on macOS. These controls are helper-level evidence, not replacement CLI or Git-lifecycle evidence.

| Control | Observed outcome |
| --- | --- |
| Exact candidate helper and isolation body | Pass; exactly two preparations; copied manifest matches returned default-order manifest |
| Replace key with the initial manifest order regardless of requested order | Rejected with ERR_ASSERTION; wrong arm order detected |
| Replace recursive copy with recursive hard links | Rejected with ERR_ASSERTION; changing one copy changes pristine bytes |
| Replace copy with a directory symlink | Rejected with ERR_ASSERTION; aliasing violates pristine-byte equality |

Command: `node /tmp/wi0238-independent-controls.mjs`. Exit 0 means the positive control passed and all three expected negative controls were rejected. All disposable fixture directories were removed in `finally`; no repository source was altered. The script extracts the block from `const initialPairs` through the start of `run`, and the new isolation test body through the next test, directly from the candidate. It runs those same extracted bodies through an AsyncFunction, changing only the key expression or filesystem copy implementation for the three mutants.

Temporary reproduction script SHA-256: `bfb1ca151004d5b5d251d1cbf37a4938f5790dd47ef30ee72f20226683cb742e`.
Observed output SHA-256: `d656bfd533ed0e73885eb9d442212bbc240d9db94cc9a23a4b0b573575d66b2a`.
The outcomes above preserve the substantive observations even after temporary files are removed.

The actual script and output are also retained in `independent-controls.tar.gz`, SHA-256 `5d4922303fa254e94f6c2294b627d4b5a39a423d566470db2f11da811f54d058`; the reviewer independently checked its hash and member names after the coordinator archived them.

## Performance evidence review

Independently read the archived profiler and controlled raw JSON / runner logs. The profiler preserves real async execFile callbacks and custom promisification; it counts only that process's instrumented async calls, not synchronous or descendant process totals. Filesystem elapsed times overlap and cannot be added into wall time. Forced Temple-first ordering exists only in this temporary profiler; normal test source and production random ordering remain unchanged.

The archived JSON exactly matches `profile-observations.json`. Both controlled runs contain the same actor command breakdown: pwd 26, Git 142, cat 227, Temple help 15, Temple context 15, Temple Work Item operations 30, product test commands 26; total 481 each. Preparation CLI calls fall from 25 to 10 and all measured async execFile calls from 1027 to 955. Filesystem copy calls rise from 31 to 39 because state remains independently copied. Both ordered fault variants remain in the unchanged test bodies.

Raw focused runner tails confirm baseline 35/35 in 62638.900625 ms and candidate 36/36 in 57841.213125 ms, with zero failed, cancelled, skipped or todo results. The approximately 7.66 percent elapsed reduction is one controlled ordered sample, not a statistically established general speedup, full-suite guarantee or model/billing comparison. Exploratory unequal-order measurements are retained but correctly excluded from that estimate.

Profiling archive SHA-256: `d13d531ef6366efda158ff52ba7b2c00b18128180ddce60a48a2e6a9e43630be`.

The baseline body remains in Git. The coordinator observed 38371 baseline bytes versus 38372 temporary-copy bytes and equality after trimming trailing whitespace before deleting the temporary source. No pre-deletion hash or separate archived temporary source exists; the reviewer does not claim to have directly inspected that deleted file. Reconstruction hashes are reproducible diagnostics, not observed hashes of the executed temporary file. This is a bounded provenance limitation; unchanged production dependencies, the retained baseline, raw workload counts and exact candidate source support the comparison without overstating its precision.

## Full verification and boundaries

The coordinator owned the single final `npm run verify` invocation against the committed candidate and reported exit 0. The reviewer independently inspected the completed log and verified its SHA-256: **1238 tests, 1238 pass, zero failures, cancellations, skips or todo; 342562.26925 ms**. Repository, documentation and package checks passed, including the 443-file package boundary. Source/test/script/package paths remain byte-identical to the exact candidate at final review.

Actual raw log SHA-256: `40d881b0ee719a15aca1961fe4594be25bb4d7e125beca1210fd34e15bd19d5e`. Preserved `verification-472c1673.log.gz` SHA-256: `c03521ad1514e6e1c3bd0161f5de52cdc03b66c5af6c161cb4b6becc09d4d98a`.

The previous full run was 288684.186083 ms; the current single uncontrolled full run is about 18.66 percent longer. Consequently, this work demonstrates fewer repeated preparation processes and a favorable controlled focused sample, **not a measured full-suite speedup**. It preserves correctness while reducing bounded setup overhead. Broader acceleration would require a separately scoped investigation of other dominant workloads and repeatable measurements.

No independent duplicate full-suite run, browser or live provider/model activity, external mutation, merge or publication was performed for this review. Doctor and evidence-only fast verification remain the coordinator's closeout responsibilities; they are not implied by this independent behavioral acceptance.
