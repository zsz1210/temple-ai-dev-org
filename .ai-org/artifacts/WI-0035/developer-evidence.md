# Developer evidence — WI-0035

- Position: Developer
- Agent Identity: Rikku
- Candidate revision: `0b02e1c5de3d10aedc0f0ec64cb96af4d9de1e72`
- Result: pass to Quality & Evaluation

## Implemented CI boundary

- CI remains one GitHub job so short governance and behavior steps do not each incur separate billable-minute rounding.
- Scope selection happens before dependency installation and distinguishes strict `documentation-only`, `evidence-state-only`, and `full` scopes.
- The classifier reads NUL-delimited Git raw diff metadata with rename and copy detection. Deletion, rename, copy, type, mode, executable, symlink, conflict, broken-pairing, comparison failure, empty comparison, manual run, and unknown status or path all select full verification.
- Documentation and evidence/state scopes are separate narrow allowlists. Mixed documentation and evidence/state changes select full verification. Identity, assignment, collaboration, policy, learning, retrieval, tracker configuration, schema, package, workflow, test, source, executable artifact, and project-overlay changes are excluded from the narrow state lane.
- Every scope runs repository and documentation checks. Evidence/state and full scopes also run schema validation and Doctor. Evidence/state runs fast contracts plus focused evidence and status tests; full runs every behavioral test. Documentation-only records an explicit not-required behavior result.
- Governance, schema, Doctor, and selected behavior remain separately named steps with `always()` conditions. The final summary reports scope and both lane outcomes; the final aggregation fails if scope selection, installation, required governance, or the selected behavior result did not succeed.

## Adversarial classifier and workflow verification

- `node --test test/ci-scope.test.mjs` passed 11/11 tests.
- Fixtures cover both rename/copy endpoints, executable-to-Markdown rename, deletion, executable addition, mode change, malformed and unavailable comparisons, manual and empty comparisons, lifecycle-only records, workflow/package/schema/test/source/unknown paths, mixed narrow scopes, and narrow documentation paths.
- A real repository range from `9a7e49fbeaac25676e314a75e42c9bd3b8748449` to `01c9150c3016f5b11b76e04730b95566a4314571` selected `evidence-state-only` for six lifecycle-state paths.
- Ruby Psych parsed `.github/workflows/ci.yml`; the focused workflow contract test proved there is one job, required steps use `always()`, scope failure selects full behavior, the job summary is written, and a final aggregation step exists.

## Exact-candidate verification

- `npm run verify` passed repository and documentation-link checks plus 205/205 tests with zero failures, skips, cancellations, or TODOs on the exact candidate revision. Local wall time was 42.42 seconds.
- The evidence/state behavior command set passed 31/31 fast tests, 9/9 focused Evidence Observer tests, and 1/1 focused init/Doctor/status contract test. Local wall time was 10.50 seconds.
- `npm run check`, `node ./templew.mjs schema validate . --json`, and `node ./templew.mjs doctor . --json` passed as the evidence/state governance command set in 3.82 seconds. Schema validation checked 55 documents against 24 schemas. Doctor reported 35 pass, one existing nonblocking stale parallel-plan warning, and zero failures.
- `git diff --check` passed and the working tree was clean at candidate verification.

## Measured lane comparison

Before this change, lifecycle/evidence-only changes used the same repository checks and full 198-test lane as behavioral changes. The separately measured baseline commands took about 41.33 seconds locally: 0.33 seconds for repository checks plus 41.00 seconds for the full behavioral suite. The new exact-candidate evidence/state command sets took 14.32 seconds locally: 3.82 seconds of governance plus 10.50 seconds of focused behavior, about 27.01 seconds or 65% shorter.

The documentation-only lane retains repository checks without schema, Doctor, or behavioral tests. Full verification remains effectively unchanged in shape and now includes the classifier regressions: the exact-candidate `npm run verify` took 42.42 seconds for 205 tests. These are local wall-clock measurements, not hosted GitHub billing evidence. Both local paths fit within one minute; hosted runner duration and actual billable-minute reduction remain unverified and must not be claimed from this observation.

## Retained boundary and rollback

No workflow was pushed or executed on GitHub, and no GitHub settings, billing, release, publication, deployment, external write, or optional integration changed. Hosted Actions expression evaluation, runner timing, job-summary rendering, and billable-minute effects remain for Independent QA or an authorized CI run.

Rollback is to revert candidate revision `0b02e1c5de3d10aedc0f0ec64cb96af4d9de1e72`. Scope-selection failures already fall back to full behavior while the final aggregation keeps the job failed.
