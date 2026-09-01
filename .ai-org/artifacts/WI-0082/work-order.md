# WI-0082 Work Order

- Position: Engineering Manager
- Agent Identity: Mog (`agent-mog`)
- Base revision: `8a7afd309e408c9257680f339d1c26cfc3ac6f88`
- Delivery mode: sequential
- Interface mode: `not-applicable` (repository documentation and explanatory SVGs, not an application UI change)

## Outcome

Make the public README understandable when it introduces Temple-specific vocabulary or invokes a Temple Core Skill. A first-time reader should be able to follow a human-facing explanation instead of opening an Agent contract, and should see the delivery lifecycle as a compact engineering diagram.

## Boundaries

- Keep English, Japanese, and Traditional Chinese README structure aligned while writing naturally in each language.
- Explain the `$skill-name` notation once and link each Core Skill invoked in a README to a matching human-facing section.
- Keep `SKILL.md` as the Agent-facing operating contract; do not use it as the beginner landing page.
- Add one English canonical Core Skills guide and one English canonical terminology guide. The localized READMEs may identify those destinations as English documentation.
- Add one localized delivery-path SVG per README, using the same geometry and distinct labels.
- Keep the README at two primary diagrams: system context and delivery path. Leave deeper architecture visuals in the documentation set.
- Preserve WI-0077, WI-0079, and WI-0081 changes. Do not add dependencies, install a diagram vendor, commit, push, publish, or release in this Work Item.

## Delivery sequence

1. Product Manager fixes the reader problem, scope, terminology burden, and acceptance criteria.
2. Tech Lead defines the link policy, Core Skills guide structure, terminology taxonomy, diagram information architecture, and risk review.
3. Developer updates the three READMEs, documentation index, two guides, and three SVGs and records developer verification.
4. Quality & Evaluation checks claims, link targets, document structure, SVG parsing, and desktop/narrow rendering.
5. Independent QA reviews the exact candidate independently from the Developer identity.
6. Release Manager records repository readiness only; no commit or push is authorized.

## Coordination

- WI-0069 also named `docs/README.md`, but its active claim is released. WI-0082 integrates sequentially from the committed document and adds only the two new reader routes.
- WI-0077 owns Management Console usability artifacts, WI-0079 owns Archify adapter work, and WI-0081 owns the live Management Console implementation. Their paths and uncommitted changes must remain untouched.
