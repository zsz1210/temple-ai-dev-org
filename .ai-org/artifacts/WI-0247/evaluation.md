# Recovery evaluation

Candidate: `e8e1e462ae07a2b6884f30bdb6fb90dde2dda73c`.
This Eval records the independent agent-lulu test-adequacy assessment in
[independent-verification-v2.md](independent-verification-v2.md), joined with
[full-verification.md](full-verification.md). It does not invent another test run.

Decision: advance to formal Independent QA for the bounded diagnostic recovery.
The two prior integrity findings are reproduced as rejected mutations; normal
crash recovery and full valid unrelated-worker recovery pass. Full offline
regression coverage is exact-candidate, Node.js 24 baseline, 1,266 passing tests.

The implementation makes recovery explicit, fingerprint-bound and non-accepting.
It preserves original receipt/journal provenance instead of automatically relaxing
ordinary finish. This addresses the observed README failure without changing its
product candidate or downgrading the Lean distinct-Verifier requirement.

Accepted narrow limitation D1: a malformed unrelated worker can surface a raw
status-renderer TypeError before Doctor. Independent fixtures prove fail-closed
behavior, unchanged lifecycle/diagnostic records and no recovery artifact. Improve
the error message in a later scoped task; do not expand this candidate now.

Not established: signatures against a fully state-writing adversary, arbitrary
policy migration, High-Assurance/indexed/normalized-evidence recovery, full live
reservation qualification, distributed recovery, or performance/token savings.
These are excluded, not silently accepted. Live WI-0246 recovery still waits for QA.
