# Baseline-reference identity repair

The maintainer accepted the WI-0242 recommendation: repair the instrument offline,
then discuss broader improvements. This work authorizes source/test changes and
an isolated recheck of the retained candidate, not another live model subject,
rewriting a sealed result, a model-policy change, merge or release.

## Scope and acceptance

The delivery-record oracle compares two recorded baseline fields against a frozen
full commit ID. Resolve each supplied reference with Git to a commit object before
comparing identity. Accept a full ID, unique abbreviation or unambiguous equivalent
reference; fail closed on absent, wrong, ambiguous, non-commit or option-shaped
input. Use argument arrays and end-of-options separation. Force ambiguity warnings
on and reject them rather than trusting user Git configuration. Preserve exact
candidate SHA, ancestry, receipt, handoff, scope, byte and product checks.

Keep this in the repository-only fixture, not the framework claim API. Extend its
generation-free qualification helper to accept a baseline spelling (default stays
full ID). Real claim and finish CLI calls must produce the accepted records; do
not create positive fixtures by editing canonical JSON. Invalid record mutations
in disposable test repositories remain explicit negative controls.

Tests cover each baseline field independently, equivalent full/short/named refs,
ambiguous object prefixes and branch/tag names, missing/wrong refs and non-commit
objects. Retain all existing product and authority negative controls. Run focused
tests during editing and one full verification on the final behavioral candidate;
distinct QA reviews the exact revision.

Recheck the WI-0242 candidate through the repaired assessor with the original
checkpoint, in isolation, without changing actor files or frozen seal. Record this
as a new offline instrument check; retain original acceptance and usage. Reuse
LESSON-0006 and PRACTICE-0002 as evidence-reuse guidance, not execution authority.

## Stop and next discussion

Stop after verified repair, independently reviewed evidence and a focused PR.
No new changed-spec run is approved here. Discuss small-task fixed overhead,
missing changed-spec evidence, reliable output classification and the design-only
Learning Loop separately rather than adding them to this repair.
