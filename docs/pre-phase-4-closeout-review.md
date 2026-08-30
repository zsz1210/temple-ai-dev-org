# Pre-Phase 4 closeout review

- Review date: 2026-08-30
- Reviewed baseline: `4c83a81125bcf1ed9a680902b4981d5af3f49494`
- Framework version: `0.1.0-alpha.22`
- Scope: Phase 1 through Phase 3 implementation, evidence, distribution, extension, and Phase 4 entry readiness
- Decision: **Hold Phase 4 implementation until the Closeout-0 blockers below are resolved**
- Review mode: repository inspection and disposable local validation; no product or framework behavior was changed

> Follow-up on 2026-08-30: [Closeout-0A](validation/closeout-0a-release-integrity.md) completed C0-01 and C0-02, and [Closeout-0B](validation/closeout-0b-live-and-upgrade.md) completed C0-03 through C0-05. This document remains the point-in-time review and gap register. Phase 4 research and ADR work may now begin; the durability/recovery and multi-repository authority contracts still require acceptance before their corresponding implementation.

## Executive conclusion

Temple does not need an architectural reset before Phase 4. Its repository-local authority model, exact-revision evidence, Position and Agent separation, project-owned extension boundary, deterministic context routing, Work Item orchestration, and local control plane form a coherent base. The current implementation passed all 129 tests on both the declared minimum Node.js major and the maintainer environment, and the accumulated validation records distinguish local evidence from retained production claims.

The immediate weakness is release integrity rather than core behavior. The Alpha.20–22 commits exist only on the local `main` branch, the current changelog stops at Alpha.19, and the generated exact-revision launcher cannot recover the unpushed Alpha.22 commit. Phase 3 also still lacks a live Human Inbox round trip and a live read-only GitHub PR/Checks run. These gaps should be closed in a bounded Closeout-0 batch before Phase 4 implementation expands the state and operational surface.

Phase 4 research and ADR drafting may begin after the release-integrity blockers are closed. Feature implementation should begin only after the bounded live-integration and data-bearing upgrade checks have either passed or been explicitly retained with an owner and stop condition.

## Status vocabulary

| Status | Meaning |
|---|---|
| `verified` | Reproduced by current automated, disposable integration, or immutable validation evidence within the stated boundary |
| `partial` | Implemented and supported by some evidence, but an important environment or end-to-end path remains unverified |
| `not-run` | A designed validation exists or is clearly required, but no completion evidence exists |
| `missing` | The required contract, implementation, or durable record does not yet exist |

Priority and routing are separate. A capability may be intentionally `missing` because it belongs to Phase 5 rather than being a current defect.

## Evidence captured during this review

- The working tree was clean at baseline. Local `main` was six commits ahead of `origin/main`; the remote head was Alpha.19 revision `cd518f843565571742038b08cb1b744deff48fb4`.
- The latest remote GitHub Actions run, `33277532243`, passed at that Alpha.19 revision. No remote CI run exists for Alpha.20–22 because those commits have not been pushed.
- The existing Alpha.22 validation records `npm run verify` with 129 passing tests on Node.js `v25.6.1`.
- A second full run under Node.js `v20.20.2`, satisfying the declared `node >=20` contract, passed repository checks and all 129 tests.
- `npm audit --omit=dev` reported zero known vulnerabilities. The two direct dependencies, `ajv@8.20.0` and `ajv-formats@3.0.1`, declare MIT licenses.
- A tracked-file credential-pattern scan found no GitHub token, AWS access-key, private-key, or OpenAI-key pattern. This is a bounded pattern scan, not a complete secret-history audit.
- A local Markdown-link check covered 118 Markdown files and found zero missing repository-relative targets. External URL availability was not exhaustively tested.
- A fresh Alpha.22 target initialized successfully and reported 35 doctor passes with no warning or failure.
- That target recorded the clean exact source revision in `temple.lock`, but `templew.mjs doctor` could not recover it because revision `4c83a81...` did not yet exist on the remote. The package runner received a GitHub codeload 404.
- The same repository-source launcher successfully recovered pushed Alpha.19 revision `cd518f8...` and returned version `0.1.0-alpha.19`. This isolates the current failure to release availability rather than the launcher protocol itself.
- A disposable repository initialized at Alpha.19, upgraded to Alpha.22, and passed doctor with 35 passes and no warning or failure. This exercise contained only initialized project state; a data-bearing real-project upgrade remains separate.
- `npm pack --dry-run` completed with a 424,554-byte archive, 1,673,606 unpacked bytes, and 243 files. It warned that no explicit `.npmignore` exists and showed that tests and the full documentation set would enter a future npm package.
- The repository has an MIT License, `CONTRIBUTING.md`, `SECURITY.md`, and `CHANGELOG.md`. The changelog stops at Alpha.19, while Git tags stop at Alpha.6.
- The GitHub repository is private. Branch protection and repository rulesets are unavailable under its current account/repository configuration. No pull request exists for a live Phase 3 GitHub-provider validation.

