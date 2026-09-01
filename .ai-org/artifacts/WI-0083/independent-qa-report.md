# WI-0083 Independent QA Report

- Position: Independent QA
- Agent Identity: Lulu (`agent-lulu`)
- Developer Agent Identity: Rikku (`agent-rikku`)
- Candidate revision: `ad10d528113963673724d9b02004b62e87aaafbe`
- Result: pass for the bounded local candidate

## Independent setup

Independent QA removed the earlier Quality worktree, created a second fresh detached worktree at the exact candidate revision, and reused only the repository's installed dependency directory through a temporary local symlink. No later evidence commit, dirty main-worktree state, generated usage view, project evaluation source, or Playwright artifact entered the candidate.

## Challenges performed

- Re-ran the complete repository suite rather than relying on the Developer or Quality result.
- Confirmed schema and semantic validation reject unknown fields, privacy retention, duplicate candidates or cases, task-shape drift, case provenance drift, policy-contract mismatch, profile-mapping mismatch, stale evidence, and unsafe source paths.
- Confirmed quality is an absolute gate: lower Token use cannot compensate for one failed required case.
- Confirmed the paired sign test ignores ties, requires the configured minimum effect and alpha, and leaves power and pilot variance as declared study-design provenance rather than inventing achieved power.
- Confirmed the evaluator reads only explicitly configured project-local sources, retains no raw prompts or responses, and does not call a provider.
- Confirmed `shadow` remains distinct from `advisory`; even an `automatic` policy value cannot activate an absent executor.
- Confirmed every routing, policy-change, budget, lifecycle, provider-call, and release-authority flag remains false.
- Confirmed fresh install, legacy policy, upgrade preservation, managed-schema parity, documentation links, and the three README structures remain consistent.

## Exact-candidate verification

- `npm run verify`: 260 passed, 0 failed, 0 cancelled, 0 skipped.
- Repository checks: 99 overlay files and 10 Positions passed.
- Documentation links: passed.
- Schema validation: valid, 104 documents checked through 28 schemas, 0 errors.
- Doctor: healthy, 35 passes, 0 failures, 1 existing stale parallel-plan warning. The warning correctly blocks dispatch from an obsolete generated plan and is unrelated to this sequential candidate.
- Self-host preflight: zero configured matched sources, `matched_advisory.status: not-configured`, no recommendation source, `execution_status: not-implemented`, automatic routing false, model switching false, and canonical state unchanged.
- English, Traditional Chinese, and Japanese READMEs each contain ten level-two sections.

## Independent conclusion

No blocking correctness, compatibility, privacy, documentation, or authority defect was found. The exact candidate may enter Release Gate as a locally verified advisory evaluator.

This result does not authorize a push, package release, provider call, paid evaluation, policy change, model switch, or automatic routing. It also does not prove that any real model profile is better for Temple; the project still has no configured matched-evaluation source.
