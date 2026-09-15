# Offline harness test pruning audit

Work Item: WI-0236. Developer: agent-rikku; Principal: human. Scope: all 49 paths in `.ai-org/artifacts/WI-0234/audit-inventory.json` under `groups.experiments`. This is Developer evidence, not independent acceptance.

Baseline for exact source comparison: `f9bbead6962d49f068c4a3d09cf40e871f2d8d01`, on `codex/prune-redundant-tests`. The prior complete baseline observation is `.ai-org/artifacts/WI-0230/verification-8bfe3889.log.gz`; it was inspected, not rerun as a new baseline. The parent work order records its relationship to the unchanged behavioral baseline.

## Result and exact deletions

Audited all 49 assigned files. Removed seven duplicate test registrations in two files. Removed five duplicate fixture executions; no unique failure mode, lifecycle, public CLI path, model protocol, budget threshold, or assertion was dropped. Two other removals are verbatim duplicate unit tests and perform no fixture execution. No tests were skipped, renamed to avoid discovery, or moved to another test group. No source, fixture, package, policy or CI file was edited. Test-only changes total 10 added and 30 deleted lines, a net reduction of 20 lines.

The following five exact baseline titles were children of `delivery pair readiness and actual injected lifecycles are generation-free and evidence-bearing` in `test/delivery-control-pair.test.mjs`:

| Removed baseline title | Retained test and equivalent execution |
| --- | --- |
| `partial-usage stops pair and retains output` | `partial usage and rejected private envelopes remain diagnostic without raw content`: existing `run({mode:"partial-usage"})`, now also passed to `assertStoppedPair`. |
| `early-wrong-usage stops pair and retains output` | Same retained test: existing `run({mode:"early-wrong-usage"})`, now also passed to `assertStoppedPair`. |
| `private-command stops pair and retains output` | Same retained test: existing `run({mode:"private-command"})`, now also passed to `assertStoppedPair`. |
| `route stops pair and retains output` | Same retained test: existing `run({mode:"route"})`, now also passed to `assertStoppedPair`, including the no-`turn/start` assertion. |
| `interrupt-failure stops pair and retains output` | Same retained test: existing `run({mode:"interrupt-failure"})`, now also passed to `assertStoppedPair`. |

Each deleted generic case and its retained detailed case called the same local `run` helper with the same mode, protocol, fake provider, source template, approval and default deadline. Each call received a fresh clone of the same template. The detailed case already executed that failure mode before this patch. This removes repeated setup and replay rather than disguising distinct cases under fewer titles.

`assertStoppedPair` preserves the complete old generic assertion set: stopped runtime status; exactly one observed stage; no efficiency comparison; a nonempty stop reason; stopped status in persisted `run.json`; and an existing `seal.json`. For `route`, it also preserves proof that no model turn was requested. All previous detailed assertions remain, including lower-bound partial usage, interruption request/acknowledgement/terminal state, unknown wrong-turn usage, private-data and diagnostic-key exclusion, unmatched command counts, rerouted model identity, and unconfirmed interruption. Remaining generic cases use the same helper with the same assertions. `missing-usage` retains its unknown-total and known-subtotal checks.

| Removed file and exact baseline title | Retained equivalent |
| --- | --- |
| `test/diagnostic-format-comparison.test.mjs`: `format command guard rejects missing, opposite, duplicate and non-opted formats` | Same title in `test/context-format-comparison.test.mjs`. The 13-line test blocks are byte-for-byte identical at the baseline, using the same `classifyCommandItem` import, current directory, commands, full/model inputs and all allow/deny assertions. Neither block uses its enclosing harness protocol or fixture. |
| `test/diagnostic-format-comparison.test.mjs`: `model root is recognized only by opted-in model observation` | Same title in `test/context-format-comparison.test.mjs`. The 10-line test blocks are byte-for-byte identical at the baseline and call the same shared `contextEntryObservation` function for full/model, wrong-format, fallback and missing-packet inputs. Neither block depends on its enclosing harness. |

