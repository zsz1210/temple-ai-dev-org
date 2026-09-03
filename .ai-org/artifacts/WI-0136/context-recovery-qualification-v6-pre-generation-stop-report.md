# WI-0136 context-recovery qualification v6 pre-generation stop

## Outcome

The exact-approved v6 attempt stopped before any candidate model generation. The Provider rejected the integration Structured Outputs schema while starting the first Terra routed turn.

- Observed candidate conditions: 0 of 2
- Operational Tokens: 0
- Retry and fallback: 0
- Candidate result: none
- Protocol SHA-256: `74f581c82408340462f1c65ef6a0666847c40ac4750303d08c5adb60ee6c153f`
- Preserved raw stopped record SHA-256: `e0be3d10eaf9f4247f1903066df8063e3358e2d2859bee667f2fa0467c6ce2c4`

This event is not a Terra quality result and must not be counted as one of the two approved candidate turns.

## Root cause

V6 added `uniqueItems: true` to `completed_slices`. OpenAI Structured Outputs supports a documented subset of JSON Schema; `uniqueItems` is not among its supported array constraints, and unsupported strict schemas are rejected. The v6 preflight checked the Codex App Server wire schema and model route but did not validate the experiment's exact output schema against that subset.

Official reference: <https://developers.openai.com/api/docs/guides/structured-outputs#supported-schemas>

## Telemetry correction

The preserved raw record reports `model_generation_performed: true`. That field is known to be wrong for this event: the Provider's causal error explicitly says the schema was rejected before generation, no condition observation exists, and the recorded Token count is zero. The raw artifact remains byte-preserved; the runner is corrected so an equivalent zero-usage, zero-observation stop records `false`.

## Corrective action

V7 removes the unsupported keyword while retaining exact enum values and an exact length of three. It adds a generation-free schema-subset check to protocol validation, freeze, and preflight; freezes the schema-check result in the Provider contract; and tests both the accepted live schema and a rejected `uniqueItems` regression fixture. A new protocol digest and exact approval are required before live generation.
