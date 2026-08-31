# WI-0065 approved scope

## User-visible outcome

Temple must distinguish what it asked the model to use from what the Provider actually reported. A human viewing Team or usage data must not have to infer whether `max` or `xhigh` is the request, the thread default, or the effective turn setting.

## Required behavior

1. A Provider-owned task records `requested_reasoning_effort`, `observed_thread_reasoning_effort`, and `effective_turn_reasoning_effort` separately.
2. The current installed App Server leaves `effective_turn_reasoning_effort` unknown because it exposes no direct acknowledgement for that value.
3. The legacy `reasoning_effort` field remains readable and gains `reasoning_effort_source`; it is never presented by itself as effective-turn proof.
4. Usage events and reports retain the explicit fields and their provenance.
5. Team cards show requested, thread-reported, and turn-effective values using human wording; unavailable evidence stays unavailable.
6. Existing task documents and integrations continue to validate.

## Out of scope

- Automatic model or reasoning routing.
- Inferring effort from Token composition, latency, or model output.
- Provider protocol changes.
- Remote commands, deployment, release, or public publication.

## Acceptance evidence

- Contract test where the turn requests `max`, the thread reports `xhigh`, and no turn-effective value exists.
- Schema and legacy-registry tests.
- Usage-attribution test with all three dimensions.
- Runtime visual review of the Team surface.
- Full local verification and distinct Independent QA on the exact candidate.
