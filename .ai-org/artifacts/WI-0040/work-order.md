# Work order — WI-0040

## Outcome

Make the existing provider-reported Token attribution and model evidence visible in the Temple Dashboard without implying that absent telemetry is zero or that an observed model is recommended.

## Product boundary

- Add a bounded, read-only `usage` projection to the control-plane snapshot.
- Add one scannable `Usage & models` workspace to both the loopback Dashboard and the private read-only viewer.
- Show current qualification progress, task-registration coverage, Token totals, model evidence, and usage-driver groups only when the source proves them.
- Preserve `unknown`, missing dimensions, and the explicit prohibition on savings, cost, model-quality, routing, and automatic-switching claims.
- Do not add pricing, automatic model routing, remote commands, prompt retention, provider payload retention, or a cross-project portfolio in this Work Item.

## Sequencing and overlap

This Work Item is sequential. `WI-0029`, `WI-0030`, `WI-0034`, and `WI-0036` are already integrated at the current base revision; their command, freshness, current-attention, and private-viewer contracts are regression requirements. `WI-0033` remains in Spec with no active claim and must review this server change before entering Build.

## Stop condition

Stop at an unclosed Release Gate after an exact candidate passes focused tests, the full repository verification, schema validation, Doctor, a live desktop review, and a live 420-pixel review. Do not release, publish, deploy, enable provider spending, or claim measured efficiency.
