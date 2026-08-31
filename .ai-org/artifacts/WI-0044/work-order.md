# Work order — WI-0044

## Problem

The current Dashboard is the latest implementation, but it presents most capabilities as one long technical page. An experienced engineer cannot quickly locate the organization view, distinguish current action from history, or discover local-only tools. This is an information-architecture failure, not a user-training problem.

## Authorized outcome

Redesign the existing Dashboard as a responsive operational cockpit with direct navigation to `Now`, `Execution`, `Usage`, `System`, and `History`. Make Human Inbox and Agent Commands discoverable on the loopback viewer while preserving their local-only authority. Preserve the accepted snapshot, SSE, privacy, redaction, and truthful-unknown contracts.

## Boundaries

- No new remote command authority or private-viewer mutation.
- No new provider, external tracker write, token pricing, model routing, deployment, release, publication, or open-source preparation.
- No change to canonical lifecycle authority or provider event schemas unless a separately reviewed defect makes it necessary.
- `WI-0043` remains the review record; this Work Item implements the accepted direction.

## Stop condition

Stop after the redesigned local and private surfaces pass automated checks, responsive browser evaluation, and Independent QA. Leave the Work Item at `release_gate`; do not publish or formally release it.
