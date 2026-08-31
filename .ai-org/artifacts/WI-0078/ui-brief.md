# WI-0078 UI design brief

- Work item: `WI-0078`
- UI Designer Position owner: Yuna
- Agent Identity: `agent-yuna`
- Delivery mode: `code-first`
- Selected tool or medium: hand-authored, repository-owned SVG with Markdown integration
- Artifact paths: `docs/assets/temple-overview.en.svg`, `docs/assets/temple-overview.ja.svg`, `docs/assets/temple-overview.zh-TW.svg`
- Artifact revision: working tree until an exact candidate revision is created
- Approval record: not required before Build for code-first; the Human Principal approved the human-first direction in the initiating request

## Why this mode

The diagram is a low-risk, reversible documentation surface with no interaction, production behavior, external dependency, or expensive implementation path. Code-first permits the SVG itself to be the first visual artifact while retaining visual review, accessibility, localization, and narrow-width checks.

## Required surfaces and states

- Surfaces: the top-level English, Japanese, and Traditional Chinese GitHub READMEs.
- Content state: every language receives the same four-stage story and repository continuity rail.
- Missing-image state: localized alt text and nearby prose communicate the same core relationship.
- Theme variants: the self-contained composition must remain legible against both GitHub light and dark page backgrounds; theme-aware styling may refine the surface without becoming essential.
- Responsive variants: the image scales to the README column and remains understandable at approximately 736 px and 360 px rendered widths.
- Accessibility: meaning does not depend on colour; each stage has an icon, ordinal/story position, and text label; SVG contains localized `title` and `desc`; Markdown contains concise localized alt text.
- Motion: none.

## Visual direction

- Hierarchy and layout: one compact horizontal story with Temple visually emphasized at the centre; a repository rail below connects the work to durable truth; a subtle return curve communicates learning.
- Story stages: human direction → Temple coordination → people and AI working together → evidence-backed result.
- Components: editorial illustration, rounded stage fields, direct labels, simple original line icons, directional path, repository rail.
- Typography: native sans-serif stack; large plain-language stage titles; no code font or acronym-heavy labels.
- Colour: warm parchment-like surface, dark ink, Temple vermilion, calm teal, and restrained gold; labels and icon forms remain distinguishable without colour.
- Spacing: generous internal whitespace; no dense grid, legend panel, node graph, or nested architecture boxes.
- Imagery constraints: original SVG geometry only; no copied artwork, generated raster text, external fonts, icon libraries, scripts, or remote resources.
- Product convention: preserve Temple's restrained, evidence-first tone while avoiding the Management Console's dark operator-dashboard styling.

## Implementation handoff

- Required design evidence: this brief, required-state coverage, research note, and final rendered visual-review record.
- Mapping: each localized SVG uses identical geometry and localized title, description, stage labels, and repository rail copy; each README embeds only its matching asset.
- Known ambiguity: GitHub's exact image width depends on viewport and browser. Keep labels short and treat nearby prose as the accessible detailed explanation.
- Runtime visual-review method: parse every SVG with `xmllint`; render representative PNGs locally; inspect desktop and narrow captures; inspect the README in a browser-compatible Markdown rendering when available.
- Visual acceptance: first-glance story is clear, Temple is central but not portrayed as autonomous authority, people and AI are both visible, repository continuity is explicit, and no text or path clips at the canvas edge.
