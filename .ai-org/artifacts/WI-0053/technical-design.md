# Technical design: project-owned manual model policy

## Storage design

The accepted policy is recorded in two human-readable, project-owned locations:

- `.ai-org/decisions/DEC-0002-temple-development-model-routing.md` is the durable decision and rationale;
- `docs/operations/token-efficiency-and-model-routing.md` is the maintainer-facing operating guidance.

These paths are outside the exact framework-managed overlay ownership set. No `.codex/agents` Position configuration, `project-overlay` default, `temple.lock` entry, schema, CLI behavior, or generated view changes in this slice.

## Why no machine-readable router yet

A new routing JSON contract would imply runtime semantics, validation, fallback, and migration behavior that do not yet exist. Adding such a file before representative evidence would create configuration without an authorized consumer and could be mistaken for automatic behavior. The first durable form is therefore a decision record plus explicit manual selection guidance.

## Required truth labels

The documentation must distinguish:

- **accepted policy**: the four profiles and project-only GPT-5.6 preference;
- **manual operation**: a human or coordinator selects model and reasoning for the exact task;
- **implemented observability**: requested and effective model can be recorded separately when known;
- **not implemented**: automatic routing, silent fallback, outcome optimization, or model comparison authority.

## Verification design

- Check the decision record is indexed by the existing Decisions README directory convention.
- Check the operations guide links to the accepted record and preserves the provider-neutral framework contract.
- Run `npm run verify` and Doctor.
- Reproduce the exact documentation candidate in a fresh detached worktree under Independent QA.
- Confirm no managed overlay, custom-Agent default, dependency, executable source, or model-backed runtime changed.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Project preference is mistaken for a framework default | State the project-only boundary in the decision, product specification, and operations guide. |
| `Luna max` is treated as universally optimal | Tie it to bounded, verifiable task shapes and preserve later evidence-based review. |
| Requested model is mistaken for effective model | Retain the existing separate metadata fields and explicit unknown state. |
| Advisory text is mistaken for automatic routing | Mark routing as disabled and avoid adding a machine-readable runtime policy in this slice. |
| All mechanical work receives a model call | Prefer deterministic local tooling when judgment is unnecessary. |

## Rollback

Revert only the decision and operations-document candidate. The provider-owned observability bridge and prior canonical task metadata remain unchanged.
