# Decision Ledger

## Decision

- ID: DEC-0005
- Status: accepted
- Date: 2026-09-01
- Owner position: Product Manager and Tech Lead
- Work item: WI-0082

## Context

Temple's public README now explains the framework at a useful product level, but it still introduces project-specific terms and invocations such as `$decision-interview`, `$temple-init`, and `$temple-work` without a human-facing destination. The repository contains precise `SKILL.md` contracts, but those files are instructions for Agents rather than an approachable explanation for a first-time human reader. The request lifecycle is also currently expressed as a text arrow, which is correct but does not make responsibility, verification, and repository evidence easy to scan.

## Options considered

1. Link every custom term directly to its source `SKILL.md` or canonical schema. This is precise for maintainers but exposes Agent instructions before the reader understands the concept.
2. Create one documentation page for every Skill and every Temple term. This provides space but creates a large translation and maintenance surface before reader demand is known.
3. Add one compact human-facing Core Skills guide, one terminology guide, first-use links from the localized READMEs, and one localized delivery-path diagram while keeping deeper contracts in their existing authoritative documents.

## Decision and rationale

Adopt option 3.

The README remains the human-facing entry point. A `$skill-name` link leads first to a plain-language Core Skills guide that explains when to use the method, what result to expect, and what it does not authorize. The underlying `SKILL.md` remains the Agent-facing execution contract and may be linked from the guide for maintainers.

Temple-specific or precisely redefined concepts lead to a terminology guide that distinguishes framework vocabulary from ordinary software language and highlights nearby terms that must not be confused. Repeated occurrences do not all need links; first use and decision points do.

The README keeps two primary visuals: one system-context diagram and one delivery-path diagram. The second diagram explains the flow from human direction through design, build, evaluation, Independent QA, and Release Gate, with repository evidence as the durable rail. Architecture internals and adapter-specific diagrams remain in deeper documentation.

English remains canonical for non-README documentation under the current repository policy. Japanese and Traditional Chinese READMEs use natural localized wording, keep the same structure, and identify English-only deep guides instead of mixing unexplained English prose into the main reading path.

## Consequences and follow-up

- Files or work items affected: `WI-0082`, the three localized READMEs, `docs/README.md`, the Core Skills guide, the terminology guide, and three localized delivery-path SVGs.
- Open questions: which guide is used often enough to justify maintained Japanese and Traditional Chinese editions; whether a later docs site should generate navigation from repository Markdown.
- Revisit trigger: repeated reader feedback shows that one compact guide is insufficient, link analytics or support requests identify a specific high-friction concept, or the documentation-language policy changes.
