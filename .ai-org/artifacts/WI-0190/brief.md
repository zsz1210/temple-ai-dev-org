# WI-0190: Proportionate instruction routes

## Work order and approved scope

The maintainer approved implementing the reviewed entry, stage-completion and lightweight-support boundaries. Change framework instruction sources and associated documentation/tests. Preserve the WI-0188 implementation and WI-0189 sealed results. Do not change runtime guards, identity rules, model policy, initialization naming, release state or experiment protocols.

## Acceptance criteria

- Sequential work does not imply parallel plan/prepare.
- Bounded read-only support stays under its parent's authority, returns findings, and cannot write project state, claim delivery or certify QA. Formal verification, shared resources, independent delivery or unclear scope use the existing governed route.
- Builder completion means the recorded handoff and next owner, not whole-Work-Item acceptance. Existing finish diagnostics may be reused only for their unchanged verified scope; failures and historical receipts remain visible.
- Native entrypoint/bootstrap reads and mandatory project tests remain required.
- Distributed instructions survive init/upgrade and existing behavior tests pass. Static instruction checks are not live-model or Independent QA evidence.

## Design and risk review

Standard profile: these instructions affect organizational behavior. Add an ADR and short reusable support reference, correct the sequential diagram and stage-specific completion text. No runtime bypass flag or new worker kind. Native read-only support is procedural guidance, not a sandbox enforcement claim. Preserve mandatory authority and separate QA. Rollback is reverting this isolated change; no project schema migration is introduced.

## Coordination

WI-0172 retains test/delivery-control-pair.test.mjs. This item adds only test/proportionate-work.test.mjs. WI-0188 changes are inherited from the sealed WI-0189 branch chain; none of their source or experiment artifacts will be rewritten. Installed root managed files remain unchanged; edit project-overlay sources only and validate in temporary initialized projects.

## Validation plan

Packaging requires updating scripts/check-package.mjs for exactly two new distributed files: ADR-0059 and the read-only-support reference. Record these as required package paths; retain the existing size and forbidden-path limits. This supporting write is recorded as a shared contract reference on WI-0190.

Run static route/authority/completion contract checks, an init/doctor/status/upgrade rehearsal, and npm run verify. Record failures honestly. Stop at Developer handoff for separate evaluation and Independent QA; no automatic merge or release.
