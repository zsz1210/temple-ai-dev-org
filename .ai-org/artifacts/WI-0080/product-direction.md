# WI-0080 Product Direction

- Position: Product Manager
- Agent Identity: Yuna (`agent-yuna`)
- Specification mode: `gate-evidence`
- Status: approved scope and acceptance source for WI-0080

## Reader problem

Temple began by addressing context loss across AI coding sessions, but that symptom no longer defines the whole product. The README must present the larger product truth: AI can perform individual development tasks, while dependable software delivery also needs an operating organization that connects product direction, responsibility and authority, engineering methods, work coordination, verification and delivery, and learning and memory.

The primary reader is evaluating how to use AI reliably in software development. They may be one developer, a technical lead, an open-source contributor, or a member of a larger engineering organization. The opening must not require them to understand Temple terminology, a fixed team size, or the three operating profiles first.

## Product promise

Canonical meaning:

> Temple gives a software project a development organization in which humans and AI can work together, keep learning, and deliver with evidence.

The localized reader-facing promises must preserve this meaning while using natural prose in each localized README.

“Development organization” means the shared operating model for decisions, responsibility, execution, verification, and learning. It does not mean a reporting hierarchy or fixed organization chart.

## README information hierarchy

Each language uses this order:

1. Product name, category, one-sentence promise, language links, status badges, and short navigation links.
2. “What is Temple?” in plain language, including the Early Alpha boundary.
3. One compact localized diagram showing human direction, Temple’s six connected concerns, and evidence-backed human-and-AI delivery.
4. Three plain-language principles: repository state outlives conversations; responsibility is distinct from the executor; completion requires evidence.
5. One representative request path from clarification through release readiness.
6. A short profile chooser for Solo, Collaborative, and High-Assurance, with real validation limits stated.
7. Only the small set of Temple terms needed to understand responsibility and staffing.
8. The shortest working installation and first-work path.
9. Current, experimental, and unverified capability boundaries.
10. Goal-oriented links to detailed English documentation.

## Language and terminology

- English remains the canonical README and documentation language under ADR-0012.
- Japanese and Traditional Chinese maintain the same hierarchy, status, and claims, but must read as native documentation rather than sentence-by-sentence translations.
- Explanatory prose and headings use the page language.
- Commands, paths, JSON fields, schema identifiers, product names, Git, GitHub, API, CLI, and other code-facing identifiers keep their stable spelling.
- A Temple-specific canonical term is introduced after its plain-language explanation, with the canonical English term in parentheses on first use where readers need to map prose to files or commands.
- Do not mix English into ordinary prose when a clear local expression exists.

## Scope and claim boundaries

- Current: human-supervised Solo workflow and repository-backed core lifecycle, context, evidence, learning, upgrade, and recovery contracts.
- Experimental or bounded: Collaborative and High-Assurance contracts, parallel planning, provider and tracker observations, federation, and the local control plane where repository or bounded local tests exist.
- Unverified: broad multi-human and multi-machine qualification, production monitoring or remediation, unattended external writes, configured semantic retrieval, regulated acceptance, and general enterprise proof.
- The current Archify output is a separate engineer-facing Design artifact under WI-0079. The README diagram explains the product at a glance and does not replace or duplicate that topology.

## Acceptance criteria

- A first-time reader can state what Temple is, why an AI-assisted project needs it, and what “development organization” means before encountering internal terms.
- The README renders as ordinary GitHub documentation, not as a marketing landing page.
- All three language versions preserve the same information hierarchy and capability boundaries.
- The localized diagrams use plain language, fit the README width, and remain readable in light, dark, desktop, and narrow-width review.
- Commands and links match the repository, `npm run verify` passes, and WI-0079 remains unchanged.
