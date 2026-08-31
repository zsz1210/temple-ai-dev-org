# WI-0078 technical design

- Tech Lead: Tidus
- UI direction: `.ai-org/artifacts/WI-0078/ui-brief.md`
- Product direction: `.ai-org/artifacts/WI-0078/product-direction.md`

## Asset design

Create three SVG 1.1-compatible assets under `docs/assets/` with one shared composition and localized content:

- `temple-overview.en.svg`
- `temple-overview.ja.svg`
- `temple-overview.zh-TW.svg`

Each file uses a `960 × 500` view box and contains:

1. a warm self-contained background surface;
2. four illustrated story stations: human direction, Temple coordination, collaborative execution, and trusted delivery;
3. one continuous directional path, labelled through position and copy rather than a technical legend;
4. a repository continuity rail for decisions, work, code, tests, and evidence;
5. a light return path from verified outcomes toward Temple learning;
6. localized SVG `title` and `desc` elements.

The Temple station is larger than its peers and uses five short plain-language capability labels. The other stations use large labels and recognisable original icons. No external image, font, JavaScript, CSS file, icon package, or generated bitmap is referenced.

## Theme and responsive behavior

- The illustration owns its background so it remains intentional on both light and dark GitHub pages.
- An internal `prefers-color-scheme` rule may adjust the surface and ink colours, but no essential contrast depends on the media query being honoured.
- `viewBox` scaling and percentage-width Markdown embedding avoid horizontal scroll.
- Primary labels carry the story at narrow widths. Small secondary labels are duplicated in nearby localized prose and alt text rather than being the only source of meaning.

## README integration

Keep the same section order and meaning in all three README files:

1. current hero, promise, badges, and Early Alpha boundary;
2. new `From intent to trustworthy software` overview image and explanatory sentence;
3. current `Why Temple?` explanation, shortened only when the visual makes copy redundant;
4. new `A request through Temple` representative path;
5. current audience and assignment-based scaling sections;
6. current Quick start plus a short `What initialization adds` explanation;
7. new `What is ready today?` maturity table;
8. current learning, evidence, authority, documentation, and license sections with direct contribution and security links.

Remove the Mermaid block that currently acts as the README's only overview. Keep the full lifecycle and six framework layers in existing deep documentation.

## Verification

- Parse all SVG files with `xmllint --noout`.
- Confirm the localized labels fit by rendering each SVG to PNG and inspecting them.
- Generate desktop and narrow README renderings when the local Markdown/browser path permits it; otherwise inspect the scaled SVG assets directly at representative widths and record the limitation.
- Run the repository's document-link checks through `npm run verify`.
- Compare the three heading sequences and intended capability statements.
- Confirm the diff contains no Console implementation, dependency, package, lockfile, architecture, or product-overlay change.
