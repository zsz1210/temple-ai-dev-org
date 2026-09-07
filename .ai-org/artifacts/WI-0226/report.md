# WI-0226: local qualification and a rejected Lean prototype

## Outcome

The operation-scoped instruction prototype is not retained. Splitting its procedure
removed a small amount of prose but introduced more provenance/selection metadata
than it saved. The CLI, distributed Skill, public documentation and package limit
were restored. The prototype is recoverable in commits `36558611` and `c734ae0f`;
neither is a passing final candidate or a released feature.

The retained implementation adds privacy-bounded command diagnostics, first-stop
correlation and a reusable sequence for **future** bounded evaluations. Historical
runners and sealed runs keep their original schedules and continuation policy.
No live model experiment, provider calibration, reset, purchase or publication ran.

## Measured full-output comparison

Generation-free, same disposable Builder fixture, Node.js 24.20.0, source candidate
`c734ae0f`. Each mode acquired the same task/authority; bytes are UTF-8 serialized
output with two-space JSON indentation. This is one deterministic fixture, not a
model sample, a timing comparison or an estimate of Token cost.

| Material | Emitted source bodies | Full JSON | Model-view JSON |
| --- | ---: | ---: | ---: |
| Existing stage | 60,994 | 90,573 | 85,740 |
| Existing task | 59,681 | 90,218 | 85,385 |
| Prototype operation | 60,325 | 94,969 | 89,506 |

Operation reduced source bodies by 669 bytes versus stage, but increased Full
output by 4,396 bytes (+4.85%) and Model output by 3,766 bytes (+4.39%). Compared to
existing task material, the prototype was larger in both bodies and complete output.
The proper measurement denominator changes the adoption decision.

An additional direct file comparison against `1b62e5e5` found that combined Skill
and procedure text changed from 8,758 bytes to 8,611 for Build / 8,620 for Test:
only 147 / 138 bytes less than before this implementation. The larger apparent
within-candidate source saving included added routing text in the candidate's
default procedure. Do not report it as a 669-byte improvement over the old release.

## Retained reliability behavior

- Read-only Git accepts documented bounded SHA prefixes and HEAD ancestors;
  lifecycle claim/handoff candidate checks still require exact full revisions.
- Rejections retain an argument index and fixed revision category, not operands.
- The original rejection remains correlated with trailing completion. Observing
  a rejection is still not OS-level prevention.
- Future sequencing takes an explicit continuation policy. Isolated product
  failures retain cost and skip dependent verification; independent subjects may
  continue only when preauthorized. Unknown validity/cleanup, missing usage,
  source drift or exhausted budget stops globally. No retry or replacement sample.
- Unconfirmed shutdown and incomplete runtime observations cannot claim complete
  usage. Totals remain a known observation subtotal, never settled account usage.
- Typed underlying stop diagnostics and a supplied immutable observation digest
  survive sequencing; absent provenance remains null. Untrusted raw fields do not.

The sequence helper is an offline-qualified building block, not a new launchable
experiment. A future caller must bind its frozen protocol, assess real isolation
and acceptance, preserve observations and supply approvals. This work does not
change the consumed WI-0224 protocol or authorize continuing its run.

## Verification record

- Prototype focused checks passed for both stage modules and whole-source fallback.
- The prototype full run had 695/696 passing tests: the Skill resource inventory
  assertion failed. This is retained as a failed qualification, not concealed by
  the separate payload-based rejection. The prototype and its new resources were
  withdrawn rather than expanding the accepted inventory.
- Independent read-only review found two P2 issues in the retained sequence:
  cleanup incorrectly left usage complete, and generic runtime stops discarded
  diagnostics. Both received targeted regression checks before final qualification.
- Follow-up review found one additional P2 conjunction: a stopped runtime that
  also exhausted the aggregate budget could bypass incomplete-usage marking.
  Candidate `5aca59ce9058877576c4d06542680fc5f71984b1` marks incompleteness before
  persistence and early limit returns. Both stopped-plus-token-overrun and
  stopped-plus-deadline regressions preserve the known subtotal, invalid sample
  status and original diagnostic without dispatching another stage.
- The separate reviewer reproduced both conjunctions on that candidate and found
  no remaining concrete P1/P2 blocker in the bounded recheck. This is informational
  review, not formal Independent QA acceptance or an efficiency endorsement.
- The bundled Skill Python validator lacked PyYAML; no dependency was installed.
  There is no final Skill change; the repository's existing Skill checks apply.
- The preceding retained candidate `ed62a967` passed full local verification
  (695/695). It is superseded by the final conjunction fix, whose full result is
  recorded separately below; the earlier pass does not validate a later revision.
- Final behavioral candidate `5aca59ce9058877576c4d06542680fc5f71984b1`:
  `npm run verify` exited 0; **696/696 tests passed**, zero failed/skipped/cancelled
  (test duration 171,302 ms). Repository checks, documentation links and package
  boundary passed (412 files). The suite includes disposable init/Doctor/Status/
  idempotent re-init and injected real Builder/Verifier lifecycle checks. These
  are local, generation-free tests, not a live-model efficiency comparison.
- Subsequent report and handoff changes are evidence/state only. This full result
  applies to the exact behavioral candidate above, not an untested later code edit.
- Developer ownership was released and the Work Item entered Test with Quality
  Evaluator ownership. Post-handoff Doctor: 36 pass, 1 warning, 0 fail. The warning
  is the existing stale generated parallel plan; no parallel runtime was dispatched
  from it. Formal Test/Eval/Independent QA and integration remain pending.

## Delivery boundary

The original efficiency acceptance criterion remains unresolved: the only Lean
prototype measured here was rejected and withdrawn. Do not mark the full Work
Item accepted merely because its reliability subset passes. Test/Eval must assess
that limited subset and retain the negative result; formal Independent QA and
integration are separate gates. This report does not authorize another live run.

## Next decision

Do not run another model comparison for this discarded prototype. Before changing
Lean again, audit the largest *required complete-output* components and repeated
administrative operations on the same task. State which obligation can genuinely
be removed or made conditional, rather than merely moving it to another file.
Any later candidate must first show a useful end-to-end structural improvement and
preserve authority/acceptance; only then decide whether a live comparison can change
adoption. Small-task efficiency and fresh-Agent continuity are separate questions.
