# Repaired ephemeral helper: live result

## Outcome

The single authorized attempt ran on 2026-09-06 at 06:05:30 UTC and stopped after 12.586 seconds with `child-resume-failed`. Compatibility failed; task quality is unmeasurable. No retry, fallback, reset or Credit purchase occurred.

Unlike WI-0198, this attempt emitted native subAgentActivity events and a child turn/started notification for the same hashed child. This is evidence of helper activity, not successful acquisition or completion. The tracker did not bind the child because thread/resume failed. The retained category does not establish whether the cause was a missing persisted child, a race, or another RPC failure.

| Measurement | Result |
| --- | --- |
| Requested model / effort | Terra / medium |
| Parent terminal | Interrupted by fail-closed cleanup |
| Parent last observed Operational Tokens | 19,073 |
| Parent input / cached input / output | 18,760 / 0 / 313 |
| Helper activity | Observed |
| Validated helper binding | None |
| Helper Tokens and terminal | Unknown |
| Structured final answer | Missing |
| Final changed / out-of-scope paths | None / none |
| Transient writes proven absent | No |
| Cleanup | Unconfirmed; no helper terminal event |

19,073 is the parent-only observed counter, not complete experiment usage, final account consumption, or cost. Native process inspection after the runner exited found no separate test app-server process; the pre-existing desktop app-server was left untouched. Process absence does not replace the missing child terminal event.

## Interpretation and next repair

The no-history request reached helper startup, but this does not validate end-to-end compatibility or demonstrate Temple efficiency. The remaining failure is in the acquisition/observation path. Before spending another live attempt, preserve a bounded RPC error category and test the native child's lifecycle against the acquisition assumptions. Do not infer missing model/effort or terminal evidence, disable the guard, repeatedly resume, or switch retention modes without review. Keep the present result sealed and use a successor for any changed experiment.

The completed repair tests are distinct from this failed live result. The reporting acceptance criterion is an honest named outcome, not a forced pass.
