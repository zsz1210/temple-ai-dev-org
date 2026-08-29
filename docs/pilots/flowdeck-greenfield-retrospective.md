# FlowDeck Greenfield Pilot Retrospective

- Pilot type: Phase 1.5 greenfield bootstrap
- Date: 2026-08-29
- Product disposition: frozen validation sample
- Production or external release: not performed

## Experiment purpose

Verify whether Temple can take an undefined product idea, establish an organization with five Agent Identities and nine Positions in a new private repository, and complete product definition, technical design, a first bounded vertical slice, testing, evaluation, Independent QA, and release closeout without redesigning the development organization.

FlowDeck is not a product for continued development on the Temple roadmap. The pilot stop condition was the first work item completing exact-revision closeout with observable evidence.

## Proven

- The user can create a Codex Project for a new private repository first, then initialize Temple at the same path without forking the central toolkit.
- The five Agent Identities are named only during first initialization. Doctor can verify all nine Position Assignments and separation between Developer and Independent QA.
- The Project Charter, domain language, specification, UX flow, ADR, technical design, handoff, tests, and QA evidence can all remain in the product repository instead of existing only in the originating chat.
- The Build Quality pack can be installed on an opt-in basis and preserve red/green and bug-diagnosis evidence in an iOS vertical slice.
- One work item can complete the full Spec -> Design -> Build -> Test -> Eval -> Independent QA -> Release Gate lifecycle.
- The Developer candidate and post-candidate lifecycle records can be committed separately. QA can reconstruct the exact revision in a clean detached checkout.
- Project-facing documentation uses the product name. Temple remains only in the CLI, lock, schemas, and technical namespace.

Observable pilot results include 14 unit and persistence tests, two UI tests, a real Apple Shortcuts callback, relaunch persistence, two clean QA checkouts, and 14 passing doctor checks. The actual code and evidence remain in the private pilot repository and are not vendored into this toolkit.

## Not yet proven

- No new Codex task took over from repository canonical state, so continuity in a new conversation without reading the originating chat has not passed validation.
- The Codex task registry remained empty during the pilot. Task titles, thread IDs, and archive readiness were not forward-tested.
- At pilot closeout, the human-facing README was grounded in repository evidence, but the Temple-native `$project-documentation` Skill had not been implemented. The FlowDeck result itself therefore does not validate that Skill; alpha.8 later implements and forward-tests it against the toolkit README.
- The pilot did not validate a physical device, the minimum iOS 17 runtime, or independent cancel and error fixtures. These are residual evidence gaps in the sample app, not reasons to continue developing FlowDeck.

## Process friction

1. **No pilot stop boundary.** Closeout naturally drifted into continued product work because Temple instructions did not stop this expansion of authority.
2. **Unresolved items can be added but not formally resolved.** Handoffs accumulate duplicate or completed items. The CLI has no `resolve` or `update` operation, so canonical JSON ultimately required manual cleanup.
3. **The candidate revision is insufficiently visible before the release gate.** The Developer handoff records the exact revision, but the work-item revision field in status does not show a tested revision until closeout.
4. **CLI ergonomics in the target repository are inconsistent.** Without `npm link`, commands require the full `node .../bin/temple.mjs` path to the central checkout. The functionality works, but routine operation is cumbersome.
5. **When one Identity holds both Quality and Independent QA, the degree of separation needs explicit disclosure.** The current small configuration satisfies the rule that Developer and Independent QA use different Identities, but it should require separate clean checkouts and evidence passes and disclose the combined assignment in reports.
6. **System-integration fixtures have platform prerequisites.** The first iOS callback prompts for output sharing and custom URL permission. The fixture must record this behavior instead of mistaking a waiting prompt for a product failure.

## Temple improvement order

### Phase 1.5 hardening

- ADR-0011 is accepted, adding the pilot stop boundary to installed instructions and the operating contract.
- Alpha.8 adds commands to list, resolve, merge, and deduplicate unresolved work-item entries without manually editing canonical JSON.
- Alpha.8 projects the Developer candidate revision in status before closeout.
- Alpha.8 outputs copyable doctor and status commands for the active POSIX shell or PowerShell CLI path after init.

### Phase 1.5 exit-gate follow-up

- Without continuing FlowDeck development, use another suitable task or sample to validate read-only context recovery and the task registry from a new Codex task.
- Declare Phase 1.5 complete only after that cross-task recovery gate passes.

This follow-up completed later in the retained [IdeaDock cold-task recovery test](../validation/greenfield-cold-task-recovery-result.md). FlowDeck remained frozen throughout.

## Skill conclusions

- `$domain-modeling` and the Build Quality pack have practical value in a greenfield flow.
- This pilot did not demonstrate a need to install Architecture, Review, Exploration, Git and Improvement, or more Matt Pocock candidates immediately.
- A one-time system-permission workaround is not a new Skill; preserve it as fixture documentation first.
- The pilot identified `$project-documentation` as the next clear candidate. Alpha.8 independently implements and forward-tests it; the original manually written FlowDeck README remains need evidence, not Skill-validation evidence.
