# Alpha.33 reader-facing documentation refresh

## Approved work order and scope

The maintainer requested updating the README after reviewing the proposed
corrections. Update English, Japanese and Traditional Chinese entry points,
plus related usage, Solo and changelog prose. Keep existing diagrams, positioning,
runtime behavior, Agent instructions, Skills, package version and authority intact.
This slice ends with verified documentation and a pull request, not a merge or release.

## Acceptance

- All README languages share structure and describe the published Alpha.33 boundary.
- Separate adopting Temple from contributing to it; preserve the source checkout
  needed for pre-init Skill context rather than inventing a package-only AI bootstrap.
- Explain optional autonomous delivery, proportionate profiles, optional observation,
  and post-init instruction/bootstrap checks without universal savings claims.
- Interview only unresolved requirements; do not repeat discovery for approved scope.
- Correct the stale Alpha.33 candidate label and the Solo Node-only statement.
- Preserve image files; validate links, rendered readability and fast repository checks.

## Approach

Use a compact practical example and setup before deeper concept layers. Retain
the two existing diagrams and detailed guides, linking rather than copying their
contracts. Move changelog-like prose out of the README. Existing documented CLI
commands keep their semantics; contributor-only verification moves to a collapsed
section. No new executable example or behavior is introduced.

## Risk and rollback

Low-risk, reversible prose only. Avoid overstating runtime orchestration, automatic
model choice, non-Node sandbox support, or multi-human qualification. A distinct
Verifier checks the exact candidate; revert the documentation commit if incorrect.
Lean is eligible: bounded local prose with stable acceptance, no UI code/assets,
external runtime operation, dependency, schema, policy or product behavior change.

## Sources

- `docs/getting-started/core-path.md`, `docs/getting-started/usage.md`
- `docs/operations/autonomous-delivery.md`, `docs/operations/collaborative-delivery.md`
- `package.json`, `CONTRIBUTING.md`, `docs/getting-started/testing.md`
- GitHub prerelease `v0.1.0-alpha.33`, published 2026-09-16; npm `next`
  resolves to `0.1.0-alpha.33` at inspection. No publication performed here.
