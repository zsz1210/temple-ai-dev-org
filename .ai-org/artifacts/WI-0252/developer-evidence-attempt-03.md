# Authority-drift correction

Candidate: `213c9e3133018bdd3a3404ff5c18a557880d293f`.

The independent rejection is addressed in assertCandidate: resolve protected
pre-delivery gates (including normalized evidence), reject their changed paths
regardless of artifact location, and compare candidate-existing authority files
physically. The own-artifact allowance now requires absence at the candidate plus
an explicit evidence reference or a named finish/diagnostic output. Native Agent
instruction filenames are excluded everywhere. Every-parent history validation
still rejects changed-then-reverted authority. Normal new scoped reports remain
eligible and grant no authority themselves.

The added regression verifies dirty/committed/hidden/reverted approved-scope
changes, precedence when the same file is also Developer evidence, existing
unrelated artifact edits, unreferenced new artifacts, unchanged Work Item/events
after refusal, and successful final completion with new referenced review evidence.

All 67 affected collaboration, delivery and finish tests passed in 82,849.326 ms.
Package check passed: 451 files, 1,017,895 packed bytes, 3,949,911 unpacked bytes.
Documentation links and diff checks passed. Raw prior full logs are deliberately
tracked despite the general log ignore rule, so their report links survive cloning.

The complete suite is running on this exact candidate. Prior 1,294/1,294 passing
results were superseded by a real independent defect and are not reused as the new
candidate's full verification. The remote reviewer must recheck its original
counterexample and judge the correction independently. No release or merge.
