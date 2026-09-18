# Remote independent review, original integration candidate

Actual remote agent-lulu report. Source links were made repository-relative; the
judgment and measurements are unchanged. Subsequent correction is separate.

## Judgment: REJECT

Reviewed candidate `11b464126c99ddc9c0b39c455ec81b9704f76479` against base `dd824741dbaa4fceca91976a259db02fc7bb00cb` as `agent-lulu`, Independent QA.

### Release-blocking finding

High — descendant verification permits pre-candidate authority evidence to change.

The allowlist treats every path beneath the Work Item artifact directory as administration via `name.startsWith(itemRoot)` ([src/lean-delivery.mjs](../../../src/lean-delivery.mjs), [allowlist](../../../src/lean-delivery.mjs)). Unlike external evidence, these files need not be new after the candidate or explicitly referenced Markdown.

The independent probe changed a candidate-existing, gate-referenced `approved-scope.md`:

- Original SHA-256: `d9de6fe03dcb3a9ba6a45d06d0960edac502939945da117d840fefd00ef019c8`
- Changed SHA-256: `7924e84f1bd0f3ce243b072adf2af9b27e46b70d45490db47bd8f661af2343a6`
- Synthetic candidate: `57ab6adc665839f71e6ffb9cc6aa3f53838ea432`
- Descendant: `a626701a7b5d0ccb71e8c2c20e0c77079eeffb08`
- Result: verifier finish returned `applied` and moved the item to `done`.

This violates the “explicit new Markdown evidence” boundary in [design.md](../../../.ai-org/artifacts/WI-0252/design.md) and [ADR-0068](../../../docs/adr/0068-collaborative-completion-recovery.md).

Required correction: restrict descendants to exact generated administration outputs; require evidence to be explicitly referenced and absent at the candidate; reject changes to candidate-existing gate, scope, approval, or specification evidence. Add this probe as a regression.

### Verification results

- Context preview: passed, `0.51 s`; navigation-only, no mutation.
- Affected tests: `101/101` passed, `0` failed, `188.77 s`.
- Recovery archive: all 23 files and event delta matched bytes/SHA-256; source event stream reconstructed correctly, `0.06 s`.
- Package boundary: `451` files, `1,017,175` packed bytes, `3,947,555` unpacked bytes, `0.56 s`.
- Initial package attempt was preserved: `EPERM` from the user npm cache in `0.46 s`; one isolated-cache rerun passed.
- Initial probe setup was rejected before mutation with `INVALID_INPUT` in `1.45 s`; corrected probe reproduced the defect in `3.22 s`.
- Canonical WI-0247 is unchanged from base, SHA-256 `167c54eff5bc0f5e364224327fbd8d9c06620036c84d8112030bf4551b5d1650`.
- Base events remain an exact prefix; seven appended events belong only to WI-0252.
- `git diff --check` passed. Final worktree is clean at the exact candidate.

Limits: the referenced recovery commit `6ca7c696…` is absent locally, so embedded snapshots could not be compared directly with that Git object; manifest integrity and reconstruction were verified instead. Full `npm run verify` was intentionally not duplicated. No lifecycle record, commit, network action, acceptance, merge, release, or live multi-user claim was made.



## Observed CLI usage

Raw initial-turn counters; cached input is a subset, not additional input.
No billed cost or quota observation is available.

```json
{
  "input_tokens": 3704770,
  "cached_input_tokens": 3315968,
  "cache_write_input_tokens": 0,
  "output_tokens": 30282,
  "reasoning_output_tokens": 14630
}
```
