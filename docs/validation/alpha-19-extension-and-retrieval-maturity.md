# Alpha.19 extension and retrieval maturity validation

- Version: `0.1.0-alpha.19`
- Feature revision: `9604cce2b30cb909a6b2355ed89a19d569a817c2`
- Clean-source and documentation revision: `cdd8b47b5425ad1314332040fd2bfca2dc554c96`
- Date: 2026-08-30
- Environment: macOS arm64, Node.js `25.6.1`, npm `11.11.0`
- Scope: Phase 2C
- Result: `passed_with_limits`

## Verified locally

- `npm run verify` passed repository checks and 112 automated tests on Node `25.6.1`.
- `npm audit --omit=dev` reported zero vulnerabilities, `npm pack --dry-run` completed, all eight distributed Skills passed the official Skill validator, and 97 Markdown files passed local-link validation.

- Pack manifest v2 installs and upgrades declared Skill entrypoints, references, scripts, and assets with provenance and compatibility metadata.
- Draft 2020-12 runtime schema validation reports document and instance paths.
- The migration registry distinguishes a fresh baseline from pending upgrade migrations and preserves existing project-owned Learning v1 until explicit migration.
- Learning CLI operations atomically create records and index entries, preserve Lesson-to-Practice derivation, record revalidation history, and surface overdue or contradicted guidance.
- Deterministic retrieval evaluation records hit rate and mean reciprocal rank without mutating canonical state when `--no-write` is used.
- The injected local-hybrid boundary preserves provider provenance and falls back to deterministic retrieval when its local semantic provider fails. No model, embeddings, vector database, daemon, or remote search was installed.
- High-Assurance rejects incomplete human-accountability setup and enforces risk-scaled UI, exact revision, normalized test/runtime, rollback, and approval gates. The Work Item contract remains enforced after a later profile change, and `doctor` rejects derived-contract drift.
- The Archify adapter safely reports absence, rejects dirty pinned sources, records MIT provenance and a closed 155-file digest set, and detects changed, missing, or unrecorded files.
- A fresh clone of official Archify `v2.15.0` resolved to `e1ac748f19cf805e44bf74fb93c796662152e273`; installation into a fresh initialized product passed adapter status, `doctor` at 35 pass / 0 warn / 0 fail, and runtime JSON Schema validation for 15 documents across 18 cataloged schemas.
- Existing Solo, Collaborative, tracker, specification, orchestration, upgrade, and Observer behavior remains covered by the full regression suite.

## Clean-source recovery and CI

The first clean-checkout attempt intentionally exposed a stale setup assumption: direct source execution failed because the Alpha.19 AJV dependencies had not been installed. The three README entry points, usage guide, and both copies of `$temple-init` were corrected to require `npm ci`; the same exercise then passed from revision `cdd8b47b5425ad1314332040fd2bfca2dc554c96`.

The fresh product lock recorded that exact commit with `source_clean: true`. With `TEMPLE_CLI_PATH` unset, its repository launcher recovered the pinned Git source through `npm exec` and returned 35 pass / 0 warn / 0 fail from `doctor`. This validates the documented clean-source path; it does not prove an offline cache or public npm distribution.

- Feature CI: [run 33277355661](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33277355661) — passed.
- Clean-checkout documentation CI: [run 33277407655](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33277407655) — passed.

## Retained limits

- Real multi-human, multi-machine Git and pull-request contention: `not_run`.
- Large-repository retrieval evaluation with a real project corpus: `not_run`.
- A configured local model, embeddings, or vector index: `not_installed / not_run`.
- Regulated external audit acceptance or production authorization: `not_run`.
- Automatic third-party download, adapter execution, external writes, deployment, and publication: not performed. The official source clone was an explicit validation input, not an installer side effect.

Alpha.19 completes the planned Phase 2C local contract. These retained limits remain explicit evidence gaps rather than inferred failures or hidden production-readiness claims.
