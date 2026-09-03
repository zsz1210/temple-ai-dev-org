# Representative comparison v6 stop report

Protocol `35deeb5fb60f8f48e818ad6abad7d576d7de976d95159d7a1fbe8ef00baa67c7` passed exact approval and preflight, then ran once with zero retry and zero fallback. Minimal Responsible Design completed before the concurrent Build wave stopped. The Temple arm and blind evaluator did not start.

The stopped run retained 103,555 candidate Operational Tokens. Design completed at 53,617. Notifications stopped at 23,769 after requesting `git -C ../../../notifications status --short`; resolving that target from the Provider-reported command working directory did not identify an exact fixture repository root, so the runner rejected it. Gateway retained 23,815 and orders-catalog retained 2,354 before both were interrupted as sibling work.

The v6 parallel-failure repair worked as intended: all three Build observations were settled before the stop record was written, every App Server child exited, and all five Minimal Responsible repositories remained clean. The path policy also behaved as frozen: it did not globally allow parent traversal. This is evidence of an unnecessary and invalid candidate Git self-check, not evidence about Temple effectiveness or model quality.

V6 provides no completed arm and no Temple-versus-minimal result. A successor must use fresh matched repositories and separate exact approval. To remove Git self-checks that the experiment coordinator already owns, successor Build instructions should require commands to remain at the arm root and explicitly prohibit candidate Git commands. The safety policy remains fail-closed.
