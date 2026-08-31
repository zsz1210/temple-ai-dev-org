# Product specification — WI-0047

## Product outcome

**Temple Workspace** is the human-facing operating surface for a Temple-backed software project. It helps a developer, small team, or enterprise operator answer six questions without opening canonical JSON:

| Destination | Human question | Existing internal view |
| --- | --- | --- |
| Overview | What needs attention now? | `now` |
| Team | Who is part of this project, and which roles do they hold? | `organization` |
| Work | What is moving, who owns it, and what evidence exists? | `execution` |
| Usage | Which model and Token evidence is available? | `usage` |
| Health | Can this workspace and its observation sources be trusted? | `system` |
| Activity | What happened before? | `history` |

The new labels are presentation routes. They do not rename canonical lifecycle states, Work Item IDs, Agent Identity IDs, Position IDs, event types, or provider contracts.

## Human-facing language

- Visible product identity: `Temple` with subtitle `Workspace`.
- Browser title: `<project> · Temple Workspace · <destination>`.
- `Agent` is used only when the AI nature or canonical traceability matters. Primary presentation uses `teammate`, `AI team`, or the person's display name.
- `Position` remains available in detail, but the default local switch reads `Teammates` and `Roles`.
- `Work Item` remains in traceable identifiers and evidence detail; primary headings use `work`.
- The full framework name remains repository and documentation identity, not repeated application chrome.

## Navigation behavior

### Wide desktop, 1200px and above

- A 248px labeled sidebar stays visible.
- Every primary destination has an original semantic inline SVG icon and visible label.
- The content area consumes the remaining width with no fixed page-wide maximum.
- Readable prose retains local line-length limits; operational cards and tables may use more columns.

### Tablet and compact desktop, 760px to 1199px

- The sidebar becomes a 76px icon rail.
- Labels are visually hidden but remain available through `aria-label`, `title`, and accessible text.
- The current destination remains distinguishable by shape, text alternative, and color.

### Mobile, below 760px

- The sidebar is off canvas by default.
- A visible Menu button opens a modal-like navigation drawer with labels.
- Escape, destination selection, or backdrop activation closes the drawer.
- Focus returns to the Menu button when the drawer closes.
- The page is not horizontally scrollable.

Old hashes (`#now`, `#organization`, `#execution`, `#system`, `#history`) remain accepted and are normalized to the new public hashes. This preserves bookmarked private-viewer links.

## Responsive composition

- The workspace content is a container and uses `repeat(auto-fit, minmax(...))` for bounded cards.
- Overview uses a wide primary area and contextual side area where width permits; it may add a third useful column on ultrawide screens.
- Team uses a multi-column teammate directory plus a bounded governance column on wide screens, then stacks them as space decreases.
- Work responsibility chains remain horizontal only when each step is readable; otherwise they wrap or become vertical.
- Position tables switch to semantic cards on narrow screens.
- No decorative empty column is introduced merely to fill width.

## Theme behavior

- First visit follows `prefers-color-scheme`.
- The operator can choose light or dark with a labeled button.
- The explicit choice is stored only in browser local storage under `temple-workspace-theme`.
- Theme selection changes presentation only; it is never included in canonical state, telemetry, command payloads, or private-viewer data.
- Both themes preserve status meaning, focus visibility, and readable contrast.

## Privacy and authority

- Private LAN/Tailscale viewers remain read-only projections.
- Human Inbox and Agent Commands remain omitted from private viewers.
- The new mobile drawer and theme control are client-only presentation state, not mutation authority.
- One snapshot, one refresh coordinator, and one event stream remain the data model.
- Existing redaction and secret-absence assertions remain required.

## Acceptance measures

- A new operator can locate Team and understand the five configured teammates without knowledge of the old `Organization` name.
- Navigation contains no numbered prefixes and is usable by keyboard and screen reader at every breakpoint.
- The browser has no page-level horizontal overflow at 3440×1440, 2560×1080, 1440×1000, 1024×1366, 768×1024, and 390×844.
- At 2560px and 3440px, the primary content width is greater than 1180px and meaningful panels occupy the available area.
- Light/dark choice persists across reload and system preference is used when there is no explicit choice.
- Legacy hashes reach the correct new destination.
- Private viewer tests and command-authority tests remain green.

## Non-goals

No new data source, provider, command, tracker mutation, automatic model routing, Token storage, price estimate, public hosting, release, publication, or dependency is added.
