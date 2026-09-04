# WI-0158 Independent QA report

- Independent QA: Lulu (`agent-lulu`)
- Developer: Rikku (`agent-rikku`)
- Exact candidate: `3ffd987c9a487783f1c8fbeed735af94f19dbc80`
- Normalized test Evidence: `EVID-20260904T143102Z-E2501EFF`
- Verdict: **Pass with publication follow-up outside this Work Item**

## Independent checks

- Rebuilt the exact candidate in a detached worktree from the committed lockfile.
- Confirmed repository checks, documentation links, and the package allowlist passed.
- Confirmed all 434 Node tests passed and the production dependency audit reported zero known vulnerabilities.
- Reproduced QueueKeep's two application tests and confirmed final Doctor 37/0/0.
- Confirmed the delivery and cold-recovery tasks used separate task identities and that recovery received no delivery output or coordinator Work Item identifier.
- Confirmed target Developer Devon and Independent QA Elliot are different Agent Identities.
- Confirmed QueueKeep remained clean after read-only recovery and that the task stopped instead of continuing product work.
- Recalculated the three-run elapsed deltas and confirmed the report makes no speed, Token, cost, general-quality, or unaided-human-usability claim.
- Confirmed Provider Token totals remain `unknown` rather than zero or estimated.
- Confirmed no publication, release, reset, purchase, retry, or fallback action was performed.

## Non-candidate setup event

The first detached-QA shell command created the correct worktree but mistakenly ran dependency installation and tests from the coordinator checkout. It was interrupted and is not cited as candidate evidence. The valid reproduction explicitly set the detached worktree as the tool working directory and completed successfully. This setup correction did not change the candidate or start another model task.

## Retained findings

- The delivery task corrected one ESM/CommonJS scaffold conflict before the first successful verification.
- A placeholder Evidence ID was rejected before lifecycle mutation, then replaced with the exact ID.
- The repository public profile still reports four blocked maintainer-path findings in historical WI-0155 and WI-0156 evidence. The package profile is clean. This is a visibility gate, not a failure of the tested Core Path.

## Boundary

This verdict supports organizational closeout of WI-0158 only. It does not select an Alpha version, freeze a public release commit, approve merge, change repository visibility, create a tag or GitHub Release, enable npm publication, deploy, or authorize an announcement.
