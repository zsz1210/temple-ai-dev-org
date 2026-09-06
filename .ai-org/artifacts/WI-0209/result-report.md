# WI-0209: bounded experiment result

## Outcome

The new experiment ran, but did not produce a completed delivery or a three-arm comparison. Ordinary Builder passed the product oracle; the fresh Verifier was stopped before provider/thread/turn creation. Prior and slim were not executed. No model retry, fallback, reset, purchase or refill was performed.

The source actually exercised was `6b1c407f60a337ba1b41467f08a831a2dc1023a2`. Its full local verification passed 648 tests before launch. Independent prelaunch review is retained in `independent-readiness.md`.

| Observation | Result |
|---|---:|
| Model / requested effort | gpt-5.6-terra / medium |
| Model turns started | 1 |
| Ordinary Builder elapsed | 138,784 ms |
| Ordinary Builder Operational Tokens | 32,691 |
| Input / cached input | 252,433 / 224,512 |
| Non-cached input / output | 27,921 / 4,770 |
| Reasoning output (included in output) | 659 |
| Provider total tokens | 257,203 |
| Verifier prelaunch stop elapsed | 41 ms |
| Overall recorded run elapsed | 140,135 ms |
| Completed deliveries | 0 |

Usage is last observed, not account-final billing. Verifier usage is unavailable, not a fabricated zero. Preparation, coordinator work and offline verification are outside actor timing. No efficiency or quality comparison can be inferred from this partial sample.

## Confirmed cause

The guard pinned the entire user configuration byte hash before launch. A single exact `projects` trust registration for the first canonical fixture directory was added during execution. Removing that two-line trusted registration and one adjacent newline in memory restores the pinned hash exactly. No unrelated byte change is needed to explain the mismatch. Independent read-only investigation reproduced this result; the component responsible for writing the registration is not independently attributed.

The original run retained the sanitized `observation-invalid` stop code. Subsequent offline diagnosis identified `isolation-source-drift`. The record has not been relabeled or rewritten. This is an over-strict experimental environment guard, not evidence of a Temple product failure or model inability.

## Evidence integrity

Protocol: `sha256:666ad249b75ca74531387c4e4d01be571cfe2dfc9906d1cad7da57b3ef687072`.

The exclusive consumed approval, run, per-file manifest and seal remain in the local WI-0209 matrix lab. Whole-manifest, run hash and recorded Git safety verification passed after shutdown and were independently checked. The corrected exact scratch exclusion worked in this attempt. WI-0208 evidence was not changed or resealed.

## Offline correction, not yet live validated

The follow-up guard tolerates only exact standalone trusted registrations for the protocol's frozen canonical fixture roots, and only in the explicitly pinned user configuration source. It removes those sections in memory and still requires the entire remaining byte hash to equal the original pin. Other files, settings, roots, aliases, extra keys, duplicate sections and unsupported multiline syntax remain fail-closed. No user configuration is edited or repinned. Isolation failure categories now survive sanitization without including configuration payloads.

Focused checks cover 31 cases across comparison, command-policy and cost-accounting suites, including negative trust-normalization cases. Full verification and independent offline review are recorded separately at handoff. This correction has not been used for a new model run.

### Final candidate verification

Candidate `4b2410a187d2f68e37cdcd4d266223c019db8f77` passed independent offline review and 31/31 focused checks. A read-only check using the retained original pin and current configuration also returned an exact normalized match; it did not change the configuration or sealed lab.

`npm run verify` on that candidate: **649/650 passed**, one failure, no skips/cancellations, 152,083.432917 ms. The failure was the unchanged optional Console refresh-event test's two-second timeout (`test/optional-console-collector.test.mjs:133`). An isolated rerun of that file passed **8/8** in 4,183.296084 ms. This does not retroactively make the full suite green or establish the exact timing failure cause. Full-suite stability remains unresolved. No Console source, assertion or timeout was changed.

The earlier intermediate full run passed 650/650 but is not substituted for final-candidate evidence because the UTF-8 correction occurred afterward. Independent QA's final PASS is limited to the offline instrument slice, not this unrelated full-suite failure or a completed live comparison.

## Remaining work and design lesson

The ordinary/prior/slim comparison remains unmeasured. The consumed attempt must not be resumed or silently retried. Any future experiment needs a fresh protocol, source binding and applicable authority.

Prelaunch review tested static effective configuration and source drift, but missed a normal configuration transition between two fresh actor processes. Future readiness should replay this transition without model generation, rather than merely repeating static checks. This is a local instrument finding, not a framework-wide learning policy or a justification for weaker isolation.
