# Auditable Self-Hosting and Evidence Profiles

Temple keeps decisions, Work Items, handoffs, evaluations, and release evidence beside the code. **Auditable Self-Hosting** applies that same operating model to the framework or project that provides it: the repository can show how its own changes were governed instead of presenting only a polished final snapshot.

That transparency still needs a publication boundary. An **Evidence Profile** states what the project intends to expose, what must be normalized, and what stays local. It does not change repository visibility or publish anything.

## Choose a profile

The project owns `.ai-org/project/evidence-profiles.json`.

| Profile | Use it when | Local environment details | Reviewed legacy evidence |
| --- | --- | --- | --- |
| `private` | The repository is private or internal | Review required | Review required |
| `public` | The source repository is intended to be public | New findings are blocked | Exact baseline matches require review |
| `restricted` | Customer, regulated, or confidential data may be present | Blocked | Blocked |

New Temple projects start with `private`. Changing the profile is a project policy decision; it is not an instruction to GitHub, GitLab, npm, or another host.

## What the public profile keeps

The public profile is designed to retain the evidence that makes development inspectable:

- lifecycle state, accepted scope, decisions, and handoffs;
- evaluation, Independent QA, and release-gate records;
- requested and effective model-routing metadata;
- Token counts and approved Token or time budgets;
- whether Credits, resets, retries, or fallback were allowed or prohibited; and
- experiment protocols, observations, limitations, and outcomes.

These facts describe governance and results. They are not credentials.

## What stays local

Temple blocks high-confidence secret and private-key shapes in every profile. Raw Provider telemetry, raw prompts or responses, live account balance or reset-availability snapshots, and tracked runtime-state directories are local-only.

For a public profile, new maintainer-specific home paths, private IPv4 addresses, and private Tailnet hostnames are also blocked until they are replaced with repository-relative paths, placeholders, or documentation-range addresses.

The scanner never prints the matched value, the containing source line, or its internal fingerprint. Rotate a real credential even if it appears only in history; redaction is not a substitute for revocation.

## Audit before publication

Run both current surfaces:

```bash
node ./templew.mjs publication audit . --profile public --surface both
```

Or inspect one surface as JSON:

```bash
node ./templew.mjs publication audit . --profile public --surface package --json
```

The command returns:

- `blocked` when at least one item must be resolved before the selected surface is published;
- `review-required` when no blocker exists but retained legacy or binary content still needs a human decision; or
- `allowed` when the bounded text inspection found neither condition.

The audit reads current Git-tracked files and the exact `npm pack --dry-run` manifest. It performs no lifecycle mutation, external request, visibility change, or publication.

## Adopt an existing repository without rewriting history

An existing project can record a reviewed full Git commit under `reviewed_legacy_baseline`. Temple fingerprints matching environment details in memory. If the same rule, path, and value existed at the baseline, the public repository audit reports it as `retained-legacy` and `review-required`. A new occurrence, a changed value, or an additional duplicate remains blocked.

The baseline is intentionally narrow:

- it applies only to the repository surface;
- it never excuses credentials, local-only runtime data, unreadable files, or inspection failures;
- it never applies to the npm package; and
- it records the reviewer, time, and rationale without storing detected values.

This is a migration mechanism, not an assertion that historical material is risk-free. Review the selected revision before recording it. Temple does not rewrite old commits or pull requests.

## Binary, history, and hosted-log review

The command identifies binary files but does not OCR screenshots or claim their contents are safe. Review rendered images, archives, and other binaries separately.

It also does not scan every historical commit or hosted CI log during an ordinary run. Keep package/current-tree checks fast in routine CI, and run full-history, hosted-log, dependency, license, and visual checks at the release gate. A passing publication audit is necessary evidence for that decision; it is not a security certification and does not authorize release.

## Common remediation

| Finding | Preferred change |
| --- | --- |
| Absolute home path | Use a repository-relative path or `/path/to/project` placeholder |
| Private LAN address | Use a placeholder or an address from the documentation ranges |
| Tailnet hostname | Use `<device>.<tailnet>.ts.net` only in prose that cannot be parsed as a real hostname |
| Raw runtime or account snapshot | Keep it in the configured local state directory and out of Git |
| Credential shape | Remove it, rotate it, and inspect history and hosted logs before publishing |
| Binary file | Open/render it and record a separate human or visual review |

See [ADR-0048](../adr/0048-auditable-self-hosting-evidence-profiles.md) for the design rationale and [Release readiness](../planning/release-readiness.md) for the broader publication gate.
