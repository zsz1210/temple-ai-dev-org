# WI-0094 quality report

Quality evaluated candidate `d2e2e8ed9ec8fd9476a529cfc1f37790220341d7` in a clean detached worktree.

| Check | Result |
|---|---|
| Focused Console and Usage tests | Pass, 25/25 |
| Full repository verification | Pass, 280/280 |
| Browser gate | Pass, 6 views at 390, 768, 1440, and 3440 pixels plus reduced motion |
| Console payload | Pass, 336,650 bytes against a 524,288-byte ceiling |
| Uncached rebuild | Pass, 985.410 ms p95 against a 1,500 ms ceiling |
| Cached request | Pass, 3.892 ms p95 against a 25 ms ceiling |
| Usage-only report | Pass, 26.345 ms p95 and 13,305 bytes |
| Invalidation | Pass, copied retained state advanced from 2 to 3 Usage observations and 4,230 to 4,231 events |
| Privacy and unknown semantics | Pass, substantive Usage output matched the internal snapshot after excluding only volatile time and the private state path |

The initial comparison harness treated independently generated `generated_at` values as a mismatch. Normalizing that intentionally volatile field made the substantive comparison pass; this was a harness correction, not an implementation defect.

