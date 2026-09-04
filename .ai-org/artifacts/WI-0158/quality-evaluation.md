# WI-0158 Quality evaluation

- Quality Evaluator: Lulu (`agent-lulu`)
- Exact candidate: `3ffd987c9a487783f1c8fbeed735af94f19dbc80`
- Result: **Pass with retained publication follow-up**

## Acceptance evaluation

1. **Frozen source — pass.** The package identity, SHA-256, size, inventory, and source revision were recorded before either Provider task began.
2. **Fresh delivery — pass.** One isolated task used the frozen package and neutral QueueKeep brief, created target `WI-0001`, and stopped at accepted closeout without maintainer coaching.
3. **Identity separation — pass.** Target Developer Devon and Independent QA Elliot are different Agent Identities.
4. **Cold recovery — pass.** A different task received no delivery conversation or coordinator Work Item ID, recovered the correct target namespace and evidence, and left the repository clean.
5. **Truthful measurement — pass.** Elapsed times, two delivery errors, one implementation correction, zero Human interventions, zero model retries, and unknown Token totals are retained. The comparison makes no general efficiency claim.
6. **Exact candidate — pass.** A detached checkout installed dependencies from the committed lockfile and passed repository checks, documentation-link checks, package-boundary checks, and all 434 Node tests. Production dependency audit reported zero known vulnerabilities.
7. **Release boundary — pass.** No visibility, version, tag, GitHub Release, npm, deployment, announcement, reset, purchase, retry, or fallback action occurred.

## Observed friction

The delivery task corrected an ESM/CommonJS scaffold conflict and one placeholder Evidence reference. Temple failed the latter command before mutation. These are retained as observed friction, not erased by the successful closeout.

The first QA shell invocation accidentally ran from the coordinator checkout instead of the detached worktree and was stopped. It is an invalid environment setup attempt, not candidate evidence. The subsequent run used the tool-level detached-worktree directory and is the only QA result cited above.

## Publication follow-up

The package audit is clean. The repository public profile still blocks four maintainer-path occurrences in historical WI-0155 and WI-0156 evidence and retains separate legacy and binary review queues. This does not invalidate the Core Path rehearsal, but it blocks a future visibility change until resolved and reviewed.
