# WI-0249 Independent QA

## Decision and assignment

**PASS for the approved bounded repair** at framework candidate
`360b1b86266692aadda590b18419d3c3f004c352`, compared with
`1bbb14bdbe78e27c13a934615eedef163c9b4f22`.

The current assignments explicitly assign Independent QA to `agent-lulu` and
Developer to `agent-rikku`; these are different Agent Identities. Context resolved
the active Independent QA claim `claim-20260917161331-b9eccc74`, Principal
`human`, against this exact candidate. Prepared worker:
`worker-20260917161330-18d6211d`. This report is authored under `agent-lulu`, not
the Developer Identity. Effective workflow and risk are Standard, not
High-Assurance. Local attribution is not provider authentication.

QA read the whole operating contract, Work Skill and assurance/parallel
references, current assignments/Work Item, approved design, Developer evidence,
independent Test/Evaluation evidence and the complete five-file candidate delta.
Environment: local macOS 27.0 (26A428), Node.js v24.20.0. HEAD matched the candidate
before and after the independent probe. The final scoped comparison of `src`,
`test`, and `docs/operations/lean-finish-recovery.md` against that revision exited
0; `git diff --check` also exited 0. Concurrent organization/evidence changes were
preserved and are not attributed to this behavioral candidate.

## Independent review and counterexample probe

The defect was a successful completion despite changed/missing product bytes
hidden by Git index flags. Review confirms that ordinary preparation, workflow
stage preparation and journal snapshot validation all await `assertCandidate`,
which now awaits the same physical checker used by diagnostic recovery. Journal
application awaits snapshot validation before lifecycle writes; finish validates
again before and after diagnostics. Recovery imports the shared checker rather
than retaining an independent implementation.

The checker compares literal scoped Git inventory with actual regular files,
raw blob hashes and executable mode. Its traversal rejects linked ancestors and
unsafe entries; the existing recovery assertions retain these checks. Changing
Git status to literal path selection is consistent with the physical walk. No
missing `await`, widened lifecycle authority, removed acceptance assertion or
new dependency was found in the candidate delta.

QA independently executed one additional inline Node assertion harness against
the candidate CLI and a fresh disposable fixture from
`test/helpers/lean-delivery-fixture.mjs`. This tests an additional ordinary-finish
boundary without repeating the evaluator matrix or full suite:

1. Create the isolated Lean Developer fixture and confirm its synthetic local
   integration policy. Assert candidate `app.mjs` has Git mode `100644`.
2. Set fixture-only `git config core.filemode false`; obtain a successful
   `work-item finish --position developer --dry-run` and retain its plan digest.
3. Change only `app.mjs` mode to `0755`. Assert scoped Git status is empty.
4. Invoke both dry-run and exact-plan apply. Assert each exits 1 with
   `Temple error: Product scope changed: actual bytes or mode differ from candidate`.
   Compare all canonical fixture bytes, assert state remains `build`, and assert
   no pending delivery journal or finish diagnostic record exists.
5. Restore the original mode and repeat exact-plan apply. Assert `success: true`
   and resulting state `test`. Clean up the disposable fixture.

All assertions passed; process exit **0**, harness elapsed **3,051.235625 ms**.
The imported fixture's zero-test footer is not an extra counted test result.
Preserved observed output:

```json
{
  "agent_id": "agent-lulu",
  "framework_candidate": "360b1b86266692aadda590b18419d3c3f004c352",
  "fixture_candidate": "71457d96204136ce7a5b60982b419f1976d5849a",
  "node": "v24.20.0",
  "probe": "ordinary finish rejects hidden executable-mode drift with core.filemode=false",
  "dry_run_exit": 1,
  "exact_plan_apply_exit": 1,
  "canonical_unchanged_on_refusal": true,
  "pending_journal_absent": true,
  "diagnostics_absent": true,
  "restored_identical_request_success": true,
  "restored_state": "test"
}
```

## Joined evidence and limits

The independent [Test/Evaluation report](test-evaluation.md) supplies the six
selected passing CLI cases, both identities/index flags, changed and missing
files, unchanged positives, direct deliver, and its separate broken-parser,
restoration and historical-replay harness. These are reused exact-candidate
measurements; this QA runtime did not rerun them. The Developer's focused 60/60
result is supplementary, not an independently repeated QA measurement.

The integration owner's [full verification](full-verification.md) resolves the
previous pending full-suite condition: exact-candidate `npm run verify` exited
0, **1,279 passed**, 0 failed/cancelled/skipped/todo, 379,193.004084 ms on Node.js
v24.20.0. Repository, documentation links and package-boundary checks passed.
QA reviewed and joined that evidence rather than duplicating the full run.

Acceptance remains bounded by the approved contract:

- Product drift after lifecycle application rejects diagnostic settlement; it
  does not undo lifecycle writes. Preserve the pending record and original inputs.
- A prior successful receipt remains historical, with no fresh product acceptance
  or next-stage readiness inferred from its `success` field.
- Raw checkout transformations, symbolic links, submodules and nonregular entries
  fail closed. Only declared product scope is compared; finish does not run
  product tests or establish a hostile-concurrent-filesystem guarantee.
- Workflow-stage routing and interrupted/diagnostic-time paths were inspected and
  covered by joined suite evidence; this QA runtime independently probed the
  additional ordinary-finish mode case only. No external, multi-machine, browser
  or live-model behavior is claimed.

No blocking defect was found within this scope. No implementation repair,
canonical edit, commit, external call or release action was performed by this QA
runtime. This report supports `independent_qa_pass`; the integration owner must
join the worker evidence and complete the authorized Release Gate and current
organization diagnostics separately. It does not authorize merge, publication,
deployment or another experiment.
