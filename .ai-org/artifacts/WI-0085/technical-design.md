# Technical Design — Public Alpha distribution boundary

## Runtime contract

- `package.json`, generated bootstrap metadata, and the toolkit's self-host `temple.lock` use `^22.0.0 || ^24.0.0`.
- README setup requirements name Node.js 22 or 24 LTS in natural English, Japanese, and Traditional Chinese.
- the hosted workflow expands one verification job definition over Node.js 22 and 24.
- Node.js 26 stays outside `engines` until its LTS transition and a later qualification decision.

## Package contract

The npm `files` list includes only:

- `bin/` and `src/` for the CLI runtime;
- `project-overlay/` for initialized project files;
- `packs/` for shipped framework packs;
- `docs/` and selected root reader documents.

`scripts/check-package.mjs` runs `npm pack --dry-run --json --ignore-scripts`, requires representative runtime and documentation files, rejects forbidden development or self-host roots, rejects undeclared top-level paths, and caps unexpected file-count or unpacked-size growth. It runs inside `npm run check` and therefore in both supported CI lanes.

## CI and OSS boundary

- `actions/checkout` and `actions/setup-node` are pinned to full reviewed v7 commit SHAs with same-line version comments.
- workflow permissions remain `contents: read`; CI does not gain write authority.
- CODEOWNERS, issue forms, and the pull-request template route review and prohibit sensitive data.
- CONTRIBUTING, GOVERNANCE, SECURITY, and THIRD_PARTY_NOTICES explain contribution licensing, maintainer authority, private vulnerability reporting, and runtime dependency licenses.
- no dependency updater is activated in this slice because it would create external pull requests after publication; that setting remains a separate decision.

## Verification

1. focused tests cover Node range, package manifest, CI matrix, and immutable Action references;
2. `npm audit --omit=dev` checks the locked production dependency graph;
3. the full repository suite runs on the exact candidate under Node.js 22 and 24;
4. a fresh packed artifact is inspected for required and forbidden paths;
5. Quality and a distinct Independent QA identity repeat the candidate checks before Release Gate.

## Rollback

Revert the candidate commit, restore the previous workflow and package metadata, and rebuild generated Temple views. No external rollback is needed because this Work Item does not change visibility, tags, releases, npm state, or GitHub settings.
