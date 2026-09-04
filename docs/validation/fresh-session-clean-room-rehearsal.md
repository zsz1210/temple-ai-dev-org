# Fresh-session clean-room rehearsal

- Work Item: `WI-0155`
- Result: **Pass with follow-up findings**
- Temple source: `779ba588f4c7315871c4ff0eaeb1df76bfca669a`
- Package: `@zsz1210/temple-ai-dev-org@0.1.0-alpha.29`
- Date: 2026-09-04

## What was tested

Two new Codex tasks were used instead of continuing the maintainer conversation.

1. A delivery task received only a frozen product brief and a local Temple package. It initialized a new repository, created project-specific Agent Identities, implemented a bounded product change, tested it, recorded evidence, and closed its Work Item.
2. A recovery task received only the resulting repository path and a recovery question. It had no access to the delivery task's conversation or final answer.

The disposable product was **QueueKeep**, a local Node.js CLI that adds, lists, and completes queue items in a JSON file. The run performed no publication, remote write, package release, purchase, reset, or fallback.

## Result

The rehearsal met every stated acceptance criterion.

| Measure | Observed result |
| --- | --- |
| Delivery task | Completed in 434.800 seconds |
| Cold-recovery task | Completed in 85.823 seconds |
| Combined Codex task time | 520.623 seconds (about 8 minutes 41 seconds) |
| Human questions or interventions | 0 |
| Product rework after first verification | 0 |
| Application tests | 2 passed, 0 failed |
| Temple Doctor | 37 passed, 0 warnings, 0 failures |
| Completed product Work Items | 1 (`WI-0001`) |
| Target repository commits | 3 |
| Provider-reported Tokens | Unknown; reliable per-task telemetry was unavailable |

The accepted product revision was `ad46bc77eae6caf3b8d6bf2a61595feaa2aa8a10`. The target repository ended at evidence-only commit `db4fd2a2ec13b2e89e47eef7a3bf07c1a01d4187`, with a clean worktree and no Git remote.

## What the recovery task found

Without the delivery conversation, the second task correctly recovered:

- the QueueKeep product purpose and bounded scope;
- the sole completed Work Item and its accepted outcome;
- Engineering Manager Mira as terminal owner;
- Developer Theo and Independent QA Priya as distinct Agent Identities;
- the exact implementation and tested revision;
- the recorded developer, test, evaluation, Independent QA, and closeout evidence;
- the passing application tests, healthy Doctor result, clean repository, and absence of a remote;
- that the safe next action was to preserve the sample unless a new Work Item was authorized.

The recovery task initially tried source identifier `WI-0155`, which appeared in its Codex task title but did not exist in the target repository. It recovered by inspecting the target's canonical state and selecting `WI-0001`. This did not prevent recovery, but it reveals avoidable test-title contamination.

## Friction observed

The participant recovered without maintainer help, but several commands required correction:

- non-interactive initialization required discovering the configuration-file shape and the accepted repository-source value;
- test evidence required structured JSON rather than a Markdown-only report;
- later gate commands required the exact returned Evidence ID rather than a partial or document reference;
- the locally packed scoped package was installed successfully, but an exploratory command first tried an unscoped module name;
- the recovery task title exposed the coordinator Work Item ID even though the target repository had its own Work Item namespace.

These are onboarding and protocol-ergonomics findings, not product-scope failures. They should be addressed before freezing the public Alpha candidate because they caused avoidable trial and error in a fresh session.

## Interpretation boundaries

This result supports a narrow claim: a new Codex task can initialize a new repository from the frozen Temple package, deliver one small local change, preserve repository-backed state, and allow another cold task to recover that state without chat handoff.

It does **not** prove:

- that an unaided human can understand the documentation;
- that larger or multi-repository work will behave the same way;
- general speed, quality, or Token savings;
- reliable Token attribution when no compatible telemetry source is available;
- process-level Independent QA by a separate model run during delivery. Session A used distinct Developer and Independent QA Agent Identities sequentially inside one Codex task; Session B was a separate task that independently verified recovery and repository health.

## Recommendation

Treat the clean-room release gate as passed, but create one small pre-freeze remediation Work Item for the observed onboarding friction:

1. provide a copyable non-interactive initialization example and explicitly list accepted repository-source values;
2. show the minimum structured test-observation example and explain when an exact Evidence ID is required;
3. remove coordinator Work Item IDs from reusable cold-recovery task titles;
4. keep unavailable Token data labeled `unknown` rather than estimating it.

After those focused corrections and normal exact-revision verification, Temple can proceed to the private Alpha freeze review. This rehearsal does not itself authorize publication, an npm release, a tag, or a change in repository visibility.

