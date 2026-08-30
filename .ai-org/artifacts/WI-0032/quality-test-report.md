# Quality test report — WI-0032

- Tested integrated revision: `8ae349e072c25297810c9e5320a782d5199fbc8c`
- Developer candidate revision: `27d735d89d30915ee2399f80f85ad563477d420c`
- Quality identity: Lulu (`agent-lulu`)
- Position: Quality & Evaluation Engineer
- Verdict: **GO — pass to Independent QA**

## Revision authority and provenance

Quality ran from the assigned clean worktree on branch `review/qa-wi-0032-federation` at integrated HEAD `8ae349e072c25297810c9e5320a782d5199fbc8c`. A path-bounded `git diff --exit-code` proved that `src/federation.mjs`, `test/federation.test.mjs`, `docs/operations/multi-repository-federation.md`, and `SECURITY.md` are byte-identical to Developer candidate `27d735d89d30915ee2399f80f85ad563477d420c`; the intervening commits contain only handoff, evidence, runtime-worker, event, Work Item, and generated-view state.

The isolated worktree initially lacked dependencies. Quality reused the main checkout's already-installed lockfile-matching `ajv@8.20.0` and `ajv-formats@3.0.1` through a temporary ignored `node_modules` symlink. No dependency was installed, fetched, vendored, or committed.

## Fresh hostile-repository reproduction

Quality first reran `node --test test/federation.test.mjs`: 11/11 passed with zero failures, skips, cancellations, or TODOs. A separate inline harness then created new disposable Git repositories and challenged the integrated implementation independently of the checked-in fixtures:

- external `core.fsmonitor`: a participant-local executable marker was configured; the marker did not run, the participant projected `current`, and its non-Git content digest remained unchanged;
- nested participant path: a claimed nested directory resolved through its parent repository and degraded to `unknown` with `repository_root_mismatch`; `source_revision` stayed null, no project or Work Item was exposed, and participant content remained unchanged;
- ambient Git injection: injected `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, config-count fsmonitor, askpass, SSH command, SSH program, SSH askpass, and credential-agent variables neither executed the marker nor redirected inspection to the decoy repository; target and decoy content remained unchanged;
- missing promisor object: a required loose blob was removed after configuring a loopback-only promisor remote; inspection made zero loopback requests, degraded to `unknown` with bounded `participant_invalid`, exposed no project or Work Items, and left participant content unchanged.

For immutability, Quality compared deterministic SHA-256 digests of every non-`.git` file, directory, mode, and symlink before and after each inspection. The `.git` changes used to construct hostile fixtures occurred before the baseline; no participant lifecycle or canonical file changed during inspection.

## Repository-wide gates

- full `npm run verify`: repository and documentation checks passed; 202/202 tests passed with zero failures, skips, cancellations, or TODOs;
- schema validation: 55 documents matched 24 Draft 2020-12 schemas with zero errors;
- Doctor: healthy, 35 pass, one known stale parallel-plan warning, zero failures;
- `git diff --check`: passed;
- affected implementation and security-document paths were unchanged between Developer candidate and tested integrated HEAD.

The stale generated parallel plan predates this Quality run. It must be rebuilt before another dispatch but does not invalidate the already prepared and attached WI-0032 worker or the exact-revision test result.

## Documented residual boundary

`docs/operations/multi-repository-federation.md` documents that local filesystem and Git checks do not harden against replacement of a repository during the same read and that multi-machine availability and hosted-provider identity remain unproven. This evidence is local to macOS Darwin 25.5.0 arm64, Apple Git 2.50.1, Node 25.6.1, a POSIX fsmonitor marker, and loopback HTTP. Git executable selection through the operator environment, wider operator/provider trust, and non-POSIX platform behavior remain outside WI-0032.

No external network, hosted-provider call, push, release, publication, deployment, external-system write, real provider action, or participant lifecycle mutation was performed.
