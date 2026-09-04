# WI-0146 documentation design

## Reader path

The README should answer, in order:

1. What problem Temple addresses.
2. What system Temple adds to a project.
3. How one change moves through it.
4. How to try it in one project.
5. How it scales and extends.
6. What is proven, experimental, and not yet claimed.

Deep implementation detail remains in `docs/`.

## Diagram hierarchy

### README: Temple layers

One compact stack shows Human Direction above six human-readable concerns and repository-backed memory below them. Context Routing and Adaptive Execution Routing are visibly separate mechanisms inside Guidance.

The README uses localized desktop and mobile SVG variants so labels remain readable rather than shrinking one wide canvas.

### Architecture: three routes

A second English-only diagram shows three separate decisions:

- Responsibility Route: who may own the step.
- Context Route: what the selected Position needs to read.
- Adaptive Execution Route: how the bounded step should be attempted.

Provider observations feed evidence and reviewed calibration. They do not silently rewrite project policy, complete a Work Item, or grant authority.

## Visual rules

- Use a compact dark neutral surface with restrained blue, teal, and amber accents.
- Use explicit spacing and hand-authored SVG geometry; do not depend on Mermaid layout in README assets.
- Keep labels at readable sizes and provide separate narrow compositions.
- Use no decorative arrows where grouping and alignment communicate the relationship.

## Risk review

This is a reversible documentation-only change. Primary risks are inaccurate capability claims, translation drift, broken links, and unreadable responsive diagrams. Mitigations are evidence-bounded wording, aligned section structure, SVG validation, responsive inspection, and the full repository verification suite.

