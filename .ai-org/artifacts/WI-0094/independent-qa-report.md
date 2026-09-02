# WI-0094 independent QA

- Verdict: **pass**
- Candidate: `d2e2e8ed9ec8fd9476a529cfc1f37790220341d7`
- Developer: Rikku (`agent-rikku`)
- Independent QA: Lulu (`agent-lulu`)
- Isolation: clean detached temporary worktree, removed after verification

Independent QA reproduced:

- 25/25 focused tests and 280/280 full repository tests;
- all six primary Console views at 390×844, 768×1024, 1440×1000, and 3440×1440, plus reduced motion;
- a 336,650-byte live Console response;
- 985.410 ms uncached p95, 3.892 ms cached p95, and a 911.811 ms invalidated rebuild;
- 26.345 ms Usage-only p95, 13,305-byte Usage payload, two observations, and 47,726 retained Tokens;
- deterministic visibility of a third synthetic Usage observation in a private copy of the real retained state;
- omission of unused Observer detail and Provider task `items` from the Console projection while preserving totals, privacy, and unknown semantics;
- Doctor with 36 pass, one known stale generated-plan warning, and zero failures;
- a clean exact candidate worktree before and after testing.

No implementation repair, repository mutation, Provider generation, public action, or external release was performed by QA.

