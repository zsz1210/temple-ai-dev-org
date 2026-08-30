# Testing strategy

Temple separates fast repository policy checks from behavioral regression tests. The goal is to preserve the safety guarantees of a repository-writing framework without spending several minutes on unchanged behavior after every documentation edit.

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

CI uses one job so GitHub does not round several short jobs into separate billable minutes.

- Every change runs `npm run check` in a clean Node.js 22 environment.
- A change containing only Markdown, repository policy documents, or documentation images stops after repository checks pass.
- Any source, test, schema, project overlay, package, integration, workflow, or unknown-path change runs the complete behavioral suite.
- Manual workflow runs always execute the complete suite.
- If the changed-path comparison is unavailable or fails, CI chooses the complete suite.

The classification is intentionally conservative. A JSON example under `docs/`, a documentation generator, or any executable file is behavioral because it may participate in validation or distribution.

## Release and live validation

The normal CI suite uses deterministic fixtures and temporary local repositories. Release candidates should also verify every supported Node.js major, package contents, clean-source recovery, and the exact candidate revision.

Live provider checks, multi-machine collaboration, external tracker writes, long-duration soak tests, and destructive recovery exercises are separate authorized validation activities. They are not silently triggered by a pull request and must retain their own bounded evidence records under [`docs/validation/`](../validation/README.md).

## Adding or changing tests

Prefer the smallest layer that proves the risk:

1. Pure validation or contract tests for deterministic rules.
2. In-process integration tests for module cooperation.
3. A small number of subprocess CLI tests for packaging, command boundaries, atomic writes, and rollback.
4. Explicit live validation only when a fixture cannot prove the behavior.

Do not remove a safety assertion merely to shorten CI. When subprocess setup dominates runtime, keep the assertion and move shared behavior to a faster harness while retaining representative end-to-end coverage.
