# WI-0085 Independent QA Report

- Position: Independent QA
- Agent Identity: Lulu (`agent-lulu`)
- Developer Agent Identity: Rikku (`agent-rikku`)
- Candidate revision: `31eb17071a304f16f2af740520e1821fd23589bd`
- Environment: second fresh detached worktree, Node.js `v24.20.0`
- Result: pass

## Independent reproduction

- Fresh dependency install with lifecycle scripts disabled: pass.
- Complete `npm run verify`: 262 tests passed, zero failed.
- Schema validation: 106 documents through 28 schemas, zero errors.
- Doctor: healthy, 35 pass, one warning, zero fail.
- `npm audit --omit=dev`: zero known vulnerabilities.
- `npm pack --dry-run --json --ignore-scripts`: 304 files, 629,472 bytes packed, 2,537,379 bytes unpacked.
- Six localized desktop/mobile SVG files: well-formed XML.

## Challenge checks

| Challenge | Result |
| --- | --- |
| Package leaks root self-host state, tests, screenshots, examples, integrations, output, or scripts | Not observed; the automated inclusion boundary rejects these paths. |
| Package omits CLI, overlay policy, installed Core Skill, Pack, docs, or responsive diagrams | Not observed; representative required paths and the complete allowlist check pass. |
| Node contract drifts between package, bootstrap, self-host lock, docs, and CI | Not observed at the corrected candidate. The prior Doctor failure proves drift is detectable. |
| GitHub Actions follow movable major tags | Not observed; both references are full reviewed SHAs. |
| CI gains write permission or weakens failed-step aggregation | Not observed; `contents: read` and the fail-closed CI contract tests remain. |
| External contributor guidance exposes or accepts private project data | Not observed; issue forms, pull-request guidance, contribution rules, and security guidance prohibit it. |
| README desktop/mobile diagrams refer to missing or invalid assets | Not observed; all localized `<picture>` sources resolve, all six SVG files are present, and XML validation passes. |
| Local closeout performs a public or irreversible action | Not observed; package remains private and no tag, Release, visibility change, npm publish, setting mutation, or announcement occurred. |

## Retained warning and non-claims

The single Doctor warning is the stale generated parallel plan. The candidate is sequential and does not dispatch from it. Hosted Linux CI, public GitHub protections, private reporting, moderation contact, a release version and tag, independent new-user adoption, and npm distribution remain pending; this pass does not convert them into completed evidence.

## Conclusion

Independent QA passes the exact candidate for its bounded repository-local outcome. Developer and Independent QA use different Agent Identities. The item may proceed to Release Gate with an explicit external-release status of `not_performed`.
