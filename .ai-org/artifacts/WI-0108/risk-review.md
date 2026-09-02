# WI-0108 risk review

- **Unexpected payment:** the owner confirmed automatic Credit reload is disabled; authority covers included Pro allowance only, and the runner has no API key or purchase path.
- **Reactive overshoot:** Token interruption follows Provider observations and can exceed a threshold before interruption completes; it is not a billing guarantee.
- **Protocol regression:** preflight validates exact installed schema digests and rejects the previously unsupported structured-output keyword before generation.
- **Authorization mix-up:** the runner validates `work_item_id` and explicit WI-0108 approval/preflight paths.
- **Treatment contamination:** the minimal candidates contain no `.ai-org`; coordinator state stays outside all candidates.
- **Invalid comparison:** the whole program stops on the first invalid attempt, without retry or fallback.
- **Overclaiming:** four turns across two synthetic cases can validate mechanism feasibility only; they cannot establish general superiority or authorize routing.
