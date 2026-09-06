# Corrected candidate verification

Candidate: `5fda83aca2c361fbe369296f0539a0957cc8a0ff`.

- Targeted native lifecycle replays: 39 passed, 0 failed.
- Full repository verification: 632 passed, 0 failed.
- Repository, documentation links and package boundary checks: passed.
- Real installed API probe without generation: passed; ephemeral resume rejected, live metadata read validated.

The full repository suite does not exercise real model delegation. The real API probe does not start a model turn. The targeted suite verifies event handling against generated schemas, including the review-discovered alternate acquisition path. These are complementary checks, not interchangeable proof of live compatibility.

Only an independently reviewed live regression can establish the one-helper compatibility result. The failed WI-0198 and WI-0200 observations remain preserved and must not be rewritten as passes.
