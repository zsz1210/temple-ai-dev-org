# Physical candidate consistency for ordinary completion

The human authorized completing this correction after the bounded diagnosis on
main `1bbb14bdbe78e27c13a934615eedef163c9b4f22`. Ten isolated CLI cases took
22,313 ms: unchanged flagged files succeeded and visible modifications rejected,
but both Git index flags hid broken product bytes from Developer and Verifier
finish. The product test failed while Verifier finish reached `done` and Doctor
reported 37/0/0. This is an integrity defect, not evidence of actual project loss.

## Approved scope and approach

Reuse the physical candidate check introduced by WI-0248, rather than keeping a
second implementation. Export it from the existing completion module, which the
recovery module already imports. Ordinary candidate validation becomes async and
awaits that check at preparation and journal revalidation. Its existing callers
cover Developer/Verifier finish, deliver and workflow-stage completion. Preserve
identity, profile, approval, journal, evidence and historical replay boundaries.
Use literal scoped Git paths, raw blob bytes, executable mode and actual scoped
inventory; never clear flags, execute content filters or read unsafe links.

Accept unchanged flagged candidates. Reject hidden modified/deleted files in
preview and apply without lifecycle writes. Preserve interrupted journals if
product changes after interruption, and reject drift during diagnostics rather
than claiming a successful result. Existing recovery coverage must remain green.
Supplement with focused controls for directory scope and direct deliver as needed.
Historical receipts remain historical, not newly verified product acceptance.

## Risk, evidence and stop

Raw-byte checks intentionally fail closed on transformed checkouts, symlinks,
submodules and nonregular entries. This does not claim protection against hostile
concurrent filesystem rewriting. Scope is the declared product, not the entire
repository; no automatic product-test rerun is added to finish.

Use Standard gates with Developer agent-rikku and distinct QA agent-lulu. Run
focused development checks, one full offline suite on the final behavioral
candidate, and independent evaluation/QA. Update the operator guide to distinguish
the shared check from the narrow recovery command. No live model experiment,
external release, npm publication or deployment. Deliver a reviewed PR; integration
requires its own authorization. Rollback: stop completion use and revert through a
reviewed change, retaining all journals and receipts.