The unused `classifyCommandItem` and `contextEntryObservation` imports were removed only from the diagnostic test file. Its own protocol, request construction, sixteen-stage executor, budget and evidence-seal checks remain. The eight-stage context-format harness remains independently tested; different aggregate ceilings were not treated as duplicates.

## Complete retained-file audit

All filenames below are relative to `test/`. A retained file may contain the narrowly identified deletions above; every other test remains.

| File | Retained protection and audit decision |
| --- | --- |
| `autonomous-diagnostic.test.mjs` | Full-path reservations, unknown accounting, actual grading and registration controls, repair synchronization, partial grade retention and real stopped-claim cleanup. |
| `autonomy-experiment.test.mjs` | Frozen model matrix, actor boundary, each seed/reference/mutant, cost arithmetic, repair ceilings, editable scope and exclusive start. Fixture-shape assertions also protect bounded product paths and mutation identities. |
| `autonomy-protocol-stop.test.mjs` | Actual malformed JSON transport and both cleanup outcomes; unknown shutdown retains stopped ownership and partial usage. |
| `context-capsule-ablation.test.mjs` | Answer-free schema, exact recovery facts, historical diagnosis replay, matched preparation, acquisition privacy, cache confounding and unknown/censored analysis. Frozen templates and evidence cannot grant launch authority. |
| `context-enter.test.mjs` | Generated shell commands through the installed CLI, whole-body reuse, actor/source freshness, projected and unknown material, distinct Verifier, fallback and recovery without writes. |
| `context-format-comparison.test.mjs` | Retains the two shared contracts removed from the diagnostic copy, plus the eight-stage harness's own approval, requests, accounting and aggregate-limit behavior. |
| `context-material-comparison.test.mjs` | Source/config isolation, exact trust exceptions, evidence sealing and aliases, failed finalization, twelve-stage execution, denied metadata and opted-in material. |
| `continuity-codex-adapter.test.mjs` | Legacy sandbox schema and probe remain separate from named permissions; positive controls do not imply live qualification; malformed responses and uncertain shutdown remain explicit. |
| `continuity-delivery-contract.test.mjs` | Completion versus downstream responsibility, arm parity, private observation counters and unknown reasons, plus actual installed small-task finish and managed procedure upgrade. |
| `continuity-fixture.test.mjs` | Real history and independent physical roots, old/current instructions, exact record descendants, full/short/branch/tag aliases, ambiguous or invalid item/claim references, hidden dirty state, mutation and cleanup boundaries. |
| `continuity-live-runner.test.mjs` | Named permissions, each matrix mode, immutable preparation, queued event correlation, cancellation races, unknown usage and cleanup, bounded native oracle RPC and descendant termination. |
| `continuity-named-permissions.test.mjs` | Explicit profile fields, simulated positive/negative read/write controls, symlink escapes, malformed observations and sticky late-generation/cleanup uncertainty. |
| `core-autonomy-candidate.test.mjs` | Compilation preserves named gates, reservations, context and actor authority; stale recovery, distinct Verifier and real CLI idempotent finish. |
| `core-comparison-runner.test.mjs` | Exact four-cell authorization, complete accounting, stage checkpoints, one repair, no double dispatch, cross-process continuation and post-call fault evidence. |
| `core-comparison-successor.test.mjs` | Preserves historical acceptance and failed cost while rejecting uncertain predecessor state and underfunded continuations; distinct drift/cleanup/usage errors. |
| `core-delivery-check.test.mjs` | Workspace and temporary cleanup, actual child termination and signal races, oracle non-disclosure, V5 fixture parity and mechanical/semantic repair feedback. |
| `core-recovery-readonly.test.mjs` | Real installed diagnostics remain read-only with a normal-writing negative control; argument routing separately rejects unsupported writes and path escapes. |
| `core-runtime-qualification.test.mjs` | Complete reservation arithmetic, independent planner agreement and actual rejection of vacuous regression tests with valid grading controls. |
| `delivery-command-policy.test.mjs` | Real Git semantics, literal shell grammar, stage/actor/candidate binding, path and symlink confinement, private diagnostics and authoritative executed envelopes. |
| `delivery-control-pair.test.mjs` | Five repeated runs removed as specified above. All unique positive lifecycles, negative modes, arm orders, real candidate checks, observer persistence, privacy and readiness remain. Existing optional installed-tool guard unchanged. |
| `delivery-matrix-completion.test.mjs` | Exact predecessor pairs and continuation manifest, model/prompt/budget binding and rejection of uncertain history. |
| `delivery-matrix-experiment.test.mjs` | Matched matrix, arm-blind review, first/repair outcomes, protected drift, exhaustion, unknown cost and grading interruption. |
| `delivery-matrix-fixtures.test.mjs` | Both bounded tasks still execute seed, reference and each semantic mutant against real public/hidden checks. |
| `delivery-observations.test.mjs` | Actual TAP/spec parsing, incomplete/TODO/nested cases, input changes, privacy, bounded source-read observations and runtime integration. |
| `diagnostic-format-comparison.test.mjs` | Two exact shared copies removed as specified above; diagnostic family isolation, sixteen-stage execution, budget exhaustion and eight-subject seal remain. |
| `diagnostic-maintenance-fixture.test.mjs` | Real maintenance seed/reference behavior and preparation that withholds reference/oracle answers from the actor. |
| `effectiveness-pilot-v2.test.mjs` | Distinct V2/confirmation protocols, exact approval, historical frozen evidence, quality-first analysis and routing-authority limits. |
| `effectiveness-pilot.test.mjs` | Original process/route comparability, native profile rejection, missing evaluator evidence, contamination and retained deviation. Different analysis contract from V2. |
| `evaluation-plan.test.mjs` | Eligibility versus complexity, immutable pins, factor validity, complete reservations, unknown fields and real CLI no-launch/read-only boundary. |
| `evaluation-sequence.test.mjs` | Attempt ledger, explicit continuation, global versus subject faults, cost and first-stop preservation, budget and persistence failures. |
| `interruption-actor.test.mjs` | Qualification before provider creation, durable triggers, exact correlation, race ordering, lower-bound accounting, budget headroom and confirmed cleanup. |
| `lean-interruption-experiment.test.mjs` | Bounded treatment parity, managed-file protection, explicit measurement amendment, fresh recovery, censoring, one repair and independent reserves. |
| `learning-review-experiment.test.mjs` | Complete check/repair reserve, distinct verification, unknown calls, post-call fault retention, manifest confinement and actual process-group cleanup. |
| `learning-review-oracle.test.mjs` | Declared executable case coverage, real installation, retained recovery, candidate/instrument distinction and real filesystem fault probes. |
| `optimized-delivery-comparison.test.mjs` | Counterbalanced matrix, exact approval, treatment adherence, complete cost/operation attribution and no unauthorized preparation. |
| `paired-entry-experiment.test.mjs` | Untouched suffix continuation, historical provenance, balanced cells, real reference qualification, terminal cleanup and exact cross-process/Git checkpoints. |
| `phase4-installation.test.mjs` | Real init/upgrade coverage and exact managed/project-owned/generated boundaries; actual schema semantic rejection, exclusive registry creation and byte-preserved project policy. Presence assertions support those ownership contracts. |
| `real-doc-check-fixture-v2.test.mjs` | Original seed compatibility plus corrected empty-root/own-Symbol semantics, historical-reference disagreement and real mutant failures. |
| `real-doc-check-fixture-v3.test.mjs` | New prototype-chain contract, V2 reference disagreement and its own product/contract mutation matrix. |
| `real-doc-check-fixture-v4.test.mjs` | Root-state matrix, permitted older reference, rejection of overspecified generated tests, nonempty executed controls and candidate/stage/protocol pregrade binding. |
| `real-doc-check-fixture.test.mjs` | Exact attributed source, original historical/public/selected-file behavior, original mutations, native oracle cwd and concurrent default-check isolation. |
| `recovery-matrix-experiment.test.mjs` | Frozen matched continuation, blind review, protected accepted discount, stale evidence rejection and real historical checkpoint commits. |
| `recovery-matrix-fixtures.test.mjs` | Changed-spec and cold-recovery historical scopes differ; both retain actual seed/reference/mutant execution and immutable accepted discount. |
| `representative-microservice-comparison.test.mjs` | Frozen live/evaluator/ablation protocols and readiness, exact package/schema semantics, command/sandbox boundaries, sibling settlement and censored/unknown analysis. |
| `representative-microservice-protocol.test.mjs` | Earlier local protocol validator is a separate public entry point; matched route, evaluator scale, retry and generation-authority boundaries remain. |
| `solo-stability.test.mjs` | Real installed multi-profile lifecycle and Learning rehearsal includes retained stopped results, drift, unauthorized commits and recovery; actor accounting and cleanup remain separate. |
| `validation-program.test.mjs` | Manifest/path identity, bounded concurrent waves, distinct candidate/program token/time/disk limits, ambiguous resumption and conservative cross-repository reporting. |
| `wave-5b-analysis.test.mjs` | Reproduces retained arithmetic and checks drift; fresh blind evaluator context and score-freeze/unseal ordering remain. |
| `wave-5b-live-protocol.test.mjs` | Sanitized packages, explicit lab root, real frozen setup, normalized score schema, incomplete/invalid results, exact stopped usage and bounded replacement approval. |

