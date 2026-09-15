# Independent test-pruning review — rejected candidate

Decision: **FAIL** for candidate `93fe381da11621d48493f350e67f9b8bfa51ef8c`. The browser-contract deletion loses a meaningful coverage guard. Stop before the expensive full run, return the same scope to Developer, and review the corrected exact revision. This report is actual independent review evidence; it is not a passing Test, Eval, Independent QA, or Release Gate receipt.

Reviewer: `agent-lulu`, Principal `human`, runtime `/root/pruning_independent_review`. Developer: `agent-rikku`, Principal `human`. Active project assignments independently confirm Lulu holds Quality Evaluator and Independent QA and Rikku holds Developer. These are different Agent Identities. The attached worker is `worker-20260915233053-33b568eb`, claim `claim-20260915233053-35ff5fa4`, pinned to the rejected candidate. At review time the four items are Standard, risk tier standard, at Test with Quality Evaluator ownership; no later-stage transition is asserted. Provider authentication was not checked or claimed.

Baseline: `477e0b60ecbe83caea18430ccb649c67ecd690ca`. Git comparison confirms production, scripts, tests, package files, project overlay and instructions match prior behavioral baseline `8bfe38892283744ba0c71bec0cd25f7cf1a02986`. The current candidate changes only eight test files plus organization records/evidence. Its test diff is 15 added and 145 removed lines, net -130. The claimed 14 removed registrations would imply 1236 from the historical 1250; no complete candidate run has confirmed that count.

## Blocking finding QA-01: browser coverage can silently disappear

Affected scope: WI-0237 and its aggregate WI-0234. Removed title: `browser gate covers the approved responsive viewports and primary views`, in `test/console-browser-contract.test.mjs`.

The deleted assertions over-specify exact dimensions and human labels, which may reasonably be pruned. However, they also enforce that responsive classes and all six primary navigation targets remain selected. That is useful behavioral coverage of the verification harness. `scripts/verify-console-browser.mjs:375` traverses only `CONSOLE_VIEWPORTS`; its navigation and layout loops similarly use only `PRIMARY_VIEWS`. There is no independent minimum or semantic completeness guard. Removing all viewports skips every responsive sweep. Removing the organization target skips the Team layout and its keyboard contract. Existing motion and field-attention checks do not restore these omitted checks.

The retained foundation assertion proves six rendered navigation targets exist, not that the browser gate visits them. The retained harness cleanup test injects `checkViews`, so it also cannot detect omitted coverage. The browser implementation being unchanged does not make removal of its only coverage-selection guard redundant. The ordinary testing contract still describes four responsive layouts and primary navigation.

### Independently executed counterexamples

Runtime: Node `v24.20.0`, `/opt/homebrew/Cellar/node@24/24.20.0/bin/node`, Darwin arm64. Disposable root: `/tmp/temple-pruning-qa-Z8e6vm/`. Test and browser-script bytes were obtained using `git show` for the exact baseline and candidate. Each isolated fixture symlinked unchanged dependencies, source modules, package files and notices. Only the disposable browser script received one mutation; repository tests and implementation were not edited.

Command: `node /tmp/temple-pruning-qa-Z8e6vm/repro.mjs`. It ran `node --test --test-reporter=tap <fixture>/test/console-browser-contract.test.mjs` for each row below. The reproduction itself exited 0 after asserting all four expected outcomes.

| Disposable script mutation | Baseline contracts | Candidate contracts |
| --- | --- | --- |
| Replace the entire `CONSOLE_VIEWPORTS` initializer with `Object.freeze([])` | Exit 1; 5 tests, 4 pass, 1 fail | Exit 0; 4 tests, 4 pass, 0 fail |
| Delete the `organization` / `Team` entry from `PRIMARY_VIEWS` | Exit 1; 5 tests, 4 pass, 1 fail | Exit 0; 4 tests, 4 pass, 0 fail |

The only failing baseline test in both cases is the deleted browser-table test. Every invocation reports zero cancellations, skips and todo. These are bounded contract-test counterexamples, not a real-browser observation; the skip paths above were verified by source inspection. No Chrome session or provider call was started.

Retained raw files and SHA-256:

