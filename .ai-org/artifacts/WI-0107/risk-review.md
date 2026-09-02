# WI-0107 risk review

- **Unexpected payment:** generation is blocked until an explicit no-auto-reload confirmation is recorded; external spend authority remains zero.
- **Reactive overshoot:** Token events arrive after consumption, so the hard threshold can overshoot. The run states this limitation and stops immediately when observed.
- **Treatment contamination:** minimal candidates never receive `.ai-org`; coordinator instrumentation remains outside candidate repositories.
- **Condition leakage:** blind exports omit condition and resolvable provenance until scores are frozen.
- **Invalid comparison:** the program stops on missing usage, reroute, retry, dirty state, out-of-scope writes, test failure, or correlation loss.
- **Overclaiming:** the output is feasibility evidence only and cannot authorize Wave 5B, Wave 5C, release, publication, or automatic routing.

