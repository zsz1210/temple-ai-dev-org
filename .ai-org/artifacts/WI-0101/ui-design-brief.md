# UI design brief

- Work item: `WI-0101`
- UI Designer Position owner: `ui_designer`
- Agent Identity: `agent-yuna` (Yuna)
- Delivery mode: `code-first`
- Selected tool or medium: existing executable HTML Management Console
- Artifact path or URL: `src/control-plane-dashboard.mjs`
- Artifact revision: implementation candidate revision, recorded at handoff
- Approval record, when required: not required for this bounded code-first wording and visibility correction

## Why this mode

The approved visual hierarchy and responsive shell do not change. The risk is a misleading authority label or accidentally visible mutation tool, not a new layout. Code-first is the lightest medium because the acceptance decision depends on the actual server mode and rendered DOM.

## Required surfaces and states

- Screens or surfaces: workspace toolbar, sidebar metadata, local-tools navigation, and footer.
- Empty, loading, error, success, and permission states: existing states remain unchanged; local read-only always hides mutation destinations.
- Responsive or device variants: existing mobile, tablet, desktop, and ultrawide contracts remain in force.
- Accessibility requirements: hidden mutation destinations must not remain keyboard-focusable; access wording remains visible text.
- Motion or transition requirements: no new motion.

## Visual direction

- Hierarchy and layout: preserve the approved shell and all page structures.
- Components and design-system references: existing Temple Management Console components.
- Typography, color, spacing, and imagery constraints: no change.
- Existing product or platform conventions to preserve: dark engineering theme, optional light theme, icon navigation, and progressive disclosure.

## Implementation handoff

- Required design or preview evidence: rendered local read-only page plus semantic browser assertions.
- Mapping from artifact to implementation: add a distinct `management-read-only` render mode; reuse the existing read-only hiding rules while giving loopback-specific access copy.
- Known ambiguity: none; private read-only viewers retain their existing copy.
- Runtime visual-review method: installed Chrome at representative desktop and mobile widths.
- Visual acceptance criteria: toolbar says `Local · Read only`; local tools are absent from DOM and keyboard order; private viewer says `Private network · Read only`; no layout collision, clipping, console error, or horizontal overflow.
