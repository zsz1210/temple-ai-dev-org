# Technical design — WI-0119

## Decision

Add a provider-neutral, project-owned `temple.execution-policy/v1` and a pure deterministic resolver. Keep the Usage Policy responsible for observation, matched evaluation, and calibration; keep the new Execution Policy responsible for step eligibility and declared route preference. Do not combine either contract with Position Assignment.

## Project-owned policy

`.ai-org/project/execution-policy.json` contains:

- an authority block whose only valid modes are `pinned`, `shadow`, and `advisory`, with automatic execution and Provider contact fixed to `false`;
- a capability catalog with stable IDs, kind, description, and supported modalities;
- execution profiles with Provider/model/reasoning requests, capabilities, modalities, allowed data classes, execution boundary, supported risk classes, and typed resource budgets;
- ordered routing rules matching structured task-shape dimensions;
- an explicit fallback profile; and
- typed resource-measure definitions.

The distribution default is provider-neutral: its profiles describe model and reasoning classes but leave Provider, model, and reasoning values `null`. This repository's project-owned copy may map approved GPT-5.6 profiles without changing the reusable default.

## Request and result

`temple execution resolve . --request <repository-relative-json> --json` reads one request and returns `temple.execution-route/v1`.

The request contains a Work Item ID and one or more unique steps. Each step includes:

- `step_id` and optional responsibility string;
- exact task-shape fields;
- required and optional capability IDs;
- required modalities;
- allowed Providers, data class, and execution boundary;
- selection mode and optional pinned profile; and
- optional typed resource budgets and observations.

The result preserves the request identity, returns each step independently, lists eligible and rejected candidates with reasons, names the rule and fallback behavior, and separates requested settings from any future effective Provider observation. This command performs no write and has no launcher dependency.

## Resolver

`src/execution-routing.mjs` owns default-policy creation, semantic validation, request validation, hard-filter evaluation, deterministic selection, projection, and project reads. The implementation uses no model, network request, prompt parsing, price inference, or local service.

Profile filtering order is stable:

1. profile status;
2. required capabilities;
3. required modalities;
4. Provider allowlist;
5. data class;
6. execution boundary;
7. risk class; and
8. requested resource budget compatibility.

Selection order is then `pinned profile`, matched-rule preference, and eligible fallback. Profile array order is never an implicit preference.

## Installation and upgrade

The Execution Policy JSON Schema is managed. The policy itself is project-owned. New initialization copies the provider-neutral seed. Upgrade creates the seed only when the project has no policy and never overwrites an existing policy.

The schema catalog validates the policy. Semantic validation additionally checks unique IDs, capability references, profile references, fallback existence, rule determinism, measure references, and the non-executing authority constants.

## Projection

Status and Observer include an execution-routing summary. The Management Console System page renders the same projection. Generated views cannot change policy or become execution evidence.

## Compatibility

- The existing Usage Policy schema remains v1 and retains calibration and matched-evaluation authority.
- Existing task requested/effective model fields remain unchanged.
- No Work Item schema migration is required; execution requests are separate project artifacts or ephemeral command inputs.
- Missing Execution Policy is handled only during init/upgrade or by the provider-neutral in-memory default for read-only inspection.

## Verification

Focused tests cover validation, independent multi-step routing, every hard filter, pinned failure, fallback, non-software extension, typed resources, no-write CLI behavior, installation, upgrade preservation, and Console projection. Full `npm run verify` plus browser-level responsive review is required before Independent QA.
