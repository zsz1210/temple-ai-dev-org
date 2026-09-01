# WI-0085 Quality Report

- Position: Quality & Evaluation Engineer
- Agent Identity: Lulu (`agent-lulu`)
- Candidate revision: `31eb17071a304f16f2af740520e1821fd23589bd`
- Environment: fresh detached worktree, Node.js `v22.23.2`
- Result: pass for Test

## Acceptance checks

| Acceptance boundary | Result | Evidence |
| --- | --- | --- |
| Node.js contract | Pass | `package.json`, `temple.lock`, bootstrap metadata, three READMEs, tests, and the hosted matrix agree on Node.js 22 and 24 LTS. |
| Package boundary | Pass | `npm run check` executed the dry-run allowlist guard; required runtime, overlay, Pack, docs, and responsive diagram files are present and forbidden development roots are absent. |
| CI supply chain | Pass | Both external Actions use 40-character commit SHAs with v7 comments; permissions remain `contents: read`; the 22/24 matrix preserves fail-closed scope and aggregation tests. |
| OSS intake | Pass with retained external gates | Contribution, governance, security, ownership, pull-request, and issue-intake files prohibit sensitive project data and keep release authority separate. Public settings and moderation contact remain outside the candidate. |
| License and provenance | Pass | MIT retention is explicit; runtime dependency licenses and Mermaid authoring provenance are present; npm publication remains disabled. |
| Public documentation | Pass | English, Japanese, and Traditional Chinese README files use the approved human-facing structure, native prose, responsive `<picture>` sources, and the Node.js 22 / 24 LTS requirement. Six committed SVGs are well-formed. |
| Release boundary | Pass | No tag, GitHub Release, npm publication, visibility change, external announcement, or repository-setting change is in the candidate. |

## Exact-candidate verification

- Fresh `npm ci --ignore-scripts`: pass.
- `npm run verify`: 262 tests passed, zero failed.
- Schema validation: 106 documents through 28 schemas, zero errors.
- Doctor: healthy, 35 pass, one warning, zero fail.
- All six localized desktop/mobile delivery SVGs: `xmllint` pass.

The single Doctor warning is the known stale generated parallel plan. WI-0085 is explicitly sequential and is not dispatching from that projection, so the warning does not invalidate this candidate.

## Quality conclusion

The exact candidate satisfies the repository-local public-Alpha hardening criteria and is ready for Evaluation and Independent QA. Public release remains blocked on the separately listed external settings, release identity, moderation route, and Human Principal actions.
