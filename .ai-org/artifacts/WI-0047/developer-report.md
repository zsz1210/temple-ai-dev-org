# Developer report — WI-0047

- Candidate revision: `b6bbe09e430d4f40c98dd0a581a25b2e2c6b6e88`
- Developer: Rikku (`agent-rikku`)
- Decision: ready for Test

## Change

The private browser surface is now presented as **Temple Workspace**. Primary navigation uses Overview, Team, Work, Usage, Health, and Activity with original semantic inline SVG icons. Canonical Work Item, Agent Identity, Position, provider, and model identifiers remain available where they provide traceability, but the primary copy is written for a human operator.

The page now supports a labeled wide sidebar, a 76px tablet icon rail, and a mobile drawer with Menu, backdrop, Escape handling, focus return, `aria-expanded`, `aria-hidden`, and `inert` state. Old route hashes normalize to the new public hashes.

The fixed `1180px` content cap is removed. Content is container-aware and uses meaningful additional columns on wide displays while keeping local prose measures readable. A system-aware light/dark theme can be changed explicitly and persists only in browser local storage.

No data source, provider, API route, redaction rule, command authority, external integration, or dependency changed.

## Verification

- Focused Control Plane tests: 35/35 pass.
- Full repository verification: 223/223 pass, including repository and documentation link checks.
- Browser console: zero errors and zero warnings after the current server was loaded.
- Viewports with zero document-level horizontal overflow: 3440×1440, 2560×1080, 1440×1000, 1024×1366, 768×1024, and 390×844.
- Wide-content measurements: 2200px content at 2560px and 3080px content at 3440px, compared with the removed 1180px cap.
- Team: five configured teammates and ten canonical roles; role switching works by click and Arrow Left/Right with roving focus.
- Theme: explicit dark selection persisted across reload; light and dark screenshots were reviewed.
- Mobile: drawer closed state is inert and hidden from assistive interaction; opening moves focus to Close navigation; Escape closes and returns focus to Menu.
- Legacy routes: `#now` normalized to `#overview`; `#organization` normalized to `#team` with the correct visible internal view.
- Private viewer: no Inbox or Agent Command navigation or mutation surface is rendered.

## Runtime evidence

- `.ai-org/artifacts/WI-0047/runtime-1440-light.png`
- `.ai-org/artifacts/WI-0047/runtime-1440-dark.png`
- `.ai-org/artifacts/WI-0047/runtime-2560-dark.png`
- `.ai-org/artifacts/WI-0047/runtime-390-drawer-dark.png`

## Boundaries retained

This change does not add remote commands, model selection, automatic routing, Token time-series data, monetary cost, public hosting, external tracker writes, cross-repository portfolio navigation, SRE/Security production telemetry, release, push, or publication.
