# WI-0102 Developer report

## Candidate

- Revision: `0c7260dd68756fb6754a1529bef60a4c42d5dcde`
- Branch: `codex/wi-0102-brownfield-validation`
- UI delivery mode: `not-applicable`

## Implemented

- Added a standalone no-generation brownfield adoption rehearsal.
- Preserved a fixture's existing Git history, README, requirements, and contribution policy while initializing Temple.
- Exercised one bounded Work Item through exact-candidate Independent QA and organizational closeout inside the fixture.
- Retained machine-readable timings, digests, mutation scope, test counts, identity separation, Doctor counts, optional-runtime usage, and limitations.
- Normalized the existing FlowDeck, IdeaDock, AiPet, and Temple self-host evidence into one human-readable Wave 1 matrix.
- Kept the nested-repository rehearsal out of default CI so ordinary pull requests do not pay its setup cost.

## Verification

- Retained rehearsal: pass in 2,438.036 ms.
- Reproducibility run: pass in 2,564.172 ms with the same preservation, mutation-scope, test, lifecycle, and authority results.
- Full repository verification: 280 passed, 0 failed, 0 skipped; repository, documentation-link, and package-boundary checks passed.
- `git diff --check`: pass.

The first development run exposed a Node.js reporter-format assumption: Node.js 24/25 emits `ℹ pass` instead of the older TAP `# pass` line. The parser was narrowed to accept both known formats, and both subsequent full rehearsals passed.

## Boundary

No model, Observer, Usage Collector, Console, network write, Docker runtime, external repository, deployment, publication, or release was used. The fixture is synthetic and same-machine; it does not satisfy independent-human or enterprise adoption.
