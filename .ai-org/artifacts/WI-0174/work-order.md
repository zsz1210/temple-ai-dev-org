# WI-0174 — Same-scope review rework

## Approved bounded outcome

The user authorized continuing the core improvement sequence. Provide an explicit return from Test, Eval or Independent QA to Build on the same Work Item, without restarting product definition for a repair inside its approved scope. No terminal reopening, scope expansion, remote mutation, release, model experiment, or overlapping onboarding implementation is authorized.

## Acceptance and design

- Require the active eligible reviewer, explicit same-scope confirmation, a reason, repository findings, and the exact current Developer candidate.
- Preserve scope, acceptance, governing references, profile, risk, UI mode and prebuild approvals. Retire all candidate-specific gates and pointers, retain append-only attempt history, and release the reviewer claim. A new Developer must claim the returned item.
- Do not silently stop a nonterminal worker or release its resources. Fail without writes when it still owns the item.
- Reject reused rejected revisions and archived downstream evidence on later handoffs, transitions and closeout. Re-run the selected profile's remaining gates. Preserve High-Assurance and sponsor checks.
- Test CLI success and failure, repeated rework, stale evidence, distinct identities, active runtime rejection, and legacy compatibility. Full verification and separate Independent QA are required.
- Documentation is English and human-facing. Mark the command unreleased; no claim that Alpha.30 supports it.

## Coordination and risk

This branch is stacked on local WI-0173. The other control task owns first-use/recovery and the frozen comparison; it was notified of WI-0174 and shared dispatcher/work-item paths. Use a separate state helper and narrow integration hooks. Do not integrate conflicting historical WI IDs. UI mode is not-applicable. The change is reversible by reverting its implementation commit; historical records are not migrated.

The documentation slice also updates the operations link in `docs/README.md`. The changed overlay schema is installed into the self-host repository and lock using `temple upgrade`; exact framework ownership is preserved. `work-item configure` does not currently add affected paths, so this supplemental write scope is recorded explicitly here, not by hand-editing the canonical Work Item.

## Stop

Stop after local implementation, verified evidence and organizational closeout. Integration, publication, process cleanup and the comparison remain separate.
