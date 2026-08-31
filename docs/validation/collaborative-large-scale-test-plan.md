# Collaborative large-scale real-environment test plan

- Status: **planned / not run**
- Capability: Collaborative profile
- Evidence class: multi-human, multi-machine, real Git hosting
- Canonical status field: `.ai-org/project/collaboration.json -> validation.real_collaborative`

## Why this test is retained

Local automated tests cannot reproduce organizational behavior, repository latency, independent checkouts, conflicting pull requests, or several people operating their own Agents. The Collaborative foundation must therefore keep a visible real-environment validation gate. Passing unit or fixture tests must not change this record to `passed`.

## Required environment

- At least two active Human Principals who are actually operated by different people.
- Enough distinct Agent Identities to exercise implementation, integration, and Independent QA separation; no fixed team size is implied.
- At least two physical computers or independently administered development environments.
- One Git-hosted repository with protected default branch, pull requests, required CI, and review rules.
- Developer memberships covering frontend, backend, and infrastructure or mobile Disciplines.
- Separate UI Designer or UX Designer participation.
- Independent QA performed by an Agent Identity that did not implement the tested candidate.

## Scenario

1. Start from one parent feature with a stable product acceptance contract.
2. Decompose it into at least six child Work Items: contract, UX or UI, frontend, backend, infrastructure, and integration/QA.
3. Include three safely disjoint affected-path scopes.
4. Include one intentional affected-path conflict that must become sequential or receive an explicit resolution record.
5. Include one blocked dependency and one shared contract that changes after an initial claim.
6. Create Work Items concurrently from two clones and verify unique IDs survive merge.
7. Attempt competing claims on the same Work Item and verify the repository exposes a conflict instead of silently accepting both.
8. Run eligible and ineligible Discipline claims and preserve the rejection evidence.
9. Open separate pull requests, run CI, perform code-owner review, and integrate through the named integration owner.
10. Run Independent QA on the exact integrated candidate revision, then complete the release gate without performing an external production release.
11. Close all originating Codex tasks and recover the full organizational state in a new task from repository files.

## Pass criteria

- No Work Item ID collision or lost canonical record.
- No Agent works outside an eligible Position and Discipline without an explicit governance change.
- A conflicting claim or write scope cannot disappear silently.
- Parent/child dependencies and shared-contract changes remain visible after handoff.
- Every merged child scope identifies Principal, Agent, base revision, branch or PR, evidence, and integration owner.
- Developer and Independent QA remain different Agent Identities on the accepted revision.
- A new task can identify active, blocked, sequential, QA-pending, and closed work without reading old conversations.
- `temple doctor` has no failures; `temple status` matches Git-hosting evidence.

## Failure and rollback evidence

Record rejected claims, merge conflicts, stale-base findings, CI failures, contract changes, abandoned worktrees, and task recovery failures. Preserve rollback commands and the exact commit graph. Do not repair the fixture by editing canonical JSON without recording the change and responsible Principal.

## Completion record

When the test is actually run, create a separate immutable validation record containing repository and commit references, real participating Principals, environment details, commands, CI URLs, PR evidence, observed failures, final results, and residual risks. Only then may an approved project change set `validation.real_collaborative.status` to `passed`. A passing `simulated_collaborative` gate is useful evidence but cannot be promoted or copied into this gate.
