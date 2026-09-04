# WI-0156 Independent QA report

Independent QA: Lulu (`agent-lulu`)

Exact candidate: `336bd945b49e80a3e6d9459a8d093790d1200f9b`

## Verdict

**Pass with follow-up findings.** The accepted scope is implemented, the exact candidate is reproducibly green, and the matched clean-room result is represented without unsupported efficiency claims.

## Independent reproduction

- A detached worktree at the exact candidate passed `npm run verify`: 431 passed, 0 failed.
- Repository checks, documentation-link checks, and the package boundary passed.
- A separate cold-recovery Codex task (`01a06c90-b0c1-77e2-a017-7407d6247f1d`) received no delivery conversation and correctly recovered the target product, `WI-0001`, responsible identities, accepted scope, exact implementation and tested revision, test evidence, Doctor state, and safe stop boundary.
- Developer Rikku and Independent QA Lulu are distinct source Agent Identities. Target Developer Devon and Independent QA Emery are also distinct.

## Acceptance checks

1. The packaged init example is production-path valid and was used without correction: pass.
2. Non-interactive guidance names the example and optional repository integration behavior: pass.
3. Observation-file and Evidence-ID guidance plus actionable malformed-input errors: pass in deterministic regression; not separately exercised end to end by the clean-room task.
4. Malformed observation leaves evidence unchanged: pass in deterministic regression.
5. Neutral recovery title prevents coordinator namespace contamination: pass in the separate recovery task.
6. Missing Token data remains `unknown`: pass.
7. Full exact-candidate gate and distinct Independent QA: pass.
8. Matched clean-room metrics and no external action, retry, reset, or fallback: pass.

## Retained findings

- Closeout help does not disclose the named gate references required by the command.
- A nonexistent local handoff path can be accepted as a lifecycle reference.
- Doctor changed a generated timestamp during nominally read-only recovery.
- Position-ID discovery caused one corrected recovery command.
- Provider Token totals were unavailable.

The first three findings merit a separate pre-freeze product correction with deterministic regression coverage. They do not invalidate the narrower WI-0156 onboarding corrections, and the sealed clean-room run must not be retried merely to hide them.

## Safety and release boundary

No source or target remote write, repository visibility change, npm publication, package-version change, tag, GitHub Release, deployment, purchase, reset, retry, or fallback occurred. This verdict is organizational closeout evidence only and does not authorize public Alpha release.
