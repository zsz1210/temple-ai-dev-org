# Testing strategy

Temple separates the bounded remote repository gate from complete local verification. The goal is to preserve the safety guarantees of a repository-writing framework without spending several hosted runner-minutes after every push.

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

Management Console changes also require the real-browser gate:

```bash
npm run test:browser
```

This command starts the repository-local Control Plane on loopback and opens four responsive layouts in an installed Google Chrome. It checks primary navigation, live rendering, browser errors, keyboard tabs, reduced-motion behavior, horizontal overflow, primary-text clipping, and named high-level layout regions. It does not download a browser or use the contributor's normal Chrome profile. A failure writes an actionable screenshot below `output/playwright/`.

## Continuous integration

GitHub Actions is intentionally a short remote consistency check, not Temple's complete test environment. Every pull request and push to `main` runs one Node.js 24 job with a five-minute ceiling. The job uses a clean checkout and performs:

- lockfile-strict dependency installation without lifecycle scripts;
- repository, documentation-link, and package-boundary checks;
- organization schema validation;
- Temple Doctor;
- `npm run test:fast`.

The workflow reports every required result and fails if any required step fails. It uses immutable Action revisions, read-only repository permission, and cancels an older in-progress run when the same pull request receives a newer commit.

GitHub Actions does not run `npm run test:full` or `npm run test:browser`. This keeps hosted use bounded and predictable, but it also means a green CI badge is only the remote repository gate. It does not prove the complete integration suite, browser behavior, Independent QA, or release readiness.

Complete evidence stays local and revision-specific:

- run `npm run verify` before proposing a behavioral candidate;
- run `npm run test:browser` for Management Console or other user-interface changes;
- record the exact tested revision and preserve the normal evaluation, Independent QA, and Release Gate separation.

## Release and live validation

Temple requires Node.js 24 or later. Node.js 24 is the remote baseline and must pass exact-candidate local verification. A newer local Node.js version may provide an additional compatibility signal, but passing on that machine does not by itself qualify a separate runtime line.

Release candidates should also review the allowlisted package manifest, verify clean-source recovery, and pin every result to the exact candidate revision.

Live provider checks, multi-machine collaboration, external tracker writes, long-duration soak tests, and destructive recovery exercises are separate authorized validation activities. They are not silently triggered by a pull request and must retain their own bounded evidence records under [`docs/validation/`](../validation/README.md).

## Adding or changing tests

Prefer the smallest layer that proves the risk:

1. Pure validation or contract tests for deterministic rules.
2. In-process integration tests for module cooperation.
3. A small number of subprocess CLI tests for packaging, command boundaries, atomic writes, and rollback.
4. Semantic real-browser tests for human-interface layout, navigation, accessibility interaction, and runtime failures that a DOM-string contract cannot prove.
5. Explicit live validation only when a fixture cannot prove the behavior.

Do not remove a safety assertion merely to shorten CI. When subprocess setup dominates runtime, keep the assertion and move shared behavior to a faster harness while retaining representative end-to-end coverage.
