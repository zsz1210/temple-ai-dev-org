# WI-0086 Quality Report

- Position: Quality & Evaluation Engineer
- Agent Identity: Lulu (`agent-lulu`)
- Developer Agent Identity: Rikku (`agent-rikku`)
- Candidate revision: `fe9f7d9846bf0741cb2bc34443c0db34ade7c5d7`
- Result: pass for Test

## Acceptance review

| Boundary | Result |
| --- | --- |
| Release identity | Pass locally: package, lockfile, constants, tests, changelog, roadmap, validation record, and proposed tag identify Alpha.29. |
| Node.js support | Pass locally: separate clean Node.js 22 and 24 worktrees each passed 262 tests. |
| Package boundary | Pass: 305 allowlisted files; forbidden development and project-state roots remain excluded. |
| Clean consumer | Pass as maintainer evidence: exact tarball version, install, init, re-init, launcher, and Doctor passed under both supported majors. |
| Upgrade preservation | Pass: Alpha.28 Work Item, Lesson, and application file remained byte-identical after Alpha.29 upgrade. |
| Dependency and privacy | Pass locally: audit reported zero known vulnerabilities and the high-confidence history scan found no matches outside excluded synthetic surfaces. Hosting-side secret scanning remains an external gate. |
| Human evidence | Correctly incomplete: no moderation contact or independent new-user result has been fabricated. |
| External actions | Pass: repository remains private; no tag, Release, npm publication, setting change, or announcement was performed. |

## Retained warning

Doctor reports only the known stale generated parallel-plan warning in the toolkit repository. WI-0086 is explicitly sequential and does not dispatch from that plan. Clean installed consumer projects report no warning.

## Conclusion

The exact candidate passes the repository-local Test gate. Hosted CI, private moderation, genuinely independent adoption, GitHub settings, and final public action remain separate gates and must stay visible through Evaluation and Independent QA.
