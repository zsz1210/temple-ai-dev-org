# WI-0180 supplemental quality evaluation

- Result: **PASS** — no blocker found in the bounded prerequisite delta.
- Quality Evaluator: Lulu (`agent-lulu`)
- Developer: Rikku (`agent-rikku`)
- Exact candidate: `64d5c94a2fd5213c464bef054e53f401247680ce`
- Reviewed baseline: `175f7ada3821b6e57e5b176f5e7af6624144abec`
- Environment: Darwin arm64, Node `v24.20.0`

This is a fresh supplemental Quality & Evaluation result for the WI-0180 Lean child. It is not an Independent QA result, release approval, live-comparison approval, or authority to invoke a model.

## Acceptance result

1. **Optional installed-provider classification — pass.** The only source change under `scripts`, `src`, and `test` is `test/delivery-control-pair.test.mjs` (`10` insertions, `2` deletions). The installed-wire test now requires both `/bin/zsh` and a successful `codex --version` probe. Only that test receives the conditional skip; the portable tests have no new skip condition.
2. **Portable behavior without Codex — pass.** With executable lookup limited to system paths that do not contain the installed Codex CLI, the complete test file reported 5 tests: 4 passed, 1 skipped, 0 failed. The skipped test was explicitly labeled `Optional installed-provider integration requires Codex CLI and zsh; portable contracts still run`.
3. **Explicit sandbox request remains fail-closed — pass.** With executable lookup intentionally containing no tools, the targeted optional run without a report request exited 0 with 1 explicit skip. The same run with `TEMPLE_DELIVERY_SANDBOX_REPORT` set exited 1 with 1 failure and **0 skips**, failed at `git-setup`, and produced no report. Thus an explicit rehearsal cannot silently become an optional skip.
4. **Production behavior and prompts — pass.** `git diff --quiet` from the reviewed baseline through the exact candidate passed for the delivery runner, command policy, comparison preparation/runner, Provider adapter, and replay adapter. The complete source-path diff under `scripts`, `src`, and `test` contains only the prerequisite test. The production runner and its actor-request/process templates are unchanged.
5. **Binding digests — pass.** Fresh recomputation at the exact candidate returned source digest `sha256:fb8c249ec8641487477ade184a208159a2edde672ad9f86e19a3e5dec0fe7c1e` and process contract `delivery-process/v6`, digest `sha256:96977af8fa19b6aa1e79d31ff9a60415165b4ec98d871362e765565df3abdd69`. The reviewed test file has no working-tree delta from the candidate.

## Fresh checks performed

| Check | Observed result | Evidence class |
| --- | --- | --- |
| `git rev-parse HEAD` and candidate object resolution | Exact `64d5c94a2fd5213c464bef054e53f401247680ce` | Candidate identity |
| Source-path name diff, focused diff review, and `git diff --check` | Only `test/delivery-control-pair.test.mjs`; guard is scoped as described; no whitespace error | Code inspection |
| Production-path `git diff --quiet` | Exit 0 | Code inspection |
| Missing-Codex complete test-file subprocess | Exit 0; 4 pass, 1 explicit optional skip, 0 fail; 143.250334 ms | Runtime test |
| Missing-tools targeted subprocess without report request | Exit 0; 0 pass, 1 explicit skip, 0 fail; 84.040125 ms | Runtime test |
| Missing-tools targeted subprocess with explicit report request | Exit 1; 0 pass, 0 skip, 1 fail; 89.56225 ms; no report created | Negative runtime test |
| `sourceDigest(...)` and `digest(deliveryProcessContract())` | Exact source and process digests above | Runtime digest recomputation |
| Candidate `sandbox-readiness.json` field inspection | `passed`; 4 stages; 81 operations; 2 denied writes; 0 Provider thread requests; 0 Provider turn requests; no model generation | Developer-evidence inspection, not a fresh replay |

## Reused evidence and limits

- The Developer-reported `npm run verify` result of 568 passed, 0 failed, 0 skipped in 100.159 seconds is accepted as exact-candidate Developer evidence; this evaluator did not repeat the full suite.
- The current candidate's installed-sandbox report was inspected for source/process binding and its recorded 4 stages, 81 operations, 2 denied writes, and zero model turns. This evaluator did not repeat the four-stage installed sandbox.
- The WI-0179 Independent QA report remains prior evidence at baseline `175f7ada3821b6e57e5b176f5e7af6624144abec`. It independently covered the broader harness and the unchanged process contract, but it is not presented as a current-candidate test result.
- This host has `/bin/zsh`, so the missing-zsh branch was inspected in code rather than reproduced by removing the absolute system executable. The missing-Codex branch and the explicit-request no-skip property were exercised in subprocesses.
- No model, live matrix, retry, fallback, merge, publication, or external action was run. This pass supports only the parent coordinator's candidate rebind/readiness decision; genuine live comparison remains pending explicit user budget approval.
