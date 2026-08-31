# UI design brief

- Work item: WI-0070
- UI Designer Position owner: UI Designer
- Agent Identity: Yuna (`agent-yuna`)
- Delivery mode: `code-first`
- Selected tool or medium: Existing Temple Workspace attention projection and Codex/CLI decision path
- Artifact path or URL: `src/control-plane-dashboard.mjs`
- Artifact revision: bounded changes on `codex/wi-0070-skill-promotion`
- Approval record, when required: user acceptance recorded by WI-0070 and DEC-0003

## Why this mode

The feature adds one bounded approval type to the existing attention projection. The first release accepts the decision through the repository-pinned CLI, including when a human replies in Codex and the authorized Agent executes that command. It does not introduce new navigation, layout, branding, motion, or remote-write capability. Code-first is proportionate because the existing attention-card behavior is already implemented and visually validated; runtime review remains required for the new states.

## Required surfaces and states

- Screens or surfaces: Overview `Needs attention`, generated Observer overview, and read-only private Overview.
- Empty, loading, error, success, and permission states: no eligible candidates; eligible candidate awaiting Tech Lead proposal; proposal awaiting human decision; deferred proposal; approved proposal with linked authoring Work Item; rejected proposal; stale or invalid proposal; command failure; private read-only presentation.
- Responsive or device variants: preserve the current single-column narrow layout and existing attention-card wrapping.
- Accessibility requirements: button labels state the proposal and decision, keyboard operation, visible focus, status/error announcements, and no color-only status.
- Motion or transition requirements: reuse current motion; no new animation.

## Visual direction

- Hierarchy and layout: Skill promotion remains a governance approval inside the existing Now attention list; its decision is performed through Codex or the local CLI.
- Components and design-system references: existing `attention-card`, `inbox-card`, badges, action buttons, and technical disclosure.
- Typography, color, spacing, and imagery constraints: reuse current tokens and warning/success/error tones; no new imagery.
- Existing product or platform conventions to preserve: private viewer is read-only; local actions fail closed on stale snapshots; canonical repository files remain authority.

## Implementation handoff

- Required design or preview evidence: runtime screenshot or browser inspection of pending, approved/deferred/rejected, and private read-only states.
- Mapping from artifact to implementation: candidate and proposal attention reuse the existing Overview attention list; decisions use the bounded `temple learning decide-skill` command.
- Known ambiguity: the exact amount of proposal detail visible before opening technical disclosure may be tuned after runtime inspection.
- Runtime visual-review method: local control-plane snapshot and browser inspection at desktop and narrow viewport.
- Visual acceptance criteria: the user can understand why the proposal exists, what approval will do, and that no Skill is activated by the decision; private viewers cannot access mutation controls.