## Capability review

| Area | Status | Supported conclusion | Remaining boundary |
|---|---|---|---|
| Initialization, identity, and ownership | `verified` | Fresh init, ten Positions, five project identities, exact managed-file ownership, no-overwrite behavior, and clean re-init are covered | Windows and clean-host operation beyond the pinned launcher remain narrower than general cross-platform support |
| Lifecycle, handoff, QA, and closeout | `verified` | Named gates, exact candidate revision, separate Developer and Independent QA, evidence-bearing handoff, and bounded closeout have real pilot and regression evidence | Production deployment and irreversible external actions remain human/external-system responsibilities |
| Product, UX, UI, and implementation contracts | `partial` | Tool-neutral delivery modes, federated document authority, revisioned references, and stale-contract blocking are implemented | Live Figma or document-system integration, semantic contract validation, and large enterprise document migration are not run |
| Skills and extension ownership | `verified` | Six core Skills, the opt-in Build Quality pack, project-owned Skills, Pack v2, provenance, collision protection, and forward tests are present | Custom-pack publishing, generic third-party installation, automated routing evaluation, and the preserved candidate packs are intentionally unshipped |
| Engineering Learning | `partial` | Atomic Lesson and Practice operations, indexing, revalidation, and deterministic evaluation are implemented | Scheduled retrospective operation, cross-project promotion, and automatic rule or Skill promotion are intentionally absent |
| Context routing and retrieval | `partial` | Bounded deterministic Context Capsules and an injectable local-hybrid boundary with fallback are implemented | Large-repository quality and a configured local model, embeddings, or vector store remain `not-run` |
| Collaborative and High-Assurance operation | `partial` | Principals, sponsorship, Position pools, Disciplines, claims, risk-scaled gates, and local concurrent mutation tests are implemented | The retained multi-human, multi-machine, real-PR validation remains `not-run`; local locks are not distributed locks |
| External task tracking | `partial` | Tracker authority separation, bounded GitHub Issue reads, supplied Jira/generic observations, and explicit reconciliation are implemented | Jira live access, external write-back, and bidirectional synchronization are intentionally absent |
| Parallel and runtime coordination | `verified` within one repository process boundary | Safe waves, stale plans, claims, resources, workers, and internal-subagent versus user-task correlation pass deterministic tests and bounded pilots | Cross-clone contention and organization-scale scheduling remain unverified |
| Evidence and Observer | `verified` within local scope | Normalized exact-revision evidence, drift detection, stale claims, risks, rollback, attention, and generated views are implemented | Evidence adapters do not execute the observed action; large retention and audit export belong to Phase 4 |
| Phase 3 control plane | `partial` | Replay journal, providers, live projection, conditions, Human Inbox authority separation, exact-SHA GitHub adapter, browser QA, and security regression tests are implemented | Live runtime-request answering, live GitHub PR/Checks, long soak, crash-at-every-write-point, remote access, and multi-machine convergence are not run |
| Release and distribution | `partial` | A clean pushed Git revision is recoverable and Alpha.19-to-22 upgrade succeeds locally | Alpha.22 is unpushed, has no CI result, has no tag, and is absent from the changelog; npm publication remains disabled |
| Open-source readiness | `partial` | MIT licensing, contribution guidance, security basics, pinned provenance, and dependency licensing exist | Repository/package visibility, release policy, package allowlist, reporting contact, branch rules, and public consumer validation remain unfinished |
| Multi-repository federation | `missing` by design | Project IDs and repository-local canonical state provide a compatible base | No service registry, cross-repository reference contract, portfolio projection, or cross-service rollout model is implemented; this belongs to Phase 4 |

## Gap register

### Closeout-0: resolve before Phase 4 implementation

#### C0-01 — Make the reviewed Alpha.22 revision remotely reproducible

- Status: `partial`
- Severity: blocker
- Evidence: local `main` is six commits ahead; current exact-revision launcher recovery returns codeload 404; remote CI stops at Alpha.19.
- Required outcome:
  1. push the reviewed Phase 3 and validation commits;
  2. obtain a passing CI run for the exact pushed revision;
  3. initialize a new target from that clean revision;
  4. run its `templew.mjs doctor` with `TEMPLE_CLI_PATH` unset;
  5. preserve the exact revision and CI/launcher evidence in a closeout record.
- Authority note: pushing and changing repository visibility are external mutations and require an explicit execution step; this review does not perform them.

