# Technical design — WI-0048

- Tech Lead: Tidus (`agent-tidus`)
- Candidate base: `1c6b097a347ab34da29a95a3a86675e300ba1ffe`
- UI contract: `UI-0002@ui-1`
- Production dependency change: none

## Theme implementation

`src/control-plane-dashboard.mjs` keeps one inline dependency-free document. The early theme script will honor an explicit stored `light` or `dark` preference and otherwise select `dark`. The primary `:root` tokens become the approved charcoal palette. An explicit `[data-theme="light"]` override retains optional light presentation without making it the baseline.

Component rules will consume semantic tokens. Backgrounds, sidebar, panels, navigation, and hero state lose the page-wide green tint. Teal remains an accent; success, warning, failure, and assurance colors remain distinguishable by text and structure as well as color.

## Team rendering

The existing Team route and organization snapshot stay unchanged. The browser renderer adds deterministic presentation metadata:

```text
Product & Experience  → product_manager, ux_designer, ui_designer
Engineering Delivery → engineering_manager, tech_lead, developer
Assurance & Release   → quality_evaluator, independent_qa, release_manager, observer
Additional responsibilities → every unrecognized Position ID
```

This metadata groups the canonical Positions but grants no authority and stores no assignment. For each canonical `organization.positions` entry, the renderer reads the assigned Agent from the existing projection. It renders every Position once and appends unknown IDs to the fallback lane.

Team tab state becomes:

- `structure`: default; Position-first responsibility lanes and Agent filter;
- `agents`: secondary; the existing detailed teammate cards.

The existing keyboard tab behavior remains. Agent filter buttons use `aria-pressed`; a local `organizationAgentFilter` holds either `all` or one active Agent ID. Snapshot refresh retains the filter only when that Agent remains active. Filtering changes opacity and border emphasis but never removes Positions, mutates state, or implies online presence. The summary is announced with `aria-live="polite"`.

Quality Evaluator and Independent QA nodes include visible `Quality evidence` and `Independent delivery check` labels plus a structural left marker. Developer remains in Engineering Delivery and therefore cannot be visually conflated with the assurance boundary.

## Documentation diagram

`docs/concepts/architecture.md` receives a compact Mermaid flowchart before its detailed architecture prose. It distinguishes:

- Human Principal authority;
- Temple Workspace read projections and the local CLI mutation gateway;
- repository and Git evidence authority;
- Positions, Agent Identities, Work Items, and Codex task execution;
- external tracker and provider observations;
- usage and health projections;
- learning and retrieval.

The diagram uses labeled boundaries and no vendor-specific dependency. `docs/README.md` links readers to the existing architecture document; it does not duplicate the diagram.

## Compatibility

- Primary destination names and route hashes are unchanged.
- Private viewers still omit Human Inbox and Agent Commands.
- Loopback commands, snapshot refresh, SSE behavior, and provider contracts do not change.
- Existing organization counts, Agent cards, governance, and safeguards remain sourced from the same snapshot.
- The runtime imports no code or asset from the conversation preview, `visualize`, Mermaid, Figma, or a graph library.

## Verification

- Static regression tests assert dark-default token semantics, Structure/Teammates labels, lane definitions, fallback behavior, filter accessibility, and retained privacy boundaries.
- Focused Control Plane suites run before the full repository verification.
- Browser review covers 3440, 2560, 1440, 1024, 768, 390, and 320 widths; Structure/Teammates keyboard navigation; all five Agent filters; ten Positions; unknown fallback using a bounded fixture if needed; theme persistence; private redaction; and console output.
- Independent QA reproduces the exact candidate in a fresh detached worktree and a fresh browser session.

## Risk review and rollback

- Risk: deterministic grouping accidentally omits a new Position. Mitigation: a fallback lane and count parity between canonical Positions and rendered nodes.
- Risk: filtering is mistaken for authority or availability. Mitigation: filter only changes presentation and keeps all nodes in the DOM with explicit explanatory copy.
- Risk: dark-first change reduces contrast. Mitigation: browser visual review in both themes and semantic text labels.
- Risk: Team refactor breaks keyboard or private-viewer behavior. Mitigation: retain the existing tab implementation pattern and focused regression coverage.

Rollback is a Git revert of the exact candidate. No migration, external state, dependency, or project-owned organization data changes are required.
