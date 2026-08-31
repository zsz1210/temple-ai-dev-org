# Independent QA report — WI-0070

- Tested candidate revision: `a5f3860a0a4cef5cd54260b75a74f0f6391d787f`
- Independent QA: Lulu (`agent-lulu`)
- Developer: Rikku (`agent-rikku`)
- Result: **PASS — advance to the unclosed Release Gate**

## Reproduction

Independent QA used a new detached worktree at the exact candidate revision and linked only the main checkout's existing lockfile-matching dependencies. No package was installed or downloaded.

- deliberately asynchronous provider-owned scenario: 96/96 passed with concurrency 12 in 28,635 ms;
- full `npm run verify`: 246/246 passed with zero failures, skips, cancellations, or TODOs;
- schema validation: 91 documents matched 27 schemas with zero errors;
- Doctor: 35 pass, one known stale generated parallel-plan warning, zero failures;
- production provider diff from the base revision: empty;
- whitespace and diff checks: pass.

Across Developer, Quality, and Independent QA, the corrected focused scenario ran 208 times under concurrency with zero failures. The earlier 24-run baseline also passed but did not exercise deliberately delayed post-response delivery and therefore is not counted as fix evidence.

## Decision

The candidate now tests the actual evidence boundary: launch acknowledgement and usage notification are independent; only a subscribed, exact, durably appended usage record satisfies the expectation. Shutdown and elapsed time do not create a pass. No production provider, Agent Command, or provider-trust behavior changed.

No live provider, model generation, external network action, command delivery, push, deployment, publication, release, or paid action occurred.
