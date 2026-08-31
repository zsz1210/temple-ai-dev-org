# Decision Ledger

## Decision

- ID: DEC-0001
- Status: accepted
- Date: 2026-08-31
- Owner position: UI Designer
- Work item: WI-0048

## Context

The first Temple Workspace redesign established human-facing navigation and responsive behavior, but its warm green-led visual direction did not match the requested engineering-tool character. The Team directory also exposed Agents and Positions without a diagram that makes the responsibility structure easy to understand.

## Options considered

1. Retain the warm light-first visual system and add only a conventional reporting tree. This preserves the current surface but conflicts with the requested engineering character and invents hierarchy not present in Temple's authority model.
2. Use a terminal-like black and fluorescent-green theme. This is visually technical but overstates terminal semantics, weakens long-session readability, and makes status color decorative.
3. Use a charcoal black-gray engineering workspace, semantic accent colors, and a position-first responsibility map with Agent Assignment inspection.

## Decision and rationale

Adopt option 3. Position is the stable responsibility contract while Agent Identity and Assignment can change or overlap. The map therefore groups Positions into responsibility lanes and displays the assigned Agent as secondary data. `visualize` is accepted as a design-review medium, not a production dependency or canonical runtime.

## Consequences and follow-up

- Files or work items affected: `WI-0048`, `src/control-plane-dashboard.mjs`, focused Control Plane tests, `docs/concepts/architecture.md`, and Control Plane operating documentation.
- Open questions: whether repeated use later justifies a dedicated Architecture destination in Temple Workspace.
- Revisit trigger: enterprise validation demonstrates more complex Position pools or a need for frequently interactive system architecture exploration.
