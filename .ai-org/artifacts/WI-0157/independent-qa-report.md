# WI-0157 Independent QA report

- Independent QA: Lulu (`agent-lulu`)
- Developer: Rikku (`agent-rikku`)
- Candidate revision: `0155149dbcb6f5ee250b01b5f0d3078dc81c72fb`
- Normalized test Evidence: `EVID-20260904T135322Z-DFABCB67`
- Decision: **Pass**

## Independent checks

- Reviewed the candidate separately from its later lifecycle-record additions.
- Repeated the full repository gate from an isolated detached checkout of the exact candidate.
- Confirmed 434 tests passed with no failures after dependency installation from the committed lockfile.
- Confirmed invalid transition references leave both Work Item JSON and the canonical event stream byte-for-byte unchanged.
- Confirmed invalid closeout references create neither a release record nor a lifecycle mutation.
- Confirmed symlinks and repository escapes are rejected, while normalized Evidence and bare Git revisions remain compatible.
- Confirmed the sealed WI-0156 report and comparison artifact were not edited by WI-0157.

## Non-product setup event

The isolated checkout's first command stopped before tests because dependencies were absent. Running `npm ci --ignore-scripts` from the committed lockfile resolved the environment prerequisite; the exact same candidate then passed. This was not a retry of model generation or a product-test failure.

## Limits

This QA result covers deterministic lifecycle behavior and evidence attribution only. It is not a fresh-session usability study, model-routing comparison, Token-efficiency result, public-release approval, or npm-publication approval.
