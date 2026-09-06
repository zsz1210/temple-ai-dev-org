# Harness verification

Candidate `dbcced471e9fc47fd4a422135c7e9eeae3c6e858`, Developer agent-rikku.

Full `npm run verify`: 663 passed, zero failures/skips/cancellations, 151873.488416 ms. Focused format, retained material and command-policy suites: 32 passed. Tests cover exact format-only requests, approved bounds, one-shot consumption, missing/opposite/duplicate format rejection, opt-in model schema, eight-stage sequencing and first-failure/usage/deadline stops. Required production sandbox/quality checks are reused, not replaced by mocks.

Preparation validated current subscription authentication, provider model/effort and schemas without a model turn. Independent readiness passed 71 tests plus 54 fast verification tests; all four sandbox probes passed. The approved run then stopped at its per-stage Token ceiling; see result-report.md. No format savings or completed live quality comparison is claimed. The approval is consumed and does not authorize a retry or changed model.
