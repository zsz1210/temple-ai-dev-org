# WI-0170 Independent QA

Latest disposition: **PASS** for candidate `7716b1fe5dc83ecfa3d52a15513d79aebeb63aaf`. The initial P3 selector finding below was corrected under WI-0171 and independently retested. This QA result does not substitute for the coordinator's full verification or Release Gate.

## Candidate and responsibility

- Reviewer: Lulu (`agent-lulu`), Position `independent_qa`; Developer: Rikku (`agent-rikku`).
- Candidate: `3c23d0d17f35bdadea0acaea35d3cef3b13fcfdb`.
- Comparison baseline: `65bf39cc5aa4783e5887810f1dbfd7a71bfe3bde`.
- Runtime: Node.js `v24.20.0`, local macOS, 2026-09-05.
- Prepared worker: `worker-20260905010943-d4368920`. Active claim and Position membership were checked through canonical files and the bounded Context route.
- `git rev-parse HEAD` matched the candidate before and after verification. `git diff --quiet 3c23d0d -- src scripts test package.json .github/workflows/ci.yml` exited 0. Concurrent uncommitted changes were coordinator-owned lifecycle and report records.

## Independent verification

`node --test test/evidence-git.test.mjs test/test-groups.test.mjs test/ci-scope.test.mjs test/console-browser-contract.test.mjs test/release-package.test.mjs test/context-capsule-ablation.test.mjs` passed **32 tests**, with zero failures, skips, or cancellations; elapsed test-run time was 29,640.158125 ms. Both complete acquisition-lab preparation tests remain covered alongside the smaller classifier fixture.

An additional `node --input-type=module` in-memory differential probe imported the baseline evidence validator from `git show 65bf39c:src/evidence.mjs` and compared it with the candidate against a temporary Git repository. The fixture contained 133 artifacts, including binary/NUL content, CR/LF paths, and a space/colon path. Duplicate entries with a wrong digest, unknown Work Items, a missing revision, a missing artifact, a non-blob tree, and invalidation produced exactly the same **10 ordered errors** in both validators.

The same probe confirmed 131 batch-safe objects used three batches, with CR/LF paths read individually. Four injected failures—partial output, trailing garbage, a populated subprocess error, and a terminated subprocess—each fell back to individual reads and still reported the deliberately wrong historical digest. The existing regression tests independently passed preservation-tag changes across invocations and mutable working-tree fallback checks. Temporary repositories were removed after these probes. The production validator was not edited.

`node scripts/test-groups.mjs changed --base definitely-missing-wi0170-ref --list` exited 0 and reported `mode: full` with all 50 current test files. The group tests passed unknown/shared/state/fixture/deleted-test fallbacks, inventory partitioning, and committed/staged/unstaged/untracked/rename discovery. Inspection confirmed actual full execution retains Node's native `--test` discovery and Release publishing still invokes `npm run verify`.

`node ./templew.mjs doctor . --json`, independently invoked and summarized through a Node subprocess, exited 0 in 6,083 ms: **36 pass / 1 warning / 0 failures**. The warning was the stale generated parallel plan. This matches the developer's reported finding counts; the reviewer did not independently repeat the baseline performance measurement. Doctor still calls schema validation and converts schema errors or exceptions into failed checks. The removed standalone CI schema invocation therefore remains covered by Doctor.

Review confirmed the real package dry-run remains in `npm run check`, and bootstrap/distributable Skill equality remains in `scripts/check-repo.mjs`. Browser lifecycle failure injection preserves resource cleanup; no user-interface implementation changed, and this report makes no new rendered-browser acceptance claim.

## Initial finding — resolved by the follow-up below

**P3 — Ignore no unknown selector arguments** (`scripts/test-groups.mjs:59`). The argument handler searches for the first `--base` and for `--list`, but does not validate remaining arguments. With a synthetic trustworthy README-only Git diff, invoking `changed --base HEAD --unknown-selection-flag --list` returns `mode: selected` and the 10 fast files, without indicating that the extra flag was ignored. A misspelled or unsupported scope option can therefore give the caller a misleading impression of the selected scope. Reject unsupported/duplicate/missing arguments or conservatively select full coverage, and add CLI-level regression coverage. This does not currently bypass full behavioral-candidate or Release verification. The coordinator elected to fix it before closeout; the changed candidate requires a follow-up review.

## Initial disposition and limits (superseded by follow-up below)

The reviewed candidate has no blocking evidence-integrity, fixture-coverage, CI-schema, or resource-cleanup finding from these checks. The P3 selector finding remains open for the coordinator's planned follow-up. This is an initial review of the exact SHA above, not approval of a future revision or lifecycle closeout. The developer's full verification result (458 passing tests) is separate evidence; this reviewer independently ran the focused 32-test suite and adversarial probes, not a second full suite. No provider calls, installations, external writes, publication, implementation changes, or canonical-state changes were performed by this worker.

## Follow-up review — WI-0171 correction

Candidate: `7716b1fe5dc83ecfa3d52a15513d79aebeb63aaf`, checked independently on 2026-09-05 as Lulu. The bounded Context route still assigns WI-0170 Independent QA to `agent-lulu`; WI-0171 is the coordinator-confirmed correction to the shared selector/test paths. `git diff 3c23d0d..7716b1f -- scripts/test-groups.mjs test/test-groups.test.mjs` shows the option validator and its regression tests. The evidence-reader, browser harness, schema consolidation, and fixture changes reviewed above remain unchanged. HEAD matched this candidate, and `git diff --quiet 7716b1f -- scripts/test-groups.mjs test/test-groups.test.mjs` exited 0 after testing.

`node --test test/test-groups.test.mjs` passed **6 tests**, with zero failures, skips, or cancellations (625.667833 ms). An independent `node --input-type=module` CLI matrix additionally checked all five valid explicit groups, valid flag ordering, six malformed or unavailable-base changed-scope requests, and three unknown/incompatible explicit-group requests. Every malformed changed request reported full selection with all 50 current test files. Unknown explicit groups and invalid explicit-group options exited 1 with an actionable error.

A second in-memory subprocess probe supplied a synthetic README-only Git diff and intercepted only the final test subprocess. A valid `changed --base HEAD` invoked `node --test` with the 10 fast files. Adding `--typo` instead invoked exactly `node --test` with no explicit files, proving native full discovery at the execution boundary rather than merely a `--list` projection. This probe ran no full suite and made no repository edits.

The P3 finding is **resolved**: unknown, duplicate, or incomplete selector options cannot silently narrow changed-scope verification. No remaining actionable QA findings were observed in this bounded review. **Final Independent QA: PASS** for `7716b1fe5dc83ecfa3d52a15513d79aebeb63aaf`, combining the preserved initial integrity/fixture review with exact-candidate parser and CLI retesting. Full verification of the corrected candidate remains the coordinator's separate evidence and was running concurrently; this worker does not claim its outcome.

After updating this report, `npm run verify:fast` passed repository, documentation-link, and package-boundary checks plus **52 tests**, with zero failures, skips, or cancellations (1,632.986541 ms test-run time). This also reran the evidence Git regressions on the corrected candidate.