## Historical fixture and slow-test review

V1 through V4 tests were retained in full. `scripts/lean-interruption-experiment.mjs` still imports V1. The V2 module explicitly preserves the historical V1 import and corrects empty selection and own enumerable Symbol behavior. V3 imports V2 and introduces prototype-chain acceptance; V4 imports V3 and clarifies root-state/error-code and generated-test qualification. V5 and the current core runtime import the later chain. `test/core-comparison-runner.test.mjs` also explicitly uses V2; the evaluation catalog retains a V4 reference. The older suites therefore remain reproducible and detect version-specific oracle/reference disagreement. Repeating a mutant name against a changed reference and expanded oracle is not equivalent coverage.

The original baseline reported about 135.9 seconds for the delivery-pair parent, 49.2 seconds for the installed Solo rehearsal and 44.9 seconds for baseline-reference aliases. Only the delivery-pair parent contained the exact repeated executions identified here. The other two retain unique real lifecycle/recovery and Git identity behavior. Baseline elapsed values are one sample; concurrent test files and machine contention prevent a causal speedup claim.

## Verification

Runtime: Node `v24.20.0` from `/opt/homebrew/bin/node`.

Tested uncommitted source candidate is the baseline above plus these exact file SHA-256 values:

- `test/delivery-control-pair.test.mjs`: `e49ea6b22da49762385803d42a4995bbe4a05d1ca51f1e2fa8b920503c9a9a9e`
- `test/diagnostic-format-comparison.test.mjs`: `e99bc3c78914ede4489eb61eaddfc202ea577ae3e0ba7fe486d15f89994d5958`

Focused command: `node --test --test-reporter=tap test/delivery-control-pair.test.mjs test/diagnostic-format-comparison.test.mjs`. Output capture: `/tmp/wi0236-focused-tests.tap`. Result: exit code 0; 40 tests passed, 0 failures, 0 cancellations, 0 skipped, 0 todo. Node reported 55,851.749666 ms for this focused run. This is editing verification, not a comparable full-suite performance sample.

`git diff --check` passed for both changed tests and this report. Baseline block extraction independently confirmed the two removed shared contract blocks were byte-for-byte identical to their retained equivalents. All 49 assigned test files appear in the retained-file audit above.

An initial delivery-pair development invocation ended without a retained completion result because its orchestration session identifier was not captured; it is not verification evidence. The focused invocation above includes both changed files and retains its result.

Full `npm run verify`, final committed candidate binding, independent review, canonical worker release and Doctor are the parent integration owner's remaining responsibilities. No canonical state was mutated by this worker. This report does not claim those gates are complete.
