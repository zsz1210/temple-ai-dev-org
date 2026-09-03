# Quality evaluation — WI-0115

- Candidate: `11012a38523676f1187fbea8b4a388ba4d81bb18`
- Evaluator: Quality & Evaluation Engineer, Lulu (`agent-lulu`)
- Deterministic onboarding decision: **PASS**
- Provider comprehension decision: **NOT RUN**

A detached candidate installed locked dependencies and passed all five focused installation tests. The package audit reported zero known production vulnerabilities and the detached tree remained clean.

The first detached setup attempt used npm's `--prefix` form and failed before tests because npm 11 resolved the worktree path incorrectly. Re-running from the exact detached worktree as the process working directory installed the same lockfile successfully. This is retained as harness-operation evidence, not classified as a Temple product failure.

The validation record does not claim that Codex or Claude loaded or understood the installed instructions. It correctly reports provider status as `not_run`, all Token fields as `null`, and every bootstrap authority flag as false.
