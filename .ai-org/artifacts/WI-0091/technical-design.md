# Technical Design — WI-0091

## Projection boundary

Add `usage.source.capture_health` to `temple.usage-baseline/v1`. It is a derived observation, not lifecycle authority.

```json
{
  "schema_version": "temple.usage-capture-health/v1",
  "status": "capturing | ready-no-live-task | historical-only | not-capturing",
  "provider_id": "codex-local",
  "provider_status": "ready | disabled | degraded | offline | unobserved",
  "token_usage_capability": "supported | unsupported | unknown",
  "reason": "bounded-machine-reason",
  "live_resumable_tasks": 0,
  "observations": 1,
  "last_observed_at": "ISO-8601 or null",
  "captured_completed_work_items": 1,
  "completed_work_items": 81,
  "completed_work_item_coverage_ratio": 0.012345
}
```

Derive the projection from four inputs that Temple can prove:

- the current Provider Registry entry for the Codex App Server;
- the registered task topology;
- detailed `org.temple.codex.usage.updated.v1` observations;
- canonical completed Work Items and correlated observation coverage.

Do not derive readiness from the existence of historical observations.

## State algorithm

1. The Provider is currently capable only when its status is `ready` and `token_usage` is `supported`.
2. If capable and one or more registered tasks are live-resumable, status is `capturing`.
3. If capable with no live-resumable task, status is `ready-no-live-task`.
4. If not capable and at least one detailed observation is retained, status is `historical-only`.
5. Otherwise status is `not-capturing`.

`reason` preserves the bounded cause: Provider degradation, unsupported capability, explicit opt-in required, no eligible live task, or active task without a ready Provider. The UI maps these machine states to human language without hiding the underlying Provider status.

## Integration

- `buildUsageBaselineFromRecords` accepts current Providers in its options and emits `source.capture_health`.
- `buildControlPlaneSnapshot` passes `registry.list()` so each refresh describes the current Provider, not the last persisted startup alone.
- `buildUsagePreflightFromRecords` uses the same helper. `detailed_thread_usage.status` reflects current capture health and adds `evidence_status` to state whether retained observations exist.
- CLI reports remain read-only and retain existing privacy and authority flags.
- The Dashboard consumes the projection and uses a bounded compatibility fallback for older snapshots.

## Dashboard composition

1. Capture-health card.
2. Aggregate metrics: total Tokens, captured completed work, observations, and monetary-cost availability.
3. Qualification and historical-integrity notes.
4. Token composition and observed driver groups.
5. Existing authority disclaimer.

No chart is shown until there are enough observations to communicate a real trend.

## Real verification

After the exact candidate passes local tests:

1. Record the pre-run observation count and total.
2. Start the local Control Plane explicitly with Codex observation enabled.
3. Launch one provider-owned, one-turn Luna task with canonical registration before the turn, no retry, and no retained instruction content.
4. Confirm a new detailed usage event, Work Item correlation, increased observation count, and updated last-capture time.
5. If the installed protocol rejects the run, stop without retry and record the bounded failure as runtime evidence.

The sample validates collection only. It does not qualify savings, cost, quality, or routing.
