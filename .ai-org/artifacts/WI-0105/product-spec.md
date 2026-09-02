# WI-0105 product specification

## User outcome

A maintainer can run one repository-local command and receive a truthful map of what Temple currently verifies for organization-scale operation, what is only simulated or documented, and what has not been run. The result must remain useful without the conversation that produced it and must not contact an external service.

## Evidence vocabulary

Every matrix row uses exactly one of these evidence classes:

- `verified-local`: exact-revision executable behavior observed on this machine;
- `simulated`: executable behavior using synthetic identities, approvals, repositories, providers, or environments;
- `documented-policy`: a repository contract inspected without its real operating environment;
- `not-run`: no qualifying observation exists;
- `not-applicable`: outside WI-0105.

The class describes the strongest retained evidence for that row. A local fixture cannot be promoted to real multi-human, external-service, production, regulated, or certification evidence.

## Boundary requirements

### Collaborative governance

The result must report the current operating profile, Principal and sponsorship counts, active Position memberships, Developer-to-Independent-QA identity separation, recovery state, and every validation-ladder status. Local governance tests are `simulated` when their actors, approvals, clones, or environments are synthetic. `real_collaborative`, `representative_pilot`, and `high_assurance_drill` remain `not-run` unless their own evidence records qualify them.

### Tracker coordination

The result must distinguish the current repository-only configuration from synthetic linked-tracker behavior. It must verify field ownership, team-visible parent versus internal child rules, read/plan/reconcile behavior, lifecycle authority, and `external_write_performed: false`. Jira, a company tracker, and a live GitHub Issues read are `not-run` in this Work Item.

### UI delivery

The result must enumerate `not-applicable`, `code-first`, `preview-first`, and `design-led`; their prebuild and closeout evidence contracts; whether a versioned UI reference is required; and the vendor-neutral `required_tool: null` policy. Existing executable and retained evidence may qualify code-first and preview-first locally. Design-led, a real Figma connection, and a real multi-party designer/developer handoff remain documented or `not-run` according to the available evidence.

### SRE and Security

The result must report the existing Observer, condition, audit-export, backup/restore, privacy-redaction, local command, exact-evidence, separation, rollback, and release-gate safeguards. It must separately report whether dedicated SRE and Security Positions exist. Production on-call, incident response, vulnerability management, threat modeling, penetration testing, disaster recovery, and security certification cannot be inferred from framework safeguards.

### High-Assurance

The result must inspect the minimum Human Principal count, sponsorship rule, separation rules, risk-tier UI restrictions, exact-candidate and normalized-evidence gates, approval counts, and rollback requirements. Executable fixtures with synthetic people or approvals are `simulated`. A real High-Assurance drill remains `not-run` until that named gate has qualifying evidence.

## Retained observation

The machine-readable observation must include:

- schema and generator versions;
- exact Git revision and clean/dirty status at execution;
- start, finish, and elapsed time;
- Node version and every executed command with exit status, elapsed time, bounded output summary, and test counts;
- canonical configuration facts used by the matrix;
- one stable ID, evidence class, status, evidence references, verified facts, and explicit limitation for every matrix row;
- boundary-level totals by evidence class;
- model, Token, external-write, network-contact, service-start, and production-action fields;
- overall `pass`, `fail`, or `stopped` status.

Unknown or unavailable measurements stay unknown. A failed command stops the run and produces no passing observation.

## Acceptance scenarios

1. A clean exact candidate passes the focused deterministic suite and emits a schema-complete observation.
2. The current project is truthfully shown as Solo with no Human Principals, no sponsorships, recovery not configured, and real collaboration not run.
3. Tracker rows show current repository-only behavior separately from synthetic linked-provider behavior and show zero external writes.
4. UI rows expose all four delivery modes and do not claim design-led or Figma execution.
5. SRE/Security rows show existing safeguards and explicitly show the missing dedicated Positions and real operational exercises.
6. High-Assurance rows distinguish executable synthetic enforcement from a real drill.
7. The retained report can be inspected cold from repository files and provides enough references to reproduce each local assertion.

## Exclusions

No external tracker call, Figma call, production endpoint, second machine, Human Principal creation, permission change, SRE or Security Position addition, model generation, usage collection, Console/Observer daemon, container runtime, deployment, publication, tag, release, cost-saving claim, Token-saving claim, security certification, or enterprise-readiness claim is part of this slice.
