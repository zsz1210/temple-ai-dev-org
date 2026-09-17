# Physical product recovery verification

Developer: agent-rikku. Candidate:
`0c1c6f1cc999bcf50a8d8ae0e1e89fe05b991ed7`.
Node.js v24.20.0. Scope: recovery module, recovery tests and operator guide.

Focused `node --test test/lean-finish-recovery.test.mjs`: exit 0, 16 passed,
zero failures/cancellations/skips/todo, 25,188.566209 ms. `git diff --check` passed.
Full `npm run verify` is running on this exact candidate; do not infer its result.

Direct comparison now covers scoped Git tree versus actual inventory, raw bytes
and executable modes. Global literal pathspec selection confines tree enumeration;
NUL records preserve filenames with tabs/newlines. No Git filters or index flag
mutations run. Unchanged flagged files recover, changed/missing ones reject both
preview and apply; hidden mid-diagnostic mutation rejects settlement. Additional
checks cover binary bytes, ignored additions, mode changes and linked ancestors.

Previous tests and acceptance under WI-0247 did not cover hidden Git flags. This
candidate and its independent judgment supersede that product-integrity claim;
historical evidence remains unmodified. No live recovery is repeated on the
already accepted README item. No merge, release or provider experiment performed.
