# UI design brief — WI-0044

- Work item: `WI-0044`
- UI Designer Position owner: UI Designer
- Agent Identity: Yuna (`agent-yuna`)
- Delivery mode: `code-first`
- Selected tool or medium: executable HTML Dashboard
- Artifact path or URL: `src/control-plane-dashboard.mjs`
- Artifact revision: exact implementation candidate to be recorded before Test
- Approval record: owner approval is represented by the instruction to proceed with the accepted `WI-0043` hierarchy

## Why this mode

The Dashboard is a local operational tool with inexpensive iteration and many live empty, stale, private, and partial-data states. The executable surface is stronger evidence than a detached mockup. The redesign still requires an explicit information hierarchy and runtime visual review.

## Required surfaces and states

- Persistent application frame: project identity, view navigation, viewer authority, connection, and freshness.
- Primary destinations: Now, Execution, Usage, System, History.
- Local destinations: Human Inbox and Agent Commands, omitted from private viewers.
- Loading: stable shell with a clear loading message.
- Empty: plain-language explanations and the next evidence required.
- Partial: show observed values alongside explicit unknowns.
- Stale/offline: retain the last snapshot, mark it stale, and disable local mutations.
- Responsive: persistent left sidebar at 800px and above; sticky horizontally scrollable destination bar below 800px.
- Accessibility: semantic navigation and main regions, `aria-current`, visible focus, 44px touch targets, textual statuses, and reduced motion.

## Visual direction

- Mood: calm professional control room, not a wall of monitoring widgets.
- Hierarchy: one clear page title and short question, followed by a small number of decisive cards. Dense evidence stays below or behind native disclosure.
- Sidebar: restrained dark navy surface, compact project mark, grouped primary and local navigation, persistent live-state footer.
- Content: warm near-white canvas-on-dark panels, cyan accent for selection, amber only for actionable attention, red only for active failure, green only for verified healthy state.
- Typography: human-readable sentence case for product copy; monospace only for IDs, revisions, and provider identifiers.
- Motion: no navigation movement; 120–180ms color and opacity transitions, `transform: scale(.98)` press feedback, and a reduced-motion override.
- Research basis: `dashboard-ui-research.md` applies Carbon's hierarchy and metric limits, Fluent's brief one-level navigation, NN/G's progressive disclosure, and Grafana's question-led operational model.

## Implementation handoff

- Preserve all currently accepted privacy and data-truth invariants from `WI-0043`.
- Keep rendering functions bounded by view; do not make navigation fetch separate competing snapshots.
- Build a responsibility-chain component from current Work Item claim/task evidence. Humanize known IDs for display without inventing unavailable identity data.
- Use one selected snapshot for all visible views; background SSE refresh updates whichever view is active.
- Runtime review must include local desktop, local mobile, private-LAN tablet, keyboard navigation, and section switching.

## Visual acceptance criteria

- A new operator does not see ten equal metrics or a full empty Usage analysis on entry.
- The active navigation state is unmistakable without relying on color alone.
- At 1024px the sidebar remains visible and the main content does not feel squeezed.
- At 420px every primary destination remains directly reachable near the top.
- The Agent responsibility chain reads left to right on wide screens and top to bottom on narrow screens.
- The landing view shows no more than four supporting metrics and every warning there has a concrete owner or next action.
