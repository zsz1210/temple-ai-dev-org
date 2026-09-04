# WI-0141 quality evaluation

## Decision

Pass the retained live comparison to Independent QA as a completed bounded experiment with explicit limitations. The execution evidence is internally consistent, all eight candidates are correct, and the revised analysis no longer hides opposing Token and latency movement behind a neutral label.

## Independently checked facts

- protocol, observation, and analysis use the same SHA-256;
- the retained condition IDs are unique and follow the frozen eight-condition order;
- all eight conditions completed and passed exact typed-fact evaluation;
- condition Operational Tokens sum to the retained total of 197,367;
- retry and fallback are zero at both run and condition level;
- retained flags confirm no raw prompts, responses, hidden reasoning, commands, or command outputs;
- both shapes explicitly report route adherence as inconclusive because coverage is incomplete;
- the multi-repository efficiency outcome is `tradeoff`, not `neutral`;
- the focused suite passes 9 of 9 tests and repository, documentation-link, and package checks pass.

## Interpretation

The data supports a correctness-preserving reduction in selected source bytes. It does not support universal Token savings or automatic routing. Single-repository and multi-repository results disagree, repetition spread is high, cache share differs materially, and one acquisition record per turn remains unknown.

These limitations are findings, not reasons to discard the run. They define the next measurement repairs and are stated in the human evaluation and public validation note.

## Gate recommendation

Advance to Independent QA. Independent QA should verify the exact candidate revision, recalculate the retained numeric totals, confirm the sealed-run guard, and reject any claim stronger than the evidence permits.
