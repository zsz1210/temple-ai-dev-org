# WI-0173 — Core consistency

## Authority and boundary

The maintainer approved implementation of the preceding six-part review. This first bounded slice fixes future handoff revision identity and aligns the public roadmap with released capabilities. Mog coordinates; Rikku implements; Lulu independently reviews. The Standard workflow remains unchanged. No release, hosting change, model experiment, paid usage, new integration, or historical-evidence rewrite is authorized here.

The separate workflow-efficiency task owns its recovery-entry changes and delivery/control comparison. WI-0172 in this branch is an intake-only ID reservation for that existing comparison, not a second experiment or a claim about its implementation state. Its owning branch and earlier branch-local ID collisions require explicit reconciliation before integration. Main and the other worktrees are not modified by this slice.

## Acceptance

- Every new handoff resolves its input to an exact Git commit in Lean, Standard, and High-Assurance work. HEAD, branch names, commit tags, abbreviated commits, and exact commits remain valid inputs.
- Nonexistent revisions, trees, blobs, unborn repositories, and option-like invalid inputs fail before creating a handoff artifact, changing the Work Item, or appending an event. Moving HEAD or a branch after handoff cannot change the recorded candidate.
- The Work Item handoff, Developer candidate, Markdown artifact, and event identify the same commit. Existing authority, independent-review, and gate requirements remain in force.
- Preserve all historical records, including earlier symbolic handoffs; do not infer or backfill their original commit from today's HEAD.
- English, Japanese, and Traditional Chinese roadmaps distinguish published Alpha.30, unreleased development changes, bounded evidence, and future capabilities. Advisory routing is not automatic execution. Historical sample findings are linked rather than used as universal savings claims.

## Design and verification

Reuse the existing Git commit resolver for all handoffs rather than only High-Assurance. Resolve before the first artifact or canonical write. Keep the helper signature stable; no schema migration, new dependency, or authority change is needed. Explicitly terminate Git option parsing when resolving caller-supplied revision names.

Add focused real-Git regression coverage for accepted references, moving references, invalid inputs, missing/unborn Git history, unchanged canonical files on rejection, and all existing profile branches. Update the old lifecycle fixture to use a real commit instead of a fake revision string. Run focused tests during development and one complete `npm run verify` for the code candidate. Independent QA reproduces the exact candidate; final Doctor checks organizational state. No browser review is needed because no UI or README diagram changes.

## Remaining approved direction

First-use simplification, same-scope QA rework, and owned process cleanup remain subsequent design/implementation slices, coordinated with the workflow-efficiency task. Reuse WI-0169's field-validation plan and the other task's comparison work instead of launching another experiment. This order is not evidence that those improvements have shipped.
