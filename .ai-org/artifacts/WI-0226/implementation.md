# Bounded Lean routing and offline evaluation reliability

The maintainer accepted the WI-0225 recommendation and authorized implementation
on 2026-09-07. This successor implements the first reversible slice, not the
single-Agent exception or a live experiment. WI-0225 remains the historical design.

## Scope and acceptance

The source write scope also includes `src/cli.mjs` for the new material option's
usage line and `scripts/check-package.mjs` for the four reviewed distribution
additions, under the same released WI-0211 integration ownership coordination.

- Add explicit `context enter --material operation`: acquire full governing
  sources, then route the complete common Lean procedure and only the current
  Build or Test module. Unknown, missing, changed, independently required or old
  procedure sources retain the existing whole-source path. No inferred reading.
- Keep native instructions, policy, task acceptance and candidate evidence whole.
  The new mode changes procedural obligations, not eligibility or verifier count.
- Preserve one evidence record by reference and reuse current finish diagnostics.
- Improve bounded Git revision diagnostics without accepting arbitrary revision
  expressions. Retain structural failure details, never operands or raw commands.
- Add a reusable offline-qualified evaluation sequence with explicit continuation
  policy, exact cost accounting, local product failures, dependent-stage skipping,
  global stops for unknown validity and no retries. Historical runners keep their
  frozen schedules and stop policy; no old run is resumed.
- Run parser/live-observer replay, real CLI Build/Test routing and fallback checks,
  complete local verification and initialization smoke. Record any unverified
  model-following or live-effectiveness questions explicitly.

## Obligation map

| Existing source / requirement | Trigger and actor | Replacement / retention | Evidence |
| --- | --- | --- | --- |
| Native AGENTS and TEMPLE authority | Every actor | Retain whole sources; no automatic omission | Entry source equality and fallback tests |
| lean-execution read/claim | Opt-in Lean Build/Test | Complete common module; ordinary mode still loads the whole procedure | Installed CLI routing |
| lean-execution Developer finish | Lean Build | Complete Build module | Build role and finish tests |
| lean-execution Verifier finish | Lean Test | Complete Test module with distinct Identity | Fresh Verifier and same-Identity rejection |
| lean-execution diagnostics/recovery | Both stages | Complete common module; recovery routes to existing procedure | Pending/failure guards unchanged |
| Current scope, evidence, policy, workflow | Every actor | Unchanged full acquisition and validation | Authority/candidate regression suite |
| Repeated command/revision narrative | Each handoff | One record referenced by existing finish | Existing finish integration suite |

## Risks and limits

Scope is sequential and has no UI. Main risks are omitted instructions, parser
over-acceptance, invalid samples mislabeled product failures, and unknown usage
silently counted as zero. Require exact known procedure bytes for substitution,
preserve independently routed sources, bind module bytes to the packet digest,
reject unknown revision forms and stop on missing usage or unconfirmed isolation.
The existing modes are the rollback path. No dependency or project-owned setting
is changed. Module routing is only one part of the broader minimization design;
it is not a claim that the remaining whole-policy burden is solved.

Developer owns implementation; a different Identity must review the exact
candidate before integration. Full test results are developer evidence, not QA.
Stop after the implementation and local evidence; later live protocols need their
own decision thresholds, finite budget and approval.
