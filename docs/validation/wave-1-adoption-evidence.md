# Wave 1 adoption evidence

- Status: **passed for the bounded local adoption baseline, with retained limits**
- Date: 2026-09-02
- Work Item: `WI-0102`
- New rehearsal: isolated local brownfield repository, no model generation
- Public release or external write: not performed

## What this wave answers

Temple already had several successful pilots, but their conclusions lived in separate validation records. This wave puts them on one scale and adds the missing local brownfield path: an existing repository keeps its own documents and workflow, adopts Temple, and completes one small exact-revision lifecycle.

The result is a baseline for choosing later experiments. It is not a claim that Temple saves Tokens, works for every organization, or has already passed independent-human enterprise adoption.

## Coverage matrix

| Scenario | Evidence class | Result and source | Retained boundary |
| --- | --- | --- | --- |
| New idea to first bounded lifecycle | Demonstrated | [FlowDeck greenfield pilot](../pilots/flowdeck-greenfield-retrospective.md) | One private iOS sample, one human, no physical-device release |
| New task continues without the originating chat | Demonstrated | [IdeaDock cold-task recovery](greenfield-cold-task-recovery-result.md) | One human and one Mac; internal workers were not separate user-owned tasks |
| Existing data-bearing project restores and upgrades | Demonstrated | [AiPet recovery rehearsal](alpha-24-aipet-recovery.md) | Isolated checkout; no real machine loss or downgrade rollback |
| Existing repository workflow survives init and upgrade | Verified implementation | WI-0097/WI-0098 plus the rehearsal below | Local execution; no independently governed hosting workflow |
| Existing project keeps native documents | Verified implementation | [Enterprise adoption contract](../getting-started/enterprise-document-adoption.md) plus the rehearsal below | Repository files only; no external document system |
| Temple develops Temple with its own organization | Demonstrated with limits | [Alpha.23 self-host dogfood](alpha-23-temple-self-host-dogfood.md) | Maintainer dogfood is not independent adoption |
| Another person adopts Temple without maintainer guidance | Not run | Retained public-Alpha adoption gate | Must be performed by another person; it cannot be simulated by the maintainer |
| Several people and machines coordinate protected pull requests | Not run | [Collaborative test plan](collaborative-large-scale-test-plan.md) | Requires real participants, machines, hosting, reviews, and CI |

## Brownfield rehearsal result

The standalone validation script created a temporary Git repository named `Ledger Lantern`. Before Temple arrived, it already had two commits, application source and tests, a human README, product requirements, and a contribution policy requiring isolated changes and review.

Temple initialization recorded `CONTRIBUTING.md` as the existing policy instead of imposing Temple's own GitHub workflow. The sample then completed one Work Item that added a JPY total formatter without changing the existing subtotal behavior.

| Observation | Result |
| --- | --- |
| Total local rehearsal | 2,438.036 ms |
| Fixture setup and original application test | 163.745 ms |
| Temple initialization | 518.668 ms |
| Bounded lifecycle through candidate | 704.161 ms |
| Detached exact-candidate Independent QA | 138.586 ms |
| Existing Git history | 2 original commits preserved; 6 commits at closeout |
| Native documents | README, requirements, and contribution policy unchanged after init and closeout |
| Product mutation scope | `src/pricing.mjs`, `test/pricing.test.mjs` only |
| Application tests | 1 before adoption; 2 Developer; 2 Independent QA |
| Identity separation | Developer `agent-fixture-devon`; Independent QA `agent-fixture-hollis` |
| Doctor | 37 pass, 0 warn, 0 fail |
| Lifecycle | `done`, exact tested candidate retained, external release `not_performed` |
| Model and Token collection | Not applicable: no model, Observer, or Usage Collector was invoked |

The detailed machine-readable observation is retained at [the WI-0102 brownfield result](../../.ai-org/artifacts/WI-0102/brownfield-rehearsal-observation.json). The experiment can be repeated explicitly with:

```bash
node scripts/validate-brownfield-adoption.mjs
```

It is deliberately not part of every `npm run verify`. Recreating a nested Git repository and replaying a full lifecycle is an experiment cost, not a useful tax on every pull request.

## What this proves

- A repository can keep its existing human documents byte-for-byte while Temple adds its own explicit organization boundary.
- A confirmed repository workflow can point to the project's policy instead of silently choosing a Temple-specific Git process.
- One bounded product change can remain separate from initialization and organizational evidence.
- Developer and Independent QA identities can reproduce the same exact candidate without requiring the optional Observer, Usage Collector, Management Console, a model, or network access.
- The retained pilots now cover greenfield setup, cold-task continuation, local brownfield mechanics, and data-bearing recovery without rerunning those expensive scenarios solely for another count.

## What remains unknown

- Whether a first-time user can adopt Temple without maintainer guidance.
- Whether a real company repository preserves its people, permissions, external documents, and review process in daily use.
- Whether several humans and machines coordinate conflicts and protected pull requests successfully.
- Whether Temple reduces delivery time, rework, or Tokens compared with a matched non-Temple process.
- Whether the local timings generalize to larger repositories or other operating systems.

Those questions belong to later independent adoption, collaborative, multi-repository, and matched-comparison waves. This fixture must not be counted as evidence for them.

## Stop condition

The sample repository was deleted after the observation was written. No second feature, external repository, Docker service, publication, deployment, or release was started.