#### C0-02 — Repair the version and roadmap ledger

- Status: `missing`
- Severity: high
- Evidence: `CHANGELOG.md` stops at Alpha.19; `docs/roadmap.md` still labels Phase 1 as the current release and calls the delivered Phase 3 items “Proposed increments.”
- Required outcome:
  1. add bounded Alpha.20, Alpha.21, and Alpha.22 changelog entries;
  2. make roadmap wording distinguish current version, delivered phases, retained validation, and future work;
  3. keep all three README entry points aligned;
  4. add a repository check that the current package version is represented in the changelog.

#### C0-03 — Run one safe live Human Inbox thin slice

- Status: `not-run`
- Severity: high
- Evidence: response shapes and provider behavior are covered through generated App Server schemas and deterministic tests, but Alpha.22 did not force a live permission or business-question round trip.
- Required outcome:
  1. use a disposable or low-risk Work Item;
  2. answer one still-live runtime permission request without material external side effects;
  3. answer one business question, prove secret omission, and explicitly incorporate only the safe proposal;
  4. prove that neither response creates governance approval or advances the lifecycle;
  5. record reconnect and expired-request refusal behavior.

#### C0-04 — Run one live read-only GitHub PR and Checks thin slice

- Status: `not-run`
- Severity: high
- Evidence: exact-SHA, ETag, rate-limit, wrong-head, fixture, and explicit-capture behavior pass request-level tests; the repository currently has no PR suitable for a live run.
- Required outcome:
  1. use a disposable PR with harmless CI;
  2. configure one exact head SHA and environment-only token source;
  3. observe PR and Check Runs through GET requests only;
  4. capture reviewed evidence explicitly;
  5. prove no GitHub write and no Work Item transition occurred.

#### C0-05 — Rehearse a data-bearing Alpha.19-to-22 upgrade

- Status: `partial`
- Severity: high
- Evidence: the disposable empty-state upgrade and extensive preservation regressions pass, but no data-bearing product repository was upgraded during this review.
- Required outcome: upgrade a disposable copy containing at least one Work Item, specification reference, tracker mapping, project Skill, Learning record, optional pack, evidence record, and custom `AGENTS.md`; compare all project-owned inputs byte-for-byte where no migration is declared, then run doctor and status.

### Pre-open-source and release hardening

#### OS-01 — Decide and document the public distribution channel

- Status: `partial`
- Severity: high before public release; not a blocker for private Phase 4 research
- Current facts: the Git revision path works for pushed commits; `package.json` is intentionally `private: true`; the npm fallback is documented as future-only.
- Required decision: choose exact public Git revisions, a public npm package, or both. Define release tags, supported versions, deprecation, provenance, and offline/cache expectations before changing repository visibility.

#### OS-02 — Bound the publish artifact

- Status: `partial`
- Severity: medium
- Evidence: dry-run packaging succeeds but includes 243 files, including 20 tests and 74 documentation files, and relies on `.gitignore` fallback.
- Required outcome: define a reviewed `files` allowlist or `.npmignore`, then verify that the CLI, overlay, packs, schemas, licenses, and required documentation remain complete in the packed artifact.

#### OS-03 — Strengthen public security and contribution policy

- Status: `partial`
- Severity: medium
- Required outcome: add supported-version and vulnerability-reporting guidance, decide the disclosure contact before publication, use reproducible CI installation, and enable public branch rules or an equivalent protected review policy when repository visibility permits.

#### OS-04 — Expand the compatibility gate deliberately

- Status: `partial`
- Severity: medium
- Evidence: Node 20 and Node 25 pass locally; pushed CI currently uses Ubuntu and Node 22 only.
- Required outcome: test every promised Node major, replace CI `npm install` with the intended lockfile-strict command, and decide whether Windows and macOS are supported or explicitly retained. Do not imply cross-platform support from path-unit tests alone.

#### OS-05 — Automate documentation integrity

- Status: `partial`
- Severity: medium
- Evidence: this review found zero missing local targets across 118 Markdown files, but the standard repository check does not enforce links, current-version changelog coverage, or trilingual README hierarchy.
- Required outcome: promote these bounded checks into repository verification without treating external-link availability as deterministic release evidence.

### Phase 4 implementation inputs

#### P4-01 — Durability and recovery

- Status: `missing` as a Phase 4 feature
- Includes backup/restore format, event checksums, command-ledger recovery, retention, crash injection, migration rehearsal, and rollback.
- Important inherited limit: Alpha.22 idempotency handles normal retries and concurrent duplicates but does not claim distributed exactly-once behavior or crash safety at every persistence boundary.

#### P4-02 — Policy and evaluation suite

