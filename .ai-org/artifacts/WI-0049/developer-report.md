# Developer report — WI-0049

- Developer: Rikku (`agent-rikku`)
- Candidate revision: `6acb200dbe5090dea7d1e10b212bcff5b8079938`
- UI delivery mode: `code-first`

## Delivered

- Renamed the primary inventory to **Open work** and gave every row an explicit `View details` / `Hide details` disclosure affordance.
- Replaced canonical lifecycle jargon in the primary reading path with concise human states such as `In progress`, `Testing`, `Waiting for release decision`, and `Planned`.
- Kept exact state, revision, provenance, freshness, task identity, and capability data under nested technical details.
- Separated work waiting for a release decision from planned work instead of mixing them into one queue.
- Reduced the healthy update state to one quiet `Last updated` line. Healthy stream connectivity is no longer repeated; reconnecting, delayed, and failed states remain visible exceptions.
- Simplified prominent Work copy and retained native disclosure semantics, focus visibility, reduced-motion behavior, and the fluid wide-screen layout.
- Added regression assertions for the human labels, disclosure affordance, quiet timestamp, stale warning, and removal of redundant status elements.

## Verification

- Focused Control Plane suite: 21 passed, 0 failed.
- Full `npm run verify`: repository and documentation checks passed; 223 tests passed, 0 failed.
- Real-browser private-viewer review: 3440, 1440, 1024, and 390 CSS-pixel widths passed without horizontal overflow; disclosure interaction worked and browser console reported 0 errors and 0 warnings in a fresh session.

## Boundaries

- The home-LAN surface remains read-only; Human Inbox and Agent Commands remain local-only.
- Canonical IDs and exact evidence were preserved rather than rewritten into presentation labels.
- No package, external UI dependency, remote command path, release, deployment, publication, or external write was added.
