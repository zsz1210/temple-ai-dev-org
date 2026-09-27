# Operation readiness design

## Observed problem

A real development task hit three avoidable setup failures: a reviewer had an
unreported dispatch dependency, a program reused an occupied host thread, and a
new analysis artifact blocked exact-candidate review. The guards were correct;
diagnostics arrived too late and required repeated inspection. This is workflow
friction, not evidence of a product defect or causal token savings.

## Bounded changes

1. Reuse host binding validation for a read-only readiness operation. Report
   stable issue codes and bounded dependency/binding IDs, never source paths or
   source contents. Capture begin checks predictable binding blockers before
   persisting its prepared ledger. Actual binding still rechecks under its lock;
   a race or interrupted persistence remains fail-closed with explicit recovery.
2. Reuse native candidate classification for a read-only candidate diagnostic.
   Classify out-of-scope changes, unexpected tracked/untracked drift, and modified
   existing candidate artifacts. List exact paths and narrow corrective guidance.
   The existing lifecycle uses the same classification and keeps all restrictions.
   Evidence membership never permits changing an already tracked artifact, and an
   executable in an artifact directory is not automatically administrative.
3. Document one preparation sequence: declare actual dependencies, bind before
   work, preserve receipts, prepare evidence before candidate handoff, and stage
   later analysis programs in ignored output rather than pretending they are reports.

## Execution and review

One task, two disjoint implementation scopes: delegated host/capture code and its
tests; coordinator candidate diagnostics, documentation and integration. Independent
review follows both scopes. Bind reviewer directly with explicit review activity
before handoff; do not invent completed planning nodes solely to satisfy a graph.

## Verification

Offline regression tests cover unsatisfied dependencies, occupied thread/turn,
successful retry after resolution, no ledger for predictable rejection, and
unchanged crash/race behavior. Candidate tests cover stray reports, exact new
evidence, executable artifacts, modified tracked evidence, escaped names and
stale/mismatched candidates. Compare read-only output with actual lifecycle refusal.
Full npm verification runs once on the final behavior candidate. No browser gate
is needed because there is no UI change. A distinct actual Agent reviews source
and evidence. Program timing and case results describe validation, not AI savings.
