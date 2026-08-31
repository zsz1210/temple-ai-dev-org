# UI design brief — WI-0048

- Work item: `WI-0048`
- UX Designer Position: UX Designer
- UI Designer Position: UI Designer
- Agent Identity: Yuna (`agent-yuna`)
- Delivery mode: `preview-first`
- Approved UI contract: `UI-0002@ui-1`
- Approved preview: `.ai-org/artifacts/WI-0048/approved-preview.svg`
- Review record: `.ai-org/artifacts/WI-0048/preview-review.md`
- Production medium: dependency-free HTML, CSS, and JavaScript in `src/control-plane-dashboard.mjs`

## Visual tokens

- Background: near-black charcoal.
- Navigation: black-gray separated by a subtle neutral border.
- Primary surfaces: stepped neutral grays rather than tinted green panels.
- Primary text: soft white; secondary text: cool gray.
- Accent: restrained teal for active and healthy state.
- Semantic attention: amber; failure: red; assurance/information: blue.
- Corners and shadows remain restrained. The page must read as an engineering workspace, not a cyberpunk terminal.

The production implementation may tune exact contrast-safe values while preserving the approved relationships. Color never carries meaning alone.

## Team composition

- Primary tab: `Structure`.
- Secondary tab: `Teammates`.
- Structure begins with Human Principal intent and approval, then three responsibility lanes.
- Position nodes show Position display name first and assigned Agent second.
- Agent filter buttons use the configured active Agent Identities; `All` is the default.
- Selecting an Agent updates one concise live summary and highlights every matching Position without changing canonical state.
- Quality Evaluator and Independent QA receive an additional non-color assurance marker and remain distinct from Developer.

## Data and truth boundary

- Agent names, active state, assignments, memberships, open work, and governance safeguards come from the existing organization snapshot.
- Lane and ordering metadata are deterministic presentation rules keyed by Position ID. Unknown future Positions fall into an `Additional responsibilities` lane rather than disappearing.
- Configured does not mean online. No chart animation implies runtime activity or hierarchy.
- A selection is local presentation state and survives snapshot refresh only while the selected Agent remains active.

## Interaction and accessibility

- Structure and Teammates use the existing keyboard-operable tab pattern.
- Agent filter buttons expose `aria-pressed` and are reachable in native order.
- Position nodes are readable without hover; filtering is supplementary.
- The selected-Agent summary uses `aria-live="polite"`.
- Focus indicators, reduced motion, minimum touch targets, drawer semantics, and private-viewer redaction remain intact.

## Responsive states

| Width | Team structure |
| --- | --- |
| 3440 / 2560 | Three responsibility lanes with bounded readable nodes |
| 1440 | Three balanced lanes inside the available Team panel |
| 1024 / 768 | Lanes may wrap or stack while the icon rail remains stable |
| 390 / 320 | One vertical lane sequence, wrapping filters, no horizontal overflow |

## Documentation mapping

The system architecture diagram belongs in `docs/concepts/architecture.md`. This Work Item does not add Architecture to primary navigation. `visualize` remains the review medium that informed this contract and is not shipped by Temple Workspace.
