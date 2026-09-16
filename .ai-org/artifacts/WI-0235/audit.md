# WI-0235 core test pruning audit

Developer: `agent-rikku`, Principal: `human`. Base revision: `f9bbead6962d49f068c4a3d09cf40e871f2d8d01`. Branch: `codex/prune-redundant-tests`.

## Result and review method

Audited all 50 exact paths in `WI-0234/audit-inventory.json` group `core`: named tests, parameterized scenario assertions, and retained failure boundaries. Read complete setup/assertion bodies and production call paths for deletion candidates. Inspected the existing full baseline log instead of rerunning the baseline. Files and current repository contracts, rather than memory, determined the decisions.

Deleted four tests across three files. All 50 files remain; no skips, renaming, discovery changes, timeout changes, fixtures, production source, scripts, policy, package or CI edits. The test patch has 5 inserted and 63 deleted lines (net -58). Three removed tests duplicate retained behavioral coverage; one only fixes decorative copy. There is no removal target or claim that every overlap is wasteful.

## Exact deletion mapping

| File | Exact old test title | Reason and retained evidence | Meaningful coverage difference |
| --- | --- | --- | --- |
| `test/cli.test.mjs` | `the chamber remains a hidden evidence-first easter egg` | The command prints a fixed decorative paragraph. Assertions required byte-exact prose and absence from help. No lifecycle, authorization, data, error or resource behavior is exercised. | Decorative output/hidden-help placement is intentionally no longer locked by a test. No replacement is needed. |
| `test/cli.test.mjs` | `executeInit never overwrites a project file created after planning` | Retained `executeInit rolls back earlier files when a later path appears after planning` calls the same `planInit`/`executeInit` copy-action path, creates the destination after planning, requires `EEXIST`, preserves the competing bytes, and requires no `temple.lock`; it additionally asserts earlier copied files are rolled back. Source `src/install.mjs` sends every ordinary copy action through the same `atomicCreate` call. | The removed copy used the decision-interview Skill path; the retained copy uses the final copy action, after earlier successful writes. The filename does not select another implementation branch. The distinct `copy-claude` race test remains. |
| `test/app-server-protocol-replay.test.mjs` | `terminal classification distinguishes structured-output rejection from other incomplete turns` | Retained `bounded App Server fixtures replay every declared result without model generation` exercises `replayAppServerProtocol -> terminalFailure` with `completed-wrapped-allowed-command`, `provider-invalid-output-schema`, and `ordinary-incomplete-terminal` fixture scenarios. It requires completed/null stop, stopped/`provider-invalid-output-schema`, and stopped/`turn-not-completed`, respectively. | The only removed unique assertions are exact human-readable error-message wording. Protocol classifications and all negative fixture cases remain. The distinct violation-then-completed sequence remains separately tested. |
| `test/model-onboarding.test.mjs` | `onboarding input and plan conform to the distributed JSON Schemas` | Retained `fresh installation distributes and manages both onboarding Schemas` already creates the identical `onboardingInput()` and `buildModelOnboardingPlan(defaultExecutionPolicy(), input, { generatedAt })`, writes both documents, and calls `validateProjectSchemas`. That validator compiles the installed distributed schemas with Ajv and checks the same objects, plus semantic validation. | Added assertions explicitly require each input/plan document to appear as valid in `checked`, preventing vacuous success from skipped discovery. Removed duplicate Ajv imports/setup and unused root constant. No new scenario or fixture was moved into another test; the existing duplicate validation pass is removed. |

The schema assertion transfer is to the existing successful installed validation before its unchanged incompatible-effort rejection. It adds no additional schema compilation, test invocation or setup.

## All owned file decisions

