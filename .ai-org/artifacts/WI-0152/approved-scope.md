# WI-0152 Approved Scope

## User problem

Temple intentionally keeps decisions, Work Items, handoffs, evaluation, Independent QA, and release evidence in the repository. That makes the framework auditable, but a repository owner currently has no explicit contract for deciding which evidence is safe for a public repository, which material requires normalization, and which data must remain local.

## Product promise

**Auditable Self-Hosting** lets a project use Temple to develop itself—or any governed project—without choosing between an empty public history and an uncontrolled evidence dump. The project selects an Evidence Profile, runs a read-only audit, and receives a human-readable gate result with safe remediation guidance.

## Evidence Profiles

| Profile | Intended use | Default posture |
| --- | --- | --- |
| `private` | Private repositories and internal development | Preserve repository evidence; credentials remain blocked; environment identifiers require awareness rather than a public-release failure. |
| `public` | Public source repositories | Preserve useful organizational evidence; block new credentials, raw telemetry, live account snapshots, maintainer paths, and private endpoints. |
| `restricted` | Repositories that may contain regulated, customer, or company-confidential data | Treat identity, environment, account, and raw operational data as blocked unless an external policy explicitly permits publication. |

`private` is the generated-project default. Selecting `public` or `restricted` is an intentional project-owned decision; Temple never changes repository visibility.

## Public evidence contract

The public profile keeps evidence that explains how work was governed:

- lifecycle state, scope, acceptance criteria, decisions, handoffs, QA, and release-gate records;
- model-routing decisions and requested/effective model metadata;
- Token counts and approved Token/time budgets;
- whether Credits, resets, retries, or fallback were approved or prohibited; and
- experiment protocols, observations, limitations, and outcomes.

It does not publish:

- credentials, authentication material, secret values, or private keys;
- raw Provider telemetry or raw prompt/response payloads;
- live account balance, remaining quota, or reset-availability snapshots; or
- maintainer-specific absolute paths, LAN endpoints, or private Tailnet hostnames in new public-facing material.

## Migration rule for an existing repository

A project may pin a reviewed Git revision as a legacy-evidence baseline. The audit fingerprints sensitive matches without storing or displaying their values. An unchanged baseline match is reported as `review-required` and `retained-legacy`; a new or changed match is `blocked`. The baseline applies only to the repository surface, never to the npm package surface.

This permits a no-history-rewrite adoption path while making future regressions enforceable. It is not an assertion that legacy evidence is risk-free; the maintainer must review and accept it before setting the baseline revision.

## Acceptance criteria

1. The three profiles have a versioned schema and a project-owned configuration file.
2. A generated project starts on `private`; the Temple self-host configuration deliberately selects `public` and pins the reviewed pre-feature revision.
3. `temple publication audit` reads tracked files only, never mutates lifecycle state, and supports repository, package, or both surfaces.
4. Audit output contains rule ID, classification, file path, line number, disposition, count, and remediation—but never the matched value.
5. Credentials and secrets always block. Public-profile environment identifiers block when new; exact legacy-baseline matches remain review-required. Package findings never inherit repository baseline exceptions.
6. Binary files are counted and reported for separate visual/manual review rather than silently treated as safe.
7. Current package-facing documentation contains no maintainer-specific home path, LAN IP, or Tailnet hostname.
8. Documentation states that a passing audit is necessary evidence, not proof that a repository is safe or authorization to publish.
9. Install, upgrade, schema, CLI, audit, package, Doctor, and full verification checks pass, followed by distinct Independent QA.

## Out of scope

Automatic sanitization, history rewriting, repository visibility changes, Provider collection, remote commands, package publication, and generalized security certification are not part of this Work Item.
