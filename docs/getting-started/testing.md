# Testing strategy

Temple separates governance checks from behavioral regression tests. The goal is to preserve the safety guarantees of a repository-writing framework without spending several minutes on unchanged behavior after every documentation or lifecycle-evidence update.

`npm run check` validates repository structure, documentation language boundaries, and local Markdown link targets. These checks are intentionally fast and run for every change.

## Local development

Run repository policy checks and the fastest contract tests while editing:

```bash
npm run verify:fast
```

Run a focused test file for the area being changed:

```bash
node --test test/tracker.test.mjs
node --test test/workflow.test.mjs
```

Before proposing a behavioral change, run the complete suite:

```bash
npm run verify
```

## Continuous integration

CI uses one job definition expanded across the supported Node.js LTS matrix. Within each matrix run, scope selection, repository checks, schema validation, Doctor, and the selected behavioral lane remain separately named steps. The summary reports both governance and behavior outcomes, and an always-run final step fails the job if any required result failed. A governance failure therefore does not hide the behavioral result.

- Every change runs `npm run check` in clean Node.js 22 and 24 LTS environments.
- A change containing only root reader documents, Markdown below `docs/`, or images below `docs/assets/` records a documentation-only behavioral result after repository checks; schema, Doctor, and behavioral tests are not required for this scope.
- A strict evidence/state-only change additionally runs organization schema validation, Doctor, `npm run test:fast`, focused Evidence Observer tests, and the focused init/Doctor/status contract test instead of every integration test.
- Any source, test, schema, project overlay, package, integration, workflow, mixed-scope, or unknown-path change runs the complete behavioral suite.
- Manual workflow runs, including release-candidate verification, always execute the complete suite.
- If the changed-path comparison is unavailable, empty, malformed, or fails, CI chooses the complete suite.

The evidence/state allowlist contains only lifecycle records and non-executable evidence:

- Work Item JSON, event history, Evidence, task, resource, and runtime-worker registries.
- Generated status, capability, parallel-plan, tracker, and Work Item projections.
- Markdown, JSON, logs, PDFs, and images below a Work Item, `observations`, or `work-orders` artifact directory.

Changes to identity, assignment, collaboration, policy, learning, retrieval, tracker configuration, templates, or other `.ai-org` paths are not evidence/state-only. Mixing general documentation with evidence/state paths also selects full verification; the narrow lanes are allowlists, not file-extension shortcuts.

The classifier reads Git raw diff metadata rather than names alone. Renames and copies retain both endpoints, while deletion, type, mode, executable, symlink, conflict, and unknown statuses always select full verification. A JSON example under `docs/`, a documentation generator, or an executable artifact is behavioral because it may participate in validation or distribution.

## Release and live validation

The normal CI suite uses deterministic fixtures and temporary local repositories. Release candidates should also review the allowlisted package manifest, verify clean-source recovery, and pin every result to the exact candidate revision. Node.js 26 remains outside the support contract while it is a Current release; it may be exercised as a non-blocking forward-compatibility check and reconsidered after it reaches LTS.

Live provider checks, multi-machine collaboration, external tracker writes, long-duration soak tests, and destructive recovery exercises are separate authorized validation activities. They are not silently triggered by a pull request and must retain their own bounded evidence records under [`docs/validation/`](../validation/README.md).

## Adding or changing tests

Prefer the smallest layer that proves the risk:

1. Pure validation or contract tests for deterministic rules.
2. In-process integration tests for module cooperation.
3. A small number of subprocess CLI tests for packaging, command boundaries, atomic writes, and rollback.
4. Explicit live validation only when a fixture cannot prove the behavior.

Do not remove a safety assertion merely to shorten CI. When subprocess setup dominates runtime, keep the assertion and move shared behavior to a faster harness while retaining representative end-to-end coverage.
