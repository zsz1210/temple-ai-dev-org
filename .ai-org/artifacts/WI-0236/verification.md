# WI-0236 candidate verification and publication boundary

Candidate: `1f922e99508d76455a645a1b8683df34e7b7616d`, based on public PR #77 commit `06b81b13c4fccdcdfee9f0afb5148c249998319f`. Not merged into main.

## Required local checks

`npm run verify` passed **760/760**, zero failed, cancelled or skipped; reported test duration **168640.272875 ms**, Node.js `v24.20.0`. Repository, Markdown-link and package checks also passed. Source, tests, managed instructions, dependencies and human docs remained identical to the candidate during verification. Later coordination/protocol/report records do not change that behavioral revision.

Focused runner/observation verification passed **28/28**. The two retained measurement-test files with synthetic username normalization passed **24/24**. The new matrix test rejects wrong count, arm, requirement condition, pair and root mapping before dispatch. Existing tests preserve cancellation, limits, retired approval rejection, usage and cleanup guards. No source/fixture test calls generate model output.

The underlying WI-0235 offline improvement was separately reviewed at original candidate `68be154276fe2648a35eadf6c3e59c665ced2ea9`: see [independent evaluation](../WI-0235/independent-review.md) and [Independent QA](../WI-0235/independent-qa.md). That approval does not pretend to cover the later four-subject adjustment; the current full suite is Developer evidence, not a new independent pass. Repository review remains required for final integration.

## Public-safe integration

The new commit is a squash over the existing public PR stack; it does not rewrite or force-push any public commit. Exact-content comparison against private local `94163eb0` returned no source/test/instruction/dependency/doc differences. `git merge-base --is-ancestor` returned exit 1 for both private `68be154` and `87466e5d`: their unpublished intermediate ancestry is not reachable from the outgoing branch. Original local branches and historical experiment results remain preserved.

One released WI-0234 claim worktree coordinate was cleared through `publication normalize-apply`, with an exact reviewed plan; the subsequent plan reported `no-changes`. Three first-party synthetic fixture strings use the already supported `fixture` username, with unchanged privacy assertions. The historical WI-0211 audit paragraph explicitly describes this later non-semantic normalization. No scanner rule or allowlist was weakened, and no historical test score was updated.

Outgoing current-tree public audit: **0 blocked text findings**, one provenance-bound reviewed adapter fixture, **68 unchanged binary review items** covered by the user's earlier image-review exemption. This is not a universal secret/security guarantee or a claim that binaries were re-reviewed. The one outgoing source commit and subsequent evidence-only commits are audited before push; raw private protocol/runtime files are not published.

## Integration and live boundary

Main requires code-owner review and last-push approval. The normal merge attempt for parent PR #74 was refused; no admin bypass, protection change, self-approval or merge was performed. This change is submitted as a stacked PR on #77. Passing PR CI is only the bounded remote repository gate, not the local full suite or release approval.

The generation-free native configuration and positive/negative oracle controls passed. Dispatch uses the new [frozen protocol](protocol.md), with first-subject canary and no retry/reset/fallback. Live results are a separate report. No npm publication or version release is authorized by these checks.
