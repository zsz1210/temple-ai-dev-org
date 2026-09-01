# WI-0086 Risk Review

- Position: Tech Lead
- Agent Identity: Tidus (`agent-tidus`)

| Risk | Control |
| --- | --- |
| Public release exposes private history or credentials | Repeat tracked-file, package, and history-oriented review; enable hosting-side secret protection before visibility changes. |
| Version metadata and immutable release point disagree | Align package, lockfile, changelog, validation record, candidate SHA, and proposed tag before approval. |
| Maintainer smoke is misrepresented as independent adoption | Keep it labeled as maintainer-run; require a separate human or separately authorized clean task. |
| Conduct policy publishes unusable or personal contact data | Do not add the final Code of Conduct until the Human Principal approves an operated private route. |
| GitHub settings unintentionally block maintenance or remain ineffective | Inspect current settings, propose exact mutations, apply only after approval, then verify effective rules. |
| npm becomes public accidentally | Keep `private: true`; GitHub Release remains the only proposed first distribution. |
| Candidate scope expands into new feature work | Limit changes to release identity, documentation reconciliation, evidence, and required public-health material. |

## Rollback boundary

Before public release, rollback is an ordinary Git revert of the candidate preparation. After public release, preserve the immutable tag, mark a faulty Release as withdrawn or superseded, return repository visibility only through a separately approved action, and restore project-owned state using the documented version-compatible backup and restore procedure where applicable.