| Audited file | Decision and retained protection |
| --- | --- |
| `test/app-server-protocol-replay.test.mjs` | Pruned one duplicate classifier test; retain every bounded replay scenario, command allowlist/quoting, usage completeness, child isolation, typed completion, violation precedence and runner/fixture contract. |
| `test/archify-adapter.test.mjs` | Retain absent opt-in behavior, reviewed patch provenance, exact installation digests, dirty-checkout refusal and unrecorded-file detection. Different installation failures are distinct. |
| `test/audit-export.test.mjs` | Retain deterministic bounded selection, recursive redaction, recovery metadata exclusions, exclusive output creation, symlink refusal and oversized event rejection. |
| `test/autonomous-delivery.test.mjs` | Retain Standard/Lean/High-Assurance lifecycle integration, exact reviewer/candidate checks, missing gate rejection, interrupted completion and real confined process boundaries. |
| `test/autonomous-ui-close.test.mjs` | Retain each selected UI mode through installed completion, absent/foreign evidence rejection, non-UI and early-stage rejection, and custom mode requirements. |
| `test/cli.test.mjs` | Pruned the chamber copy test and an equivalent copy-collision test; retain public CLI wiring, compact diagnostics, init/upgrade ownership, Claude/bootstrap boundaries, rollback and malformed-state detection. |
| `test/collaboration-governance.test.mjs` | Retain migration/provisional membership, bootstrap authority, actor binding, real-versus-simulated validation and conflicting disposable clone histories. |
| `test/console-delivery-summary.test.mjs` | Retain bounded/redacted summary projections, completion-versus-session distinctions, unsafe input rejection, local GET-only routes and private viewer denial for both server surfaces. |
| `test/context-packet.test.mjs` | Retain whole-source authority acquisition, exact digests, missing/hostile input boundaries, stage ownership, projection freshness and whole-source fallbacks for unknown shapes. |
| `test/context.test.mjs` | Retain unknown acceptance semantics, stable content measurements, safe source manifests, non-identity retrieval relevance, instruction routing, scope overlap and project-owned context upgrades. |
| `test/daily-delivery.test.mjs` | Retain installed completion, rejected checks, exact candidates, rework history, pending recovery, process death/timeout, path and actor guards, usage unknowns and budget reserves. |
| `test/delivery-entry.test.mjs` | Retain compact/full equivalence, navigation-only authority, source changes, exact current ownership, typed options, pending mutations and post-rework freshness. |
| `test/delivery-report-text.test.mjs` | Retain truthful completion/evidence/usage distinctions, terminal-control sanitization, bounded histories and read-only installed text/JSON/error interfaces. These assertions encode evidence semantics, not decoration. |
| `test/delivery-scope-entry.test.mjs` | Retain rejection of old artifact-only sessions and invalid entry scopes, preservation of readable history, no-check execution on rejection and accepted declared product scopes. |
| `test/evidence-observer.test.mjs` | Retain evidence hashing, Git preservation tags/clones, test/runtime recording, stale/historical attention, explicit invalidation and rollback. Runtime drift and test-observation invalidation use different recording paths. |
| `test/execution-routing.test.mjs` | Retain schema and semantic rejection boundaries separately, including the Independent QA counterexample, malformed resource collections, capability filters, unknown observations and read-only CLI/path boundaries. |
| `test/federation.test.mjs` | Retain composite identities, pinned contracts, participant read-only projections, Git shadow/replacement/fsmonitor/environment/promisor defenses and unknown/truncated coordination handling. |
| `test/field-actors.test.mjs` | Retain all V01/V02/V03/V04/V13/V14/V16 regression scenarios: actual claims, non-default actors, sponsorship, qualified membership, binding provenance and distinct IDs. |
| `test/field-attention.test.mjs` | Retain all field attention boundaries between active runtime, completed review, device/decision waiting, current/historical evidence debt and actual acceptance. |
| `test/field-cli.test.mjs` | Retain public executable measurement example, CLI cache/run reporting, private identity redaction and reconciliation/view-refresh outcomes. |
| `test/field-evidence.test.mjs` | Retain exact historical binary/empty/spaced bytes, missing source behavior, archive/path/tamper limits, invalidation metadata and integrity-versus-source-authentication distinction. |
| `test/field-lifecycle.test.mjs` | Retain new-clone attributed contributor lifecycle, actual Developer and non-default QA with independent human approval, and workflow defaults under strict collaboration. |
| `test/field-reconciliation.test.mjs` | Retain all stable-ID/history conflict, identity collision, exact preview freshness, unchanged claim qualification, inventory bounds, process interruption and human edit preservation regressions. |
| `test/field-verification.test.mjs` | Retain complete input/toolchain/environment fingerprints, immutable cache evidence, newest failure precedence, real argv execution, timeout/descendant cleanup, platform limits and non-fabricated execution status. |
| `test/handoff-revision.test.mjs` | Retain CLI normalization of branch/tag/commit inputs, unchanged historical outputs, invalid/unborn/non-Git rejection and cross-profile normalization. CLI and helper entry points remain explicit. |
| `test/high-assurance.test.mjs` | Retain risk-to-evidence tier mapping, human prerequisites, selected UI restrictions, normalized evidence/rollback/approval gates and Doctor assurance-drift rejection. |
| `test/json-rpc-process-cleanup.test.mjs` | Retain graceful exit, TERM-resistant owned child with untouched sibling, natural exit, spawn failure, circular serialization failure and unconfirmed cleanup failure. |
| `test/json-rpc-process-protocol.test.mjs` | Retain actual subprocess Unicode/CRLF/separator framing, malformed unterminated tail, pending-call rejection, content-free diagnostics and every invalid envelope class. |
| `test/lean-delivery.test.mjs` | Retain preview/no-write/idempotence, historical retries after ownership changes, actor/evidence guards, each interruption checkpoint, journal links, active workers and time-dependent qualification/evidence expiry. |
| `test/lean-finish.test.mjs` | Retain Developer/Verifier equivalence and independence, candidate advancement, diagnostic and canonical interruption phases, changed recovery inputs, full Doctor failures and cross-operation unresolved diagnostics. |
| `test/learning-operations.test.mjs` | Retain explicit learning lifecycle, human Skill promotion decisions, absent automatic activation, duplicate/path/claim guards, retrieval metrics and canonical-only semantic fallback. |
| `test/learning-review-coverage.test.mjs` | Retain immutable review/supersession history, concurrent CLI retries, all Lesson IDs, header/history preservation, stale/unsafe/malformed inputs and unchanged Learning index. |
| `test/mechanical-completion.test.mjs` | Retain opt-in exact replacement bounds, precommitted authority, excluded paths, malformed inputs, strict profiles, invalid UTF-8 and interrupted recovery. High duration is not redundancy. |
| `test/model-onboarding.test.mjs` | Pruned duplicate direct schema success; retain installed schema validation with explicit checked-document assertions, compatibility/unknown handling, project policy preservation and read-only CLI/path boundaries. |
| `test/operating-contract.test.mjs` | Retain whole contract/procedure acquisition for both cold actors, initialization and scope-change instructions, old whole-source behavior and exact managed ownership on upgrade. |
| `test/orchestration.test.mjs` | Retain safe deterministic waves, outside dependencies, named bidirectional overlap, stale/edited generated plans and preview-without-creation. |
| `test/packs.test.mjs` | Retain opt-in absence, install/re-init/remove behavior, exact manifest ownership, conflicting/identical untracked files and rollback on installation/removal races. |
| `test/phase-4b.test.mjs` | Retain adversarial catalog/scoring, provider usage dimensions, account-versus-task telemetry, insufficient/stale/mismatched evidence, advisory qualification, privacy and archive conflict quarantine. |
| `test/phase2c-extension.test.mjs` | Retain Pack v2 references/scripts/assets and provenance, installed schema errors, complete High-Assurance policy validation, migration baselines and absent legacy retrieval config without writes. |
| `test/phase4-cli.test.mjs` | Retain real CLI parsing for repeated backup names/export filters, deletion consent/freshness, output exclusivity and coordinator-owned federation projections. |
| `test/proportionate-work.test.mjs` | Retain Agent-facing support/sequential/governed-worker instructions and init/upgrade distribution with project-owned Skill preservation. |
| `test/publication-artifact-normalization.test.mjs` | Retain deterministic redacted artifact plans, stale input, rollback/idempotence, untouched out-of-scope files and active evidence registry protection. |
| `test/publication-normalization.test.mjs` | Retain canonical coordinate normalization authority/consent, stale plans, active coordinate refusal, rollback, schema-preserving evidence references and public CLI behavior. |
| `test/recovery.test.mjs` | Retain backup payload ownership/integrity, manifest/link/size tampering, retention consent/freshness, partial deletion, restore interruption, human edit preservation, version compatibility and disposable rollback rehearsal. |
| `test/runtime-coordination.test.mjs` | Retain pinned launcher boundaries and stop forwarding, absent/mismatched/escaping local CLI rejection, stage disciplines, actual QA ownership, scarce resources, reserved/attached runtimes, fresh waves and rollback. |
| `test/solo-learning-revalidation.test.mjs` | Retain both Lesson and Practice contradicted-latest-result retrieval regressions, reconfirmation, legacy absence and ineligible candidate exclusion. |
| `test/tracker.test.mjs` | Retain protected local fields, credential rejection, unique/visible mappings, external completion non-authority, safe GitHub argv, explicit reconciliation and inherited context. |
| `test/work-item-configure-options.test.mjs` | Retain unknown value/boolean rejection before target access, no-write failures, repeated/cleared valid values and read-only help handling. |
| `test/work-item-rework.test.mjs` | Retain all review-stage transitions, historical rejected candidate/evidence protection, exact rollback, sponsored reviewer binding, runtime guards and custom prebuild gate boundaries. |
| `test/workflow.test.mjs` | Retain public Standard/Lean lifecycle, no-go migration, task identity/registry concurrency, gate artifacts, normalized evidence, source/approval freshness, ownership and upgrade rollback boundaries. |

