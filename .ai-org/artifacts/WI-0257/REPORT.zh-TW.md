# Compact evidence view: English publication copy

English summary of the locally delivered Chinese report; the historical filename
is retained for existing relative links. Repository publication policy permits
localized prose only at selected entrypoints.

Candidate: `5a6e4f8ef4015a9b6ebdc9d865170da278186acd`.
Optional read-only `evidence view` omits recognized top-level passing Node spec
lines and removes only whitespace outside JSON strings. Other content, source
hashes, limitations and digest-bound original retrieval remain. No Headroom
dependency, proxy, persistent service or model call is introduced. Existing
command defaults remain unchanged; this does not compress Codex conversations.

| Fixed historical sample | Original tokens | Compact content | Complete JSON envelope |
| --- | ---: | ---: | ---: |
| Failed full test log | 28,372 | 3,796 | 4,325 |
| Accepted full test log | 28,210 | 3,563 | 4,072 |
| Verification report | 720 | 532 | 837 |
| Usage report | 748 | 587 | 888 |
| Authority finding | 394 | 394 | 694 |
| Exact-revision finding | 344 | 344 | 651 |
| Archive manifest | 24,865 | 24,497 | 29,413 |
| Total | **83,653** | **33,713** | **40,880** |

Measured with o200k_base, not provider billing. Content reduction is 59.7%;
complete compact envelopes are 51.1% smaller than raw original payloads, whose
side of that comparison has no envelope. All 74 predetermined checks retained,
including 39 archive hash markers. Seven digest-bound originals were byte-equal.
2,389 top-level passing lines omitted; indented subtests retained. Fourteen CLI
calls, zero model calls. Seven compact calls totaled 1,652.98 ms including startup.

A separate single-process observation took 0.25 seconds, maximum RSS 83,083,264
bytes (about 79.2 MiB). This does not establish overall RAM savings. Short reports
and escaped JSON envelopes can grow. Original rereads add context. Model quality,
retrieval frequency, caching, rework, total delivery time and billed cost were
not measured. Hostile concurrent filesystem races were not qualified.

Full frozen-candidate verification: **1,303 passed, 0 failed, 0 skipped**,
308.93 seconds wall time; repository, documentation and package checks passed.
Distinct verifier: seven focused tests and ten additional assertion groups passed.
See [measurements](measurements.json), [qualification](qualification.md),
[verifier judgment](verifier.md), and [raw full log](full-verify.log).
The reproducible pilot script remains in local sibling
`temple-headroom-offline-2026-09-19/measure-temple.py`, outside the package.

Original closeout recommended review and merge, then selective use for long logs.
The user subsequently authorized integration. No npm release or new model
experiment is implied.
