# Human approval — WI-0028

- Recorded: `2026-08-30`
- Approver: project owner through the current Codex conversation
- Request accepted: proceed with the recommended Alpha.27 release checkpoint

## Authorized external actions

- Fast-forward push the reviewed local `main` history to `origin/main`.
- Read GitHub repository and Actions state and wait for the matching CI runs.
- Clone the same private repository for clean-checkout verification.
- Create and push the annotated `v0.1.0-alpha.27` tag only after the exact final commit is green and independently verified.

## Explicit exclusions

- No force push, ref deletion, history rewrite, visibility change, branch/ruleset mutation, npm publication, GitHub Release, deployment, external tracker write, model call or switch, account probe, or paid action.
- This approval is bound to `WI-0028`, the Alpha.27 checkpoint, and the stop conditions in its work order. It is not reusable for a later version or public release.
