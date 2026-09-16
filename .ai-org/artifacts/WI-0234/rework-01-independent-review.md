# Independent test-pruning review: corrected candidate

Decision: **PASS** for the bounded test-pruning acceptance of WI-0234, WI-0235, WI-0236 and WI-0237, with the exact scope bindings below. QA-01 is corrected. Thirteen unnecessary registrations are removed, one browser contract is rewritten, and the complete candidate run records 1237 passing tests. This is actual Test/Eval/Independent QA evidence; it does not perform a Release Gate transition, merge, publication or deployment.

Reviewer: `agent-lulu`, Principal `human`, runtime `/root/pruning_final_review`. Developer: `agent-rikku`, Principal `human`. I read current `.ai-org/project/assignments.json`: Lulu has active Quality Evaluator and Independent QA assignments; Rikku has the active Developer assignment. These are distinct Agent Identities. Current context and the attached runtime independently confirm worker `worker-20260915234127-5239c0ed`, claim `claim-20260915234127-ed333126`, Quality Evaluator, candidate `220eda6180c1806d4bc261c9332bf3e55ed92a0b`, branch `codex/prune-redundant-tests`. This Standard work does not claim distinct Human Principals or provider authentication.

## Revision and accounting checks

- Original source baseline: `477e0b60ecbe83caea18430ccb649c67ecd690ca`.
- Initially rejected pruning candidate: `93fe381da11621d48493f350e67f9b8bfa51ef8c`. Its failed review and Developer audits remain historical records; they are not passing acceptance for the aggregate or optional scope.
- Corrected integrated candidate: `220eda6180c1806d4bc261c9332bf3e55ed92a0b`. HEAD, Developer handoff and active review claim agree. At final inspection no test, source, script, package or overlay working-tree difference exists relative to this candidate.
- The candidate inventory exactly matches Git: 117 tracked `.test.mjs` paths, 117 inventory entries, 117 unique entries, no missing/extra files. Every path has an audit decision in the assigned report: root 10, core 50, harness 49, optional 8. The groups are audit ownership buckets, not changed npm discovery groups.
- Git records eight changed test files, 33 inserted and 141 deleted lines, net minus 108. No test file is removed. There is no production, script, package, overlay, CI or fixture change, no new skip, and no narrowed discovery or timeout. The full run confirms a reduction from 1250 to 1237 executed test results, rather than a claimed count inferred only from source registrations.

I independently examined the exact test diff, approved pruning plan, root audit, deletion mappings in the child audits, corrected Developer evidence, previous rejection, retained test bodies and the relevant implementation paths. I verified audit inventory coverage programmatically. This does not claim a second complete reading of all 117 unchanged test bodies or a second complete suite invocation.

## QA-01: independently executed regression and flexibility controls

Command: `node /tmp/temple-pruning-final-qa-WBwfqd/repro.mjs`.

The reproduction obtains exact test and browser-script bytes using `git show`, creates unique disposable fixtures, and runs `node --test --test-reporter=tap <fixture>/test/console-browser-contract.test.mjs` for each row. Unchanged source modules, dependencies, package documents and notices are symlinked from the verified repository. Only disposable browser-script copies are mutated. No repository source/test edits, actual browser, provider calls or model generation are involved.

Runtime: Node `v24.20.0`, `/opt/homebrew/Cellar/node@24/24.20.0/bin/node`, Darwin arm64. The reproduction exits 0 after asserting all nine expected results. Every invocation discovers five tests and records zero cancellations/skips/todo. Every expected failure is exclusively the coverage-selection contract.

| Disposable case | Corrected candidate result | Interpretation |
| --- | --- | --- |
| Exact unchanged candidate | Exit 0; 5 pass, 0 fail | Positive control; 237.483917 ms |
| Empty `CONSOLE_VIEWPORTS` | Exit 1; 4 pass, 1 fail | Rejects the original vacuous coverage counterexample |
| Omit `organization` / Team target | Exit 1; 4 pass, 1 fail | Rejects the original missing primary-view counterexample |
| Omit tablet class | Exit 1; 4 pass, 1 fail | Preserves all four required responsive classes |
| Mobile height becomes zero | Exit 1; 4 pass, 1 fail | Rejects invalid dimensions |
| Desktop width equals tablet width | Exit 1; 4 pass, 1 fail | Preserves distinct increasing responsive widths |
| Mobile width becomes 760 | Exit 1; 4 pass, 1 fail | Preserves coverage below the actual mobile breakpoint |
| Change all dimensions and labels, reorder both tables, add another viewport | Exit 0; 5 pass, 0 fail | Allows harmless detail changes; 229.960167 ms |
| Same harmless changes with the original baseline test | Exit 1; 4 pass, 1 fail | Demonstrates removal of the former literal-table restriction |

