# Product specification — WI-0059

## Problem

Temple Workspace currently counts every nonterminal lifecycle state as active inventory. Sixteen older items have complete Test, Evaluation, and Independent QA evidence but were held at Release Gate because formal publication was deferred. Five other items still have real missing decisions or environment validation. Treating both groups alike makes the human-facing state misleading and would pollute the next measurement baseline.

## Accepted disposition

### Organizationally complete

Close the following Work Items with a `go` organizational decision and no external release:

- `WI-0030`, `WI-0032`, `WI-0034`, `WI-0036`, `WI-0037`, `WI-0038`
- `WI-0040`, `WI-0041`, `WI-0042`, `WI-0044`, `WI-0045`, `WI-0046`, `WI-0047`, `WI-0048`, `WI-0049`
- `WI-0050`

Their existing accepted scope, exact tested revision, Test, Evaluation, and Independent QA evidence remain authoritative. Closing them does not authorize a package release, Git push, public access, deployment, external mutation, or a claim beyond the evidence already recorded.

### Retained validation

- `WI-0029` remains in Test until a separately authorized safe disposable registered Codex task receives a real Agent Command and the result is evaluated without weakening its privacy contract.
- `WI-0035` remains in Test until an explicitly authorized hosted GitHub Actions comparison measures runner behavior and billing impact. Local timings are not billing evidence.

### Retained product decisions

- `WI-0031` remains in Spec as the hardening umbrella until its retained child boundaries receive explicit dispositions.
- `WI-0033` remains in Spec until the repository owner chooses the operator-owned origin, credential-handle, executable-path, and argument-pinning trust model.
- `WI-0043` remains in Spec as the Dashboard review parent until its next product decision is explicitly made; implemented children can close independently.

## Acceptance boundary

The reconciled baseline is successful when the 16 Release Gate items are `done`, the five retained items remain nonterminal with truthful reasons, no reconciliation claim remains active, generated status and parallel planning are fresh, and all verification gates pass.
