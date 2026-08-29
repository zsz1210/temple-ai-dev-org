# Greenfield cold-task recovery result

- Status: **passed with limits**
- Test date: 2026-08-30
- Protocol revision: `391fe3f5de6a6e2623619f9e7ab4c1019af30b67`
- Framework baseline: `0.1.0-alpha.16` at `804de31aec791546693abc8b52549f0eaf23b1ec`
- Product repository: private `zsz1210/ideadock`
- Product closeout revision: `a93e57136e7a73b9aca82721720274abbe614d24`
- Exact Developer handoff and QA revision: `716b2cadd6baa64b185e2f9c733d7cc7b98319c6`
- Environment: macOS 26.5.2 arm64, Node.js 25.6.1, npm 11.11.0, Xcode 26.6, iPhone 17 Pro Simulator on iOS 26.5
- Governing plan: [Greenfield cold-task recovery test plan](greenfield-cold-task-recovery-test-plan.md)

## Scope

The originating task created IdeaDock as a new private, retained product repository. It established the product charter, domain language, requirements, code-first UI contract, technical design, five Work Items, a buildable iOS baseline, and a two-wave parallel plan. It committed and pushed that state before any feature implementation.

A new projectless Codex task then received only the private repository URL and a request to recover and continue from repository state. It received no product summary, Work Item ID, Position, Agent name, next command, or prior-chat handoff.

The complete private execution record is retained at `docs/validation/cold-task-recovery.md` in the IdeaDock closeout revision above.

## Recovery result

The fresh task cloned a clean `main` at `df6dc486aa90118b6b59cbcaa483882893b83e9e` and, before mutation, correctly reconstructed:

- the local-first IdeaDock product and its explicit exclusions;
- the difference between the buildable placeholder and unimplemented product behavior;
- all five Agent Identities, ten Positions, and Developer versus Independent QA separation;
- the parent Work Item, first parallel wave, sequential integration wave, affected-path boundaries, approved specifications, Integration Owner, and stop boundary;
- the absence of registered tasks, claims, candidate revisions, QA, release, deployment, and retained test-result artifacts.

It requested no old-chat explanation. The parent Codex task was registered against the parent Work Item, received the generated stable title, and later became completed and archive-ready.

## Runtime execution and join

The fresh task consumed the repository plan rather than inventing a new decomposition:

| Work Item | Scope | Candidate revision |
|---|---|---|
| `WI-0002` | Domain validation and deterministic Product Brief renderer | `d8fc6b6c2903f7d23ed7d7f934f458ae0d198d37` |
| `WI-0003` | SwiftData repository and failure recovery | `fb70ac3eb4326ac37ce5507f0658f8afd301b449` |
| `WI-0004` | Native capture, validation, preview, retry, and share surfaces | `9da2b3220295783ef0a9902f8a4cd49d49721991` |

The three workers used isolated worktrees from one recorded base and stayed inside disjoint declared paths. Red-to-green work found a real persistence defect: after a failed save, an old `ModelContext` could still expose content that had not reached disk. The implementation rebuilt the context after failure and added failed-insert and failed-update coverage.

Integration Owner Theo Grant recorded the candidate-to-joined mapping at `84f786d46d888284810fb0f9193a7b551c45d3ea`. The joined suite passed 21 tests with zero failures; three named app-composition checks remained intentionally skipped until `WI-0005`. The dependent wave then composed the application, added deterministic runtime fixtures, retained ten required Simulator states, and produced the exact Developer handoff revision.

Canonical lifecycle changes made earlier plans stale. Status exposed the stale state, and no dependent dispatch used it before rebuilding. Terminal closeout rebuilt a fresh zero-wave plan.

## Verification and closeout

- Developer verification: 28 passed, 0 failed, 0 skipped.
- Quality Evaluation: a clean exact-revision run passed 28, failed 0, skipped 0.
- Independent QA: a distinct second clean exact-revision run passed 28, failed 0, skipped 0.
- Runtime evidence covered empty, editing, validation, populated, preview, native share-sheet, persistence-error, relaunch-persistence, and accessibility-size states.
- The final source, tests, project configuration, and UI evidence were unchanged between the exact QA revision and repository closeout.
- All five Work Items closed, all claims were released, the task became archive-ready, and `temple doctor` passed 27 checks with zero warnings or failures.
- Release `go` meant repository closeout only. No physical-device, TestFlight, App Store, production, public, external-tracker-write, or destination-delivery action occurred.
- The experiment stop boundary held; no second IdeaDock feature was created.

## Limits and observed friction

1. **CLI bootstrap depended on host setup.** The fresh task correctly stopped when `temple` was absent from `PATH`. The documented `npm link` prerequisite was restored after its recovery report. This supplied no product or organizational hint, but a repository alone is not yet sufficient to bootstrap the CLI on a clean host.
2. **Internal worker correlation is incomplete.** The parent Codex task was registered, but collaboration subagents were internal runtime workers rather than user-owned Codex tasks and were not represented in the project task registry. Their candidate revisions and worktrees were preserved through Work Item and join evidence.
3. **Claim sequencing required self-correction.** The runtime created worktrees and began red-phase work before the three first-wave claims were recorded. The orchestrator detected the mismatch, registered the exact branches, worktrees, and bases, rebuilt the plan, and accepted no candidate evidence before correction. Dispatch still needs an atomic preflight boundary.
4. **Discipline eligibility is Work Item-wide.** Build-era `general-development` requirements did not initially match Quinn Vale's `quality` memberships at the QA stage. The run added explicit eligibility without changing Position authority, but stage-specific discipline requirements should be validated earlier.
5. **Parallel source work can share a scarce test resource.** Concurrent workers caused CoreSimulator materialization contention. Source work remained parallel while Simulator verification was serialized and isolated. Temple does not yet model runtime resource locks.
6. **The evidence is intentionally narrow.** One user, one machine, one iPhone Simulator model, portrait orientation, and one accessibility size do not validate multi-human or multi-machine coordination, a full device matrix, VoiceOver, physical devices, production operations, or product usefulness.
7. **No Lesson or Practice was promoted automatically.** One successful pilot is evidence for framework decisions, not sufficient reason to install another Skill or Practice in every project.

## Decision

The Phase 1.5 exit gate is satisfied: a non-example product moved from an unstructured idea to exact-revision closeout, and a new conversation recovered and continued the organization without the originating chat or manual reconstruction by the user.

Phase 2 may begin, but this result does not satisfy the retained multi-human, multi-machine test. Alpha.17 should stay narrower than a full control plane and prioritize the friction observed here:

1. preserve a discoverable, version-pinned CLI bootstrap or invocation contract for fresh hosts;
2. define an atomic claim-before-worker dispatch boundary plus runtime-worker correlation and task-registry semantics for internal subagents versus user-owned Codex tasks;
3. support or preflight lifecycle-stage discipline eligibility without weakening Position authority;
4. expose shared verification-resource constraints so parallel implementation can degrade verification safely and observably.

The retained [collaborative large-scale test](collaborative-large-scale-test-plan.md) remains **planned / not run**.
