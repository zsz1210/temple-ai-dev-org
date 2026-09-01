# WI-0079 work order

## Outcome

Create one local, engineer-facing Archify architecture preview that explains how Temple turns human intent into bounded execution, exact-revision evidence, and recoverable repository truth.

## Reader

The primary reader is a software engineer evaluating Temple after the human-facing README overview. The preview should answer how the framework works and where authority lives without requiring the reader to inspect every JSON file or CLI command.

## Authorized scope

- Preserve the existing localized README overview diagrams and all public documentation unchanged.
- Use the reviewed Archify `v2.15.0` source at commit `e1ac748f19cf805e44bf74fb93c796662152e273` through the existing isolated adapter boundary.
- Ground authored nodes and relationships in current repository architecture, collaboration, evidence, learning, and adapter documents.
- Preserve typed source, verified HTML output, static review captures, validation receipts, and the exact source revision under this Work Item.
- Stop in Design after presenting the local preview for owner review.

## Excluded follow-on work

- No README or public documentation edit.
- No replacement of the existing Mermaid architecture diagram.
- No second Workflow, Sequence, Data Flow, or Lifecycle diagram.
- No publication, push, release, deployment, hosted viewer, or external system mutation.
- No Archify pin upgrade beyond the already reviewed `v2.15.0` contract.

## Source authority

- `docs/concepts/architecture.md`
- `docs/operations/collaboration.md`
- `docs/operations/evidence-and-observer.md`
- `docs/extensions/context-routing.md`
- `docs/extensions/engineering-learning.md`
- `docs/extensions/archify-adapter.md`
- `docs/adr/0005-third-party-adapters.md`
- `.ai-org/core/workflow.json`
- `.ai-org/project/retrieval.json`

Generated views and prior screenshots are navigation or visual evidence only; they are not architecture authority.

## Stop condition

Stop when one validated local architecture preview and its visual-review evidence are ready for the owner to choose whether it belongs in the README, only in architecture documentation, or should be revised first.

## Interface classification

`ui_delivery_mode` is `not-applicable`. The deliverable is a documentation artifact, not a Temple product interface. Visual review remains an explicit acceptance requirement for the diagram.
