# WI-0167 npm first-version exception approval

- Date: 2026-09-05
- Human Principal: repository owner
- Decision: accept the npm registry's first-version `latest` alias as a bounded platform exception
- Observed aliases: `next -> 0.1.0-alpha.30`; `latest -> 0.1.0-alpha.30`
- Evidence: `.ai-org/artifacts/WI-0167/npm-registry-observation.json`

The owner accepted this exception after Temple disclosed that npm automatically created `latest` for the first version of the new package and rejected two completed interactive 2FA removal attempts with HTTP 400.

This approval does not reclassify Alpha.30 as stable. Public Alpha instructions must use `@zsz1210/temple-ai-dev-org@next`. Future prereleases must request `next`; only a separately approved stable GitHub Release may intentionally assign `latest`.

The owner also approved the next bounded improvement: design and implement npm Trusted Publishing through a GitHub Actions workflow that publishes only when a GitHub Release is published, never on an ordinary pull request or merge.
