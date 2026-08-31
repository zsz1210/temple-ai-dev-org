# Technical design — WI-0046

## Architecture decision

Extend the existing Observer snapshot with one backward-compatible `observer.organization` projection and render it in a new Management Console workspace. Keep the console dependency-free and preserve the current single-snapshot, single-refresh-coordinator, and single-SSE-stream architecture.

## Organization projection

`buildObserverProjection(target)` reads the project, Agents, Assignments, Positions, collaboration configuration, Work Items, workers, evidence, events, and learning in one bounded projection build.

The new value uses schema `temple.organization-view/v1`:

```text
organization
├── profile
├── coordination_backend
├── counts
├── agents[]
│   ├── id, display_name, active
│   ├── assignments[]
│   ├── memberships[]
│   └── current_work_items[]
├── positions[]
│   ├── id, display_name, purpose
│   ├── owns[], cannot_approve[]
│   ├── assignment
│   ├── memberships[]
│   └── current_work_items[]
├── safeguards[]
├── issues[]
└── large_scale_validation
```

Deterministic rules:

1. Agent order follows `agents.json`; Position order follows `positions.json`.
2. Active Assignment records define the current holder of a Position.
3. Collaboration memberships are eligibility and Discipline metadata, not Assignment authority.
4. Current work excludes terminal Work Items and joins by explicit `assigned_agent_id`, active-claim Agent, and canonical owner Position. It remains secondary observation context.
5. Missing Agent, Assignment, membership, or Position references create explicit `issues`; records are not silently dropped.
6. All Positions are projected. Unassigned Positions use `assignment: null`.
7. `active` is configuration status only and must not be relabeled as online.

## Safeguards

Build deterministic checks from active Assignments:

- `developer-independent-qa-separation`: pass only when both are assigned and the Agent IDs differ; warning when one is unassigned; fail when they match.
- `developer-release-manager-separation`: pass only when both are assigned and the Agent IDs differ; warning when one is unassigned; fail when they match.

Every result includes participant Position IDs, bounded Agent IDs/display names, and a sentence explaining the status. These checks are observable governance state; they do not approve QA or Release Gate outcomes.

## Privacy boundary

The Organization projection contains only canonical roster, Position, Assignment, Discipline, governance, validation-reference, and bounded current-work metadata. It excludes:

- Human Principal and sponsorship records;
- credentials, tokens, raw prompts, and command payloads;
- Inbox, daemon, or raw recent-event state;
- inferred online presence;
- unverified model defaults or routing policy.

The existing private snapshot sanitizer may pass this bounded projection through. Private-viewer tests must explicitly assert both its presence and the continued absence of local-only authority and secrets.

## Management Console rendering

Update `renderControlPlaneDashboard` without a framework migration:

- Reframe document title, skip link, navigation landmark, brand subtitle, and footer copy as Management Console.
- Insert Organization after Now and renumber the remaining primary destinations.
- Rename Execution's kicker to `Live execution`; retain its existing filter.
- Render Organization from `snapshot.live_observer.organization`, because the live projection already carries the Observer fields forward.
- Preserve the selected Organization tab in browser state outside snapshot-render functions.
- Use stable DOM builders and text content; never inject canonical values as HTML.
- Join responsibility-chain Agent IDs to organization display names for presentation, while retaining explicit unknowns.

## Organization tab behavior

Keep `organizationMode` as `agents` or `positions`. A render replaces only the selected panel content and re-applies the same mode. The two tab buttons implement:

- click activation;
- Arrow Left/Right wrap;
- Home/End;
- `aria-selected` and roving `tabindex`;
- no URL route change and no extra network request.

Desktop includes a semantic Position table. CSS swaps it for semantic Position cards below 800px.

## Tests

Focused automated coverage must prove:

- zero current work still exposes all configured Agents and Positions;
- Agent and Position order is deterministic;
- membership and Assignment remain distinct;
- same-identity Developer/Independent QA produces a failing safeguard;
- private snapshots expose bounded Organization data but not local-only state or secrets;
- rendered HTML contains Management Console framing, Organization navigation, semantic tabs, table labels, and Live execution copy;
- current refresh coalescing and private mutation tests remain green.

Browser evaluation covers 1440×1000, 1024×1366, 768×1024, and 420×900; both Organization modes; keyboard tabs; no horizontal overflow; no console errors; stable focus and selected mode after refresh; and private read-only rendering.

## Risk review

- **Topology confused with runtime:** mitigated by separate destinations, visible explanatory copy, and secondary current-work markers.
- **Membership confused with Assignment:** mitigated by separate fields and labels in the projection and UI.
- **False hierarchy:** mitigated by equal-status Agent cards and explicit assignment-not-reporting copy.
- **Privacy expansion:** mitigated by a bounded projection and explicit private-viewer regression assertions.
- **Framework creep:** mitigated by using shadcn/ui only as composition reference and adding no dependency or copied source.
- **Refresh focus loss:** mitigated by preserving mode and avoiding replacement of tab controls.
- **Mobile table overflow:** mitigated by a card-row representation below 800px and `min-width: 0` throughout.
- **False completion claims:** mitigated by the repository-backed capability audit and truthful empty states.

No provider, external write, public hosting, dependency, release, or publication change is required.