In particular, source-string assertions for Agent instructions, release-gate help, evidence authority and bootstrap loading remain. Reporting copy that distinguishes unknown usage, observed checks and actual acceptance remains. The field regressions and independent-review counterexamples were not edited. No protected IR01/IR02/IR03 contract file was changed in this scope.

## Focused verification

Candidate: the three-file patch over `f9bbead6962d49f068c4a3d09cf40e871f2d8d01`. Runtime: Node.js `v24.20.0`. Command:

```text
node --test test/app-server-protocol-replay.test.mjs test/model-onboarding.test.mjs test/cli.test.mjs
```

Actual result: exit 0; 48 tests, 48 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo; runner duration 31764.215458 ms. The three files previously had 52 top-level results; four were deleted, not skipped or combined into fewer counted scenarios. The retained late-copy race and both explicit installed-schema document checks passed.

```text
git diff --check -- test/cli.test.mjs test/model-onboarding.test.mjs test/app-server-protocol-replay.test.mjs
```

Actual result: exit 0, no whitespace errors.

Tested file SHA-256:

| Path | SHA-256 |
| --- | --- |
| `test/cli.test.mjs` | `ad76b429788c7425593cb62993bf71f49c990283efccafb01e1bde99e21d3124` |
| `test/model-onboarding.test.mjs` | `a4f174d374478eb3a89ee8d30410c4c78d355a6875acc2858b6dde8908b1e6a1` |
| `test/app-server-protocol-replay.test.mjs` | `619b9bee41680cf65eaea2f1a29aaba8e5b5e933472c42e1878ac59dfe4820df` |

