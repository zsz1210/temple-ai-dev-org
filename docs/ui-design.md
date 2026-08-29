# UI design responsibility and delivery modes

When a work item has a user-facing interface, UI design is always owned. A separate pre-implementation visual artifact is required only when project risk, collaboration cost, or visual sensitivity justifies it. Work without a user-facing interface records `not-applicable` and does not manufacture UI evidence. A new Work Item may remain undecided during intake and specification, but it must record one of the four outcomes before Build.

## UX and UI are separate responsibilities

| Position | Owns | Does not certify |
|---|---|---|
| UX Designer | User flow, information and interaction structure, behavioral states, usability risk, and copy decisions | Implementation quality or release |
| UI Designer | Visual hierarchy, layout, component treatment, design-system guidance, visual states, and UI delivery mode | Implementation quality or release |

In the lean five-Identity configuration, one Product Design Agent Identity holds Product Manager, UX Designer, and UI Designer. A larger project may split those Positions later.

## Delivery modes

### Not applicable

Use for backend, command-line, library, migration, or infrastructure work with no user-facing interface.

- No UI brief or visual artifact is required.
- The explicit mode prevents missing UI work from being confused with genuinely UI-free scope.
- If scope later adds an interface, select one of the three interface delivery modes before implementation.

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

Figma is one example, not a privileged format. In code-first delivery the executable implementation is the first visual artifact; the AI holding UI Designer responsibility may propose that first version within the approved product scope, UX flow, platform conventions, design system, accessibility requirements, and human approval policy.

The selected UI delivery mode and the identity of its UX, UI, and technical contracts become part of the delivery baseline at Build. They cannot be removed or changed to a lighter mode while that Work Item remains in Build or later states. An approved current revision of the same contract ID may be repinned; a different contract or materially different interface scope requires stopping and replanning before implementation continues.

## Current alpha boundary

This release installs the UI Designer Position, the machine-readable delivery-mode and evidence policy, a UI design-brief template, Work Item mode and contract references, lifecycle evidence gates, and status/doctor/context observation. Project-level defaults, design-source adapters, design-token synchronization, and automated visual-regression integration remain planned capabilities.
