# UI design brief — WI-0040

- Work item: `WI-0040`
- UI Designer Position owner: UI Designer
- Agent Identity: Yuna (`agent-yuna`)
- Delivery mode: `code-first`
- Selected tool or medium: executable HTML Dashboard
- Artifact path or URL: `src/control-plane-dashboard.mjs`
- Artifact revision: exact implementation candidate to be recorded before Test
- Approval record, when required: not required for code-first

## Why this mode

This is an internal operational surface that extends the existing Dashboard design system. The information contract and misleading-data risk are material, but the layout is inexpensive to inspect and revise in the executable Dashboard. A separate mockup would not provide stronger evidence than the real empty, partial, and narrow-screen states.

## Required surfaces and states

- Surface: one full-width `Usage & models` panel after current attention and before detailed Work Items.
- Empty: no detailed usage; show qualification and coverage honestly, plus a concise next-evidence explanation.
- Partial: show observed fields and groups while labeling unknown fields and missing dimensions.
- Success: show qualified longitudinal coverage and any exploratory model comparison without implying routing authority.
- Error and stale: use the Dashboard's global stale/error state; retain the last rendered evidence and avoid zero substitution.
- Permission: identical read-only content is allowed in the private viewer; no control is added.
- Responsive variants: desktop two-column detail area; one column at 900px and below; no horizontal overflow at 420px.
- Accessibility: semantic headings, textual status and values independent of color, native disclosure for long driver lists, and no chart-only encoding.
- Motion: none beyond existing live snapshot refresh behavior.

## Visual direction

- Hierarchy: a compact evidence summary first, Token composition second, observed drivers or an empty-state explanation third, and non-authority copy last.
- Components: reuse existing metric cards, badges, rows, panel borders, spacing, and status colors.
- Typography and color: preserve the current dark control-plane palette; use `unknown` as text, never an em dash or `0`.
- Charts: do not add a time-series or proportional chart until real timestamped observations exist. Empty charts imply measurement where none exists.

## Implementation handoff

- Required design evidence: this brief and the product specification.
- Mapping: snapshot `usage` feeds one `renderUsage` function; it must tolerate absent legacy snapshots and all nullable numeric fields.
- Known ambiguity: a future time-series view requires a separately bounded aggregation contract and is intentionally outside this Work Item.
- Runtime visual-review method: inspect the live self-host Dashboard at desktop width and at 420px; use a deterministic observed-data fixture for the partial-data rendering test.
- Visual acceptance criteria: the operator can identify evidence availability, qualification progress, observed model state, and prohibited conclusions without scrolling through Work Items or reading raw JSON.
