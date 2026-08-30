# Developer evidence — WI-0032

- Position: Developer
- Agent Identity: Rikku (`agent-rikku`)
- Exact candidate revision: `27d735d89d30915ee2399f80f85ad563477d420c`
- Result: pass to Test and Quality & Evaluation

## Security properties

- Every federation Git subprocess receives an allowlisted noninteractive environment instead of inherited ambient credentials or `GIT_*` injection variables.
- Global and system Git configuration are skipped. Command-scoped overrides disable external `core.fsmonitor`, hooks, credential helpers, replacement objects, and transport protocols.
- `GIT_NO_LAZY_FETCH=1` forbids automatic retrieval of missing promisor objects; the protocol denylist is retained as defense in depth.
- A participant path must resolve to the exact top level reported by Git before the expected revision or any canonical document is read. Nested paths discovered through a parent repository degrade to `repository_root_mismatch`.
- Literal-object reads, canonical dirty-state checks, symlink refusal, size bounds, bounded diagnostics, and participant lifecycle immutability remain in force.

## Exact-candidate verification

- `node --test test/federation.test.mjs`: 11/11 passed with zero failures, skips, cancellations, or TODOs.
- Hostile fixtures proved that an external `core.fsmonitor` marker did not execute, a nested participant path did not expose the parent repository, injected `GIT_DIR`, `GIT_WORK_TREE`, config, askpass, SSH command, and credential-agent variables did not redirect inspection, and a missing promisor blob caused zero requests to a local HTTP sentinel.
- Existing regressions continued to prove literal revision reads despite `git replace`, refusal of Git and filesystem symlinks, dirty canonical-state degradation, bounded projection, and participant content immutability.
- `npm run verify`: repository checks and documentation links passed; 202/202 tests passed with zero failures, skips, cancellations, or TODOs.
- `node ./templew.mjs schema validate . --json`: 55 documents matched 24 Draft 2020-12 schemas with zero errors.
- `node ./templew.mjs doctor . --json`: healthy; 35 pass, one known stale parallel-plan warning, and zero failures. The stale plan predates dispatch and was not used for another preparation.
- `git diff --check`: passed before the implementation commit.

## Boundaries and residual risk

No push, release, publication, deployment, external-system write, hosted-provider request, participant lifecycle mutation, or provider-trust code change was performed. The missing-object regression used only a loopback sentinel and observed zero requests.

The participant checkout can still be replaced during the interval between filesystem and Git reads; this existing local time-of-check/time-of-use limit remains documented. Evidence is local to macOS with Apple Git 2.50.1 and a POSIX fsmonitor fixture; fresh Independent QA must reproduce the exact commit. Git executable selection and broader operator/provider trust remain outside WI-0032 and are not claimed by this evidence.
