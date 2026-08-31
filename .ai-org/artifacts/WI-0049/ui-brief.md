# UI design brief: human-readable status and disclosure

## Ownership and delivery mode

- Owner Position: UI Designer
- Delivery mode: `code-first`
- Selected medium: the executable Temple Workspace HTML/CSS/JavaScript
- Rationale: this is a bounded refinement of an approved dark Workspace shell. The interaction is low risk, native `details` behavior can be reviewed directly, and runtime responsive evidence is more useful than a separate static mockup.

## Visual direction

Keep the existing black-and-charcoal engineering aesthetic. Reduce system-status chrome in the healthy state and increase the visibility of the actual interaction:

- A quiet, right-aligned last-updated line replaces the green success banner.
- Each Work Item summary uses a structured three-part row: identity, status, disclosure affordance.
- A small chevron and explicit text make expansion obvious.
- Technical metadata is visually secondary and nested.
- Waiting and planned inventory are separate, labeled disclosures rather than one ambiguous mixed queue.

## States

| State | Presentation |
|---|---|
| Loading | Quiet `Loading current data…` metadata; actions unavailable |
| Current | `Last updated <time>` only |
| Stale | Prominent warning plus last successful update when known; actions unavailable |
| Work Item collapsed | ID, title, human status, chevron, `View details` |
| Work Item expanded | Same summary with rotated chevron and `Hide details`; human detail first, technical detail nested |
| Empty group | Short human empty state |

## Interaction and accessibility

- Use native `details` and `summary` so pointer, Enter, and Space behavior is preserved.
- The whole summary is the disclosure target; the affordance explains the behavior but is not a competing nested button.
- Preserve focus-visible treatment.
- Rotate only the chevron, approximately 130–160 ms; remove the transition under `prefers-reduced-motion`.
- Keep labels usable on a 34-inch wide display without capping the page to a fixed narrow width, and stack affordances cleanly on small screens.

## Review evidence

Browser review must cover wide desktop, tablet, and mobile widths, plus local and private read-only copy. A stale refresh must remain visibly distinct from the healthy metadata state.

