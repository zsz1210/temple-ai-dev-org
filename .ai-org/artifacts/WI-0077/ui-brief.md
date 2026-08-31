# UI design brief — WI-0077

## Status

Draft preview-first brief for owner review. It extends the approved `UI-0002@ui-1` baseline; it does not replace that UI contract or authorize Build.

## Direction

Use a dark charcoal engineering console with quiet borders, compact but readable data density, and restrained semantic color. The interface should feel operational and trustworthy rather than theatrical.

- Neutral charcoal surfaces establish hierarchy through elevation and border contrast.
- Teal marks selection and verified healthy state.
- Amber marks attention or uncertainty.
- Red is reserved for a current failure or delivery-stopping condition.
- Blue marks informational assurance or policy context.
- Monospace is limited to Work Item IDs, revisions, evidence IDs, timestamps, and machine state.
- Icons support labels; they never replace an unfamiliar destination name.

## Global shell

The persistent shell contains:

- Product mark and **Temple Workspace** name.
- Primary navigation with icons and text at desktop width.
- Project name and operating profile.
- Access indicator: `Local operator` or `Private view · read-only`.
- Data freshness and manual refresh.
- A local-only Action Center separated from observational navigation.

Use an eye icon with `View only` for observational surfaces. Do not use a lock icon: the access state describes available capability, not a locked or punitive condition.

Do not repeat implementation doctrine in every footer.

## Responsive composition

| Width | Navigation | Content |
| --- | --- | --- |
| `≥ 1920` | 248 px labeled sidebar | Adaptive grid up to approximately 1680 px; three columns only when comparison benefits |
| `1280–1919` | 232–248 px labeled sidebar | 12-column grid, commonly two columns |
| `768–1279` | 72 px icon rail with tooltips | One or two columns; prose remains bounded |
| `< 768` | Drawer opened by a visible menu button | Single column; tables become priority rows plus selected details |

The layout must not require horizontal scrolling at 320 CSS px, except for content that is inherently two-dimensional. Wide screens add parallel context instead of stretching paragraphs.

## Destination behavior

### Overview

- A compact page header contains the question, access mode, and freshness.
- “Needs you now” appears first only when real action exists.
- Work-moving and upcoming-gate cards are ordered by consequence and recency.
- Follow-up is visually quieter and cannot trigger the global critical state by itself.

### Work

- Search and filters remain visible above one inventory.
- Desktop uses a dense row/table presentation; narrow screens show priority fields in stacked rows.
- The selected item opens a right-side detail panel at wide widths and an inline/full-screen detail at narrow widths.
- Responsibility chain, dependencies, Codex task, evidence, model, Token, and affected paths appear in detail.

### Team

- Retain `Responsibilities`, `People & Agents`, and `Authority` tabs.
- Responsibilities remain Position-first and do not imply a reporting hierarchy or permanent one-Agent-per-Position assignment.
- Each identity is explicitly tagged `Agent` or `Human`.
- Show current Work Item and effective model only when recorded evidence exists.

### Usage

- Start with Token totals, recorded cost availability, model distribution, and measurement coverage.
- Show `Insufficient evidence for trend` until the configured threshold is met.
- When evidence is sufficient, expose time range, Work Item, task type, Agent, Position, and model filters.
- Separate observed facts from routing recommendations.

### System

- Lead with `Healthy`, `Attention`, `Degraded`, or `Unavailable`, plus human impact.
- Show provider, freshness, transport, and projection state.
- Put Evidence IDs, revisions, and raw observation payloads inside details.
- Keep `Status`, `Configuration`, `Integrations`, and `Access` as local tabs under System rather than adding another top-level destination.
- Present effective configuration as readable values with source and operational effect. Do not use disabled toggles to represent view-only data.
- Group configuration into workspace, AI execution, context, and governance so a human can answer “what is active?” without reading canonical JSON.

### History

- Use tabs for `Finished work`, `Audit trail`, and `Evidence`.
- Provide search, date range, event/lifecycle/Position filters, and bounded pagination.
- Human labels precede raw event names.

## Interaction and accessibility

- Every interactive element has visible keyboard focus and a target of at least 24 × 24 CSS px.
- Active navigation is conveyed by label and shape, not color alone.
- Tabs use `tablist`, `tab`, and `tabpanel` semantics with keyboard navigation.
- Status updates use a restrained `role=status` region when content changes without navigation; routine refreshes do not announce an entire page.
- Loading, empty, insufficient-evidence, stale, unauthorized, and failure states use distinct copy and treatment.
- Animation is limited to purposeful state transitions and respects reduced-motion settings.
- A running Worker may use one quiet activity dot and one thin progress trace. Do not animate entire cards, counts, or background surfaces.
- A fresh projection may use one 240 ms acknowledgement highlight; it must not loop.
- Use transform and opacity for motion, keep routine UI transitions under 250 ms, and remove nonessential animation under `prefers-reduced-motion`.
- Preview-only runtime scenarios must be labeled as simulated or historical replay and must never look like current canonical state.

## Highest-risk preview states

The prototype must cover:

1. No current human action, while open work still exists.
2. A true dependency-blocking decision versus an intentionally retained blocked validation.
3. One Work Item with full responsibility/model/evidence detail.
4. Too little usage evidence for a trend.
5. A current provider condition versus historical evidence.
6. Read-only private view with no local tools.
7. A clearly labeled historical running replay with restrained motion.
8. A one-time “just updated” acknowledgement.
9. Human-readable view-only configuration with value provenance.
