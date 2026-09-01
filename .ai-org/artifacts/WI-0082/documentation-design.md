# WI-0082 Documentation Design

- Position: Tech Lead
- Agent Identity: Tidus (`agent-tidus`)
- Base revision: `8a7afd309e408c9257680f339d1c26cfc3ac6f88`
- UI delivery mode: `not-applicable`

## Audit result

The three READMEs are structurally aligned. Their first-reader gaps fall into four groups:

1. **Invocation syntax:** `$temple-init`, `$decision-interview`, and `$temple-work` look like shell variables or commands but are prompts that select a Temple method.
2. **Framework vocabulary:** Position, Agent Identity, Work Item, Evidence, Human Principal, Assignment, Discipline, Claim, Handoff, and Release Gate have narrower Temple meanings than ordinary usage.
3. **Operating profiles:** Solo, Collaborative, and High-Assurance are policy profiles, not team-size templates.
4. **Repository surfaces:** `TEMPLE.md`, `.ai-org/`, `templew.mjs`, and `temple.lock` play different authority and ownership roles that should be explained together rather than inferred from filenames.

## Linking policy

- Link the first definition or action-oriented occurrence, not every repeated occurrence.
- Link `$temple-init`, `$decision-interview`, and `$temple-work` to stable headings in `docs/getting-started/core-skills.md`.
- Link the `Core Skills` label to the same guide.
- Link the four first terms and the profile names to stable headings in `docs/concepts/terminology.md`.
- Add terminology and Core Skills as explicit goal routes in the README and documentation index.
- Keep raw `.agents/skills/*/SKILL.md` links in a maintainer note inside the Core Skills guide. These remain execution contracts, not beginner documentation.

## Multilingual writing policy

- Keep product facts, maturity boundaries, section order, destinations, and stable Temple identifiers aligned across languages.
- Do not keep sentence structure aligned. English, Japanese, and Traditional Chinese must each read as an independently written technical introduction.
- Traditional Chinese should lead with the reader's concrete difficulty, use direct verbs, avoid stacked abstract nouns, and explain unfamiliar English identifiers before relying on them.
- Japanese should use the problem-to-mechanism-to-operational-caution rhythm common in human-facing technical documentation, omit unnecessary subjects, and avoid noun-heavy translations of English clauses.
- Retain English where it is the stable code-facing identifier or an established engineering term. Translate the surrounding explanation, not the identifier itself.
- Apply the same rule to visible diagram labels and alt text, not only body paragraphs.

## Core Skills guide structure

1. Explain that `$name` is prompt notation, not a terminal command.
2. Provide a six-row selection table covering `$temple-init`, `$decision-interview`, `$domain-modeling`, `$project-documentation`, `$skill-authoring`, and `$temple-work`.
3. Give each Skill a stable heading and the same five questions:
   - When should I use it?
   - What will it do?
   - What will it not do?
   - What does a useful request look like?
   - What result should I expect?
4. End with the authority rule and maintainer-facing contract links.

## Terminology guide structure

- **People and responsibility:** Human Principal, Position, Agent Identity, Assignment, Position Membership, Discipline.
- **Work and verification:** Work Item, Claim, Handoff, Evidence, Independent QA, Release Gate.
- **Operating profiles:** Solo, Collaborative, High-Assurance.
- **Learning and methods:** Lesson, Practice, Skill, Skill Proposal.
- **Repository ownership:** canonical source, project-owned, framework-managed, generated view, and the four installed surfaces.

Each definition includes plain meaning and a nearby term it must not be confused with. The guide does not duplicate schemas or detailed operations manuals.

## Delivery-path diagram

Use one `960 × 430` SVG geometry for all three languages:

- a header identifying the diagram as the path for one request;
- three grouped bands: Human direction, Engineering delivery, and Assurance;
- seven numbered nodes: clarify outcome, approve scope, design, build, test and evaluate, Independent QA, Release Gate;
- arrows that show sequence without implying a reporting hierarchy;
- a bottom repository-evidence rail listing the durable records accumulated along the path;
- restrained blue, teal, amber, and neutral colors with light/dark mode styles and readable text at narrow GitHub widths.

This diagram replaces the text-only arrow block. The existing overview SVG continues to answer the system-context question.

## Risk review

- **Link drift:** use repository-relative links and heading anchors that match explicit ASCII Skill names.
- **Meaning drift:** keep the same section order, table row count, diagram geometry, destination set, capability claims, and maturity boundaries while allowing each language to choose its own sentence structure and examples.
- **Authority overclaim:** state that Skills guide methods but do not grant permission, and that Release Gate records readiness rather than performing deployment.
- **Visual overload:** retain exactly two primary README diagrams and keep deeper architecture diagrams outside the entry point.
- **Concurrent work contamination:** limit edits to WI-0082 affected paths and inspect the final diff by path.
- **Accessibility:** include SVG title/description, high-contrast text, non-color labels, and meaningful Markdown alt text.
