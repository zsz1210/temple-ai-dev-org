# Corrected successor verification

Candidate source after the first readiness rejection adds `TurnStartedNotification` and `TurnCompletedNotification` to the provider contract that is frozen into the seal.

Observed command:

`node --test .ai-org/artifacts/WI-0194/events.test.mjs .ai-org/artifacts/WI-0195/runner.test.mjs`

Result: 38 passed, 0 failed, 0 skipped, 15.088 seconds. The successor-specific test calls the generation-free provider inspection and asserts all five notification schemas required by the repaired executor are present. No model generation or live experiment occurred.

Fresh lab: `/var/folders/wy/bkc6__f557nb9z8_jy9m9brc0000gp/T/temple-wi0193-sEYpzm`.
Seal SHA-256: `16ca0e5a49495529304e1d69143c2d0dc1a50f920360f42d8a3bef4d12b0c23e`.
