# WI-0108 developer report

## Prepared and verified

- Created a new exclusive lab at `<LOCAL_HOME>/Documents/ChatGPT/temple-wave-5a-lab-r2`; the retained WI-0107 lab was not modified.
- Materialized four fresh candidate repositories from the pinned WI-0106 fixtures. All four started and remain clean; both minimal candidates contain no `.ai-org` directory.
- Bound the runner to the explicit WI-0108 approval and preflight paths so it cannot reuse or overwrite WI-0107 authority evidence.
- Passed the no-generation preflight for exact CLI/schema digests, supported structured output, Luna Max availability, manifest semantics, owner approval, candidate revisions, and treatment isolation.

## Authorized execution result

The first Luna Max candidate began at `2026-09-02T13:12:33.974Z`. Provider telemetry reported 24,456 Tokens. The runner then interrupted the turn because its command allowlist inspected the human-readable shell wrapper `/bin/zsh -lc ...` and rejected the underlying permitted `sed` read. The program stopped at `2026-09-02T13:12:50.659Z` under the zero-retry rule.

- Launch attempts: 1 of 4 allowed
- Completed candidates: 0
- Remaining candidates not started: 3
- Observed Tokens: 24,456
- Candidate product changes: none
- Blind or sealed candidate packages: none
- Automatic retries or fallback models: none

This is a fail-closed mechanism result, not a Temple-versus-minimal comparison. Provider telemetry is not an account billing statement or a Credit conversion.

## Post-stop correction

The runner now validates each structured App Server `commandActions` entry instead of parsing the shell-formatted display command. It pins the exact `ItemStartedNotification` schema and preflights both a permitted wrapped `sed` action and a forbidden `curl` action. The post-correction no-generation preflight passed. WI-0108 was not rerun.

## Verification

- `node --check .ai-org/artifacts/WI-0107/run-wave-5a.mjs`: pass
- corrected no-generation preflight: pass
- four retained candidate Git trees: clean
- `npm run verify`: 280/280 pass
- `git diff --check`: pass

Candidate revision: `1211d700717417f5a585cd9f488ea09000ffd1d0`.
