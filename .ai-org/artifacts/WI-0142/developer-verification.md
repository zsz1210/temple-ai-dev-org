# WI-0142 developer verification

## Result

Pass on implementation revision `250abc73c0b1ddfb56e0d6d9853fe200f74c3c2d`.

## Verified behavior

- 11 focused Context Capsule regression tests passed;
- supported sanitized `cat CONTEXT_PACKAGE.json`, shell-normalized single-file reads, and exact absolute control paths classify as `control` only when their condition root is unambiguous;
- multi-file commands, wrong working directories, traversal, symlink escape, oversized paths, and failed commands remain unknown or excluded;
- retained acquisition evidence contains no raw command or output content;
- analysis v5 reports gross, cached, non-cached, output, Operational Tokens, cache share, and repetition details;
- missing or failed cache control blocks a causal efficiency claim while retaining descriptive results;
- the reusable protocol template is draft, unapproved, generation-disabled, and grants no external authority;
- repository, documentation-link, and package checks passed;
- the final full suite passed 411 of 411 tests;
- `.ai-org/artifacts/WI-0141/` has no diff from the implementation base.

An earlier concurrent full-suite run observed one timeout in the unrelated optional Console refresh test. That test passed alone, and a clean full-suite rerun passed all 411 tests. No product code was changed to mask the transient result.

## Commands

```bash
node --test test/context-capsule-ablation.test.mjs
npm run check
npm run verify
git diff --check
git diff --name-only 496a949 -- .ai-org/artifacts/WI-0141
```

No model invocation, external write, release, publication, Credits purchase, refill, or usage reset was performed.
