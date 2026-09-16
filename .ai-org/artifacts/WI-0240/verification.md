# Continuity batch verification

Developer: agent-rikku. Candidate `2d4c018cacde20072c2deba738117da689ad9ce3`; baseline `860344965b36a95714fd0087f2148b8f2b23d1dd`. The original continuity test file is byte-identical to baseline. No initialization, production source, runtime policy, discovery or timeout changed.

Implementation uses a coordinator-only reader, at most 16 exact SHA-1 blob IDs, with bounded subprocess output and complete byte-framing validation before returning any data. Disk comparisons retain traversal and current file reads, repeat the file/link/mode/size guard after collecting a batch, and release each batch before reading the next. Extraction retains the 64 KiB per-file bound and exclusive scratch cleanup. Invalid batch results map to existing dirty-source or unreadable-candidate rejection. The live experiment instrument digest already includes every tracked scripts file, so the new helper is covered without changing the protocol.

Three new controls passed: real binary/empty/duplicate blobs and limits; malformed, reordered, partial, failed or oversized process output; actual cross-batch hidden binary changes and unsafe modes/hardlinks/symlinks rejected before candidate execution. Result: 3/3, 4120.400541 ms. These supplement rather than replace the original 33 continuity results.

The same retained profiler completed the original 33 results: 33/33 pass, no failures/skips/cancellations, 81935.773 ms, versus the retained baseline instrumented 182534.399333 ms. Only result output paths and the reported candidate SHA differ from baseline instrumentation; reversing those substitutions produces byte-identical wrappers/test bodies. Direct subprocess counts exclude CLI descendants. The profiler's known one--c Git label is corrected by the same source-backed summarizer in both observations. The original developer handoff preceded full verification and did not constitute acceptance.

## Measured comparison

| Surface | Before | After |
| --- | ---: | ---: |
| Binary per-file Git reads / bounded batch reads | 2403 / 0 | 0 / 180 |
| Those direct Git process times | 57.040 s | 2.602 s |
| All direct synchronous subprocesses | 3469 | 1246 |
| Candidate assessment, 81 calls | 74.963 s | 14.009 s |
| Unchanged initialization, 14 calls | 61.471 s | 40.898 s |
| Unchanged claim/finish control, 7 calls | 21.997 s | 12.596 s |
| Original 33-result focused runner | 182.534 s | 81.936 s |

All other direct command and copy counts match exactly after the established label normalization. The four phase call counts and positive/negative/rejection outcome distributions also match. The reduction of 2223 direct subprocesses (64.08%) is precisely the replacement of 2403 per-file reads with 180 bounded batches. Text reads of delivery records remain 174 and are deliberately outside the optimization. No test was removed, cached or skipped.

The approximately 55.1% shorter focused time is an observed pair, not an isolated or guaranteed treatment effect: unmodified initialization and claim/finish also ran faster. The changed read operations' count is stronger structural evidence. File phases include their subprocess times; do not add the table's rows as elapsed time. The old uninstrumented 231.259-second profile is not substituted as the comparison baseline. No full-suite speedup is claimed from historical runs.

`profiling-evidence.tar.gz` preserves both raw logs, measurement wrappers, raw JSON, summaries, summarizers and the three-control log; `measurement-provenance.json` pins their raw SHA-256 values and the exact comparison checks. The profiler is coordinator-only and not distributed to fixture actors. Candidate interpretation wording was corrected after review to identify batching as the treatment; no raw measurements changed.

## Full verification

`npm run verify` exited 0 on candidate `2d4c018cacde20072c2deba738117da689ad9ce3`: repository, documentation-link and package checks passed; 1245/1245 tests passed, zero failures, cancellations, skips or todos; test-runner duration 739137.255583 ms (12 minutes 19 seconds). `git diff HEAD -- scripts test src package.json` was empty after completion. The original 1242 cases remain, with three new controls. This full-run duration is an observation, not evidence of an overall suite speedup against historical runs under different load.

The full log is preserved as `full-verification.log.gz`. Distinct reviewer runtime probes began only after this full run completed; their results and verdict are recorded separately in `independent-review.md`.
