# Draft participant prompt layers

These are reviewable scaffolds for future adapters, not launch instructions. The
offline planner does not render or send them. Freeze the exact rendered content,
provider/native instructions and source assembly before an execution. Replace all
placeholders from a versioned scenario, never from an unbounded conversation dump.

## Shared task layer

```text
Outcome: {{goal}}
Acceptance: {{participant-visible-acceptance}}
Initial product revision: {{product-seed-revision}}
Permitted changes and tools: {{scope-and-tool-boundaries}}
External actions: {{explicitly-authorized-actions-or-none}}
Budget and stop contract: {{full-delivery-envelope-and-adapter-stop-rules}}

Own the implementation from this goal through delivery. Choose a suitable design,
investigation, decomposition and test method within the frozen constraints. Continue
reversible fixes within scope. Ask only for missing information or an action outside
the authorized boundary. Preserve existing behavior covered by the acceptance.

Deliver the exact candidate revision, actual verification evidence, remaining
defects and truthful completion status. Do not claim an unperformed check passed.
The common external evaluator uses the frozen acceptance contract.
```

Do not disclose hidden grader implementation or a known-good solution. Include
requirements needed for fairness, including explicit error and safety semantics.
Hold this shared layer constant across modes for the same scenario.

## Ordinary Codex layer

```text
This participant checkout has no installed Temple workflow. Complete the shared
task using the available repository context and tools. The common experiment
controller handles observation and external evaluation according to the frozen
protocol. Report the product and evidence in the common delivery format.
```

The adapter must actually isolate the checkout from Temple participant instructions
and unrelated inherited memory. Ordinary Codex remains subject to the same platform
instructions, sandbox and user permission boundary. The experimental wrapper is
reported separately; do not present this as an unobserved raw Codex task.

## Current Temple layer

```text
Temple revision: {{framework-revision}}
Work Item: {{work-item-id}}
Effective profile and risk: {{effective-profile-and-risk}}
Assigned Identity and responsibility: {{actor-and-position}}

Read the installed TEMPLE.md and applicable project instructions. Resolve the
current Work Item context and consume the necessary routed sources. Follow the
effective workflow, authority, evidence and distinct-verification requirements.
Use the pinned CLI for supported lifecycle administration. Reuse already-read,
unchanged context when the contract permits it. Implement the shared outcome with
the autonomy allowed by that profile. Report the common product delivery evidence.
```

Lean, Standard and High-Assurance select real existing profiles; their obligations
come from the pinned installation. An adapter may automate supported fixed
administration but must measure that intervention and cannot fabricate semantic
acceptance. Do not add a second mandatory QA call just to make the labels symmetric:
freeze how native verification and common external grading are represented in each
arm and account for every actual actor.

## Proposed core candidate layer

```text
RESEARCH LAYER — LIVE RUNTIME ISOLATION AND EXECUTION ARE NOT QUALIFIED.
Keep the authorized goal, boundaries, minimal durable state, exact evidence and
independent acceptance contract. Choose intermediate planning, documents, tools
and role decomposition within the fixed budget. Activate risk safeguards when the
contract requires them. Update only the state needed for truthful delivery and
recovery; do not add administrative stages solely to resemble an organization.
```

This prose cannot override current Temple. The repository-only
[compiler](../core-autonomy-candidate.mjs) now assembles the versioned contract,
deduplicated required context and complete reserved budget from trusted control
snapshots. Its minimal recovery projection and pinned-CLI completion adapter are
offline mechanisms. They do not implement worker isolation, live generation,
runtime budget enforcement or proof that supplied snapshots are authoritative.
The control checkout retains all native instructions and current Lean gates.
The separate [runtime adapter](core-runtime.md) now implements the selected screen's
stage dispatch and reservation checks. Its command/empty-thread controls and offline
rehearsal remain distinct from the first authorized model-tool canary. This planner
does not invoke that adapter or change the compiler's authority flags.

## Size and context accounting

Record rendered UTF-8 bytes and, where the actual tokenizer is available, input
tokens for shared task, mode instructions, selected source context and recovery
state separately. Tokenizer estimates are not provider-observed use. Preserve
native instruction/model/runtime versions and measure repeated input, cached input
and output across all calls. A shorter initial prompt alone does not prove lower
total delivery cost. No hidden reasoning needs to be retained.
