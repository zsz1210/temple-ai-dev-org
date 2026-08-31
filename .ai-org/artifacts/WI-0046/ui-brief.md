# UI design brief — WI-0046

- Work item: `WI-0046`
- UI Designer Position owner: UI Designer
- Agent Identity: Yuna (`agent-yuna`)
- Delivery mode: `code-first`
- Selected medium: executable native HTML/CSS/JavaScript Management Console
- Implementation artifact: `src/control-plane-dashboard.mjs`
- Visual evidence: exact implementation candidate to be captured during browser evaluation

## Why this mode

The console is a private operational surface with live, empty, partial, stale, and narrow-screen states. Code-first keeps those states executable and testable. It does not remove UI ownership: information architecture, visual hierarchy, responsive behavior, accessibility, and browser review are required before closeout.

## Product framing

- The complete application is the **Temple Management Console**.
- `Now` is the operational **Dashboard** within that application.
- `Organization` describes durable topology from canonical files.
- `Execution` describes current claimed, blocked, or live-attached work only.

## Application frame

Primary navigation order:

1. Now
2. Organization
3. Execution
4. Usage
5. System
6. History

Loopback-only Human Inbox and Agent Commands remain in a separate Local tools group and are omitted from private viewers.

The composition borrows the useful visual grammar of shadcn/ui's Dashboard, Sidebar, Tabs, Avatar, and Table examples: grouped navigation, compact section cards, strong active state, fallback identity marks, segmented local views, and dense readable rows. No shadcn source or dependency is copied or installed.

## Organization layout

The view opens with four compact facts: active Agents, assigned Positions, collaboration profile, and safeguard result.

The main area contains:

- a true two-tab control: `By Agent` and `By Position`;
- an equal-status assignment map in `By Agent`, with one project heading and every Agent card at the same visual level;
- a dense Position table on wide screens and definition-list cards on narrow screens;
- a compact governance panel for profile, coordination backend, safeguard checks, and large-scale validation status.

Assignment connectors, if used, mean only “this Agent holds these Positions.” They never imply a reporting hierarchy.

## Agent cards

Each Agent card contains:

- initials fallback mark;
- canonical display name and ID;
- configured identity status, explicitly distinct from online or runtime status;
- Position chips in canonical order;
- membership Disciplines;
- current non-terminal Work Item count and bounded identifiers as secondary context.

No active work renders as `No current assigned work`; it does not hide the Agent.

## Position directory

Columns or card fields:

- Position;
- assigned Agent or `Unassigned`;
- purpose;
- Disciplines;
- authority boundary (`Cannot approve …`);
- current-work count.

Purpose and authority text remain visible content, not tooltip-only content. Ten rows do not require search, pagination, sorting, or a table framework.

## Interaction and accessibility

- The Agent/Position control uses `role="tablist"`, `role="tab"`, `aria-selected`, roving `tabindex`, Arrow Left/Right, Home, and End.
- Snapshot refresh updates content without resetting the selected organization tab or stealing focus.
- Active navigation and safeguard state use text and structure in addition to color.
- Focus rings cover navigation, tabs, disclosure, buttons, and links.
- Touch targets remain at least 44px.
- Frequent view switching is immediate; retain only color and press feedback, with reduced-motion support.
- Wide Position tables include a caption and column scopes; mobile Position cards use semantic definition lists.

## Responsive behavior

- At 1200px and above: 248px sidebar, Agent cards in a compact multi-column map, Organization content plus governance side panel.
- From 800px to 1199px: persistent sidebar, two- or three-column Agent cards, governance panel below the directory if needed.
- Below 800px: existing sticky horizontal primary navigation, one-column Agent cards, Position cards instead of a desktop table.
- At 1440×1000, 1024×1366, 768×1024, and 420×900: no page-level horizontal overflow.

## Required states

- all active assignments, no active Work Items;
- one or more current Work Items;
- unassigned Position;
- missing membership Discipline;
- passing and failing separation safeguard;
- `solo`, `collaborative`, and `high-assurance` profile labels;
- large-scale validation not run;
- current, stale, and disconnected snapshots;
- loopback and private read-only viewers.

## Visual acceptance

- Organization remains legible without a large decorative hierarchy tree.
- A viewer can identify all five current Agents and all ten Positions without opening raw project files.
- The difference between configured organization and live execution is stated in visible copy.
- The current profile and separation safeguards are understandable to a new operator.
- The UI does not imply that profile, Assignment, model, or command state is editable from the private viewer.
