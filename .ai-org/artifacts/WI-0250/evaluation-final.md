# Candidate evaluation and gate evidence

Exact candidate: `9148bd6478dbb25eff5cf0c9d1af91cd4d03c683`.
Actual distinct reviewer: `agent-lulu`, remote Codex task
`01a0b044-ef77-7f01-af96-11e93d5b2f28`. Developer: `agent-rikku`.
The coordinator records the returned assessment after Developer handoff; it does
not backdate claims or treat the remote read-only inspection as lifecycle mutation.

| Criterion | Evidence | Result |
| --- | --- | --- |
| Mechanical report, no rerun/acceptance, unknown billing | New measurement tests; remote failed-attempt/input-loss probe | Pass within declared-input coverage |
| Exact candidate, artifact and output safety | Physical hidden-drift, mode/deletion/tampering and path controls | Pass |
| Actual owner/claim/plan and next action | Repaired combined case plus independent four-condition probe | Pass after rework |
| Route ID input error before mutation | API/CLI result tests in field-readiness and full suite | Pass |
| Integration regression | Final full verification, 1,288/1,288 | Pass |
| Package boundaries | Independent 446-to-448 manifest comparison, unchanged boundary source | Pass; child WI-0251 done |

The review's initial medium-severity defect was reproduced, retained, repaired
through same-scope rework and independently rechecked. No unresolved reproduced
defect remains in this bounded candidate. The actual final independent report and
its reuse boundaries are in `independent-review-final.md`; complete local output
is in `full-verification-final.md`. One substantive review supports Test, Eval and
Independent QA records without pretending three separate executions occurred.

Measurement export took 66–72 ms locally and 125–127 ms remotely in a small fixture,
with exactly one actual command attempt per host. These are three diagnostic report
samples on different Node 24 patch versions, not statistical cost/speed claims.
Provider-reported review counters are retained individually, without adding
possibly cumulative counters or calculating an unsupported price.

Organizational closeout is within the user's implementation-and-testing approval.
No merge, release, deployment or real-human collaboration maturity is granted.
Rollback: revert the bounded source change through review and retain all historical
attempts, findings and generated receipts. The old collaboration-recovery branch
and its conflicting WI-0247 history remain separate for later explicit integration.
