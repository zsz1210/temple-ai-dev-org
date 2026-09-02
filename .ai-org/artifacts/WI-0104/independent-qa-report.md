# WI-0104 Independent QA report

## Verdict

Pass for exact revision `6385b89d077e3507d7220d3ff935ffa26119369c`.

Developer and Independent QA are separate Agent Identities: Rikku (`agent-rikku`) developed the candidate and Lulu (`agent-lulu`) performed Independent QA.

## Independent checks

- Runner syntax and the full repository gate passed: 280 tests, zero failures, zero skips.
- Fifty-nine retained-evidence assertions passed across the six scenarios, 98 successful runtime commands, six revision-bound native tests, four clean repository revisions, baseline/final/cold federation state, cleanup, disk arithmetic, image provenance, registry digests, and privacy redaction.
- A minimal side-effect probe confirmed that Node rejects the original fractional timeout before a child process starts. This agrees with the retained first attempt's zero commands and absence of runtime or fixture state.
- Doctor reported 36 passes, one stale generated parallel-plan warning, and zero failures.
- The detached QA worktree remained clean and was removed.

## Runtime reproduction decision

Independent QA did not recreate Colima or rerun the containers. The evidence was internally consistent, source-bound, content-addressed, and sufficient for the declared local claim. Repeating the run would redownload a deleted VM image and produce a different environmental sample without resolving an inconsistency.

## Non-blocking observations

- The generated parallel plan is stale and must be rebuilt before any future parallel dispatch. This does not invalidate the sequential WI-0104 result.
- Duplicate-event idempotence exists in the generated service implementation but was not a separate runtime scenario. It is not among WI-0104's six declared scenario acceptance cases.

## Claim boundary

This pass applies only to the single-human, single-machine, deterministic local rehearsal. It does not qualify production, enterprise, multi-human, multi-machine, cost, Token-savings, deployment, or release claims.
