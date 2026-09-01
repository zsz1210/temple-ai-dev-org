# WI-0083 Developer Report

- Position: Developer
- Agent Identity: Rikku (`agent-rikku`)
- Candidate revision: `ad10d528113963673724d9b02004b62e87aaafbe`
- UI mode: `not-applicable`
- External action: no provider call, model switch, policy mutation, push, deployment, or release

## Implemented

- Added the managed `temple.matched-model-evaluation/v1` schema and mirrored it in the install overlay.
- Extended the project-owned Usage Policy with an optional, backward-compatible list of explicitly configured evaluation sources below `.ai-org/evaluations/model/`.
- Added a bounded loader that rejects unsafe paths, linked files, repository escapes, missing files, oversized files, and invalid JSON without scanning the repository.
- Added a deterministic quality-first evaluator for one exact task shape. It requires identical case IDs, input digests, source revisions, rubric, profile mappings, and statistical decision contract before comparing resource measures.
- Added the versioned `paired-sign-test-v1` comparison. A challenger must pass every quality case, meet the configured minimum Token effect, and pass the exact two-sided sign test. Token count, latency, rework, human intervention, and profile ID provide deterministic ordering.
- Added `usage evaluate --fixture ... --no-write --json` and integrated configured sources into `usage report` and `usage preflight`.
- Kept observational shadow candidates separate from project-qualified matched advisories.
- Kept every execution and authority flag false. The evaluator does not contact a provider, launch evaluation cases, select a model for an active task, rewrite policy, change lifecycle state, or share data across projects.
- Updated English, Traditional Chinese, and Japanese README copy and the deeper operations guide without claiming that real model superiority has been proven.

## Verification

- Focused Usage Policy, evaluator, CLI, schema, installation, and upgrade tests: 20 passed, 0 failed.
- Shared-tree `npm run verify`: 260 passed, 0 failed.
- Fresh detached worktree at the exact candidate revision: `npm run verify` passed 260 of 260 tests.
- Exact-candidate schema validation: valid, 104 documents checked through 28 schemas, 0 errors.
- Exact-candidate Doctor: healthy, 35 passes, 1 existing stale parallel-plan warning, 0 failures.
- Exact-candidate self-host preflight: no evaluation source is configured, so the result is `not-configured`; `execution_status` is `not-implemented`, `automatic_routing` is `false`, `model_switch_performed` is `false`, and canonical state is unchanged.

## Boundaries

- The fixtures prove deterministic qualification and rejection behavior; they do not prove that Luna, Terra, Sol, or another profile is better for Temple's real work.
- Temple's own project policy intentionally lists no matched-evaluation source. Collecting real comparison data requires a separately authorized provider, evaluation set, budget, rubric, and privacy review.
- Only the `balanced` policy objective and `paired-sign-test-v1` are supported in this slice. Another objective or statistical method fails closed.
- Automatic routing, adaptive self-modification, live evaluation execution, cross-project learning, monetary cost claims, push, and release remain outside this Work Item.
