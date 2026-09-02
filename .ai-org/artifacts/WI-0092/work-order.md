# Work Order — WI-0092

## Outcome

Make detailed Codex Token observation an explicit clone-local capability: optional for every Temple user, continuously managed on the current Mac when selected, and honest about retained history and unobserved gaps.

## Included work

- Define `off`, `on-demand`, and `managed-local` as operator modes outside canonical project state.
- Add a read-only status and a preview/apply/remove lifecycle for a macOS LaunchAgent that starts the local Control Plane with Codex observation and an optional private-LAN viewer.
- Keep service definitions, paths, logs, and machine addresses below the Git common directory or the user's LaunchAgents directory; do not commit them.
- Project the selected mode and bounded capture-window facts into Usage without assigning account-wide activity to a Work Item.
- Preserve current Provider-owned auto-registration and explain the existing explicit `task register` path for Codex tasks created outside Temple.
- Verify the human Usage view at responsive widths and retain the private-viewer GET-only boundary.

## Boundaries

- Temple remains usable when observation is off; no daemon, App Server, or model call is installed or started by `temple init` or `temple upgrade`.
- Managed local is macOS-only in this slice. Unsupported platforms report that boundary and retain on-demand operation.
- Installing, activating, replacing, or removing a local service requires an explicit command and exact plan digest. No background service mutation occurs during status, plan, Dashboard refresh, or ordinary verification.
- The observer does not create tasks, start turns, switch models, retry generation, answer approvals, or expose local mutation routes to the LAN viewer.
- Work Item Token values remain telemetry, not fields in canonical Work Item JSON.
- Do not retain prompts, responses, hidden reasoning, credentials, raw Provider payloads, or account-wide Token values.
- Do not change Provider trust, external authority, public release state, or automatic model routing.

## Evidence required

- Deterministic plan, digest, plist escaping, unsupported-platform, stale-plan, replacement, activation, status, and rollback tests with no real service mutation.
- Capture-health tests for all three modes, retained-history state, and unobserved completed work after the declared observation boundary.
- CLI tests for read-only planning/status and explicit mutation guards.
- Runtime validation of the generated macOS service on the current Mac, including restart behavior, Codex Provider health, private-LAN read-only access, and retained Usage totals.
- Responsive and reduced-motion browser evidence for the real Usage view.
- Full verification plus distinct Independent QA on the exact candidate revision.
