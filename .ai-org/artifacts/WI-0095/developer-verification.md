# Developer Verification — WI-0095

- Developer: Rikku (`agent-rikku`)
- UI mode: `not-applicable`

## Change

The CLI integration test now follows the native host contract. Unsupported hosts require the structured rejection result, exit code 1, and absence of the Observer manifest and LaunchAgent directory. macOS retains the complete lifecycle assertions without skips or weaker expectations.

No product code changed. The managed-local Observer remains macOS-only and the approved local service remains active.

## Pre-candidate result

`node --test test/local-observer-service.test.mjs` passed 5 tests with 0 failures on macOS, including the unchanged lifecycle branch. Exact-revision full verification and Linux hosted CI remain required.
