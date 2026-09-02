# Work Order — WI-0095

## Problem

GitHub Actions run `33581136546` failed the Node.js 22 and 24 full suites at the same managed Observer CLI integration test. The product correctly returned `unsupported-platform` with exit code 1 on Linux, while the test incorrectly required the macOS installation lifecycle and exit code 0 on every host.

## Authorized scope

- Keep managed-local service installation macOS-only.
- On unsupported hosts, verify the explicit rejection result and absence of service-state writes.
- On macOS, retain the complete preview, install-without-activation, status, and exact-removal test.
- Preserve the failed hosted run and require a fresh Node.js 22 and 24 hosted result.

## Exclusions

- No Linux service implementation or product support claim.
- No Observer activation, removal, or retained-telemetry deletion.
- No repository visibility, GitHub setting, tag, Release, announcement, or npm action.

## Stop condition

Stop if the correction requires weakening unsupported-platform behavior, changing the macOS service lifecycle, or bypassing a failing hosted lane.
