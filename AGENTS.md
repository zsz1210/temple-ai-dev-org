# Repository instructions

This repository builds the Temple AI Development Organization Framework.

- Never add project-specific Agent display names to `project-overlay/`.
- Keep Position definitions separate from Agent Identity and Assignment data.
- Treat files and evidence as canonical; chat titles and conversation memory are not state.
- Preserve managed, project-owned, and generated boundaries.
- Treat only exact `temple.lock.managed_files` entries as framework-managed; allowed roots are not ownership claims.
- Never make Developer and Independent QA the same Agent Identity.
- Follow `docs/skill-authoring.md` and `docs/skill-design.md` when creating or promoting a Skill.
- Follow `docs/engineering-learning.md` when changing the learning schema, templates, promotion rules, or retrieval behavior; do not treat one Lesson as a framework-wide rule.
- Use `apply_patch` for edits and run `npm run verify` before claiming completion.
- Do not vendor or activate optional integrations without an ADR, pinned version, license review, and tests.
