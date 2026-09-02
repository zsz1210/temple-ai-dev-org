# Wave 5A pinned feasibility fixtures

Each case contains a `starter/` tree visible to the model and an `evaluator/` tree retained by the coordinator. The model receives the exact `TASK.md` file in either condition. The evaluator tree is copied only after the candidate turn completes.

The Temple condition adds the pinned framework organization to a copy of `starter/`. The minimal condition adds only a concise neutral repository instruction that repeats the tool and safety limits. Product files, task text, Codex version, model, reasoning, sandbox, approval policy, and turn limit remain matched.

The grader receives an arm-neutral package matching `arm-neutral-export.schema.json`. The exporter:

1. includes only the patch below `src/` and `test/`;
2. removes repository paths, Work Item IDs, task IDs, Agent and Position names, branch names, instruction filenames, timestamps, and condition labels;
3. converts either native handoff into the same five-field `completion` object;
4. assigns `package_id` from a salted SHA-256 mapping retained separately until scores are final;
5. withholds the map from the evaluator and reveals it only after signed scores are recorded.

Objective acceptance tests run before blind scoring. A critical failure rejects the package. Usage values are shown only after the quality score is frozen, preventing lower Token totals from influencing subjective grading.

## Reproducing bundle digests

`feasibility-protocol.json` defines the case-bundle digest as `sha256-path-null-content-null-v1`. Starting at this `fixtures/` directory, enumerate every regular file below one case-ID directory, sort by ascending bytewise UTF-8 POSIX path relative to `fixtures/`, and feed each record to one SHA-256 stream as: UTF-8 relative path, one NUL byte, raw file bytes, one NUL byte. This covers the starter, hidden acceptance tests, rubric, and reference implementation without relying on archive metadata, locale collation, or filesystem traversal order.

The objective fixture check uses a temporary directory with `candidate/` and `evaluator/` as siblings. Public tests must pass on the starter, hidden tests must fail on the starter for the intended defect, and those same hidden tests must pass after only the pinned reference `src/` is substituted. The temporary directory is not a measured candidate and is removed after the check.
