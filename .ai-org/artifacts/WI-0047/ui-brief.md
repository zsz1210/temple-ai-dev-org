# UI design brief — WI-0047

- Work item: `WI-0047`
- UI Designer Position: UI Designer
- Agent Identity: Yuna (`agent-yuna`)
- Delivery mode: `preview-first`
- Approved UI contract: `UI-0001@ui-1`
- Approved preview: `.ai-org/artifacts/WI-0047/approved-preview.svg`
- Review record: `.ai-org/artifacts/WI-0047/preview-review.md`
- Implementation medium: dependency-free HTML, CSS, and JavaScript rendered by `src/control-plane-dashboard.mjs`

## Visual direction

Combine the approved human-first calmness with enterprise information density:

- warm neutral light surfaces and deep green navigation;
- a dark theme with the same hierarchy rather than a separate visual language;
- clear destination names and recognizable original icons;
- one visually dominant current-focus card, followed by compact facts and operational detail;
- restrained borders, shadows, and radii; no decorative dashboard clutter;
- readable text at human scale, with canonical IDs kept secondary.

The preview establishes hierarchy and tone. Runtime state, generated content, responsive reflow, empty states, and private-viewer behavior are verified against the implementation.

## Application chrome

- Brand: a simple original Temple mark, `Temple`, and `Workspace`.
- Primary destinations: Overview, Team, Work, Usage, Health, Activity.
- Local-only destinations: Human Inbox and Agent Commands, shown only on loopback.
- Wide-sidebar status card: current connection and transport summary.
- Main top bar: mobile Menu control, current destination context where needed, and a theme control.

Icons are custom inline SVG primitives authored for Temple. They must use `currentColor`, be `aria-hidden` inside a fully labeled button, and never carry meaning without the adjacent/accessible label.

## Layout contract

- `body` and `.app-shell` fill the viewport but never force a content-width cap.
- `.app-main` uses fluid padding with `clamp()`.
- `.content-wrap` is 100% wide, with container query support.
- Metrics use auto-fit columns with a readable minimum card width.
- Operational content uses a two-column default and may become three useful columns in an ultrawide container.
- Prose paragraphs retain a local maximum line length near 65 characters.
- Tables and data grids use their available panel, while cards retain bounded measure.

## Interaction contract

- View switching is immediate; only color, background, border, and short transform feedback may transition.
- Pointer hover styles are enabled only for fine pointers.
- Buttons use a subtle pressed scale; reduced-motion removes transforms.
- Theme control exposes the next action, for example `Switch to dark theme`.
- Mobile drawer traps the navigation experience through `aria-expanded`, an inert-looking backdrop, Escape handling, and focus return. It does not need a third-party dialog dependency.
- Team tabs retain roving tabindex and Arrow Left/Right, Home, and End behavior.
- Snapshot refresh never resets the current destination, Team tab, explicit theme, or drawer state unexpectedly.

## Responsive verification matrix

| Viewport | Sidebar | Expected composition |
| --- | --- | --- |
| 3440×1440 | labeled | fluid ultrawide columns; no centered 1180px island |
| 2560×1080 | labeled | wide operational composition with useful side context |
| 1440×1000 | labeled | two-column dashboard and organization side panel |
| 1024×1366 | icon rail | stacked main regions, labels accessible by title/ARIA |
| 768×1024 | icon rail | one-column main regions and responsive position cards |
| 390×844 | drawer | single-column content, no horizontal overflow |

## Required states

- current, stale, disconnected, and failed snapshot;
- private read-only and loopback full-access shell;
- all five configured teammates and all ten assigned roles;
- zero and nonzero active work;
- missing Token evidence;
- current and historical work;
- light and dark themes;
- legacy and new route hashes;
- drawer open/closed and keyboard access.

## Visual acceptance

- The page reads as a product for people, not as an AI debugging document.
- The operator can explain what each primary destination contains from its label and icon.
- The 34-inch ultrawide view uses horizontal space for operational comparison, not empty margins or stretched prose.
- Mobile navigation is discoverable without converting the primary destinations into a long horizontal scroller.
- Both themes feel like the same Temple Workspace and preserve state meaning.
