# Work order — WI-0047

## Outcome

Turn the current management surface into **Temple Workspace**: a clear, human-facing place to understand the AI development organization, current work, resource evidence, operating health, and history.

## Why now

The previous slice made organization data visible, but the shell still reads like an internal system console. Numeric navigation, system-centric destination names, a dark-only presentation, and a fixed `1180px` content cap make the product harder to understand and waste most of an ultrawide display. The user approved a calmer human-first direction with enterprise information density before implementation.

## Authorized scope

- Use `Temple Workspace` as the visible product identity while retaining `Temple AI Development Organization Framework` for repository and deep-documentation identity.
- Rename the primary destinations to Overview, Team, Work, Usage, Health, and Activity.
- Replace numeric prefixes with original semantic inline SVG icons and accessible labels.
- Use a labeled sidebar on wide screens, an icon rail on tablet widths, and an accessible drawer on mobile.
- Add system-aware light and dark themes with an explicit local preference.
- Remove the narrow global content cap and make dashboard composition fluid on ultrawide, desktop, tablet, and mobile screens.
- Preserve canonical data, bounded projections, current refresh behavior, private-viewer redaction, and loopback-only command surfaces.
- Update focused tests and human-facing operations documentation.

## Explicit exclusions

- No framework migration, UI dependency, icon package, copied shadcn source, or vendored component library.
- No provider, model-routing, token-accounting, mutation-authority, external-tracker, public-hosting, release, push, publication, or open-source-preparation change.
- No change to Agent Identity, Position, Assignment, or project-overlay ownership.

## Coordination

WI-0047 is the sole sequential editor for the declared UI, test, and documentation paths. Earlier overlapping Work Items are retained as verified predecessors or review context. Mog is the Integration Owner.

## Stop condition

Stop after one exact candidate passes focused tests, full verification, multi-viewport browser evaluation, and independent QA. Leave WI-0047 unclosed at Release Gate and keep the live viewer private.
