# WI-0113 Developer Report

## Outcome

The Wave 5A runner now completes independent candidates without requiring a human to approve every ordinary continuation. The final r8 execution started and completed all four planned Luna Max turns with zero retry and zero model fallback.

The repeated earlier stops had four different technical causes:

1. WI-0112 applied the reviewed Token ceiling to cumulative gross context throughput, so cached context repeatedly counted against the operational stop.
2. r5 sent fields that the installed stable App Server accepts only through its experimental API.
3. r6 allowed safe commands but the worker combined them in one shell call, which correctly failed the command policy.
4. r7 trimmed Git porcelain output before parsing it and removed the first letter of a path beginning with a leading status space.

The final implementation isolates inherited parent-task environment variables, uses only stable App Server fields, requests one allowlisted shell command per tool call, delegates Git status parsing to the shared tested implementation, retains detailed usage, applies the operational Token ceiling to non-cached input plus output, measures interrupted filesystem state, and confines per-candidate Token/time stops to that candidate.

## Live result

- Four of four candidates completed in 473,047 ms.
- Gross Provider throughput was 1,662,089 Tokens.
- The operational budget counter was 153,481 Tokens: non-cached input plus output.
- Cached input was 1,508,608 of 1,648,353 input Tokens, or 91.52%.
- Aggregate candidate disk growth was 2,699 bytes.
- No retry, fallback, reset redemption, purchased-Credit authorization, network access, dependency installation, or external candidate write occurred.
- The public rate-card formula retained by the approved protocol produces 1.865109 equivalent Credits. This is not an observed bill or proof of personal Pro accounting.

Three candidates passed both public and hidden tests. The minimal idempotent-command candidate passed its public tests but failed hidden acceptance because it returned the same state object for a retry. The objective quality gate rejected it.

Only the compatible-event-evolution pair qualified for descriptive resource comparison. On that single pair, Temple used 22,471 more operational-budget Tokens (+71.89%) and 118,330 ms more time (+145.38%). The pilot therefore supports no Token-saving, speed, superiority, or automatic-routing claim. It does show that the four-turn execution, correlation, detailed usage capture, exact revisions, blind-package export, and hidden quality gate work end to end.

The packages themselves withheld condition, usage, and resolvable revisions as designed. However, the coordinator's separate local observation remained readable to the same evaluator context and was accessed before the score artifact was frozen. The package scores use only package fields, but this run cannot prove independent evaluator blinding. A future qualifying study must enforce evaluator access separation rather than relying on convention.

## Privacy and retained evidence

Raw prompts, raw responses, hidden reasoning, credentials, and Provider payloads remain outside Git. Repository evidence keeps bounded numeric usage, candidate revisions, objective outcomes, quality decisions, and the honest negative/neutral interpretation.
