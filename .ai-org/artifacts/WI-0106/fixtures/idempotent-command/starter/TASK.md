# Idempotent command repair

Repair the command handler so retrying the same valid command ID does not apply the balance change twice and does not emit a second event.

Preserve the exported `applyCommand` API, the existing first-application result, immutable input state, and the current validation behavior. Do not add dependencies or change files outside `src/` and `test/`. Add useful public tests and run `npm test`.

Return a short completion record with: changed paths, test command and result, assumptions, and remaining risks.
