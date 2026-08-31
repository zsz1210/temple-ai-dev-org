# WI-0066 risk review

| Risk | Control | Residual status |
|---|---|---|
| A resumed run launches an ambiguous turn twice | Persist `running` before launch and fail closed on recovery; never retry automatically | low |
| Aggregate ceilings are checked only after a costly turn | Support cumulative usage callbacks and interrupt requests, then stop before another launch | bounded by Provider callback latency |
| Participant paths escape the experiment root | Real-path containment plus safe relative-path validation | low |
| A turn edits unrelated files | Pre/post inspection and explicit allowlists; any violation stops the program | low |
| One repository silently becomes lifecycle authority for another | Reports are derived observations and retain per-repository authority | low |
| Descriptive Tokens or duration are presented as savings or billing | Claim flags remain false and unknown totals remain null | low |
| A generic runner becomes an unreviewed remote-command gateway | No generic live CLI; injected adapter, network false, approval never, no credentials | low |
| The WI-0064 blocked result is obscured | Preserve its artifacts and name the overlap boundary | low |
| Large validation exhausts local resources | Hard turn, attempt, Token, time, disk, concurrency, and diff ceilings; zero retry | bounded by measurement interval |

No external action, release, credential, secret, purchase, or irreversible migration is introduced.
