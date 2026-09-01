# UI design brief — WI-0081

- Work item: `WI-0081`
- UI Designer Position owner: UI Designer
- Agent Identity: Yuna (`agent-yuna`)
- Delivery mode: `preview-first`
- Selected tool or medium: responsive HTML/CSS/JavaScript preview
- Artifact path: `.ai-org/artifacts/WI-0077/management-console-preview.html`
- Artifact revision: SHA-256 `731d09a51963691144a170131a6da1f0f638c863f97e84ad1bd8947e2103b3c7`
- Governing UI reference: `UI-0002@ui-1`
- Approval record: `.ai-org/artifacts/WI-0077/preview-review.md`; `.ai-org/artifacts/WI-0081/owner-authorization.md`

## Why this mode

The Console is a whole-product human operating surface with six destinations, private and local authority variants, wide-screen density, and tablet/mobile reflow. Preview-first reduces the risk of implementing an agent-oriented ledger or ambiguous action semantics. The owner reviewed the interactive direction before authorizing this production slice.

## Required surfaces and states

- Screens: Overview, Work, Team, Usage, System, History, plus loopback-only Human Inbox and Agent Commands.
- States: loading, current, refresh delayed, empty data, insufficient usage evidence, current conditions, terminal history, private read-only access, and local action availability.
- Responsive variants: 2560/1440 desktop, 1024 tablet, and 390/320 mobile CSS pixels.
- Accessibility: landmarks, skip link, semantic headings, named icon controls, keyboard navigation, visible focus, touch targets of at least 44 CSS pixels, and non-color status labels.
- Motion: restrained running-state indication only when real current execution evidence exists; all nonessential animation disabled under `prefers-reduced-motion: reduce`.

## Visual direction

- Hierarchy: dark engineering-console shell, compact sidebar, direct page questions, current decisions and delivery movement before retained history.
- Components: restrained cards, table-like Work inventory, selected-item detail, Position-first Team lanes, evidence-first Usage, and System-local read-only configuration.
- Typography and color: system sans plus monospace for IDs/evidence; charcoal surfaces with teal primary accent and semantic amber/red/green status colors.
- Preserve: Temple's human-readable terminology, no numbered navigation, no lock icon, no reporting hierarchy, and no implication that configured Agents are online.

## Implementation handoff

- Required evidence: approved preview, preview review, required-state coverage, focused tests, full local verification, and runtime screenshots.
- Mapping: proposal shell and hierarchy become production DOM/CSS; all values and repeated records come from the snapshot; scenario controls and hardcoded examples are removed.
- Known ambiguity: the current snapshot does not expose independent execution/impediment axes or per-item Human authority. Production must label those values unavailable instead of inferring proposal examples.
- Runtime review: real control-plane server on loopback and private LAN, automated browser snapshots/screenshots, accessibility tree inspection, console inspection, and horizontal-overflow checks.
- Acceptance: no fixture-only value is presented as live; private authority stays unchanged; navigation, filters, selection, and focus survive refresh where applicable.
