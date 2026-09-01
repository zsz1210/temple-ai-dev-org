# WI-0080 Documentation Design and Risk Review

- Position: Tech Lead
- Agent Identity: Tidus (`agent-tidus`)
- Base revision: `53d3ab69dcb228c3e7eb0466febff86c1b7a591d`
- UI delivery mode: `not-applicable`

## Technical design

### README implementation

Use standard GitHub Markdown and the small subset of HTML already supported by the existing README files:

- centered product title, category, promise, language links, and badges;
- normal Markdown headings, paragraphs, tables, lists, notes, code fences, and relative links;
- no custom CSS, script, landing-page buttons, application chrome, or generated HTML dependency;
- one localized SVG embedded through ordinary Markdown immediately after the plain-language introduction.

All three README files use identical section order and equivalent capability claims:

1. Product header and short navigation.
2. What Temple is.
3. Compact operating-model diagram.
4. Three operating principles.
5. One request path.
6. Profile chooser.
7. Minimal terminology and responsibility model.
8. Quick start.
9. Maturity boundaries.
10. Goal-oriented documentation links, authority boundary, and license.

### Diagram implementation

Replace the three existing `docs/assets/temple-overview.*.svg` files with localized variants of one shared C4-inspired system-context geometry and styling contract:

- `viewBox="0 0 960 620"` and no fixed pixel width or height;
- light and dark color variables through `prefers-color-scheme`;
- language-appropriate font fallback stacks;
- the Human Principal at the left, a central Temple framework boundary, and human-and-AI executors at the right;
- four internal mechanisms that group Temple's six concerns into organization and authority, work and context, coordination and delivery, and verification and learning;
- a project repository below the framework boundary showing the two-way relationship between recovering current truth and writing traceable records;
- restrained system-diagram notation: explicit boundaries, boxes, directional relationships, no decorative icons, gradients, or shadows;
- font sizes and label lengths chosen to remain readable when GitHub scales the image to README width.

The diagram is an explanatory product overview. The Archify topology under WI-0079 remains the deeper engineer-facing architecture view.

This shape follows the reader-approved candidate in `diagram-candidates/temple-overview-c4.zh-TW.svg`. It borrows the C4 System Context idea of one system boundary surrounded by people and durable external context, but it is not presented as a formally compliant C4 model. `diagram-candidates/research-notes.md` records the notation research; no diagram vendor or optional dependency is added.

### Terminology implementation

- Explain concepts in ordinary prose before presenting canonical Temple names.
- Introduce only Position, Agent Identity, Work Item, and Evidence in the README terminology section.
- Keep Human Principal, Discipline, authority grants, projections, Integration Owner, and detailed lifecycle vocabulary in linked documentation unless required for a truthful profile boundary.
- Keep commands, file paths, status/profile IDs, product names, and schema-facing identifiers unchanged.

## Risk review

| Risk | Mitigation and verification |
|---|---|
| Temple is reduced to multi-Agent context management | Lead with the development-organization promise and group all six framework concerns into four understandable project-local mechanisms. Use session fragmentation only as one example. |
| README becomes another landing page | Use only GitHub-renderable Markdown/HTML and normal document hierarchy. |
| Translation drifts or reads unnaturally | Preserve one shared information hierarchy; write Japanese and Traditional Chinese independently with localized prose and stable identifiers. |
| Capability claims overstate Alpha maturity | Retain explicit current, bounded/experimental, and unverified categories from canonical Vision, Roadmap, and validation records. |
| Diagram is unreadable on mobile or dark mode | Render every localized SVG at desktop and narrow widths in light and dark themes; reject clipping or illegible labels. |
| Links or setup instructions drift | Run repository link checks and the full `npm run verify`; exercise the documented local verification commands already used by the project. |
| Existing WI-0079 work is overwritten | Limit writes to WI-0080 declared paths and canonical evidence; inspect the final diff by path before handoff. |

## Verification plan

1. Structural comparison of all three README headings and linked targets.
2. CJK/English language-policy check through repository verification.
3. SVG parse and render checks for three assets in light and dark themes.
4. Desktop and narrow-width screenshot inspection of the actual Markdown render or an equivalent GitHub-style renderer.
5. `npm run verify`.
6. Independent QA review under `agent-lulu`, distinct from Developer `agent-rikku`.
