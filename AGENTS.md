# Repository instructions

This repository builds the Temple AI development organization template.

- Never add project-specific Agent display names to `template/`.
- Keep Position definitions separate from Agent Identity and Assignment data.
- Treat files and evidence as canonical; chat titles and conversation memory are not state.
- Preserve managed, project-owned, and generated boundaries.
- Never make Developer and Independent QA the same Agent Identity.
- Use `apply_patch` for edits and run `npm run verify` before claiming completion.
- Do not vendor or activate optional integrations without an ADR, pinned version, license review, and tests.
