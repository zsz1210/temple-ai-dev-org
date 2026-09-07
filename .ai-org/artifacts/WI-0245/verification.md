# Developer verification and evaluation

Exact behavioral candidate: `3bfae21d8b2cc39df325f025b0e02f4a2ab61669`.

- `node --test test/delivery-entry.test.mjs`: six passed, zero failures,
  10,479.533541 ms; actual CLI guidance and existing ownership, drift, missing
  source, pending-operation, invalid-input and rework cases passed.
- `npm run verify`: exit 0; repository/link/package checks passed; 794 tests
  passed, zero failures/skips/cancellations, 196,347.742541 ms.
- Parent/current source normalization: replacing only the `read_policy` value
  makes the complete module byte-identical. Policy text is 181 versus 431 bytes.
- Fresh installed runtime/schema, thread, isolated oracle and native-observation
  qualifications passed; see [readiness](readiness.md). No model turn executed.
- Old sealed protocol and run hashes match; runtime comparison finds exactly
  `src/context-entry.mjs` changed. No project-overlay, actor prompt, model, tool,
  fixture-solution, validator or lifecycle source was changed by WI-0245.

This validates a bounded guidance clarification, not evidence of reduced reading,
Tokens or time. The risk is that an Agent may ignore the clarification or still
need most files under explicit instructions. It must not use the inventory
distinction to skip required authority or current acceptance evidence.

Independent QA must review the exact candidate, preserved constraints and frozen
two-subject readiness before generation. Full verification does not guarantee
all provider/actor behavior and does not authorize retries or broader scope.
