# UI design responsibility and delivery modes

UI design is always owned, but a separate pre-implementation visual artifact is required only when project risk, collaboration cost, or visual sensitivity justifies it.

## UX and UI are separate responsibilities

| Position | Owns | Does not certify |
|---|---|---|
| UX Designer | User flow, information and interaction structure, behavioral states, usability risk, and copy decisions | Implementation quality or release |
| UI Designer | Visual hierarchy, layout, component treatment, design-system guidance, visual states, and UI delivery mode | Implementation quality or release |

In the lean five-Identity configuration, one Product Design Agent Identity holds Product Manager, UX Designer, and UI Designer. A larger project may split those Positions later.

## Delivery modes

### Code-first

Use for low-risk features, exploratory interfaces, internal tools, and inexpensive iteration.

- No separate mockup is required before implementation.
- Record a concise UI brief and required states.
- Follow approved product, platform, and design-system conventions.
- Inspect the executable result and preserve runtime visual-review evidence.

Code-first means implementation is the first visual artifact. It does not mean visual design, accessibility, state coverage, or review is optional.

### Preview-first

Use when layout, interaction direction, or stakeholder understanding should be confirmed before full implementation.

- Produce a wireframe, SwiftUI Preview, Storybook story, HTML prototype, partial Figma design, or equivalent artifact.
- Review required states and important variants.
- Record feedback and the artifact revision.
- Compare the executable result with the accepted preview.

### Design-led

Use for brand-sensitive surfaces, expensive rework, design-system changes, multi-team delivery, or high visual and accessibility risk.

- Use an approved and versioned design source.
- Define components, tokens, states, responsive variants, accessibility, and motion where relevant.
- Record approval and implementation mapping.
- Treat implementation review as verification against the design source, not as approval inferred from the artifact's existence.

## Tool policy

Choose the lightest tool that can produce the required evidence. The framework does not require Figma. Tools and media may include Figma, native code previews, Storybook, browser prototypes, annotated screenshots, or Markdown UI specifications.

Tool choice does not change Position ownership, user authorization, or release gates. A design artifact is evidence and input; it is not proof that the implementation matches it.

## Current alpha boundary

This release installs the UI Designer Position, the machine-readable delivery-mode policy, and a UI design-brief template. Selection is recorded in the project-owned brief. Project-level defaults, work-item overrides in canonical JSON, Figma adapters, design-token synchronization, and automated visual-regression integration remain planned capabilities.
