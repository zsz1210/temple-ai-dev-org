# Technical design: human-readable Workspace status

## Implementation shape

Keep the server projection and lifecycle enums unchanged. Introduce presentation-only helpers inside the generated Workspace script:

- `workStatusLabel(item)` maps Observer categories and terminal states to human labels.
- `workStageLabel(state)` presents a readable workflow stage while retaining the exact enum in technical details.
- `appendWorkGroup(...)` renders separate inventory disclosures without changing the source item order.
- `setSnapshotState(...)` renders either quiet update metadata or a prominent stale warning.

## Work Item disclosure

`renderWork` continues to create native `details.work` elements. Its `summary` becomes:

1. Work Item ID and title
2. one status lozenge
3. `.work-disclosure` containing a CSS chevron plus separate `View details` and `Hide details` labels

The body starts with a human `Work details` card. A nested `details.technical-details` contains exact state, revision, lifecycle provenance, freshness quality, and task trace fields. Registered task cards remain visible in the expanded body because they answer an operator question, but their raw provenance badges move into each task's nested technical disclosure.

## Grouping

`renderCurrentWork` preserves expanded Work Item IDs across refresh and creates these regions:

- direct current flow: `active`, `blocked`, and `qa_pending`
- `Waiting for release decision`: `approval_pending`
- `Planned`: `queued`
- terminal history remains on Activity

The grouping changes presentation only. No item is filtered out of its existing destination.

## Refresh status

The existing freshness threshold remains 30 seconds.

- Current: one quiet main-content line, `Last updated <formatted time>`.
- Stale response: warning title `Updates delayed`, last successful timestamp when available, and disabled loopback actions.
- Fetch failure: warning title `Unable to refresh`, prior information remains visible, and loopback actions stay disabled.

The sidebar retains transport/connection identity but not a duplicate snapshot time. The footer retains the authority boundary but no timestamp.

## Copy audit

Replace only prominent, general-audience strings in Overview, Work, Team summaries, and the footer. Keep exact technical terms in Health, Activity, nested technical details, tests, and operator documentation where precision matters.

## Risk and rollback

Risk is low and confined to generated browser HTML/CSS/JavaScript. The projection schema, server routes, security boundary, and mutation checks do not change. Rollback is `git revert` of the candidate commit. Browser review must explicitly prove that stale warnings and disabled-action behavior remain intact.

## Verification

- Focused control-plane foundation, Inbox, and private-viewer tests.
- Full `npm run verify`.
- Runtime browser review at wide desktop, tablet, and mobile widths.
- Fresh detached-worktree Independent QA on the exact candidate revision.

