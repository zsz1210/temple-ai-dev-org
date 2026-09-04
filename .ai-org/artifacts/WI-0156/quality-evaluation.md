# WI-0156 Quality evaluation

Quality & Evaluation Engineer: Lulu (`agent-lulu`)

Exact candidate: `336bd945b49e80a3e6d9459a8d093790d1200f9b`

## Decision

**Pass with follow-up findings.** Retain the focused onboarding corrections and the matched comparison. The result is sufficient for this bounded Work Item but does not authorize a public Alpha freeze or a release.

## Acceptance review

- **Package-visible initialization:** pass. The example validates through the production init path, and the clean-room task used it without configuration or repository-source correction.
- **Evidence guidance:** pass at deterministic regression scope. CLI tests verify actionable malformed-observation guidance and the exact reusable Evidence ID. The clean-room task did not invoke normalized Evidence capture, so no end-to-end claim is made for that path.
- **Neutral recovery namespace:** pass. The task title contained no coordinator Work Item ID and recovery selected the target repository's `WI-0001` directly.
- **Unknown-safe usage:** pass. Missing provider Token data remained `unknown`.
- **Matched clean-room observation:** pass with findings. Delivery and recovery completed with no Human intervention, product rework, model retry, fallback, or external action.
- **Exact-candidate repository gate:** pass. A detached worktree at the exact candidate passed 431 tests, repository checks, documentation links, and package-boundary verification.

## Comparison interpretation

The successor was 20.997 seconds slower in combined task time (+4.03%). With one run per condition, this is descriptive noise rather than evidence of regression or improvement. The useful observed changes were fewer onboarding guesses and removal of cross-repository title contamination, not speed.

## Findings retained

1. Closeout help omits its named `--satisfy` requirements.
2. Lifecycle gate references can retain a nonexistent local handoff path.
3. Doctor rewrites a generated timestamp during nominally read-only recovery.
4. Valid Position IDs are not obvious enough to prevent an avoidable recovery-command correction.
5. Token totals remain unavailable and must not be estimated.

## Claim boundary

One bounded local product and one matched rerun cannot establish general time, quality, Token, human-usability, or multi-repository benefits. The new findings should be corrected and deterministically tested in a separate slice; they should not trigger an automatic clean-room retry.
