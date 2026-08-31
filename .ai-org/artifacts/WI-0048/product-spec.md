# Product specification — WI-0048

## Problem

Temple Workspace is now human-facing and responsive, but the current warm green-led visual identity does not match the requested engineering-tool character. Team shows correct Agent and Position data but requires the operator to infer the operating structure from directories. Temple's overall system boundaries are described in prose but do not yet have one concise architecture diagram.

## User outcome

An operator should be able to open Temple Workspace and immediately recognize a calm engineering workspace, understand how responsibility is divided, inspect which Agent currently carries each Position, and find a version-controlled explanation of how Temple coordinates authority and execution.

## Product behavior

### Visual language

- Charcoal black and neutral gray are the primary background and surface colors.
- Teal is reserved for current selection, healthy connectivity, and verified positive state.
- Amber is reserved for attention, red for failure, and blue for assurance separation or informational emphasis.
- Prose remains in the normal interface typeface. Monospace is limited to identifiers, revisions, models, Token values, and concise machine state.
- Dark presentation is the default and primary baseline. Light presentation may remain as an optional preference and must preserve the same hierarchy.

### Team operating structure

- Team opens with a position-first responsibility map, not a conventional reporting tree.
- Current responsibility lanes are Product & Experience, Engineering Delivery, and Assurance & Release.
- Every active Position appears exactly once in the map and shows its current assigned Agent Identity.
- The lanes and role ordering are presentation metadata derived from stable Position IDs; Agent names and assignment counts come from the canonical organization snapshot.
- Selecting one active Agent highlights every Position currently assigned to that Agent and de-emphasizes unrelated Positions. Selecting All restores the complete map.
- The existing Agent-oriented directory remains available as a secondary Team mode for detailed work and expertise inspection.
- Developer and Independent QA remain visibly separate responsibilities held by different Agent Identities.

### System architecture documentation

- The architecture document includes a concise diagram showing Human Principal authority, Temple Workspace and CLI boundaries, repository authority, Position and Agent execution, Codex tasks, external tracker projections, usage and health, and learning and retrieval.
- Repository files and Git evidence remain canonical. Workspace, generated views, telemetry, Codex tasks, and external trackers do not become lifecycle authority.
- The diagram is documentation, not proof that an optional integration is configured.

## Responsive behavior

- Wide screens retain the labeled sidebar and use horizontal space without stretching prose.
- Tablet retains the semantic icon rail.
- Mobile retains the accessible drawer and stacks responsibility lanes without horizontal overflow.
- Team remains understandable at 320 CSS pixels without relying on hover.

## Exclusions

- No runtime dependency on `visualize`, Mermaid, Figma, a graph library, or a remote service.
- No new Architecture primary destination in this Work Item.
- No change to Agent or Position authority, lifecycle policy, command gateway, provider, tracker, Token, model-routing, or release behavior.
- No public hosting, push, publication, closeout, or release.

## Acceptance source

The authoritative acceptance criteria remain on `.ai-org/work-items/WI-0048.json`. The approved visual direction is `UI-0002@ui-1` with `.ai-org/artifacts/WI-0048/preview-review.md` as the human review record.
