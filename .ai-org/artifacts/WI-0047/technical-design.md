# Technical design — WI-0047

## Architecture decision

Keep the current dependency-free server-rendered document and snapshot runtime. Refactor only presentation contracts inside `renderControlPlaneDashboard`: static shell markup, CSS tokens and responsive rules, route aliases, theme state, and mobile navigation state. Do not change provider data, Observer schemas, API endpoints, mutation paths, or server binding behavior.

## Public routes and internal views

The DOM and renderer keep their stable internal view IDs to minimize behavioral risk. A client-side route table maps human-facing hashes to those IDs:

```text
overview → now
team     → organization
work     → execution
usage    → usage
health   → system
activity → history
```

Legacy hashes map to the same internal views and are normalized with `history.replaceState`. Loopback-only `inbox` and `commands` remain unchanged. View buttons continue carrying internal targets so current render and jump logic remain stable.

## Theme tokens

Introduce one semantic token set for background, panels, subtle surfaces, sidebar, borders, text, status colors, accent, input surfaces, and shadows. Light is the CSS default; `[data-theme="dark"]` overrides the same tokens.

An early head script chooses:

1. a valid `temple-workspace-theme` local-storage preference;
2. otherwise the current `prefers-color-scheme` result.

The later client script owns the theme button, accessible action label, explicit persistence, and visual icon state. No server or canonical state changes.

## Navigation shell

- Add original inline SVG icons using only simple Temple-authored paths and primitives.
- Keep full labeled navigation at `>=1200px`.
- Override the shell to a 76px rail from `760px` through `1199px`, hiding only visual labels.
- At `<760px`, position the sidebar off canvas and expose it through a Menu button, backdrop, Escape handler, and focus return.
- Keep the existing sidebar connection card on wide screens; compact modes use the main connection status.
- Use `@media (hover:hover) and (pointer:fine)` for hover-only affordances and reduced-motion rules for transitions.

## Fluid workspace

- Remove `.content-wrap`'s `1180px` maximum and set it to full width.
- Use `clamp()` for main padding and mark the content/view regions as inline-size containers.
- Use auto-fit metric and teammate grids.
- Use responsive grid columns below 1100px and add meaningful third-column capacity only in wide containers.
- Keep local readable measures on headings and prose.
- Preserve `min-width:0`, responsive Work Item summaries, and semantic position-card fallback.

## Presentation compatibility

Update visible labels and documentation while preserving canonical technical labels where traceability matters. Tests assert new product language, semantic icon markup, route aliases, responsive contract, and theme behavior. Existing redaction, command draft, refresh coalescing, and provider tests remain regression gates.

## Risk review

- **Old bookmarks break:** mitigated by legacy hash aliases and automatic normalization.
- **Theme flashes or diverges:** mitigated by the early head script and a single token contract.
- **Light theme reveals hardcoded dark surfaces:** mitigated by overriding all shell, panel, form, work, usage, organization, and state surfaces with semantic tokens, followed by visual QA in both themes.
- **Mobile drawer traps or loses focus:** mitigated by explicit expanded state, Escape/backdrop close, destination-close, and focus return.
- **Tablet icons become ambiguous:** mitigated by `aria-label`, `title`, accessible label text, and stable semantic icons.
- **Ultrawide becomes stretched prose:** mitigated by local text measures and content grids rather than a global page cap.
- **Privacy or command authority drifts:** mitigated by no data/API change and the complete existing private-viewer and inbox regression suite.
- **A UI library silently becomes required:** mitigated by no dependency or vendored source change.

## Verification

1. Focused rendering, Inbox, live, and private-viewer tests.
2. Full `npm run verify` on the implementation candidate.
3. Playwright checks at 3440×1440, 2560×1080, 1440×1000, 1024×1366, 768×1024, and 390×844.
4. New and legacy route navigation, theme persistence, drawer keyboard behavior, Team tab keyboard behavior, console errors, and horizontal overflow.
5. Fresh independent QA against the exact committed candidate.

No migration, provider, dependency, external write, public listener, release, or publication action is required.
