# UI design brief — Team multi-human governance

- Work Item: `WI-0076`
- UX Designer Position: UX Designer
- UI Designer Position: UI Designer
- Agent Identity: `agent-yuna`
- Delivery mode: `code-first`
- Production medium: dependency-free HTML, CSS, and JavaScript in `src/control-plane-dashboard.mjs`

## Rationale

The work changes information architecture inside an established visual system and does not introduce a new brand, interaction paradigm, remote mutation, or vendor dependency. The owner approved the textual hierarchy and responsive wireframe in the preceding review. Code-first is proportionate when paired with required-state coverage, runtime visual review, keyboard checks, private-viewer verification, and exact-candidate screenshots.

## Hierarchy

The main destination remains **Team**. A compact summary answers accountable people, active Agents, responsibility coverage, qualification attention, and governance readiness. Three tabs follow:

1. **Responsibilities** — default Position-first lanes. No Human Principal apex or reporting connector.
2. **People & Agents** — accountable people and sponsored Agent Identities remain visually distinct.
3. **Authority** — explicit grants, bootstrap and recovery readiness, validation state, and separation safeguards.

Work claims remain in Work. Team may show only a bounded active-work count and link.

## Required states

| State | Requirement |
|---|---|
| Solo | One implicit accountable person, existing Agents, collapsed governance detail, no missing-Principal error |
| Collaborative configured | Duplicate names remain disambiguated by immutable ID or handle; sponsorship and verification class are legible |
| Qualification attention | Provisional, suspended, expired, or revoked membership is text-labelled and not represented only by color |
| Authority bootstrap | Temporary Bootstrap Owner and missing recovery readiness are explicit |
| Authority mature | Scoped grants and configured quorum appear without an organizational apex |
| No Principal data | People section explains unavailable or redacted data without inventing a person |
| Private viewer | Principal records, sponsorships, detailed grants, and binding data are absent; coverage remains useful |
| Missing organization snapshot | Every tab shows one bounded unavailable state |
| Narrow viewport | Tabs wrap or scroll accessibly; responsibility lanes and cards stack with no horizontal page overflow |

## Interaction and motion

- Tab and keyboard navigation are immediate; no transition delays frequent use.
- Pressable controls use a subtle active state.
- No animation implies that an Agent is online or that a reporting hierarchy exists.
- Any future anchored detail panel may use a 180–220 ms ease-out transform and opacity transition; reduced motion removes spatial movement.

## Accessibility

- Native tab semantics, roving tab focus, Arrow/Home/End behavior, visible focus, minimum touch targets, and logical DOM order.
- Essential content is readable without hover.
- Status always has text and shape or border treatment in addition to color.
- Tables retain a mobile card alternative with matching accessible names.

## Private-viewer boundary

The UI cannot recover redacted information client-side. The server projection removes Human Principal records, sponsorships, detailed grants, and local actor-binding data before serialization. The private view labels the resulting surface as redacted read-only coverage rather than an empty organization.

