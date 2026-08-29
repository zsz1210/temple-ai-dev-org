# ADR-0010: The first optional development Skill pack

- Status: Accepted
- Date: 2026-08-29

## Context

Temple's core Skills handle initialization, decisions, domain language, and lifecycle mutations, but daily development also needs repeatable implementation procedures. The Matt Pocock catalog includes TDD, bug diagnosis, architecture, review, prototyping, Git, and retrospective capabilities. Installing all of them at once would create overlapping triggers and fixed context cost.

AiPet `WI-0001` provided the first observable development case: a new UI vertical-slice test initially failed its long-term memory assertion. After ranking hypotheses and inspecting the screen structure, the team found that the below-fold accessibility node in `ScrollView + LazyVStack` had not yet been created; the product had not lost its memory. Scrolling through the public UI made the test pass. The same candidate revision then passed six tests, visual attachment review, and Independent QA in a clean detached worktree.

## Decision

The first optional development pack is **Build Quality**, composed of Temple-native `tdd` and `diagnosing-bugs` Skills.

- `tdd` requires choosing a public seam in advance, observing red, making the smallest change, reaching green, and preserving exact command and result evidence.
- `diagnosing-bugs` requires a reproducible problem, ranked hypotheses, a red-capable feedback loop, a minimal root-cause fix, regression evidence, and removal of temporary instrumentation.
- The pack does not replace the Developer, Tech Lead, Quality & Evaluation Engineer, or Independent QA Positions, and it does not automatically change work-item state.
- The implementation must be written independently. The Matt Pocock Skills remain pinned MIT-licensed inspiration and are neither vendored nor loaded at runtime.
- The pack must have its own manifest, installer boundary, scenario tests, and upgrade tests. It is not part of the default `project-overlay/` and must continue to be validated in the next real project pilot.

Architecture, Review, Exploration, and Git and Improvement remain candidates for later packs. `implement`, `implement-spec`, `setup-pre-commit`, `git-guardrails-claude-code`, and `wizard` are not adopted as generic core capabilities.

## Consequences

- Development capabilities are no longer mixed into the same layer as the organizational workflow; projects can install them as needed.
- Real friction from AiPet determined the first pack, not catalog popularity.
- Alpha.6 provides opt-in installation and a checksum lifecycle, but candidates are still not copied into every project. Pack installation cannot replace real red/green or Independent QA evidence.
- The Phase 1.5 greenfield pilot can continue using the small core while evaluating whether its first vertical slice needs the Build Quality pack.
