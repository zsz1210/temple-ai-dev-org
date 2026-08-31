# WI-0078 diagram and README research

## Reader and question

The primary reader is evaluating Temple from its GitHub landing page. The first visual must answer four questions without requiring agent-engineering vocabulary:

1. Who decides the direction?
2. What does Temple coordinate?
3. Who performs the work?
4. Why can the result be trusted and continued later?

## Sources reviewed

- [C4 System context diagram](https://c4model.com/diagrams/system-context): start with the big picture; foreground people, roles, and systems rather than technologies or protocols; the intended audience includes non-technical readers.
- [C4 notation guidance](https://c4model.com/diagrams/notation): diagrams should mostly stand alone, relationships should be understandable, colour must not carry meaning by itself, and a context view does not have to use conventional blue-and-grey boxes.
- [C4 diagram levels](https://c4model.com/diagrams): use only the zoom levels that add value for the intended audience; do not force every architectural level into one entry-point diagram.
- [GitHub documentation style guide](https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide#alt-text-for-diagrams-and-graphs): every image needs meaningful alt text, while the surrounding page explains the information conveyed by the diagram.
- [GitHub Markdown image guidance](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#images): keep repository images on relative paths; GitHub also supports the `picture` element when separate presentation variants are necessary.
- Public README examples from [n8n](https://github.com/n8n-io/n8n), [OpenHands](https://github.com/OpenHands/OpenHands), [Pydantic AI](https://github.com/pydantic/pydantic-ai), and [Supabase](https://github.com/supabase/supabase) were reviewed for entry-point hierarchy, visual restraint, quick-start placement, and links to deeper documentation. Their artwork and layouts are not copied.

## Archify assessment

The user-provided [Archify repository](https://github.com/tt-a1i/archify) is directly relevant to Temple's deeper technical documentation. Its typed JSON intermediate representation, deterministic validation, and architecture, workflow, sequence, data-flow, and lifecycle outputs fit evidence-backed technical communication. Upstream currently identifies `v2.16.0` as stable and distributes the project under MIT.

Temple already has an accepted optional-adapter boundary for Archify, pinned to `v2.15.0` at commit `e1ac748f19cf805e44bf74fb93c796662152e273`. The local status is `not_installed`, which is a valid safe state. This Work Item does not install, execute, vendor, or update Archify because:

- the README hero is a human-facing product story rather than a technical topology;
- the three localized static SVGs need no renderer, runtime, update check, or vendor-specific source format;
- the current upstream stable release is newer than Temple's reviewed pin and therefore requires a separate version, license, provenance, and test review before adoption;
- Archify's renderer chrome supports `en` and `zh-CN`, while this README also requires Japanese and Traditional Chinese presentation;
- an optional technical-visualization tool must not become a prerequisite for understanding or operating Temple.

Decision: retain Archify as the preferred candidate for a separately authorized pilot involving deep architecture or workflow documentation. Apply its verifiability principles here, but keep the README overview original, static, repository-owned, and dependency-free.

## Applied direction

Use an editorial product-story illustration rather than a component diagram:

`Human direction → Temple coordinates → People and AI work → Verified result`

A repository rail runs beneath the story to show that decisions, work, code, tests, and evidence remain available across tasks. A return path indicates learning without turning the graphic into a dense engineering loop.

The Temple panel uses plain-language responsibilities:

- clear roles;
- shared context;
- bounded work;
- independent checks;
- learning.

The five agent-engineering terms from the referenced Threads post remain useful diagnostic vocabulary, but they are not used as the README's primary visual hierarchy. Graph execution is optional and proportional, not the required final stage of every Temple project.

## Visual and implementation constraints

- Original vector geometry and icons only; no copied illustration, external font, or icon dependency.
- One common composition with localized text in three repository-owned SVG files.
- Warm, approachable palette with text and shapes that remain distinct without colour alone.
- Theme-responsive SVG variables for GitHub light and dark appearance.
- `viewBox`-based scaling, short labels, and minimum practical text size for narrow README rendering.
- SVG title and description plus localized Markdown alt text and nearby prose.
- No animation, script, remote resource, raster-only text, or vendor-specific source format.

## README information hierarchy

1. Name, promise, maturity boundary.
2. Human-facing overview visual.
3. Why Temple exists.
4. One representative request-to-release path.
5. Audience and scaling model.
6. Quick start and what initialization adds.
7. Shipped, experimental, and planned boundary.
8. Learning, evidence, authority, deeper documentation, contribution, and security.

The README remains an entry point. Complete layers, schemas, workflow requirements, validation history, and implementation details stay in focused documents.
