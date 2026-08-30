# Independent QA report — WI-0032

- Tested integrated revision: `024af6123163c52d4aa06b051c2d39de9fb2ace1`
- Developer candidate revision: `27d735d89d30915ee2399f80f85ad563477d420c`
- Quality input revision: `8ae349e072c25297810c9e5320a782d5199fbc8c`
- Independent QA identity: Lulu (`agent-lulu`)
- Developer identity: Rikku (`agent-rikku`)
- Position: Independent QA
- Result: **PASS — advance to the unclosed Release Gate**

## Independent revision authority

Independent QA ran only after WI-0032 entered `independent_qa`, in the assigned `review/independent-qa-wi-0032-federation` worktree. The exact integrated HEAD was `024af6123163c52d4aa06b051c2d39de9fb2ace1`. Path-bounded comparisons proved that `src/federation.mjs`, `test/federation.test.mjs`, `docs/operations/multi-repository-federation.md`, and `SECURITY.md` are byte-identical both to Developer candidate `27d735d89d30915ee2399f80f85ad563477d420c` and Quality input `8ae349e072c25297810c9e5320a782d5199fbc8c`.

The isolated worktree initially lacked dependencies. Independent QA used a temporary ignored `node_modules` symlink to the main checkout's existing lockfile-matching installation. No dependency was installed, fetched, vendored, or committed. The symlink and disposable harness were removed before final handoff.

## Fresh hostile-repository reproduction

Independent QA authored a new disposable harness and constructed fresh repositories after entering this Position. The harness did not reuse Developer or Quality fixtures or assertions as evidence.

- **Exact root and external `core.fsmonitor`:** the exact participant root projected `current` at its exact revision. A repository-local `core.fsmonitor` value pointed to an executable outside the participant; the marker did not execute. A SHA-256 snapshot covering the whole participant tree, including `.git`, file modes, and symlinks was unchanged.
- **Nested path:** a claimed nested directory discovered through a parent repository degraded to `unknown` with the exact bounded diagnostic `repository_root_mismatch`. `source_revision` remained null, no project or Work Item was exposed, the local path was absent from the projection, and the full participant-tree digest was unchanged.
- **Ambient Git, config, credential, and SSH injection:** injected Git directory, common-directory, worktree, index, object, alternate-object, namespace, ceiling, global/system config, command-line config, askpass, SSH, credential-agent, proxy-command, and Git-exec-path variables neither executed a marker nor redirected inspection to a decoy repository. The target projected `current` with its own exact identity and revision. Full-tree digests of both target and decoy were unchanged, and decoy identity, raw participant fields, and local paths were absent from the projection.
- **Missing promisor object:** a required loose project blob was removed after configuring a loopback-only promisor remote. Inspection made exactly zero loopback requests, degraded to `unknown` with `participant_invalid`, projected no project or Work Items, exposed no remote URL, local path, or raw failure, and left the full participant tree unchanged.

The four hostile checks therefore reproduced executable-config isolation, exact-root authority, scrubbed noninteractive Git execution, no lazy fetch, bounded fail-closed diagnostics, no participant lifecycle mutation, and participant immutability independently of the checked-in federation suite.

## Repository-wide verification

- focused federation suite: 11/11 passed with zero failures, skips, cancellations, or TODOs;
- full `npm run verify`: repository and documentation checks passed; 209/209 tests passed with zero failures, skips, cancellations, or TODOs;
- schema validation: 55 documents matched 24 Draft 2020-12 schemas with zero errors;
- Doctor: healthy, 35 pass, one known stale generated parallel-plan warning, zero failures;
- `git diff --check`: passed;
- both affected-path comparisons against the Developer candidate and Quality input revision: empty.

Environment: macOS 26.5.2, Darwin 25.5.0 arm64, Node 25.6.1, and Apple Git 2.50.1. The only HTTP listener was a disposable loopback sentinel, and its request count remained zero. No external network, hosted-provider request, push, release, publication, deployment, external-system write, real provider action, implementation change, provider-trust change, or participant lifecycle mutation occurred.

## Decision and residual risk

No blocking counterexample was found. Independent QA supports transition only to the unclosed Release Gate for the affected implementation as integrated at `024af6123163c52d4aa06b051c2d39de9fb2ace1`.

Same-read repository replacement remains an acknowledged local time-of-check/time-of-use limit. Operator-controlled Git executable selection through `PATH`, non-POSIX behavior, hosted-provider identity, organization-wide RBAC, and multi-machine races remain outside WI-0032. The stale generated parallel plan must be rebuilt before a future dispatch; it does not invalidate this already prepared exact-revision reproduction.
