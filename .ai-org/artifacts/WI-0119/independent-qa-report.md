# Independent QA report — WI-0119

## Verdict

Pass for exact candidate `cfa12af59f28159cd7f3c55989b984a03c817e7f`.

Rikku (`agent-rikku`) remains the Developer and Lulu (`agent-lulu`) remains the Independent QA Agent Identity. A separate Codex QA task was attempted but could not start because the account had reached its current task-usage limit. The repository owner directed the work to continue, so the Independent QA Position was exercised in the controlling Codex task. This preserves the recorded Agent Identity and Position separation required by the Solo project profile, but it is not claimed as a separate model-process or human review.

## Independent checks

- `npm run verify` ran from `2026-09-03T02:58:26.254Z` through `2026-09-03T02:59:34.529Z`: repository checks, documentation links, package boundary, and all 325 tests passed with zero failures, skips, cancellations, or TODOs.
- The policy and request validators fail closed on unsupported automatic authority, partial Provider mappings, unknown required capabilities, duplicate structured rules, invalid resource measures, and unavailable observations represented as zero.
- Eligibility checks execute before preference selection for profile status, capability, modality, Provider allowlist, data class, execution boundary, risk class, and resource ceiling.
- Pinned selection cannot silently fall back. Advisory and shadow results expose only requested settings; effective Provider, model, and reasoning remain unobserved and `null`.
- The resolver imports no network, process-launch, prompt-evaluation, or Provider client. Its public command reads repository-relative JSON and rejects symlink escape; tests verify that resolution does not alter the target.
- The custom content-production fixture adds `video_producer`, storyboard and video-render capabilities, and a local media profile without changing the core Position catalog.
- Schema validation passed for the current repository. The Management Console receives only a compact read-only policy summary and exposes no route editor or launch action.

## Non-blocking observation

The Work Item's planning-time `affected_paths` array retains `docs/adr/0046-adaptive-execution-routing.md`, while the accepted ADR is named `docs/adr/0046-separate-adaptive-execution-routing.md`. The documentation index and every live link use the accepted filename, and documentation-link validation passes. Because `affected_paths` is a planning/overlap declaration rather than release evidence or runtime input, this does not invalidate the candidate.

## Claim boundary

This pass qualifies the deterministic, local, provider-neutral execution-routing foundation and its read-only human projection. It does not qualify real-model quality, automatic routing, Provider compatibility, purchased Credits, external execution, deployment, publication, push, merge, or public release.
