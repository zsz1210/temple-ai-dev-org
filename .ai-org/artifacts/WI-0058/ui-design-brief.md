# UI design brief

- Work item: `WI-0058`
- UI Designer Position owner: UI Designer
- Agent Identity: Yuna (`agent-yuna`)
- Delivery mode: `code-first`
- Selected tool or medium: existing executable Temple Workspace Usage view
- Artifact path or URL: `src/control-plane-dashboard.mjs`
- Artifact revision: exact Developer candidate, to be recorded after Build
- Approval record, when required: `.ai-org/artifacts/WI-0058/human-approval.md`

## Why this mode

The information architecture, dark engineering visual language, responsive shell, and Usage composition already have approved UI contracts. This change adds evidence provenance copy and a partial-history warning to an existing surface; it does not introduce a new flow or visual system. A separate mockup would add more coordination cost than risk reduction, while runtime review remains required.

## Required surfaces and states

- Surface: Temple Workspace `Usage` view.
- Success: totals visibly include valid archived observations and explain how many were restored.
- Active-only: no archive claim is shown.
- Partial: skipped or conflicting history is clearly described without exposing paths or payloads.
- Empty: existing unknown-not-zero guidance remains intact.
- Responsive variants: current wide, tablet, and mobile Usage layouts remain usable.
- Accessibility: provenance and warnings use text, not color alone; existing semantic headings and readable contrast remain.
- Motion: no new motion.

## Visual direction

- Preserve the existing dark engineering Workspace hierarchy and components.
- Keep the four summary metrics and driver cards unchanged.
- Add one concise human-readable history line near the evidence summary, not raw archive or parser terminology.
- Use the existing informational or warning note treatment.

## Implementation handoff

- Required design evidence: this brief plus deterministic required-state coverage.
- Mapping: `usage.source.history` drives the success or partial-history copy.
- Known ambiguity: an archive may be structurally readable but is still observational evidence, not cryptographic attestation.
- Runtime visual-review method: local/private Temple Workspace in a real browser at desktop and tablet-width viewports.
- Visual acceptance: `WI-0056`, `23,433`, and `gpt-5.6-luna` are readable; history provenance is understandable; no raw file path or payload appears; navigation and responsive layout remain intact.
