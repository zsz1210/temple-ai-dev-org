# WI-0079 visual review

## Deterministic result

- Diagram type: `architecture`
- Quality profile: `showcase`
- Validation: `9/9` checks passed
- Composition: `0` errors, `0` warnings
- Specification SHA-256: `166f79a6d03e05a145fe379e82139161a8a6a45c1e1144b03da491c65f96d081`
- Delivered artifact SHA-256: `f78a59f13fc42fcdd3c167df6472e266925d46e7ba409a792a38f5d6eba4092f`
- Correction rounds: `2`

## Desktop inspection

Archify's `visual-check` passed containment at 1440×900, 1600×1000, 1920×1080, and 2048×1320. At all four sizes, `scrollWidth` equaled `innerWidth` and `scrollHeight` equaled `innerHeight`. Light and dark screenshots at 1440×900 and 2048×1320 were inspected.

Observed desktop result:

- the six-node primary delivery path reads left to right;
- the context-recovery route stays in the upper corridor without crossing a node;
- the external provider stops at the Observer projection;
- repository authority is visually distinct from delivery assurance;
- node, boundary, relationship, and card text remain inside their containers;
- no visible line crossing, clipped label, ambiguous corridor, or conspicuous empty lower band blocks comprehension.

Desktop visual review: `passed`.

## Narrow inspection

A real Chromium session at 390×844 was checked in both light and dark themes.

- `innerWidth`: `390`
- `scrollWidth`: `390`
- `scrollHeight`: `1139`
- horizontal page overflow: none
- vertical page scrolling: expected and present
- console: one irrelevant local-server `favicon.ico` 404; no artifact runtime error

The narrow viewer is contained but is not a strong at-a-glance engineering map: the left edge of the theme control is visibly clipped, only two guided-view chapters fit in the first row, and the full nine-node topology is not visible at once inside the diagram viewport. The underlying semantic controls and all nodes remain present in the accessibility snapshot, but that does not repair the visual first impression.

Narrow visual review: `failed` for README-style at-a-glance use.

## Decision consequence

The current HTML is suitable as a desktop interactive architecture preview and is useful for judging the content model. It should not be promoted directly as the README visual. If the owner accepts the architecture content, a later authorized slice should export or create a static full-diagram SVG, verify that artifact separately at narrow width, and then decide README versus architecture-document placement.

Overall visual review: `failed` because the Work Item explicitly included narrow-width review. This is a truthful Design finding, not a failed Archify deterministic validation.
