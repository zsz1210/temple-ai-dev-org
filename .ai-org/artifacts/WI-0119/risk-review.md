# Risk review — WI-0119

## Classification

Standard framework contract change. It adds schemas and read-only routing behavior but performs no Provider call, task launch, external mutation, deployment, or release.

## Risks and controls

- **Position-to-model coupling:** the policy and request carry a free-standing responsibility string only for explanation; rules cannot match Agent Identity or display name, and profiles are never stored in Assignments.
- **Capability mistaken for authority:** a profile can be eligible only inside the request's explicit Provider, privacy, boundary, and risk constraints. Capability presence never grants credentials or permission.
- **Preference presented as proof:** provider-neutral seeds make no optimality claim. Rule order is project-declared policy; calibrated recommendations remain governed by the separate Usage Policy.
- **Automatic execution by implication:** schemas require `automatic_execution`, `provider_contact`, and `mutation_performed` to remain false. The CLI only reads and prints.
- **Unknown resource values becoming zero:** observations require explicit availability and quality. Missing values are omitted or unavailable.
- **Extension collision:** custom IDs must be namespaced or unique and remain project-owned. The fixture proves resolver flexibility without claiming custom Position governance is complete.
- **Schema drift:** install, upgrade, Doctor, schema validation, and CLI tests cover the new managed and project-owned boundaries.
- **Console misunderstanding:** the System view labels routing as read-only policy and shows no action control.

## Rollback

Revert the implementation commit. Existing Usage Policy, tasks, Work Items, and observations remain valid because this Work Item does not migrate them. Removing the project-owned Execution Policy returns read-only inspection to the provider-neutral default; no external state requires rollback.
