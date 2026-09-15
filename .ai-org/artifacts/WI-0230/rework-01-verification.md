# Field remediation rework 01 verification

Developer: agent-rikku. Scope: WI-0230 integration and WI-0233 reconciliation. Rejected candidate: `535c306e38355864adc336f0a1289f105855bbdd`. Independent findings: IR-01/IR-02 in `independent-review.md`. This is a new evidence attempt; it does not reinstate retired acceptance.

## Corrections

- IR-01: reconciliation CLI builds and passes actual Status/Capability data to their writers. It refreshes an existing valid parallel plan while retaining scope and capacity, without dispatch. A derived-view failure preserves the actual canonical mutation state and offers `reconcile refresh-views` for view-only repair. Apply and rollback use the same handling; malformed plans remain available for explicit repair.
- IR-02: bounded unchanged Work Item validation prevents identity reconciliation from leaving an active claim with no eligible Agent, sponsor or current stage qualification. Directory inventory and consulted bytes join preview freshness. Historical released claims remain history.

## Evidence

The root's real public CLI regression passed four tests, including successful canonical merge plus fresh generated plan/status and an actual filesystem failure after canonical merge followed by view-only recovery. It verifies no canonical replay, no fabricated acceptance and retained worker ceiling. This is focused editing evidence only.

Corrected behavioral candidate: `aff1b86e608b15273f9874cc49971cab9e69940a`. Reconciliation focused verification passed 25/25 in 9.114 seconds, including the earlier actual SIGKILL recovery. Full `npm run verify` is in progress for this exact candidate; no full result is asserted here yet.

## Runtime visual review applicability

The real browser gate on `535c306e38355864adc336f0a1289f105855bbdd` passed four viewports, six primary views, reduced motion and six synthetic attention states. Its screenshot is retained at `.ai-org/artifacts/WI-0230/ui-runtime.png` and was visually inspected: the awaiting-environment row shows completed review, not-running execution, not-complete acceptance, the environmental impediment and a next step. Synthetic labels are intentional, not product observations.

The diff from `535c306e` to `aff1b86e` is empty for `src/control-plane-dashboard.mjs`, `src/control-plane-server.mjs`, `src/status.mjs`, `src/observer.mjs`, `src/delivery-attention.mjs` and `scripts/verify-console-browser.mjs`. This attempt references compatible prior browser measurements and makes their applicability explicit; it does not claim another browser run occurred. Final full-suite and independent judgments still govern acceptance.

Windows execution and independent human-machine trials remain unperformed as documented in the main verification record.
