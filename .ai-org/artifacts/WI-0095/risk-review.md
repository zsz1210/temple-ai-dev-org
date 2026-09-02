# Risk Review — WI-0095

| Risk | Mitigation |
| --- | --- |
| Turn the failure into a skipped test | Require explicit unsupported result, exit code, platform, observation mode, and no-write assertions. |
| Weaken the macOS lifecycle | Leave every existing macOS assertion in the native `darwin` branch. |
| Accidentally claim Linux support | Change test code only; retain product rejection and document the exclusion. |
| Hide the failed release evidence | Preserve run `33581136546` as a failed, non-waived artifact and require a new run. |
| Pass locally but fail on Linux again | Treat hosted Node.js 22 and 24 as acceptance criteria, not optional confirmation. |

This is a reversible, test-only repository correction. It performs no external service or release action.
