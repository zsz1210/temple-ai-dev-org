# Quality test report — WI-0029

- Exact integrated candidate: `6a27378b758cdbb7be35dcd0957001b8ce810f66`
- Quality identity: Lulu
- Position: Quality & Evaluation Engineer
- Verdict: **NO-GO — blocking privacy/non-retention defect**

## Fresh reproduction

The implementation candidate was inspected and reproduced independently from Developer evidence.

- focused Control Plane inbox/live suite: 16/16 passed;
- gateway-specific adversarial selection: 3/3 passed;
- full `npm run verify`: 197/197 passed, with repository and documentation checks green;
- schema validation: 48 documents against 24 schemas, zero errors;
- Doctor: 35 pass, one nonblocking stale generated parallel-plan warning, zero failures;
- current working diff and `4d441b3..6a27378b` candidate range: `git diff --check` passed;
- a fresh isolated loopback runtime with a deterministic fake Codex App Server reproduced disabled, idle, active, preview-confirmed, `turn-started`, `provider-rejected`, `delivery-unknown`, `interrupted`, and `completed` histories at desktop and 420-pixel width with zero browser console errors or warnings;
- no command was sent to a real Codex task.

## Blocking finding: complete short instructions are retained verbatim

The accepted work order requires durable records to retain a bounded redacted preview but never the complete instruction. The UI brief likewise says that the full instruction exists only in the transient browser form and provider conversation.

The implemented `safeInstructionPreview` takes the first 240 characters and redacts recognized secret patterns, but it does not ensure that the stored preview differs from the complete instruction. For every ordinary instruction shorter than 240 characters, the durable `state/inbox/commands.json` value is therefore the entire provider-bound instruction. The Dashboard renders that same full value under `Retained preview`.

Fresh fixture evidence compared the provider input against durable state:

| Provider-bound instruction | Stored `instruction_preview` | Instruction length | Preview length |
|---|---|---:|---:|
| `Quality fixture start turn` | `Quality fixture start turn` | 26 | 26 |
| `reject quality fixture` | `reject quality fixture` | 22 | 22 |
| `timeout quality fixture` | `timeout quality fixture` | 23 | 23 |
| `complete quality fixture` | `complete quality fixture` | 24 | 24 |

This is not merely a display ambiguity: the values are present verbatim in the durable generated command store after the browser session. Secret-pattern redaction and non-retention of long instructions do not satisfy the stated rule for ordinary short instructions.

## Stop boundary

Quality does not pass, so WI-0029 must remain in `test`. No evaluation report is issued, Independent QA is not started, and `release_gate` is not reached. Developer code was not modified. Real Codex execution remains separately unauthorized and unresolved.
