# ADR-0012: English canonical documentation with localized README entry points

- Status: Accepted
- Date: 2026-08-29

## Context

The toolkit accumulated English, Traditional Chinese, and Japanese across architecture decisions, usage instructions, roadmap notes, and pilot records. That made navigation inconsistent, increased maintenance cost, and left readers unsure which language version was authoritative. Public users still benefit from a clear entry point in the three languages used by the maintainer.

## Decision

- `README.md` is the canonical English entry point.
- `README.ja.md` and `README.zh-TW.md` are maintained Japanese and Traditional Chinese entry points with the same information hierarchy and claims.
- All other toolkit documentation, installed instructions, Skills, templates, changelog entries, contribution guidance, and security guidance use English.
- A change to public README behavior or claims must update all three README variants in the same change.
- Repository checks reject CJK text in Markdown outside the three root README files. Identifiers, product names written in Latin characters, diagrams, and non-language typography are unaffected.
- This is a policy for the central toolkit. The installed `$project-documentation` Skill follows each target project's own language policy and does not impose multilingual documentation on product repositories.

## Consequences

- Detailed documentation has one canonical language and no longer drifts across partial translations.
- English remains the default GitHub landing page while Japanese and Traditional Chinese readers retain first-class onboarding.
- Contributors must keep three concise README variants aligned, but they do not need to translate every internal document.
- A future localization expansion requires a deliberate maintenance decision rather than adding isolated translated files.
