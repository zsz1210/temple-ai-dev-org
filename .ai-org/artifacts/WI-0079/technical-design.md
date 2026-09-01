# WI-0079 technical design

## Diagram type and purpose

- Type: Archify `architecture`
- Intended surface: local interactive engineering preview
- Primary story: `Human authority → Temple coordination → bounded execution → evidence gates → repository truth`
- Supporting stories: repository-backed context recovery and observation-only external inputs
- Tool: isolated Temple adapter for Archify `v2.15.0`
- Source commit: `e1ac748f19cf805e44bf74fb93c796662152e273`
- License: MIT
- Output mode: static by default; no authored trace animation

The preview uses nine primary nodes, four conceptual boundaries, nine authored relationships, three guided views, and three conclusion cards. The main path remains visible without activating a guided view.

## Architecture mapping

| Preview node | Repository authority |
|---|---|
| Human Principal | `docs/concepts/architecture.md`, `docs/operations/collaboration.md` |
| Temple entry | `docs/concepts/architecture.md` command responsibilities and local interfaces |
| Work coordination | `docs/operations/collaboration.md`, `.ai-org/core/workflow.json` |
| Context and capability routing | `docs/extensions/context-routing.md`, `docs/extensions/engineering-learning.md` |
| Human and AI execution | `docs/operations/collaboration.md` |
| Evidence and gates | `docs/operations/evidence-and-observer.md`, `.ai-org/core/workflow.json` |
| Repository truth | `docs/concepts/architecture.md` file boundaries and canonical state |
| External tracker and provider | `docs/concepts/architecture.md` task and external-tracker boundary |
| Observer and Workspace | `docs/operations/evidence-and-observer.md`, `docs/concepts/architecture.md` |

## Boundary semantics

- `Human authority` shows intent and approval ownership; it is not a reporting hierarchy.
- `Temple coordination layer` groups the shared entry, bounded Work Item coordination, and routed context.
- `Bounded delivery and assurance` separates execution from exact-candidate evidence gates.
- `Repository authority boundary` contains canonical repository truth and a read-only generated projection, while the relationship direction makes the authority asymmetry explicit.

Archify's available `region` and `security-group` visual boundary kinds are presentation primitives here, not deployment-region or network-security claims. The artifact does not enable the `deployment-ownership` engineering profile.

## Authored relationship rules

- Solid emphasis follows the primary delivery path.
- Dashed relationships show context recovery or observation inputs, not lifecycle approval.
- The external provider relationship terminates at the Observer projection and never reaches the evidence gate.
- Repository truth routes context back to later work without implying that a Lesson, Practice, or Skill grants authority.

## Provenance and mutation boundary

Temple installed only the exact reviewed local Git checkout through `temple adapter archify-install`. The adapter remains isolated under `.ai-org/adapters/archify/v2.15.0/`; the manifest records the exact source, MIT license, and file digests. The preview source and generated output are projections under `.ai-org/artifacts/WI-0079/` and cannot mutate Work Items, approvals, or release state.

## Stop boundary

This Work Item stops in Design. It does not authorize README placement, public documentation edits, a second diagram, publication, or a runtime dependency on Archify.
