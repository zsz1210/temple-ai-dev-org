# Contributing

This repository is the central toolkit. Do not add Agent names, product specifications, work items, or verification evidence from any real project.

Change workflow:

1. Update the relevant specification or ADR first.
2. Update `project-overlay/`, the central documentation, or the CLI.
3. Run `npm run verify`.
4. Run `init -> doctor -> status` once in a temporary directory.
5. Update the changelog before creating a version tag.

When adding or modifying a Skill, also follow `docs/skill-design.md` and update the adoption state and third-party provenance in `docs/capability-catalog.md`.

Documentation is English except for the localized root entry points. Keep `README.md`, `README.ja.md`, and `README.zh-TW.md` structurally aligned whenever public behavior, installation, or capability claims change. See [ADR-0012](docs/adr/0012-documentation-language-policy.md).

Every upgrade feature must preserve these rules: managed files may be updated, project-owned files must not be overwritten, and generated files may be rebuilt.
