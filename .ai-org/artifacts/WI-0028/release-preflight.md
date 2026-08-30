# Release preflight — WI-0028

- Release line: `0.1.0-alpha.27`
- Intended tag: `v0.1.0-alpha.27`
- Repository: `zsz1210/temple-ai-dev-org`
- Visibility at preflight: private
- Local base before release work: `ee0e65b3bac156fdf2a18a6281dd81af3f644ee5`
- Remote relation after fetch: `origin/main` was an ancestor of the local candidate; local `main` was 64 commits ahead and 0 behind
- Tag state at preflight: absent locally and remotely

## Passed local checks

- The package declares `0.1.0-alpha.27`, `private: true`, Node.js `>=20`, and the MIT license.
- `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, and `THIRD_PARTY_NOTICES.md` are present.
- GitHub Actions is configured to run on pushes to `main` and pull requests with Node.js 22.
- Full verification on Node.js `20.20.2` passed 195/195 with no failures, skips, cancellations, or TODOs.
- `npm audit --omit=dev` reported zero known vulnerabilities.
- A bounded tracked-filename and tracked-content scan found no tracked secret-pattern matches.
- A package dry run included the launcher, CLI, overlay, README, license, and third-party notices. It also confirmed that the current package surface is too broad for publication; the package is intentionally not published by this checkpoint.

## External gates still required

- Fast-forward push the reviewed candidate to the private origin.
- Require the matching GitHub Actions run to pass.
- Reproduce the exact pushed revision from a new remote clone, including lockfile installation, full verification, schema validation, Doctor, and launcher checks.
- Obtain Independent QA for the exact candidate.
- Push the final closeout commit, require its matching CI run to pass, reproduce that exact final commit from a clean remote clone, then create and push the annotated tag.

## Retained public-release work

These are not blockers for the authorized private Alpha tag, but they remain blockers or explicit decisions before a public repository or npm release:

- define a narrow npm package allowlist instead of relying on the repository `.gitignore` fallback, and exclude project-owned `.ai-org` and `.codex` state unless deliberately required;
- publish a supported-version and private vulnerability-reporting policy;
- establish enforceable branch protection or rulesets when the repository plan supports them;
- verify any operating-system matrix beyond the maintainer macOS environment and GitHub-hosted Ubuntu CI;
- perform a separate repository-history privacy, public provenance, package-installation, and release-channel review.

No public visibility, npm publication, GitHub Release, deployment, account probe, model call, model switch, or paid action is authorized by this checkpoint.
