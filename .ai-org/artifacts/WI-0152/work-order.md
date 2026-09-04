# WI-0152 Work Order

## Outcome

Turn Temple's repository-backed self-host record into an explicit, reusable capability named **Auditable Self-Hosting**, governed by a versioned **Evidence Profile**. A maintainer must be able to preserve useful delivery history while detecting material that should not enter a public repository or package.

## Authorized scope

- Add project-owned `private`, `public`, and `restricted` Evidence Profiles with `private` as the distribution default.
- Add a deterministic, read-only publication audit that reports classifications and locations without printing detected values.
- Allow an explicitly reviewed Git revision to serve as a frozen legacy-evidence baseline. Existing matched findings may remain visible as retained legacy evidence; new or changed findings must still fail the public gate.
- Normalize maintainer-specific paths and private endpoints in current package-facing documentation.
- Explain the capability in English documentation and add concise aligned README copy in English, Japanese, and Traditional Chinese.
- Add tests covering configuration, install/upgrade ownership, redaction, classification, baseline behavior, CLI behavior, and package boundaries.

## Explicit exclusions

- Do not change GitHub repository visibility, collaborator permissions, branch protection, or Git history.
- Do not publish npm, create a tag or GitHub Release, deploy a service, or announce an Alpha.
- Do not delete or rewrite retained Work Item, approval, QA, routing, experiment, Token-budget, Credits, or reset evidence.
- Do not collect Provider telemetry or inspect live account state as part of the audit.

## Human decisions already recorded

- The current repository and its exact commit and pull-request history will be preserved.
- Historical account-approval facts such as approved models, budgets, Credits, resets, retry policy, and fallback policy may remain public.
- Credentials, secret values, raw Provider telemetry, and live balance or reset-availability snapshots remain local-only.
- Maintainer absolute paths, private-network endpoints, and Tailnet hostnames are normalized in current and future public-facing material.

## Completion boundary

Completion means the capability, policy contract, documentation, and local verification evidence exist on the implementation branch and have passed independent QA. It does not authorize repository publication or a package release.