## Baseline and timing limits

Existing raw evidence: `.ai-org/artifacts/WI-0230/verification-8bfe3889.log.gz`. It records 1250 pass, 0 fail/skipped and 285611.118583 ms for the full suite. It is the prior complete result, not verification of this patch.

Removed test durations in that single baseline sample: chamber 332.687042 ms; early init copy race 27.993 ms; terminal classification 0.2415 ms; direct onboarding schema success 58.733917 ms. These are concurrent per-test samples and must not be summed into a promised wall-clock saving. The focused run uses a different command and concurrent machine workload, so it does not establish full-suite speedup.

Some of the most expensive inspected core tests remain because their cases are distinct:

| Retained exact title | Prior sample ms |
| --- | ---: |
| `invalid precommitted contracts and non-note paths reject` | 36911.260209 |
| `synthetic High-Assurance uses the common entry but still rejects missing normalized evidence and rollback` | 31293.4845 |
| `UI evidence remains disallowed in earlier stages and non-UI close` | 22699.301 |
| `extra committed or dirty product changes, wrong replacement, and executable note reject` | 18757.291084 |
| `CLI review rework preserves scope, archives attempts and releases claims across supported review stages` | 18503.870417 |
| `missing UI evidence, nonexistent files and foreign-mode keys reject before canonical writes` | 17992.208584 |

## Handoff boundary

This is Developer audit and focused-check evidence only. No commit or canonical lifecycle/runtime mutation was made by this worker. The integration owner performs final candidate commitment, full `npm run verify`, distinct-Identity independent review, exact-evidence join and canonical closeout/Doctor. This audit does not claim those later gates complete.

