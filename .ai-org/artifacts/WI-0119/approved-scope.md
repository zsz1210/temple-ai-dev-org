# Approved scope — WI-0119

The repository owner approved the recommended pre-public Adaptive Execution Routing foundation after reviewing the separation between organization, capability, execution, resource observation, and calibration.

This Work Item may add a project-owned execution policy, managed JSON Schemas, a deterministic read-only resolver, CLI and Management Console projections, focused tests, extension fixtures, terminology, architecture documentation, and an ADR.

The implementation must preserve these boundaries:

- Position defines responsibility and authority, not a fixed model.
- Capability Route identifies the methods, tools, services, and modalities required by one step.
- Execution Profile describes one eligible execution configuration.
- Execution Route records the selected configuration and the candidates rejected by hard constraints.
- Model Calibration may inform future preference order, but cannot execute or rewrite policy.
- Provider contact, task creation, automatic routing, purchased Credits, external writes, deployment, publication, and public release are not authorized.

The current Console may display read-only policy state and route evidence. It must not add a route editor or command surface.
