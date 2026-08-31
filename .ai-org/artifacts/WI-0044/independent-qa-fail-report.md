# Independent QA report — WI-0044 candidate 1

- Candidate revision: `d17a5f263e4e93eab2922d14e55456fd3d6c5b25`
- Independent QA: Lulu (`agent-lulu`)
- Decision: fail; rework required before Release Gate

## Passing evidence

- Full repository verification: 221/221 pass.
- Focused Control Plane verification: 33/33 pass.
- Fresh private-LAN browser validation passed five-view navigation, URL-hash switching, keyboard navigation, the responsibility chain, private redaction, and read-only authority.
- 1440 × 1000, 1024 × 1366, 768 × 1024, and 420 × 900 had no document-level horizontal overflow.
- The 1024px layout retained the 248px sidebar; the 420px layout stacked the responsibility chain vertically.
- Fresh browser console: 0 errors and 0 warnings.

## Blocking counterexample

The product specification requires `Now` to prioritize firing recovery conditions over release bookkeeping. The candidate excludes every `stale-evidence` condition from `actionableAttention`, even when its condition lifecycle is `firing` and status is `true`.

In the exact live state, System reported 10 firing stale-evidence conditions while Now led with 9 release decisions. This is an acceptance mismatch even though the automated and responsive checks pass.

## Required rework

Surface firing stale-evidence recovery on Now ahead of release decisions without restoring the previous high-noise list. A grouped actionable condition that links to System is acceptable. Produce a new exact candidate and rerun Independent QA.
