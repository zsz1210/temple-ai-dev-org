# WI-0148 Work Order

## Problem

The first README diagram already communicates Temple's layered operating model, but its visible title does not use the established `Temple Concept Layers` name. The second diagram uses software-specific wording and a single mandatory Release Gate path, which can imply that Temple hard-codes IT Positions and one workflow depth.

## Approved scope

- Rename the first README section and visible diagram title to `Temple Concept Layers`, with natural Japanese and Traditional Chinese labels.
- Keep the first diagram's layer structure and content unchanged apart from its title and subtitle hierarchy.
- Rename the second section to `One Work Item through Temple` and use domain-neutral reader language.
- Preserve canonical lifecycle terms as secondary labels rather than treating Tech Lead, Developer, or another Position as a fixed node.
- State that each step resolves responsibility, context, and execution separately.
- Show that workflow profile and risk determine review depth and closeout; do not imply every Work Item requires the same Release Gate.
- Keep current core Positions distinct from planned custom Positions and workflows.
- Do not publish or release.

## Acceptance criteria

1. English, Japanese, and Traditional Chinese READMEs remain structurally aligned and natural.
2. Desktop and narrow diagrams render without overlapping text, clipped labels, or ambiguous arrows.
3. The diagrams are accurate for software and non-software future Position configurations without claiming that custom Positions ship today.
4. Repository checks, link checks, SVG parsing, focused tests, and a real browser render pass.

## Design and risk review

The Concept Layers graphic remains a structural diagram. The Work Item graphic remains a sequence diagram, but uses outcome-oriented labels with canonical stage names in parentheses and a small route-resolution note. This keeps the two graphics complementary instead of duplicating architecture detail.

Risk is low: the change is documentation-only, reversible, and does not alter Temple lifecycle behavior or Provider execution.

