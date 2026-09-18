# Corrected Developer candidate

Candidate: `9148bd6478dbb25eff5cf0c9d1af91cd4d03c683`.
Developer: `agent-rikku`.

Same-scope rework corrects the independent finding: an active claim now takes
precedence over a different planned assignment. The plan remains visible through
`planned_agent_id` and `assignment_note`. Unclaimed mismatches still block;
different actors still cannot assume an active claim. The existing combined-case
test now explicitly exercises this condition and passed locally, 3/3.

Final `npm run verify` exited 0: 1,288 passed, zero failed/cancelled/skipped/todo,
Node duration 265,118.506875 ms and wall time 266.78 seconds. Repository/document
checks passed; package manifest is 448 files, 1,010,477 packed bytes and 3,924,251
unpacked bytes. Complete log is `full-verification-final.md`.

The separate remote reviewer rechecked the exact candidate, ran the affected 3/3
cases plus its own four-condition probe, verified unchanged measurement/package
source and returned PASS. Its actual report is `independent-review-final.md`.
This Developer record does not replace that judgment.

Prior rejection and successful initial tests remain historical. Two final-check
launches stopped during documentation-link checking before any suite began: a
remote absolute source link was made portable and its relative depth corrected.
These were evidence-only changes, not hidden test failures or full-suite reruns.

The measurement-engine samples in `measurements.md` belong to the earlier exact
candidate; those modules are unchanged and their bounded measurements are reused
as supporting mechanism evidence, not relabeled as a new experiment. No new
provider or quota call, main integration, package publication or deployment.
