# Test pruning QA-01 correction

Developer: agent-rikku, Principal: human. The earlier aggregate candidate `93fe381da11621d48493f350e67f9b8bfa51ef8c` was rejected before full verification. `independent-review.md` demonstrates that deleting the complete browser table contract permitted empty viewport selection and omission of a primary navigation target to escape the remaining contract tests.

Restored one semantic coverage test in `test/console-browser-contract.test.mjs`. It requires all four named responsive classes with valid dimensions and increasing widths, checks both sides of the actual mobile-sidebar breakpoint, and requires the six stable primary navigation targets. Exact pixel dimensions, human-readable labels, array order and additional viewports are not pinned. No production browser code or test-discovery rule changes.

The final scope now removes 13 registrations and rewrites one existing test; expected full count is 1237. Other deletion mappings remain unchanged. The original worker audits and rejected review remain as history, not final acceptance. The corrected browser-contract focused command `node --test test/console-browser-contract.test.mjs` passed five tests, zero failures/skips, 255.2605 ms on Node v24.20.0. Exact corrected candidate, full verification and fresh independent judgment will be appended when observed.
