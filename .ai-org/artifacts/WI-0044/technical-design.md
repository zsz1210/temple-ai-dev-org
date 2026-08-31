# Technical design — WI-0044

## Rendering boundary

Keep the Dashboard dependency-free and server-rendered from `renderControlPlaneDashboard`. The browser continues to fetch one `/api/v1/snapshot` and subscribe to one `/api/v1/events` stream. Navigation only changes which already-rendered view is visible; it does not start additional polling or mutate canonical state.

## Application frame

- `aside.app-sidebar` holds project identity, primary navigation, optional loopback tools, authority, connection, and snapshot freshness.
- `main.app-main` contains one header and seven route panels.
- Each route panel uses `data-view`; navigation buttons use `data-nav-target` and `aria-controls`.
- The active view is stored in the URL fragment and restored on reload. Unknown or private-only fragments fall back to `now`.
- At widths below 800px, the sidebar becomes a compact top shell and the navigation list becomes a sticky horizontal row.

## View renderers

- `renderNow`: small operational metrics, prioritized attention, and active-work focus.
- `renderExecution`: responsibility chains and non-terminal Work Item details; local Agent Commands remain a separate discoverable view.
- `renderUsage`: concise qualification state; expanded metrics only for observed data.
- `renderSystem`: providers and active conditions.
- `renderHistory`: terminal Work Items and occurrence/observation timeline.
- Existing Human Inbox and Agent Command form logic is retained inside dedicated local views.

`renderNow` classifies attention before presentation. Blocked work, live runtime permission requests, business questions, and firing conditions with a concrete recovery action form the primary queue. Release approvals form a secondary decision queue. Stale evidence and informational or suppressed conditions remain available under History or System rather than competing for the top slot.

## Responsibility chain

For each non-terminal Work Item:

1. Agent comes from the active claim, otherwise a registered task, otherwise `unknown`.
2. Position comes from the active claim/task when available, otherwise the canonical owner Position.
3. Work Item comes from canonical lifecycle state.
4. Codex task comes from the registered task; absence stays explicit.
5. Model comes from task usage attribution when observed; absence stays explicit.

Display-name humanization removes known `agent-` prefixes and title-cases identifiers. It is presentation only and never creates canonical identity evidence.

## Safety and regressions

- Private HTML omits local tool navigation and panels at render time.
- Stale snapshots continue to disable all `.action` controls.
- Existing redacted snapshots and cursor-only private SSE remain unchanged.
- Tests assert navigation landmarks, private omission, responsibility-chain labels, empty Usage behavior, and retained replay coordination.

## Risk review

- **Hidden capability:** mitigated by explicit navigation and local-tool grouping.
- **False current state:** mitigated by persistent freshness and stream indicators.
- **Invented organization data:** mitigated by deterministic evidence precedence and explicit unknowns.
- **Private authority leak:** mitigated by server-side omission, not CSS hiding.
- **Mobile navigation loss:** mitigated by a sticky primary destination bar and browser checks.
- **Refresh regression:** mitigated by preserving one refresh coordinator and one snapshot sequence.
- **Visual density migration:** mitigated by native disclosure and moving terminal work to History.

No new dependency, provider schema, external write, release, or deployment is required.
