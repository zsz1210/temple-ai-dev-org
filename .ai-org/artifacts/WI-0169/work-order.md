# WI-0169 Work Order

## Scope and authority

The owner accepted the next step of collecting useful real-world qualification evidence after Alpha.30. This slice prepares that work: reconcile the validation index with completed results and write a bounded field-validation plan. Execution protocols, Provider turns, changes to other projects, model-policy changes, and another release are outside this slice.

## Acceptance

- Current navigation identifies the completed WI-0135, WI-0136, WI-0141, and WI-0143 results and the unexecuted WI-0144 successor design.
- The next plan specifies scenarios, the decision each addresses, measurements, baselines, stop conditions, and reporting outputs.
- The plan distinguishes live project experience from controlled comparisons, and package Alpha.30 from a later main revision.
- Missing Token telemetry remains unknown; no sample size or efficiency claim is invented.
- Links and required repository verification pass.

## Design and risk

Update only the validation index and add one linked English plan. Keep historical result records unchanged. Use existing comparison and clean-room findings as the basis. This reversible, bounded documentation change qualifies for Lean; it changes no executable behavior, schema, authority rule, or runtime configuration.

## Completion boundary

Finish with a checked-in plan and corrected navigation. Report explicitly that no new live experiment has run. A later implementation can convert the first scenario into a frozen executable protocol after confirming its task, Provider interface, and operating envelope.
