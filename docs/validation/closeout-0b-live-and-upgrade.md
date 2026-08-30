# Closeout-0B live integration and data-bearing upgrade validation

- Framework version: `0.1.0-alpha.22`
- Validated implementation revision: `613bf34d3f8effd4f3c23060a7a4ac2dc953999c`
- Validation date: 2026-08-30
- Local environment: macOS arm64, Node.js `v25.6.1`, Codex Desktop/App Server `0.150.0-alpha.12.2`
- Scope: Closeout findings C0-03, C0-04, and C0-05
- Result: **Passed with retained limits**

## Executive result

All three bounded Closeout-0B checks passed:

- a live Codex Human Inbox round trip kept runtime permission, business fact, and governance authority separate across interruption and reconnect;
- the production GitHub provider read one disposable pull request and its successful Check Runs at the configured exact SHA using only `GET` requests;
- a data-bearing Alpha.19 project upgraded to Alpha.22 while all 17 compared project-owned inputs remained byte-identical.

The first live Human Inbox run exposed a real integration defect: incorporation wrote an artifact path directly into Work Item `context_refs`, while that field accepts Context Map route IDs. JSON Schema validation passed, but `temple doctor` correctly failed the Work Item. Revision `613bf34d3f8effd4f3c23060a7a4ac2dc953999c` fixes the transaction so incorporation writes the Markdown source, registers a project-owned Context Map route, pins the route ID, and rolls all canonical writes back together on failure. The regression test now runs doctor after incorporation. The fresh live rerun and the full 129-test suite passed.

## C0-03 — Live Codex Human Inbox

