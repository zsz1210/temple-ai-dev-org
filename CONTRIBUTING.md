# Contributing

This repository is the central framework. Do not add Agent names, product specifications, work items, or verification evidence from any real project.

Change workflow:

1. Update the relevant specification or ADR first.
2. Update `project-overlay/`, the central documentation, or the CLI.
3. Run `npm run verify`.
4. Run `init -> doctor -> status` once in a temporary directory.
5. Update the changelog before creating a version tag.

When adding or modifying a Skill, follow the public contract in `docs/skill-authoring.md`, the maintainer promotion rules in `docs/skill-design.md`, and update the adoption state and third-party provenance in `docs/capability-catalog.md`.

When changing Engineering Learning, update the record model, `index.json` validation, doctor and status behavior, templates, and `docs/engineering-learning.md` together. Project Lessons and Practices remain project-owned and must never be promoted into framework behavior automatically.

When changing Positions, update initialization examples, lean Assignment slots, Position configs, doctor checks, upgrade migration, and tests together. UI design changes must preserve the code-first, preview-first, and design-led evidence contract without imposing a mandatory vendor tool.

Documentation is English except for the localized root entry points. Keep `README.md`, `README.ja.md`, and `README.zh-TW.md` structurally aligned whenever public behavior, installation, or capability claims change. See [ADR-0012](docs/adr/0012-documentation-language-policy.md).

Every upgrade feature must preserve these rules: managed files may be updated, project-owned files must not be overwritten, and generated files may be rebuilt.
