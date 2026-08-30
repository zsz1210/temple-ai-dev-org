# Evaluation report — WI-0012

- Candidate revision: `3872ac71630e8a52d69f1b624793bfa6e7cf5475`
- Result: pass to Independent QA

## Evaluation

| Requirement | Result | Evidence |
|---|---|---|
| Equivalent snapshot replay is idempotent | Pass | Pure normalization plus journal duplicate test |
| Changed snapshot growth is incremental | Pass | Real two-start self-host observation: +1 summary and +4 new history events |
| Historical terminal work is not live | Pass | Projection and Provider integration tests; live snapshot reported `live=0`, `history_only=1` |
| Historical failures do not become current attention | Pass | Terminal integration assertion and live snapshot `attention=null` |
| Dashboard distinguishes the states | Pass | Dashboard source assertions for History only and history badge styling |
| Existing live behavior is preserved | Pass | Active-task live-event and disconnect regression test |

## Evaluation note

The first real restart found that mutable global window statistics were attached to every historical event. The final candidate moves those statistics to one snapshot-summary event and retains only stable bounds on turn/item events. This preserves collision protection instead of weakening journal identity checks.

## Retained follow-up

In a detached toolkit-self-host worktree, the default launcher resolved the same-version globally linked package, so exact-candidate Doctor verification explicitly used `TEMPLE_CLI_PATH=./bin/temple.mjs`. This did not affect local-module or CLI behavioral tests, but candidate-SHA binding for self-host worktree bootstrap should be addressed as a separate Work Item.
