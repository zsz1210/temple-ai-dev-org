# UI design brief

- Work item: WI-0065
- UI Designer Position owner: UI Designer
- Agent Identity: Yuna (`agent-yuna`)
- Delivery mode: `code-first`
- Selected tool or medium: existing server-rendered Temple Workspace HTML/CSS/JavaScript
- Artifact path or URL: `src/control-plane-dashboard.mjs`, governed by `UI-0002@ui-1`
- Artifact revision: runtime candidate revision
- Approval record, when required: code-first; no separate prebuild approval required

## Why this mode

This is a small semantic correction inside an existing approved Team card, not a new visual system. Executable code plus runtime review is the lowest-rework evidence while preserving the approved dark engineering shell.

## Required surfaces and states

- Surface: Team Agent model details.
- States: requested only; thread-observed plus requested; future turn-effective; no model evidence.
- Responsive variants: existing wide desktop, tablet, and narrow navigation behavior.
- Accessibility: labels remain text, do not depend on color, and stay inside the Agent card's accessible model-status region.
- Motion: none added.

## Visual direction

- Keep the existing Agent card hierarchy and compact secondary metadata.
- Reuse existing typography, spacing, colors, and model-state styling.
- Use human labels instead of schema names or AI-generated explanation copy.

## Implementation handoff

- Map each explicit reasoning field to one short line.
- Never render the legacy compatibility field as effective-turn proof.
- Review the live Team page at desktop and narrow widths.
- Acceptance: a `max` request plus `xhigh` thread observation is immediately understandable and `Effective turn · Not observed` remains explicit.
