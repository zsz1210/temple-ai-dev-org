# Product specification — WI-0046

## Product outcome

Temple exposes one **Management Console** for understanding and operating the AI development organization. The `Now` destination is the operational Dashboard inside that console; it is not the name of the whole application.

An operator must be able to answer these questions without reading Temple's JSON files:

1. How is the organization composed, even when nobody is actively working?
2. Which Agent holds each Position, and what is that Position responsible for?
3. What work is moving now, and how trustworthy is the observed runtime evidence?

## Information architecture

| Destination | Question answered | Scope |
| --- | --- | --- |
| Now | What needs me now? | Operational Dashboard: health, attention, next action, work in focus |
| Organization | How is this organization composed? | Permanent Agent Identities, Positions, Assignments, Disciplines, collaboration profile, and separation safeguards |
| Execution | Who is doing what now? | Claimed, blocked, or live-attached work and its Agent → Position → Work Item → Codex task → observed model chain |
| Usage | Where are model resources going? | Available Token evidence, qualification, composition, and drivers |
| System | Can I trust the observation path? | Provider health, conditions, connection, freshness, and viewer transport |
| History | What happened before? | Terminal Work Items and canonical or observed timeline |

Loopback-only tools remain a separate navigation group. Private LAN and Tailscale viewers omit those tools and remain read-only.

## Organization data contract

`observer.organization` is a bounded, read-only projection of canonical organization files:

- `.ai-org/project/agents.json`
- `.ai-org/project/assignments.json`
- `.ai-org/core/positions.json`
- `.ai-org/project/collaboration.json`
- Canonical non-terminal Work Items, used only for current-work counts and references

The projection contains no Principal records, sponsorship details, credentials, raw prompts, command payloads, or inferred runtime identity. It includes:

- collaboration profile and coordination backend;
- active Agent Identities and their active assigned Positions;
- all active assigned Positions with purpose, owned artifacts, approval exclusions, and membership Disciplines;
- bounded references to current non-terminal Work Items assigned to each Agent or Position;
- explicit separation checks for Developer versus Independent QA and Developer versus Release Manager;
- the recorded large-scale collaboration-validation status and plan reference.

Organization topology remains visible when there are no active claims or live tasks. Current-work markers are subordinate context and never decide who holds a Position.

## Organization experience

- Organization is one primary navigation interaction away from every view.
- Its default `By Agent` view shows every active Agent with a compact identity mark, assigned Positions, Disciplines, and current-work count.
- A `By Position` view shows all active assigned Positions in a dense, scannable table with assigned Agent, purpose, Disciplines, and current-work count.
- A concise profile panel explains the active operating profile and repository coordination backend.
- A safeguards panel gives textual pass or fail results and names the identities involved. Color is supporting evidence, not the only signal.
- Empty current work does not collapse or hide the organization.
- Inactive or unassigned records are not silently presented as active. A future directory expansion may expose them with explicit status.

## Shell and composition

- The browser title, navigation landmark, brand subtitle, skip link, and product copy call the whole surface the Temple Management Console.
- The console retains one-level primary navigation, one live snapshot, one refresh coordinator, and one event stream.
- Composition may take inspiration from shadcn/ui's app sidebar, inset content, compact cards, segmented controls, and dense data table patterns.
- This slice does not install shadcn/ui, React, Tailwind, or another dependency and does not copy or vendor shadcn component source.
- Existing Temple colors, semantic status language, accessibility behavior, and privacy boundaries remain authoritative.

## Responsive and accessibility requirements

- No horizontal page overflow at 1440×1000, 1024×1366, 768×1024, or 420×900.
- Desktop and landscape tablet use the persistent sidebar. Narrow screens use the existing sticky horizontal destination row.
- Agent cards reflow without creating a tall decorative org-chart connector tree.
- The Position table retains readable labels on narrow screens through a responsive card-row treatment or bounded internal scrolling; the page itself must not overflow.
- The `By Agent` and `By Position` controls are keyboard reachable, expose pressed or selected state, and preserve the current view during live refresh.
- Text and status do not depend on color alone; reduced-motion behavior remains intact.

## Acceptance measures

- The console visibly distinguishes the Management Console, the `Now` Dashboard, permanent Organization topology, and current Execution.
- All five active Agent Identities and all ten active assigned Positions remain visible with no active Work Item.
- A first-time operator can find an Agent's Positions or a Position's assigned Agent in one primary navigation interaction and one local view toggle at most.
- The active collaboration profile, coordination backend, and separation safeguards are readable without opening raw JSON.
- Private-viewer tests prove the projection exposes only bounded canonical roster and governance metadata while Inbox, commands, daemon state, recent raw events, and secrets remain absent.
- Browser review covers desktop, tablet, and mobile viewports, both organization modes, keyboard state, refresh stability, and console errors.

## Capability truth boundary

This slice must publish a repository-backed requirements audit using four states: `shipped`, `partial`, `planned`, and `intentionally deferred`. UI presence alone is not proof that a data source is populated or universally observable.

## Non-goals

This slice does not add model selection or switching, Token time-series storage, monetary cost, automatic routing, external tracker writes, remote Agent commands, cross-repository portfolio navigation, SRE/Security production telemetry, new providers, public hosting, release, or publication.