- Status: `partial` foundation
- Existing policy checks cover many individual violations, but there is no consolidated evaluation suite or scorecard for false completion, wrong revision, self-approval, unauthorized external operation, and rework.
- The suite should use adversarial scenarios and preserve refusal or escalation evidence rather than only count passing code paths.

#### P4-03 — Multi-repository federation contract

- Status: `missing`
- Required design before schema implementation:
  1. every service repository retains its own `.ai-org/` canonical state;
  2. cross-repository identity uses a composite reference such as `project_id + work_item_id`, never a bare Work Item ID;
  3. service-local parents and dependencies remain local, while cross-service Initiative and dependency references use a separate versioned contract;
  4. one source owns each API or event contract; consumers pin an exact revision instead of copying the authority;
  5. a coordination repository owns only genuinely cross-service Initiative, domain-map, contract-index, and rollout artifacts;
  6. the portfolio surface aggregates read-only projections and cannot advance local lifecycle state;
  7. cross-repository changes use compatibility and rollout waves, not an assumed atomic multi-repository commit;
  8. provider credentials and Human Principal authority remain repository-scoped and least-privileged.
- An ADR must define this authority model before a service registry, portfolio store, or cross-repository Work Item schema is added.

#### P4-04 — Portfolio and operational metrics

- Status: `missing`
- The roadmap names duplicate scope, context-loss rework, unsupported completion claims, handoff comprehension time, approval age, and QA separation, but there is no durable cross-project baseline or historical scorecard.
- The portfolio should aggregate bounded project projections, capacity, and user-approved cost inputs without copying canonical project state.

#### P4-05 — Retention, audit export, and notification control

- Status: `missing`
- Human Inbox command, submission, and audit data currently has local bounded-content rules but no full retention lifecycle, export contract, or notification throttling.
- Secret redaction must be re-evaluated at every aggregate and export boundary.

#### P4-06 — Maintainability before further surface growth

- Status: `partial`
- Evidence: behavioral regression coverage is broad, but `src/cli.mjs`, `src/work-items.mjs`, and `src/tracker.mjs` are already large modules, and no lint, type, or coverage threshold is enforced.
- Required action: establish measurable change-risk signals and module boundaries during Phase 4 design. Do not perform a cosmetic large refactor without a failing maintenance scenario or preserved public behavior tests.

### Retained validation that must stay visible

- Real multi-human, multi-machine, separate-clone claims, branches, pull requests, protected rules, CI, integration joins, and conflict recovery.
- Large-repository deterministic retrieval quality and any configured local-hybrid or RAG provider.
- Long-duration control-plane soak, large-journal performance, and process termination at every persistence boundary.
- Windows execution and broader cross-platform filesystem behavior unless promoted into the supported matrix.
- Regulated-audit acceptance, organization-specific approvals, and production-release operation.

These are not reasons to represent delivered local features as missing. They are reasons to keep enterprise and production-readiness claims narrower than the local implementation.

### Phase 5 or explicit optional scope

- External GitHub, Jira, CI/CD, deployment, or notification writes.
- Remote control-plane access, organization-wide RBAC, remote workers, and centralized mutable authority.
- Slack or email delivery and cross-team portfolio automation.
- Automatic bidirectional synchronization with external planning or business-document systems.

## Recommended execution sequence

1. **Closeout-0A — release integrity:** complete C0-01 and C0-02, then rerun the exact-revision launcher and CI.
2. **Closeout-0B — bounded reality checks:** complete C0-03, C0-04, and C0-05 in disposable or copied repositories with explicit stop conditions.
3. **Phase 4 research and ADRs:** research durability, evaluation, and federation; accept the authority and data contracts before implementation.
4. **Phase 4A implementation:** backup, restore, checksums, crash recovery, migration rehearsal, and audit retention.
5. **Phase 4B implementation:** adversarial policy evaluation and daily Human Inbox reliability.
6. **Phase 4C implementation:** multi-repository registry and read-only portfolio, followed by the retained multi-repository validation.
7. **Open-source release track:** complete OS-01 through OS-05 when the owner is ready to make the repository public; do not silently combine publication with Phase 4 implementation.

## Entry gate for Phase 4 implementation

Phase 4 implementation may start when:

- the exact reviewed baseline is pushed, CI is green, and a fresh project launcher recovers it;
- the changelog and roadmap describe Alpha.20–22 accurately;
- the live Codex, live GitHub, and data-bearing upgrade checks have passed or have an explicit retained decision with owner, reason, and next review point;
- the Phase 4A durability contract and the multi-repository authority principles above are accepted before their schemas are written;
- no unresolved finding is being hidden by calling a local test “enterprise-ready.”

Until then, Temple remains suitable for bounded local alpha use and continued review, not for a broad production or multi-repository readiness claim.
