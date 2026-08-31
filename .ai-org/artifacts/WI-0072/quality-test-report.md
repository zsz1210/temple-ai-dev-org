# WI-0072 Quality test report

- Input candidate: `5913ea0c3b1e68fdce21da93299e9e440fc52a39`
- Affected-path comparison: byte-identical to the candidate
- Focused evidence suite: 14 passed, 0 failed, 0 skipped
- Runtime schema validation: valid; 93 documents and 27 schemas checked
- Doctor: 35 pass, 1 known stale-plan warning, 0 fail

Quality reproduced the unpreserved failure, deterministic tag recovery, idempotency, conflicting-tag rejection, fresh-clone availability, affected-scope rejection, and governance-only dirty classification. No remote write or evidence rebinding occurred during this test.
