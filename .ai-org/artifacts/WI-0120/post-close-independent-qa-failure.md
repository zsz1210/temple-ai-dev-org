# Post-close Independent QA failure — WI-0119

## Context

After the repository owner reset Codex usage, Lulu (`agent-lulu`) performed a new read-only Independent QA review in a separate Codex task. The review inspected implementation candidate `cfa12af59f28159cd7f3c55989b984a03c817e7f` and final closeout HEAD `de45168658c8c9b7d7ad3326b875a3b1ad01deb3`.

## Verdict

**Fail — medium severity, release-blocking for the versioned route contract.**

The Execution Route schema required the top-level and step key names, but the step object had no property schemas and did not reject additional properties. Ajv 2020 therefore accepted a malformed route containing a numeric `step_id`, string `task_shape`, an `executed` selection status, claimed effective model values, an unavailable resource value of zero, and an unexpected Provider-launch command.

The resolver remained read-only and safe in the exercised cases. The failure is at the stored/generated output-validation boundary: callers could mistake a malformed document for a valid `temple.execution-route/v1` result.

## Independent evidence

- `npm run verify`, `2026-09-03T03:08:08Z` through `2026-09-03T03:09:16Z`: 325 passed, zero failed. This proved that the existing suite missed the counterexample.
- `temple schema validate`, `2026-09-03T03:10:41Z` through `2026-09-03T03:10:42Z`: 143 documents and 33 schemas reported valid, but no stored malformed route existed in the repository catalog path.
- The malformed Ajv counterexample was accepted at `2026-09-03T03:11:43Z`.
- Direct resolver adversarial checks passed at `2026-09-03T03:13:46Z`.
- Implementation, schema, policy, tests, documentation, fixtures, and lock blobs were identical between the implementation candidate and closeout HEAD, so the finding applies to both.

The separate QA task made no file, lifecycle, Git, or external-state change. This record is the repair input for WI-0120 and does not rewrite the earlier event history.
