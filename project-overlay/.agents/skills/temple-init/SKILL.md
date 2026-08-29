---
name: temple-init
description: Initialize a repository's AI development organization with the temple CLI, including project-specific Agent names and Position assignments. Use for first-time organization setup, not ordinary feature work.
---

# Project Organization Init

Initialize one target repository without inventing project facts or overwriting user files.

## Required outcome

- All ten required Positions remain stable.
- The target project receives its own Agent Identities only after the user confirms their English display names.
- One Identity may hold multiple Positions.
- Developer and Independent QA must use different Identities.
- `temple init --dry-run`, the real init, `temple doctor`, and `temple status` all complete or leave an explicit blocker.

## Workflow

1. Resolve the target repository and the central Toolkit checkout containing `bin/temple.mjs`. Never assume they are the same directory. Confirm the checkout's lockfile dependencies were installed with `npm ci`; if a runtime dependency is missing, stop and report that exact prerequisite instead of guessing a global package.
2. Inspect the target read-only: repository name, current `AGENTS.md`, language/build clues, and whether `.ai-org` or `temple.lock` already exists.
3. If `temple.lock` already identifies an initialized organization, stop treating this as first init and run `doctor`; do not create new identities.
4. Show the user the recommended five assignment slots:
   - Coordination: Engineering Manager, Release Manager, Observer.
   - Product Design: Product Manager, UX Designer, UI Designer.
   - Technical: Tech Lead.
   - Delivery: Developer.
   - Quality: Quality & Evaluation Engineer, Independent QA.
5. Ask whether the user wants to provide names or wants AI suggestions. When suggesting names, propose unique natural English names without encoding rank, model, or letters such as Agent A/B/C. Explain that names are editable labels and IDs remain stable.
6. Wait for explicit confirmation of the names and mappings. Do not initialize on an unconfirmed proposal.
7. Build a `temple.init/v1` JSON config with `naming_mode` set accurately. Use a temporary file outside the target repository when possible; do not commit it.
8. Run the dry-run first. Surface existing-file conflicts and the `AGENTS.md` integration plan. Only use `--integrate-agents` after the user has approved changing an existing `AGENTS.md`.
9. Run the real init, verify that the target contains `templew.mjs` and a matching `temple.cli-bootstrap/v1` lock record, then run `doctor` and `status` through `node ./templew.mjs` from the target. Do not substitute an unversioned global CLI if the launcher reports a version or source failure. Remove only the exact temporary config you created.
10. Report the target path, assigned identities, doctor result, generated status path, and any remaining manual integration. Do not claim a GitHub push, CI pass, or runtime verification without evidence.

The central Toolkit must never acquire these project names as defaults. Do not modify the central Position definitions to store them.
