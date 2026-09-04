# Developer report — WI-0130

## Delivered

- Added a fresh six-candidate experiment runner with exact owner approval, App Server schema/model checks, matched inputs, zero retry/fallback, bounded Tokens/time/disk, and arm-neutral packages.
- Added an integer `0..100` blind-evaluator contract and a one-turn Sol xhigh evaluator that freezes scores before mapping reveal.
- Added a pure analyzer that separates A-versus-B process effects from B-versus-C route effects and preserves correctness exclusions.
- Ran four Terra medium candidates, two Luna max candidates, and one Sol xhigh evaluator within the approved envelope.
- Added the human result report and retained a bounded canonical observation without raw prompts or hidden reasoning.

## Measured result

- Candidate operational Tokens: `211526`
- Evaluator operational Tokens: `25122`
- Combined operational Tokens: `236648 / 520000`
- Candidate turns: `6 / 6` completed
- Evaluator turns: `1 / 1` completed
- Retries, fallback, between-candidate intervention, and path violations: `0`
- Conventional Fixed correctness: `1 / 2`
- Temple Fixed correctness: `1 / 2`
- Temple Adaptive correctness: `2 / 2`

## Deviation found after the run

The reused historical setup helper created Standard Work Items even though the WI-0130 protocol registered Lean. This invalidates a Lean Core Path claim. It does not invalidate the retained Standard-process diagnostic or the matched B-versus-C route observation. The preflight now checks `workflow_profile=lean`, `scope_class=bounded`, and `risk_tier=low`, so this mismatch fails before any future generation.

The one-run approval has been consumed. No rerun, deployment, publication, public release, purchased Credits, automatic reload, or routing policy mutation was performed.

## Recommendation

Close this experiment as `inconclusive` for the intended Lean process claim. Keep the data as negative/mixed evidence, replace the historical setup helper, narrow the broad bounded-quality route, and create a separate approved comparison only after the corrected zero-generation preflight passes.
