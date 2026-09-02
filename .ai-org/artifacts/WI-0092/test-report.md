# Test Report — WI-0092

- Position: Quality & Evaluation Engineer
- Agent Identity: Lulu (`agent-lulu`)
- Exact candidate: `5e74864527cb2422aac67804efda3583194e6a58`
- Environment: clean detached worktree, macOS, Node.js `v24.19.0`, Chrome `152.0.7977.65`
- Worktree state after verification: clean

## Independent execution

The QA worktree was created directly from the exact candidate commit. Dependencies were installed from `package-lock.json` with `npm ci`; no source or canonical project file from the Developer worktree was reused outside Git.

```text
node scripts/check-repo.mjs
PASS

node scripts/check-doc-links.mjs
PASS

node scripts/check-package.mjs
PASS — 309 packaged files

node --test
276 passed, 0 failed

node scripts/verify-console-browser.mjs
PASS — mobile 390x844, tablet 768x1024, desktop 1440x1000,
       ultrawide 3440x1440, six primary views, reduced motion
```

## Focused assurance

- Deterministic service planning and direct argument-vector plist generation passed.
- Unsupported-platform, stale-plan, replacement-consent, deletion-consent, rollback, and idempotency cases passed.
- A currently active plan cannot be replaced without explicit activation authority.
- Off mode retains earlier data without implying current capture.
- Managed local mode reports post-start correlated and uncorrelated completed work separately.
- Account-wide usage remains unallocated and cannot satisfy Work Item backfill.
- Private-viewer and LAN tests remain GET-only and redacted.
- Responsive Usage layout has no horizontal overflow at 390 or 1440 pixels in the controlled managed-gap visual state.

## Remaining runtime boundary

The exact `launchctl` argument contract and failure rollback were exercised with a controlled adapter. This report does not claim that the candidate was installed as a real LaunchAgent on the operator's Mac. That integration observation is required before final closeout.
