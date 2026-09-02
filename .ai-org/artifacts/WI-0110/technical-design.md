# WI-0110 technical design

Use the merged `setup-wave-5a.mjs` and `run-wave-5a.mjs` harnesses without changing the frozen case bundles or treatment assignment.

1. Create the exclusive `temple-wave-5a-lab-r3` root.
2. Run all ten WI-0109 replay scenarios and the validation-program tests locally.
3. Run `run-wave-5a.mjs --preflight-only` against WI-0110 and the new approval record.
4. Inspect the preflight output for zero blockers, exact installed schema digests, the requested Luna Max profile, clean candidates, and `model_generation_performed: false`.
5. Invoke the runner once without `--preflight-only`. Its coordinator serializes four waves, enforces reactive Token/time/disk limits, records usage and terminal state, and stops without retry on the first failure.
6. Preserve a bounded repository observation derived from the lab. Raw prompts, responses, reasoning, command output, credentials, and account billing data stay out of repository evidence.

The lab is disposable external state. Candidate repositories may change only in `src/` and `test/`; the framework repository receives evidence and documentation only.
