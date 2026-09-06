# WI-0196 corrected-candidate verification

## Candidate

`d07a86d0bb6bd26117d518c6d14276393a21aa38`

## Correction

- `reasoningEffort: null` now stops as `child-resume-effort-unconfirmed` before child binding.
- Allowlisted child-acquisition and usage-integrity violations retain fixed top-level result codes; unknown tracker failures still collapse to `event-contract-violation`.
- Executor-level tests now cover nested and foreign activity, candidate overflow, duplicate spawn, usage inconsistency, and usage regression.

## Results

```text
node --test .ai-org/artifacts/WI-0196/events.test.mjs
19 passed, 0 failed

node --test .ai-org/artifacts/WI-0196/events.test.mjs .ai-org/artifacts/WI-0194/events.test.mjs
52 passed, 0 failed

npm run verify:fast
54 passed, 0 failed

npm run verify
632 passed, 0 failed

git diff --check
passed
```

All checks were local and generation-free. No model, live Provider turn, Credit, reset, retry, fallback, release, or merge was used.
