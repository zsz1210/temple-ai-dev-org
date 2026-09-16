# Independent review: bounded continuity Git reads

Reviewer: `agent-lulu` (Lulu), independently assigned Quality Evaluator and Independent QA. Developer: `agent-rikku` (Rikku). Both identities were verified in `.ai-org/project/assignments.json` and the Work Item claim history; they differ. The prepared worker is `worker-20260916030935-ed63684a`, with claim `claim-20260916030935-9993cddc`.

Candidate: `2d4c018cacde20072c2deba738117da689ad9ce3`. Baseline: `860344965b36a95714fd0087f2148b8f2b23d1dd`. Local environment: macOS, Node.js `v24.20.0`, Apple Git `2.50.1`. The candidate HEAD and original continuity test file equality were independently checked. Review writes are limited to this record and temporary probes; no implementation, policy, canonical state, or commits were changed by the reviewer.

## Source findings

- The reader accepts at most 16 full SHA-1 blob identifiers, not arbitrary Git expressions. It requires a successful binary process result, a bounded buffer, matching identifier order and blob type, an integer size within the per-blob limit, exact byte framing, and no trailing output. A later malformed frame throws before any result array is returned.
- Working files retain the original traversal, protected-source, untracked/missing-source, link, executable-mode, and size checks. Each collected file is checked again after the batch read, then read fresh and compared as bytes. There is no persistent disk, content-verdict, or candidate-success cache.
- Extraction resolves blobs from the exact candidate tree, retains the 64 KiB per-blob limit, validates the entire batch before writing any extracted input, and remains inside the existing exclusive-scratch cleanup boundary.
- The reader process timeout remains 15 seconds. The maximum working batch output is 16 times (1 MiB plus 128 bytes), approximately 16 MiB; this is an explicit memory tradeoff against fewer processes. Only one pending working batch is retained at a time.
- The live runner's instrument digest enumerates tracked `scripts` files and therefore covers the new tracked helper. The original 33 continuity cases are byte-identical to baseline; the new controls supplement them.
- The existing filesystem lstat/read gap is not an atomic filesystem snapshot. The added recheck closes the extra collection-delay gap, but this bounded offline verifier still does not qualify a hostile-code sandbox. No stronger guarantee is claimed.

## Execution and conclusion

**PASS** for the exact candidate above, within this bounded offline scope. No unresolved implementation defect was found. This judgment combines independent source review and actual independent adversarial execution with inspection of the parent's exact-candidate complete verification; the complete suite was not redundantly rerun by QA.

The parent reported `npm run verify` exit 0. The inspected full log records 1,245/1,245 passing tests, zero failures/cancellations/skips/todos, and 739137.255583 ms. The raw full log SHA-256 is `f1c83f90b191240760e89ea0418632a5822c18c0d1cbc1647d145eddef9d98cf`. The focused unchanged continuity profile records 33/33 passes; the three added permanent controls also passed.

After the full run finished, QA executed `node /tmp/wi0240-independent-probe.mjs` on the same candidate, macOS arm64 / Node.js v24.20.0. Exit code: 0; stderr: empty. Observed results:

| Independent injection | Observed rejection or result | Candidate execution | Scratch directories remaining |
| --- | --- | --- | --- |
| Unexpected trailing bytes in the second working-file batch, after an earlier successful batch | `dirty-source` | 0 | 0 |
| Make HANDOFF.md executable after Git returns the batch containing that file's OID, before the disk recheck | `unsafe-working-file` | 0 | 0 |
| Truncate the extraction batch after working-file comparison succeeds | `unreadable-candidate` | 0 | 0 |
| Restore the inputs and process behavior, then perform actual candidate verification | accepted | actual oracle and regression execution | 0 |

These injections confirm no partial batch success can reach candidate execution, the new post-batch safety recheck actually runs, failed extraction cleans its exclusively owned scratch, and a failure does not leave a stale rejection cache. The temporary fixture was removed in the probe's final cleanup. Probe source SHA-256: `42613dee0d79b2314135c4ff977a707c551cb1348fe46f150cca70338e71ba73`. Result JSON SHA-256: `c73f8cbd686df7b417cbb5497443fda21e5011c36d885ddcb0fa8c47f25d23b9`. Source and JSON are handed to the parent for evidence archival. After execution, HEAD remained the exact candidate and `git diff HEAD -- scripts test src package.json` remained empty.

The measured subprocess reduction is structurally attributable to batching. Timing observations are not a randomized causal estimate: unchanged initialization and other phases also became faster. The full-suite observation must remain separate from the focused before/after profiles.

The candidate summary initially retained the baseline phrase "No treatment was applied." QA reported this metadata problem; the parent corrected the candidate summary to identify batching as the treatment without changing raw observations. The reviewer did not repair implementation code. Canonical closeout, Doctor, final evidence checks, and any later merge/publication remain the parent's responsibility and are not implied by this acceptance.
