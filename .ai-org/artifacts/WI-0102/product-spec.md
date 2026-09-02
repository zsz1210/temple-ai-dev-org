# WI-0102 product specification

## Reader outcome

A prospective Temple user should be able to distinguish what the framework has already demonstrated from what is merely implemented, simulated, planned, or still unknown. A maintainer should be able to choose the next experiment without repeating expensive work that already has valid retained evidence.

## Evidence classes

The Wave 1 matrix uses four deliberately different labels:

- **Demonstrated:** a retained project or environment completed the named behavior and preserves exact evidence.
- **Verified implementation:** deterministic or isolated verification proves the mechanism, but not representative human adoption.
- **Partial:** useful evidence exists, but a named condition or end-to-end step is missing.
- **Not run:** no retained result supports the scenario.

A stronger label must never be inferred from several weaker records. One author operating several Agent identities is not independent-human evidence, and a copied or synthetic repository is not a real enterprise adoption.

## Current evidence baseline

| Scenario | Current class | Retained source | Boundary |
| --- | --- | --- | --- |
| New idea to first exact-revision lifecycle | Demonstrated | FlowDeck greenfield retrospective | One private iOS sample, one human, no physical-device release |
| Fresh task recovers and continues from repository state | Demonstrated | IdeaDock cold-task recovery result | One human, one Mac, internal workers not separate user-owned tasks |
| Data-bearing project backup, restore, and forward upgrade | Demonstrated | AiPet Alpha.24 recovery rehearsal | Isolated checkout; no real machine loss or rollback to the old version |
| Preserve an adopter's repository workflow during init and upgrade | Verified implementation | WI-0097/WI-0098 adaptive onboarding evidence | Local tests and same-machine QA; no full small-change lifecycle in a newly adopted brownfield repository |
| Existing project keeps native document authority | Verified implementation | Alpha.14 specification contracts and enterprise adoption contract | Contract and regression evidence; no external enterprise document system was mutated or independently adopted |
| Temple develops Temple through its own organization | Demonstrated with limits | Alpha.23 self-host dogfood | Maintainer dogfood, not independent adoption |
| Independent person adopts Temple without maintainer guidance | Not run | Public-Alpha adoption gate | Must be performed by another person; the maintainer cannot simulate independence |
| Several humans and machines coordinate protected pull requests | Not run | Collaborative large-scale test plan | Requires real participants and environments |

## Brownfield rehearsal scenario

The new deterministic rehearsal begins with an already versioned repository containing:

- a human README;
- product requirements in an existing folder convention;
- a contribution policy that requires isolated changes and review;
- a small tested application; and
- at least two pre-adoption commits.

The rehearsal snapshots the repository, initializes Temple with a confirmed reference to the existing contribution policy, and verifies that project-owned source and documents remain byte-identical. It then creates a bounded Work Item inside the fixture, changes one named application behavior, runs its application tests, records exact candidate evidence, uses different Agent identities for Developer and Independent QA, and performs organizational closeout without external release.

## Measurements

The retained result records wall-clock duration for setup, initialization, bounded delivery, and verification; file counts and digests; changed paths; application and Doctor results; lifecycle result; and whether any model or external service was used.

Token usage for this rehearsal is **not applicable**, not zero: the fixture invokes no model. This keeps the result useful for framework overhead without pretending to measure AI delivery cost.

## Acceptance interpretation

Passing this Work Item upgrades the brownfield row from `not run` to `verified implementation` for an isolated local fixture. It does not prove independent usability, enterprise scale, real external-document integration, multi-machine coordination, or Token savings.

## Stop condition

The sample stops immediately after its first bounded lifecycle and retained report. Any additional product feature, external repository action, model run, or public-release change requires a separate Work Item and authority.
