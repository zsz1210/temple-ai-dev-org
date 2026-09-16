# Exact release-preparation verification

Candidate: 1a98048da0990c04c0cb9b02ffa5d25ad778d013.
Node v24.20.0 / macOS, npm ci --ignore-scripts completed first.
Command npm run verify, exit 0: **1248/1248 pass**, zero fail/cancelled/skipped/todo.
Duration reported by the suite: 283474.274875 ms. Repository checks, documentation
links and 444-file package-boundary checks all passed. Full retained log is
full-verification.log; the machine-specific root is the only redacted value.

Repacked Alpha.33 is byte-identical to the earlier qualified archive. Subsequent
canonical/lifecycle/evidence changes do not change packaged source, runtime,
dependencies or behavioral tests. registry-smoke.mjs is a separately syntax-checked
post-publication evidence harness, not a packaged behavior or a new prepublication test.
The hosted Release workflow still performs its own exact-tag verification before npm.
