# WI-0229 — Test finding, candidate not accepted

Candidate: `ef4f6cd34279ab11a3410876d84688b7a2ff68a3`.
Reviewer: `quality_evaluator` / `agent-lulu`, Principal `human`, distinct from
Developer `agent-rikku`. Source, tests and documentation were unchanged from
the exact candidate during this review. The three earlier source-review findings
were repaired, but formal review identified the blocker below.

## Checks

Independently ran `node --test test/mechanical-completion.test.mjs` on Node.js
24.20.0: **14/14 passed**, zero failure, skip, cancellation or todo;
47618.221208 ms. The pass includes same-request recovery, extra product/mode
drift, link rejection and invalid raw UTF-8 regressions. Passing these tests does
not override the newly identified ownership defect.

The [Developer report](report.md) records exact-candidate full verification:
712 passed, zero failed/skipped, 173786.710125 ms. This is attributed evidence,
not an independently repeated full suite. Its `test/cli.test.mjs:525` fixture
executes init → Doctor → Status and idempotent re-init in a temporary directory,
satisfying the bounded default-install compatibility observation by evidence
reuse. The default fixture expects the unconfirmed integration warning, not a
mechanical policy activation. Source comparison confirms no installed policy,
workflow definition, existing Skill, dependency or initialization default changed.

## P2 — real managed ownership is not excluded

`src/mechanical-completion.mjs:68` checks
`Object.hasOwn(lock.managed_files ?? {}, contract.file)`. Real `temple.lock`
uses an array of `{ path, sha256 }` entries, not an object keyed by path. This is
confirmed in the current lock, `test/cli.test.mjs:533` and the existing upgrade
implementation. Consequently a regular allowlisted note whose path is an exact
managed entry is not rejected by this check, contrary to ADR-0061 and the Work
Item's explicit protected-source acceptance criterion.

`test/mechanical-completion.test.mjs:99` replaces the array with an object and
therefore does not qualify the real-format managed-file boundary. A regression
should preserve the actual array format, add the exact note path/checksum in the
preapproved baseline, perform the literal candidate edit, and require rejection
before lifecycle mutation. Source inspection establishes the wrong lookup; a
new end-to-end reproduction was not run during this bounded review.

The minimal repair is exact entry-path lookup against a validated managed-files
array, with a real-format regression and conservative rejection of malformed
ownership inputs. No source repair was performed by the reviewer.

## Disposition

Test is **not accepted** for this candidate. Do not advance to Eval, Independent
QA or Release Gate on these results. Parent acknowledged the finding and will
use supported same-scope rework, then provide a corrected exact candidate with
fresh verification. The existing ordinary Lean distinct-Verifier and Standard/
High-Assurance routes remain required; this review grants no exception.

No live generation, policy activation, source/test edit, commit, push, merge,
closeout or external release was performed. Review changes remain uncommitted.

Final compact Status confirms Test, the exact candidate, one unresolved finding,
and no active claim. Doctor: 36 pass, 1 warning, 0 fail; the existing generated
parallel plan remains stale and was not used to dispatch work.
