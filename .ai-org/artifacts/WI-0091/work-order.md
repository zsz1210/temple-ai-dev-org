# Work Order — WI-0091

## Outcome

Make Temple Workspace distinguish retained Token evidence from the health of the current capture path, then verify the correction with one bounded real provider observation.

## Included work

- Add a machine-readable capture-health projection derived from the Codex Provider, registered task topology, and detailed usage observations.
- Present a human-readable Usage status with the current capture state, last successful capture, completed Work Item coverage, and a bounded recovery action.
- Preserve unknown values as unknown and retain the existing separation between per-thread observations, account activity, cost, savings, quality, and routing authority.
- Verify the renderer at desktop, tablet, and mobile widths, including private read-only access and reduced motion.
- Run one short provider-owned Luna task only after the implementation and local tests pass, with no prompt or hidden-reasoning retention and no automatic retry.

## Boundaries

- Do not enable Codex observation silently or make it a framework default. Runtime observation remains an explicit local opt-in.
- Do not infer Tokens from repository events, elapsed time, output text, account-wide activity, or internal-subagent counts.
- Do not fabricate or manually edit usage observations.
- Do not expose prompts, hidden reasoning, credentials, raw Provider payloads, Inbox state, or Agent Commands to the private viewer.
- Do not change model-routing policy, spending limits, release visibility, or public-release state.

## Evidence required

- Deterministic status tests for disabled, unavailable, ready-without-task, awaiting-observation, and active-capture conditions.
- Exact coverage and last-capture tests using retained historical observations.
- Runtime visual evidence for live and private read-only Temple Workspace views.
- Focused test output, full `npm run verify`, and one bounded real capture result or a truthful failure record.
- Distinct Independent QA on the exact candidate revision.
