# WI-0060 UI design brief

- Work item: `WI-0060`
- UI Designer Position owner: `ui_designer`
- Agent Identity: `agent-yuna` (Yuna)
- Delivery mode: `code-first`
- Selected medium: existing Temple Workspace HTML/CSS/JavaScript
- Artifact path: `src/control-plane-dashboard.mjs`
- Governing visual contract: `UI-0002@ui-1`
- Separate preview approval: not required for this low-risk card extension

## Why this mode

The Team surface, dark engineering visual language, card system, responsive shell, and human-facing information hierarchy are already approved. The new content is a bounded telemetry summary inside an existing Agent card, so executable code with focused runtime visual review minimizes rework without weakening evidence requirements.

## Required surfaces and states

- Surface: Team → Teammates → each active Agent card.
- States: active observed model, last observed model, requested-only model, and no observation.
- Evidence difference: requested and effective values must not visually collapse into one claim.
- Responsive variants: fluid wide desktop, tablet/icon-rail layout, and one-column mobile cards.
- Accessibility: text labels carry meaning without relying on color; timestamps and provenance remain readable; no new focusable control is introduced.
- Motion: none required.

## Visual direction

- Place the model panel below role chips and above work/expertise metadata.
- Use one quiet eyebrow label, a prominent model name, and restrained provenance lines.
- Use the existing cyan/green/amber semantics sparingly; unknown remains neutral.
- Preserve compact cards and allow long model/task identifiers to wrap rather than truncate essential evidence.

## UI craft review

| Before | After | Why |
|---|---|---|
| Model evidence is visible only after navigating to Work or Usage. | Each teammate card answers the model question in place. | Reduces navigation and binds execution evidence to the human teammate view. |
| A reader could mistake a configured Agent for an online model-backed worker. | Status labels distinguish Active, Last observed, Requested, and No observation. | Prevents the interface from overstating runtime truth. |
| Requested and effective model details are scattered in technical views. | A differing requested model appears as secondary provenance. | Preserves an important diagnostic difference without dominating the card. |

## Implementation handoff

- Required evidence: this brief, automated state-resolution tests, full repository verification, and browser screenshots at wide desktop/tablet/mobile.
- Mapping: one deterministic resolver consumes the bounded snapshot; Agent cards render its returned state.
- Known ambiguity: older Codex-host-owned tasks may not contain model metadata and must remain unknown.
- Runtime visual-review method: Playwright against the private LAN viewer and loopback snapshot as available.
- Visual acceptance: all four truth states remain legible; no card overflow; no private mutation UI appears.

