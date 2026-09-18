# Independent exact-HEAD authority finding

The remote reviewer confirmed the original descendant counterexample is rejected
without Work Item/event writes on 213c9e3133018bdd3a3404ff5c18a557880d293f. Its new
probe then found an incomplete repair: HEAD equal to the candidate returns before
the authority validation. An assume-unchanged candidate-existing approved-scope
artifact was physically changed while Git status stayed empty; Developer finish
returned applied and moved the item to Test.

Probe candidate/HEAD: f5b2e0adab3c8f5347b09754306fb14a1172c887.
Original hash: d9de6fe03dcb3a9ba6a45d06d0960edac502939945da117d840fefd00ef019c8.
Changed hash: 06b7c407fa1668ce83c4e5fa0fcaf766e2fce4cb95c5d813ae4c826c6becff12.
Probe wall time 2.01 seconds. Remote affected tests passed 7/7 plus the one legacy
test; local full verification passed 1,295/1,295 in 296.504729 seconds. Neither
passing suite overrides this independent rejection.

Return within the same scope. Run authority validation before the exact-HEAD early
return for Developer, Verifier and identical-request recovery. Cover ordinary and
hidden authority edits at exact HEAD with no lifecycle writes. Complete the narrow
independent correction review before launching the next full suite, to avoid a
known incomplete repair consuming another full-verification run.
