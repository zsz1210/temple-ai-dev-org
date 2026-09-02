# Work Order — WI-0096

## Problem

GitHub Actions run `33582511826` passed the complete Node.js 22 lane and the Node.js 24 browser gate, but Node.js 24 reported 275/276 because fixture cleanup raced with temporary Git object removal:

`ENOTEMPTY .../policy-product/.git/objects`

All assertions in `escaped, missing, and undeclared-side-effect scenarios fail closed` had already passed. The failure arose only in `context.after` recursive cleanup.

## Authorized scope

- Add one bounded temporary-tree removal helper inside `test/phase-4b.test.mjs`.
- Use it for every recursive Phase 4B cleanup hook.
- Preserve every behavior assertion and the failed hosted run.
- Require full local and hosted verification.

## Exclusions

- No product, policy evaluation, Usage, model routing, Observer, or runtime behavior change.
- No unbounded retry or ignored cleanup failure.
- No repository visibility, GitHub setting, tag, Release, announcement, or npm action.

## Stop condition

Stop if the fix requires weakening a behavioral assertion, suppressing a persistent cleanup failure, or changing non-test source.
