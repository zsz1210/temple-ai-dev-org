# ADR-0012: English canonical documentation with localized README and Roadmap entry points

- Status: Accepted
- Date: 2026-08-29
- Last amended: 2026-08-30

## Context

The toolkit accumulated English, Traditional Chinese, and Japanese across architecture decisions, usage instructions, roadmap notes, and pilot records. That made navigation inconsistent, increased maintenance cost, and left readers unsure which language version was authoritative. Public users still benefit from clear README entry points in the three languages used by the maintainer. The Roadmap is also a primary public decision surface: readers need to understand what is delivered, what remains planned, and which gates prevent overstated readiness without first translating the entire internal documentation set.

## Decision

- `README.md` and `docs/roadmap.md` are the canonical English entry points.
- `README.ja.md`, `README.zh-TW.md`, `docs/roadmap.ja.md`, and `docs/roadmap.zh-TW.md` are maintained Japanese and Traditional Chinese entry points with the same information hierarchy, phase status, gates, and claims as their English counterparts.
- All other toolkit documentation, installed instructions, Skills, templates, changelog entries, contribution guidance, and security guidance use English.
- A change to public README behavior or claims must update all three README variants in the same change.
- A change to Roadmap phase status, gates, or planned scope must update all three Roadmap variants in the same change.
- Repository checks reject CJK text in Markdown outside the six localized README and Roadmap files. Identifiers, product names written in Latin characters, diagrams, and non-language typography are unaffected.
- This is a policy for the central toolkit. The installed `$project-documentation` Skill follows each target project's own language policy and does not impose multilingual documentation on product repositories.

## Consequences

- Detailed documentation has one canonical language and no longer drifts across isolated partial translations.
- English remains the default GitHub and Roadmap language while Japanese and Traditional Chinese readers retain first-class onboarding and planning visibility.
- Contributors must keep the three README variants and three Roadmap variants aligned, but they do not need to translate every internal document.
- A future localization expansion requires a deliberate maintenance decision rather than adding isolated translated files.
