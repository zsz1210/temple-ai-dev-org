# Technical design: bounded instrumentation pilot

## Topology

The Temple toolkit remains at:

`/Users/zsz1210/Documents/ChatGPT/temple-ai-dev-org`

The ordinary target repository is separate:

`/Users/zsz1210/Documents/ChatGPT/temple-effectiveness-lab/instrumentation-pilot`

The target receives its own project ID, Agent identities, Work Item, task registry, evidence, generated views, and Git history. No target identity is copied into the toolkit's `project-overlay/`.

## Initialization

1. Create an empty local Git repository at the confirmed target.
2. Create a temporary `temple.init/v1` config outside the repository with `naming_mode: ai-suggested` and the five confirmed assignments.
3. Run the toolkit CLI dry-run and inspect conflicts.
4. Run ordinary init without `--self-host` and without `--integrate-agents` because the target begins without an `AGENTS.md`.
5. Verify `templew.mjs`, `temple.lock`, bootstrap version, Doctor, Status, assignments, and identity separation.
6. Remove only the exact temporary config.

## Synthetic repository baseline

Before the Developer task, commit:

- the initialized Temple organization;
- `PRODUCT.md` containing the approved function contract;
- a minimal dependency-free `package.json` using `node --test`;
- no implementation, tests, or README example.

This exact commit becomes the Developer task base revision.

## Target Work Item and task

- Create one gate-evidence Work Item with affected paths `src`, `test`, `README.md`, and `package.json`.
- Route it through Spec and Design using repository artifacts prepared before Build.
- Configure it sequentially and claim it as Casey at Build.
- Create one projectless user-owned Codex task titled `WI-0001 · Developer · Casey`, explicitly directing it to the target path and exact base revision.
- Immediately register the returned stable thread ID to the target Work Item with Position `developer`.
- Do not send a second implementation turn, retry, steer, interrupt, or model switch.

## Telemetry sequence

1. Run `usage preflight` before task creation to record the no-task baseline.
2. After stable thread registration, run preflight again and start the local Codex-enabled control plane if its provider can be started without an external dependency.
3. Wait for the single task within the 15-minute ceiling.
4. Update the target task and any runtime record with the exact terminal status and revision.
5. Run `usage preflight` and `usage report --no-write` after completion.
6. Classify the result as `observed`, `partial`, or `unavailable`; missing usage remains unknown.

Account-wide activity is not attributed to this project. No pricing lookup or monetary estimate is part of the pilot.

## Verification and independence

- Developer evidence must identify the exact candidate commit and local Node test result.
- Quality evaluates the synthetic acceptance rules and the telemetry classification separately.
- Iris performs Independent QA from a fresh detached worktree of the target candidate; Casey cannot certify it.
- The coordinator records the pilot outcome in `WI-0051` and stops. Closing either Work Item does not authorize another feature or repository.

## Budget enforcement

- Structural limits—one task, one implementation prompt, one deliverable, no retry—are enforceable even when live Tokens are unavailable.
- If the task remains active at 15 minutes, request no new work and record the timeout state.
- If provider-reported total Tokens exceed 25,000, record the exceedance and do not retry.
- No external dependency, GitHub, hosted CI, deployment, release, or publication command is allowed.

## Rollback

The target is intentionally disposable, but this pilot does not authorize deleting it. Rollback means stop the task, preserve its local Git and telemetry evidence, and leave the target in place for review. Any later deletion requires a separate explicit request.

