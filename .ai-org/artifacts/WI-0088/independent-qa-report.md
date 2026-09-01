# WI-0088 Independent QA Report

## Independence

- Developer: Rikku (`agent-rikku`)
- Independent QA: Lulu (`agent-lulu`)
- Candidate revision: `1a82106c9fdc61efaa3aa502be320432c0bf82bf`
- The candidate was evaluated from fresh detached worktrees rather than the Developer's active working directory.

## Positive control

The exact candidate passed a clean Node.js `v24.20.0` install, all 268 repository tests, package boundaries, schema validation, Doctor, and installed-Chrome traversal of four viewports across all six primary Console views. The exact worktree remained clean.

## Negative control

Independent QA created a second disposable worktree at the exact candidate, then introduced an uncommitted test-only `.view-header{width:200vw!important}` defect. The browser gate failed nonzero on the first affected surface and reported both independent symptoms:

- `mobile/Overview: document is 405px wider than the viewport`
- `mobile/Overview: .view-panel:not([hidden]) > .view-header escapes the viewport (15..795 of 390)`

It also wrote `output/playwright/wi-0088/mobile-overview-failure.png` as a valid 795x1478 PNG with SHA-256 `d4cff44c946f4b443021591b3d624e0b8835e4a9d03e2a17373c774f431059c9`. The entire disposable worktree, injected defect, dependencies, and screenshot were then removed. No candidate source was changed.

This negative control demonstrates that the gate detects an actual responsive-layout regression, identifies the viewport and view, returns a failing exit status, and preserves a diagnostic screenshot instead of merely exercising a green path.

## Challenge findings

- No browser installer or additional GitHub Actions job exists in the candidate.
- Browser execution is blocking only for the Node.js 24 full lane; its aggregation condition is tested.
- Chrome-only coverage and the lack of hosted timing evidence are stated limitations, not hidden claims.
- The stale prior Alpha.29 candidate remains explicitly invalid after the lockfile change.
- The stale generated parallel-plan warning is unrelated to sequential WI-0088 execution and does not weaken the candidate evidence.

## Decision

Pass. The implementation may advance to Release Gate for repository integration only. This does not authorize push, publication, tagging, package release, repository visibility changes, or a claim about hosted billing.