The harmless control uses mobile 412x915, tablet 820x1180, desktop 1366x900 and ultrawide 2560x1200, retains the same six target identifiers, changes display labels, reorders both lists and adds an extra viewport. It is contract evidence about allowable selection changes, not proof that a real rendered UI works at those dimensions.

The unchanged browser script iterates `CONSOLE_VIEWPORTS` and `PRIMARY_VIEWS`. Therefore the restored semantic guard protects meaningful harness coverage; the current candidate avoids the previous silent empty/omitted selection regression while releasing exact pixel/label/order pins. The historical failed report `independent-review.md` remains valid for its rejected candidate and is not overwritten.

Temporary evidence root: `/tmp/temple-pruning-final-qa-WBwfqd/`. `results.json` records every command outcome, failing title and individual raw TAP SHA-256. Each case has a named `.tap` file and a disposable fixture containing the exact tested bytes.

The integration owner also preserved `repro.mjs`, `results.json` and all nine raw TAP files in `.ai-org/artifacts/WI-0234/rework-01-qa-reproduction.tar.gz`. I independently checked its file listing and SHA-256: `9db92b328d142f365d2dc6e5d6ee30fe334e37c6a2a085def3b263f89d3d0b01`. Disposable fixture copies are omitted; the script reconstructs exact revision bytes. To rerun elsewhere, set the script's repository and temporary-root constants to an available repository and fresh empty temporary path.

| Evidence | SHA-256 |
| --- | --- |
| `repro.mjs` | `ff2ad370c037a346c9241c1b925511d993a51a76fdb83d9668b9faf9e2a7d28c` |
| `results.json` | `4ba3ac7a14ba28ddecd76806fffb6ff13d57028dafbadb63328b94ea029e3082` |
| `unchanged.tap` | `aa66e3cc327f2e6b0306e21ca2bf7e96b4de720885a55fd07f1a0c49abad406b` |
| `empty-viewports.tap` | `97802ab1911ce906640ffdb68afb55cc32c123c8336145f492aa527670cc4f4d` |
| `omitted-organization.tap` | `69fd8e9c5c3523d2a7c5f2384e4da6a54a80d11c890efc9f831fb45b4c469ea0` |
| `harmless-pixels-labels-order-extra.tap` | `44897635b9d4526c19ecb6e9951f8805a582680618caf7ca70078692f7d7c5db` |

## Independent equivalence judgments for the 13 removals

| Removal group | Count | Independent judgment and meaningful difference |
| --- | ---: | --- |
| SVG L1-L6 snapshot, decorative chamber output/hidden-help placement, optional Console/Collector help prose | 3 | Accept intentional removal of ordinary presentation pins. These checks do not establish authorization, runtime separation or resource behavior. Link checks and actual Console/Collector/CLI coverage remain; they are not substitutes for exact deleted wording, which is deliberately no longer enforced. |
| Direct terminal-classifier test | 1 | Retained eleven-scenario replay calls the same `terminalFailure` function after event matching and covers completed/null stop, schema rejection and interrupted classification. The deleted exact diagnostic message text is intentionally not pinned. |
| Early ordinary-copy race | 1 | Retained late ordinary-copy race calls the same `planInit` and `executeInit` `copy`/`atomicCreate` path. It requires EEXIST, preserves competing bytes, requires absence of `temple.lock`, and additionally proves rollback of earlier writes. The filename does not choose another branch. Distinct Claude-copy race remains. |
| Separate successful onboarding-schema validation | 1 | Retained installed-schema test creates the same input and generated plan. `validateProjectSchemas` compiles the distributed schemas with Ajv, validates the same objects, and applies semantic checks. New explicit `checked` document assertions prevent silently omitted validation. The invalid effort negative test remains. |
| Duplicate format-command and model-observation blocks | 2 | Independent Git block extraction confirms the baseline removed blocks and retained current context-format blocks are byte-identical, 13 and 10 lines. They call the same shared functions with the same input; neither uses the enclosing diagnostic harness's protocol. Each harness retains its different execution and accounting tests. |
| Duplicate partial-usage, early-wrong-usage, private-command, route and interrupt-failure executions | 5 | The detailed diagnostic test already called the same `run` helper with these five modes and default protocol/setup. `run` clones the same template for each result. `assertStoppedPair` transfers all old generic assertions to those existing results: stopped, one stage, noncomparability, nonempty reason, persisted stopped record and seal; route also retains no `turn/start`. Existing detailed assertions and remaining missing-usage controls stay intact. Five redundant clones/replays are eliminated, not five distinct modes hidden behind fewer titles. |

