# Independent QA report — WI-0069

- Tested candidate revision: `aead7f548adde729e607d3db2806f62dd2251967`
- Independent QA identity: Lulu (`agent-lulu`)
- Developer identity: Rikku (`agent-rikku`)
- Position: Independent QA
- Result: **PASS — advance to the unclosed Release Gate**

## Independent revision authority

Independent QA created a fresh detached worktree at the exact Developer candidate. It did not reuse the Developer or Quality working directory. Because a linked worktree has no local dependency directory, QA temporarily linked it to the main checkout's already installed, lockfile-matching `node_modules`; no dependency was installed, fetched, vendored, or committed. The link and worktree were removed after verification.

## Repository-wide verification

- final `npm run verify`: repository and documentation checks passed; 246/246 tests passed with zero failures, skips, cancellations, or TODOs;
- schema validation: 90 documents matched 27 Draft 2020-12 schemas with zero errors;
- Doctor: 35 pass, one known stale generated parallel-plan warning, zero failures;
- `usage report --no-write`: loaded the project policy, reported `cold-start` calibration and `shadow` recommendation mode, kept automatic routing ineligible, kept Credits/cost `unknown`, and confirmed that Token limits are not financial limits;
- autonomy projection: `exceptions-only`, routine decision `automatic`, with explicit approval triggers for spend, external writes, irreversible actions, deployment/release, privacy changes, unapproved models/providers, budget breaches, high-risk low-confidence work, and policy changes;
- `git diff --check`: passed.

## Reproduction notes

The first full attempt exposed a test-fixture setup issue: the detached worktree had no local `node_modules`, so a self-host fixture created a broken dependency link. After QA supplied a temporary link to the existing lockfile-matching installation, that test passed independently.

A later full attempt exposed one intermittent, out-of-scope control-plane timing signal: the provider-owned usage notification was not present before assertion. The same test passed immediately in isolation, and the final unmodified full suite passed 246/246. This is not evidence of a WI-0069 Usage Policy regression, but it should be tracked separately as test-stability work rather than hidden.

## Acceptance and residual boundary

No blocking counterexample was found for initialization, upgrade preservation, progressive project-local calibration, diagnostic-only thresholds, cost provenance, exception-only autonomy, or fail-closed unknown data. The result does not qualify a live provider, a monetary cost source, automatic model execution, cross-project learning, deployment, or release.

No live model generation, provider call, external network action, push, release, publication, deployment, external-system write, or paid action was performed.