| File under the disposable root | SHA-256 |
| --- | --- |
| `repro.mjs` | `5026fe43fd62647ebc0b3017f80ea3696874fcf7e755b825793274d567496f9b` |
| `results.json` | `19d7435e3c5077b3c77baa1436439b9f5b69157f43f97e7ff2ca07427ed9eeba` |
| `no-responsive-viewports-baseline.tap` | `f9b95033bcda5acf12a3ecbda3ffbab68137ae5df1c4547663de0e9a1e3ada4c` |
| `no-responsive-viewports-candidate.tap` | `2a0b510a6c33160fc43f2af7331b503c96ea794fa55595cca775cdc588ff2c1e` |
| `omitted-team-view-baseline.tap` | `b14afdeee92ffec7c96ef007c788130d9e302555b7f261db610a360c2f66621f` |
| `omitted-team-view-candidate.tap` | `36d555e0b0fa5791bd3093e6a36d1b94e8f6ce46355ad49cc79a0ed72d89e498` |

Required correction: retain a semantic coverage guard for the responsive classes and six stable navigation targets, without reinstating unnecessary exact pixel dimensions or labels. The corrected guard should reject both counterexamples. Implementation belongs to a separately claimed Developer rework cycle.

## Other deletion mappings and audit completeness

The remaining 13 removals are provisionally sound from this bounded static review. They have not received final candidate acceptance or a complete independent test run.

- The earlier ordinary-copy collision and retained later collision reach the same `action.type === "copy"` / `atomicCreate` path in `src/install.mjs`. The retained test requires `EEXIST`, preserves competing bytes, requires no lock, and additionally checks rollback. The separate Claude-copy race remains.
- The retained App Server replay fixture checks all 11 declared scenarios, including completed/null stop, schema rejection and interrupted classification through the same helper. Exact diagnostic prose is intentionally no longer pinned.
- The installed onboarding-schema test constructs the same input/plan and uses the distributed Ajv schemas. The two added `checked` assertions require each specific document to be present and valid, preventing vacuous success from skipped discovery. The negative incompatible-effort check remains.
- Independent baseline extraction confirms the two removed format-command and model-observation blocks are byte-for-byte identical to the retained context-format blocks: 13 and 10 lines respectively, with the same shared entry points.
- The five removed generic runs already occur in the detailed test with identical mode/default setup. `assertStoppedPair` transfers stopped status, one stage, noncomparability, nonempty reason, persisted stopped status and seal existence to every retained result. The `route` call also retains no `turn/start`. The detailed assertions and the remaining `missing-usage` special controls remain intact. This removes five fixture executions rather than hiding distinct modes inside a registration.
- Static SVG label numbering, the decorative chamber output/hidden-help placement, and ordinary optional-command help copy are explicitly relinquished detail checks. The reports identify these coverage differences without claiming link checks or HTTP tests prove exact wording.

The inventory exactly matches `git ls-tree` for the candidate: 117 tracked test files, 117 listed entries, 117 unique entries, no missing or extra paths. Every listed filename has a decision in its assigned report: root 10, core 50, experiments 49, optional 8. I read the complete four audit reports, pruning plan/report, verification record and exact test diff, then checked the relevant retained assertions and implementation paths. This confirms audit accounting and challenges the changed deletion candidates; it does not claim I independently reread every body in all 117 unchanged files. There are no test-file deletions, discovery/config changes, introduced skips or production changes in this candidate.

## Scope judgments and remaining work

| Scope | Test | Eval / independent review |
| --- | --- | --- |
| WI-0234 aggregate | Complete verification not performed | **FAIL**: QA-01 violates retained meaningful coverage acceptance |
| WI-0235 core | Complete verification not performed | Static mappings provisionally sound; final acceptance pending corrected integrated candidate |
| WI-0236 offline harnesses | Complete verification not performed | Static mappings provisionally sound; final acceptance pending corrected integrated candidate |
| WI-0237 optional runtime | Counterexample demonstrated; complete verification not performed | **FAIL**: QA-01, browser selection guard lost |

No full suite was launched because the early independent finding already requires a new candidate. Prior baseline/focused Developer results do not qualify the rejected revision. No passing normalized assurance evidence or release judgment is recorded. The parent confirmed the full run had not started and will handle rework, exact candidate commitment, complete verification and a fresh independent review. I made no implementation, test, policy or canonical-state changes and no commit; only this report and disposable QA fixtures were created.
