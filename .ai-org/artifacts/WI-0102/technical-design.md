# WI-0102 technical design

## Decision

Implement the brownfield rehearsal as an explicitly invoked, dependency-free Node.js validation script rather than a permanent default-CI test. The script is retained and reviewable, while each full repository verification avoids paying the cost of creating a nested Git repository and replaying an entire lifecycle.

## Execution boundary

`scripts/validate-brownfield-adoption.mjs` creates a temporary directory, initializes a new Git repository there, and deletes it after the run. It invokes the candidate's local `bin/temple.mjs`; it does not use a global Temple installation, network service, model provider, external repository, Docker runtime, or user project.

The fixture starts with two Git commits and project-native files:

- `README.md`;
- `docs/requirements.md`;
- `CONTRIBUTING.md`;
- `package.json`;
- a tested application module and test.

The initialization config records `CONTRIBUTING.md` as the existing repository policy and requires isolated changes plus review. Pre-existing human document digests and the pre-adoption commit ancestry are checked after initialization and after closeout.

## Lifecycle

The script performs these stages:

1. create and test the pre-existing repository;
2. initialize Temple and verify the confirmed repository-integration record;
3. create `WI-0001`, satisfy Spec and Design gates, and enter Build;
4. implement one named application change plus its test and commit the exact candidate;
5. record the Developer handoff;
6. run Test and Evaluation;
7. create a detached Git worktree at the candidate, rerun the application tests as Independent QA, and remove the worktree;
8. enter Release Gate, close organizationally with no external release, and run Doctor;
9. write one bounded JSON observation when `--output` is supplied.

Developer and Independent QA remain different configured Agent identities. A detached worktree proves exact-candidate reproduction, but it remains the same machine and the same human operator.

## Measurement

Use monotonic elapsed time for fixture setup, initialization, delivery, Independent QA, and total execution. Record the candidate revision, initial/final commit counts, application test counts, Doctor pass/warn/fail counts, pre-existing document digests, initialization paths, product-change paths, and explicit negative flags for model generation and external actions.

Token usage is recorded as `not_applicable_no_model_invoked`. No numerical zero is emitted because no Provider measurement occurred.

## Failure behavior

Every command is checked. On failure, the script reports the failing command and captured output, preserves no misleading pass observation, removes the detached QA worktree when possible, and deletes the temporary fixture. It never retries a model or external action because neither exists in this rehearsal.

## Default CI decision

`npm run verify` is still required for the Temple candidate, but it does not execute the nested-repository rehearsal. The retained observation proves the separately invoked experiment. A later maintainer may add a cheaper focused contract test only if a regression justifies permanent CI cost.

## Rollback

Remove the standalone script and Wave 1 documents, then rerun `npm run verify`. The experiment creates no durable external state and no real project mutation.
