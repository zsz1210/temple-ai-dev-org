# Independent QA report — WI-0058

- Position: Independent QA
- Agent Identity: Lulu (`agent-lulu`)
- Developer Identity: Rikku (`agent-rikku`)
- Exact candidate: `31c78a2d7a523de6991c50de19db59235bc78166`
- Decision: pass

## Reproduction

Independent QA created a second fresh detached worktree at the exact candidate, installed the lockfile state, and ran `npm run verify`. All 232 tests passed, repository checks passed, documentation links passed, and the detached worktree remained clean.

## Archive and projection checks

Without starting a model turn or sending a Provider command, Independent QA confirmed:

- one historical observation is included from local archive history;
- total Tokens are `23,433`;
- the driver is `WI-0056`, `task-0005`, Developer, Build, `gpt-5.6-luna`, reasoning `max`;
- coverage is `complete`, with zero identity conflicts;
- `archive_mutation_performed` and `canonical_state_changed` are both false;
- both preserved archive SHA-256 values are unchanged.

## Independent UI check

A separate Playwright browser session opened the private-LAN read-only Usage view at `1024x768`. It found `23,433`, `WI-0056`, `gpt-5.6-luna`, and the restored-history explanation. The browser reported zero console errors and zero warnings. No Dashboard command surface or external write was exercised.

## Adversarial result

The candidate fails closed for malformed usage JSON, unsafe file types, oversized files, project mismatch, invalid Token values, file changes during read, and conflicting Provider identities. It strips arbitrary fields before aggregation and does not restore archived records into the active journal.

## Residual limitations

Archive inclusion is bounded structural evidence, not cryptographic attestation. One qualified Work Item cannot establish Token savings or model quality. Monetary cost and automatic routing remain unavailable. These limits are disclosed in the UI and documentation and do not block this scoped closeout.

Independent QA recommends organizational `go` with no external release, publication, deployment, or push.
