# WI-0155 Work Order

## Purpose

Test whether a new Codex task with no Temple conversation history can use only repository-visible instructions and a frozen user brief to initialize a new project, complete one bounded Work Item, and leave enough durable state for a second cold task to recover the result.

## Frozen inputs

- Temple source revision: `779ba588f4c7315871c4ff0eaeb1df76bfca669a`
- Package: `@zsz1210/temple-ai-dev-org@0.1.0-alpha.29`
- Tarball: `/private/tmp/wi0155-package.TwBetl/zsz1210-temple-ai-dev-org-0.1.0-alpha.29.tgz`
- Tarball SHA-256: `fb910bce72b6560cffdd973fa3fda2735a060c39f083b0328c57c092034aeb69`
- Tarball inventory: 370 files, 797,992 packed bytes, 3,173,551 unpacked bytes
- Disposable project: `/Users/zsz1210/Documents/ChatGPT/temple-clean-room-wi-0155.QXrZ4y`
- Participant brief: `.ai-org/artifacts/WI-0155/participant-brief.md`

The tarball was produced from a clean detached worktree at the exact source revision. It is local-only and is not an npm publication.

## Run design

### Session A — new-project delivery

Use a new Codex task with no inherited Temple conversation. It may read the frozen participant brief, package README, installed project instructions, and other repository-visible documentation it discovers through the normal product path. It must not receive a hidden answer, expected command transcript, or maintainer coaching.

The participant initializes the disposable repository, creates the product's bounded Work Item, implements and tests it, preserves distinct Developer and Independent QA Agent Identities, closes the Work Item, and leaves healthy Status and Doctor results. It then stops.

### Session B — cold recovery

Use a second new Codex task that receives only the disposable project path and the recovery question. It must recover the project identity, assigned Position and Agent, completed Work Item outcome, supporting evidence, and next safe action from repository state. It does not receive Session A's conversation or final response.

## Measurements

Record:

- wall-clock elapsed time for each session;
- completion or exact stop condition;
- errors and retries;
- Human questions or interventions;
- documentation or bootstrap gaps;
- rework after first verification;
- Provider-reported Token/model data when available, otherwise `unknown`.

The result is one bounded observation. It cannot establish unaided human usability, universal quality, or general Token savings.

## Stop conditions

Stop and return to the Human Principal if the run requests external spend, a reset, a fallback model, repository visibility changes, remote writes, publication, destructive history changes, sensitive credentials, or a product-scope decision outside the participant brief. Ordinary local implementation decisions and reversible fixes remain automatic.

The sample product freezes after accepted closeout and cold recovery. Do not continue developing it.