These judgments accept ten removals with retained behavioral protection plus three intentionally relinquished presentation checks. The browser contract is a rewrite, not a fourteenth deletion. All changed lines fall within these decisions. Original child reports that say two optional deletions or fourteen aggregate deletions describe the rejected intermediate state and must be read with this corrected report.

## Complete verification evidence, independently inspected

The integration owner executed `npm run verify` once on corrected candidate `220eda6180c1806d4bc261c9332bf3e55ed92a0b` and reported process exit 0. I inspected the raw output and independently verified that the retained gzip decompresses byte-for-byte to it. I did not launch another full suite. This separates the Developer's complete run from my separately executed counterexamples and candidate judgment.

Observed checks: repository checks passed (118 overlay files, 10 Positions); documentation links passed; package boundary passed (443 files); full discovery reported 117 test files. Final result: **1237 tests, 1237 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo**, duration **288684.186083 ms**. The recursive `node:test` warning for the unchanged group helper is present, while the final skipped count is zero; no pruning change introduced that helper or warning.

| Evidence | SHA-256 |
| --- | --- |
| `/tmp/temple-pruning-full-final.log` | `c93054ee41afbbbcfb24f1d4121cba156f7410854ddf5a2ce332b31b4d6f7dfc` |
| `.ai-org/artifacts/WI-0234/verification-220eda61.log.gz` | `7f52e73ca25e53051990395c1de21edaf756e934d5c0ac67bcb9f39571e94134` |

The prior 1250-test baseline reports 285611.118583 ms. The corrected sample is approximately 1.08 percent longer, so this evidence does **not** demonstrate a wall-clock speed improvement. Both are single concurrent-suite observations, not a controlled benchmark. Five removed duplicate executions, thirteen fewer registrations and fewer repeated assertions are the demonstrated structural reductions. No token, billing or provider-performance result is claimed.

## Exact scope acceptance

| Work Item | Handed-off Developer revision | Test / Eval / Independent QA decision |
| --- | --- | --- |
| WI-0234 aggregate | `220eda6180c1806d4bc261c9332bf3e55ed92a0b` | **PASS**: complete integrated run plus independent deletion/negative-control review; QA-01 resolved |
| WI-0235 core | `93fe381da11621d48493f350e67f9b8bfa51ef8c` | **PASS for the unchanged owned scope**: all 50 assigned paths are byte-identical at corrected `220eda6180c1806d4bc261c9332bf3e55ed92a0b`; the complete corrected integration and reviewed mappings qualify this identical module scope |
| WI-0236 offline harnesses | `93fe381da11621d48493f350e67f9b8bfa51ef8c` | **PASS for the unchanged owned scope**: all 49 assigned paths are byte-identical at corrected `220eda6180c1806d4bc261c9332bf3e55ed92a0b`; the complete corrected integration and reviewed mappings qualify this identical module scope |
| WI-0237 optional runtime | `220eda6180c1806d4bc261c9332bf3e55ed92a0b` | **PASS**: corrected browser guard independently rejects counterexamples; optional help deletion is acceptable; complete corrected run passed |

The two child compatibility judgments do not rehabilitate the rejected aggregate `93fe381d`: that full revision still lacks the browser guard. They apply only to the exact unchanged child-owned paths integrated into the accepted corrected candidate. Git confirms source, scripts, overlay and package blobs also match across baseline, initial candidate and correction.

Unresolved acceptance defects: none. Release Gate administration, worker/claim release, final Doctor and post-evidence prose checks remain the integration owner's work. I changed no implementation, repository test, policy or canonical state and made no commit. The only repository write was this independent report; executable reproductions stayed in the temporary QA root. No real-browser execution, live provider validation, merge or deployment is implied.
