# Developer verification — WI-0038

- Candidate revision: `787c6faf4ea8e127e9308a7311628de0f0dc5eb9`
- Developer: Rikku (`agent-rikku`)
- Result: **pass to Quality & Evaluation**

## Correction

Lifecycle transition now inspects merged gate evidence before any Work Item or event write. A reference beginning with `EVID-` must exist in the normalized registry, belong to the same Work Item, and remain current. A normalized `independent_qa_pass` must additionally be `test` or `runtime` evidence with outcome `pass`. File-backed Solo gate evidence remains backward-compatible, while High-Assurance retains its stricter revision, actor, risk, and evidence contracts.

## Adversarial coverage

The workflow test reproduces the real malformed placeholder and also rejects:

- a well-formed but nonexistent Evidence ID;
- Evidence belonging to another Work Item;
- failed Independent QA evidence;
- expired Evidence;
- invalidated Evidence.

Every rejection asserts byte-identical Work Item and event-stream content. A current same-Work-Item pass record then proves the valid transition still succeeds.

Focused workflow coverage passed 18/18. The exact candidate also passed:

```text
npm run verify
tests 217
pass 217
fail 0
skipped 0
duration_ms 44013.331667
```

Repository checks and documentation-link checks passed. No external action or release was performed.
