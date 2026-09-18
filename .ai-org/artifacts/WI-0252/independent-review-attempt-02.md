# Remote independent recheck, attempt 2

Actual resumed agent-lulu report; source links made portable. The original
rejection remains retained. Counters below are cumulative for the resumed session.

## Revised judgment: REJECT

Candidate: `213c9e3133018bdd3a3404ff5c18a557880d293f`
Prior REJECT for `11b464126c99ddc9c0b39c455ec81b9704f76479` remains preserved.

The original post-handoff counterexample is fixed:

- Synthetic candidate `d5738bbe…`, descendant `3060a555…`
- Approved-scope SHA changed from `d9de6fe0…` to `7924e84f…`
- Result: `GUARD_REJECTED`, mutation `not_started`
- Work Item and events unchanged; state remained `test`
- Wall time: `2.40 s`

### Remaining high-severity defect

The protected-authority check is bypassed when `HEAD` already equals the candidate. [src/lean-delivery.mjs](../../../src/lean-delivery.mjs) returns before protected gates are resolved and physically checked at [line 162](../../../src/lean-delivery.mjs).

Independent reproducer:

- Candidate and HEAD: `f5b2e0adab3c8f5347b09754306fb14a1172c887`
- Candidate-existing `approved-scope.md` hidden with `assume-unchanged`
- Git status: empty
- Candidate SHA-256: `d9de6fe0…`
- Physical SHA-256: `06b7c407…`
- Developer finish returned `applied` and advanced the item to `test`
- Wall time: `2.01 s`

This contradicts ADR-0068’s physical authority requirement at [line 31](../../../docs/adr/0068-collaborative-completion-recovery.md). The new regression begins authority mutation only after Developer finish ([test](../../../test/collaborative-recovery.test.mjs)), so it does not cover this path.

Required correction: perform protected gate resolution and physical candidate comparison before the exact-HEAD early return. Add no-write regressions for dirty, `assume-unchanged`, and `skip-worktree` authority drift during first Developer finish.

Commands:

- `node --test … test/collaborative-recovery.test.mjs`: `7/7` passed, `16.83 s`.
- Named legacy test only: `1/1` passed, `1.96 s`.
- No full suite was run.
- Worktree remains clean at exact candidate `213c9e313…`.

Reuse limits: the previous 101-test result remains background evidence only for unchanged paths, not a fresh full-candidate pass. Package-boundary and recovery-history files are unchanged from `11b464126…`; their earlier checks remain reusable. Recovery commit `6ca7c696…` is still unavailable locally, so direct source-object comparison remains impossible. No canonical state, network, merge, release, or product files were changed.

```json
{
  "input_tokens": 5408381,
  "cached_input_tokens": 4824064,
  "cache_write_input_tokens": 0,
  "output_tokens": 41313,
  "reasoning_output_tokens": 20380
}
```