The harness followed the current [official Codex App Server lifecycle](https://developers.openai.com/codex/app-server/): initialize the connection, start and resume one persistent thread, start turns with the required collaboration mode, answer live server requests, observe request resolution, interrupt an unanswered turn, and archive the validation thread after completion.

The successful rerun used a fresh disposable Temple project at project revision `a7e16aa3e5208575bd52450f6d4ef5e000db0645` and archived Codex thread `01a0501a-7573-7b82-b047-af9f2eaec9a4`.

### Runtime permission

- The live provider surfaced `item/commandExecution/requestApproval` for the harmless command `/usr/bin/true`.
- Human Inbox showed one runtime-permission request and no business-fact request.
- Accepting the still-live request resolved it and allowed the command to exit successfully.
- The result recorded `external_action_performed: true` because a command ran, but `canonical_state_changed: false`; the Work Item boundary was unchanged.
- No runtime response created evidence, governance approval, or a lifecycle transition.

### Business fact and secret handling

- A Plan-mode turn surfaced one real `item/tool/requestUserInput` request containing a deployment-region question and a credential question marked secret.
- Human Inbox showed one business-fact request and no runtime-permission request.
- The provider received both answers, while Temple persisted `Japan` and only `[SECRET ANSWER OMITTED]` for the credential.
- The raw secret was absent from the normalized telemetry journal and all Temple durable files inspected by the harness.
- The first response remained a local proposal and did not mutate the Work Item.
- Incorporation at a deliberately wrong exact revision was rejected.
- Explicit incorporation at the current exact revision created `.ai-org/artifacts/WI-0001/business-facts/submission-d0293cbedf11f2a5.md`, registered route `business-fact-d0293cbedf11f2a5`, and pinned that route ID to the Work Item. The artifact path itself was not used as a `context_refs` value.
- Work Item state, scope, acceptance criteria, gate evidence, and evidence count remained unchanged; no governance approval was created.
- Post-incorporation doctor reported 35 passes, zero warnings, and zero failures.

### Stale request and reconnect

- A second business question was interrupted before answer; App Server reported the request resolved as part of cleanup.
- The gateway rejected attempts to answer that expired request both before and after reconnect.
- Resuming the same persistent thread returned the same thread ID, all prior turns were terminal, and no pending request was reconstructed from durable telemetry.
- The validation thread was archived after the checks.

## C0-04 — Live read-only GitHub PR and Checks

A disposable branch and [pull request #1](https://github.com/zsz1210/temple-ai-dev-org/pull/1) were created solely to provide a real read target. The pull request was never merged; after capture it was closed and the remote validation branch was deleted. Those setup and cleanup writes were outside the provider. The provider itself performed no GitHub mutation.

- Configured and observed head SHA: `6265c50b9ab26d5915573d19843ab814c45126fa`
- Base SHA: `f6d5608c95f423a724ce2b39940b3fd4e332a3b8`
- Provider requests:
  - `GET /repos/zsz1210/temple-ai-dev-org/pulls/1`
  - `GET /repos/zsz1210/temple-ai-dev-org/commits/6265c50b9ab26d5915573d19843ab814c45126fa/check-runs`
- Successful Check Runs:
  - [`verify` job 99181024285](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33282922261/job/99181024285)
  - [`verify` job 99181013090](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33282917683/job/99181013090)
- Normalized observation: two total, two successful, zero failed, zero pending, outcome `pass`, and `external_action_performed: false`.
- Explicit capture created evidence `EVID-20260830T002026Z-07C2C8D0` at the exact SHA without changing Work Item state or gate evidence.
- A different but resolvable revision was rejected because configured, observed, and requested head SHAs did not all match.
- The token existed only in the harness environment. The persisted state contained neither the credential nor an authorization header.
- Post-capture doctor reported 35 passes, zero warnings, and zero failures.

## C0-05 — Data-bearing Alpha.19-to-22 upgrade

The source repository was checked out at exact Alpha.19 revision `cd518f843565571742038b08cb1b744deff48fb4`. Its disposable target contained real project-owned state before upgrade:

- one Work Item with an approved specification reference;
- one linked tracker mapping and reconciliation evidence;
- one normalized unverified evidence record;
- one indexed Lesson;
- one project-owned Skill;
- the opt-in Build Quality pack;
- custom project content before the managed `AGENTS.md` marker;
- project identity, assignments, collaboration, context, retrieval, and resource configuration.

Alpha.22 dry-run completed before the actual upgrade. A SHA-256 manifest compared 16 complete project-owned files plus the project-owned `AGENTS.md` prefix. All 17 comparisons were unchanged. The upgrade added only declared framework and project-seeding migrations; it did not take ownership of the project Skill or rewrite the existing specification, tracker, evidence, Learning, Work Item, configuration, or custom instructions.

After upgrade:

- `temple status` reported Alpha.22, one Work Item, one approved specification, one evidence record, one Lesson, one optional pack, and nine discoverable capabilities;
- the project-owned Skill remained classified as a project extension;
- doctor reported 35 passes, zero warnings, and zero failures across 75 managed files and all project contracts.

## Final regression and remote verification

- Focused Human Inbox tests: 3 passed, 0 failed.
- Full `npm run verify`: repository checks passed and all 129 tests passed at revision `613bf34d3f8effd4f3c23060a7a4ac2dc953999c`.
- GitHub Actions [run 33283852265](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33283852265) completed successfully for that exact revision; [`verify` job 99183492832](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33283852265/job/99183492832) passed in 3 minutes 33 seconds.

## Entry decision and retained limits

Closeout-0B is complete. Together with [Closeout-0A](closeout-0a-release-integrity.md), all Closeout-0 findings have bounded passing evidence. Phase 4 research and ADR work may begin.

This does not yet authorize unbounded Phase 4 schema or feature implementation. The durability/recovery contract and multi-repository authority ADR must be accepted before their corresponding implementation begins. The following validations also remain visible rather than being implied by this result:

- real multi-human, multi-machine, separate-clone contention and protected-branch operation;
- long-duration control-plane soak and process termination at every persistence boundary;
- large-repository retrieval quality and a configured local-hybrid or RAG provider;
- Windows and broader cross-platform execution;
- production release actions, regulated audit acceptance, public distribution, and organization-specific approval policy.
