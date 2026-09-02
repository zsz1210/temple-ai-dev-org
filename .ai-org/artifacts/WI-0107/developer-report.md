# WI-0107 developer report — pre-generation checkpoint

## Implemented

- Added a fail-closed setup script that materializes four fresh candidate Git repositories and refuses replacement.
- Initialized Temple candidates from pinned framework revision `c3a342502857791d24b2e1c2c299d03c56142ae9`.
- Kept both minimal candidates free of `.ai-org` state.
- Added a four-wave, concurrency-one validation manifest with the approved Token, time, disk, retry, fallback, network, and path controls.
- Added a direct Codex App Server runner that treats Temple and minimal candidates identically at transport level, declines runtime authority requests, records detailed numeric usage, runs public and hidden tests, and emits blinded packages plus a sealed mapping.
- Added an explicit account-approval file gate before the first generated turn.

## Verified without generation

- All four candidate repositories are clean and their baseline public tests pass.
- Both pinned case-bundle digests, launch instruction digest, and tool-policy digest match.
- Codex CLI and all nine required App Server schema digests match the inspected local contract.
- `gpt-5.6-luna` with `max` reasoning is listed as available.
- Repository verification passes all 280 tests.
- Temple Doctor reports 36 pass, one pre-existing stale parallel-plan warning, and zero failures.

## Current stop

No candidate turn has started. The only preflight blocker is `owner-confirmation-required`: the provider exposes account usage but not the automatic Credit reload setting. The owner must explicitly confirm that automatic reload is disabled and that included Pro allowance may be used.

The Token interrupt remains reactive and cannot guarantee zero overshoot or prove billed cost.

