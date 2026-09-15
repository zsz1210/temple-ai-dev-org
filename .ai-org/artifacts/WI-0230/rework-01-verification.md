# Field remediation rework 01 verification

Developer: agent-rikku. Scope: WI-0230 integration and WI-0233 reconciliation. Rejected candidate: `535c306e38355864adc336f0a1289f105855bbdd`. Independent findings: IR-01/IR-02 in `independent-review.md`. This is a new evidence attempt; it does not reinstate retired acceptance.

## Corrections

- IR-01: reconciliation CLI builds and passes actual Status/Capability data to their writers. It refreshes an existing valid parallel plan while retaining scope and capacity, without dispatch. A derived-view failure preserves the actual canonical mutation state and offers `reconcile refresh-views` for view-only repair. Apply and rollback use the same handling; malformed plans remain available for explicit repair.
- IR-02: bounded unchanged Work Item validation prevents identity reconciliation from leaving an active claim with no eligible Agent, sponsor or current stage qualification. Directory inventory and consulted bytes join preview freshness. Historical released claims remain history.

## Evidence

The root's real public CLI regression passed four tests, including successful canonical merge plus fresh generated plan/status and an actual filesystem failure after canonical merge followed by view-only recovery. It verifies no canonical replay, no fabricated acceptance and retained worker ceiling. This is focused editing evidence only.

The corrected candidate, complete suite, independent recheck and final diagnostics will be appended after they run. Previous browser evidence applies to the unchanged console source; source/data compatibility remains subject to the final full run. Windows execution and independent human-machine trials remain unperformed as documented in the main verification record.
