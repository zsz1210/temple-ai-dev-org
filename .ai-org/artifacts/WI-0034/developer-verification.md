# Developer verification — WI-0034

- Candidate revision: `7a52896443e5055bd0b572f1df30e1536488c90f`
- Integrated revision inspected: `ef583f0ee575262709d14278d561b34a75ddd13a`
- Developer: Rikku (`agent-rikku`)
- Result: **pass to Quality & Evaluation**

## Implemented behavior

- Agent Command drafts retain instruction, selected task and operation, and focus across unrelated refreshes. A changed target or active turn preserves the draft but clears confirmation and explains the stale precondition.
- Snapshot freshness is separate from SSE connectivity. A stale or failed snapshot retains prior information, presents both polite status and assertive error text, and disables mutation actions.
- The overview separates active, QA, approval, queued, blocked, and terminal states.
- Current attention and nonterminal Work Items precede collapsed terminal history. Six primary attention records remain visible and additional evidence or recovery signals are collapsed.
- Terminal failed evidence and failed workers remain auditable history without being mislabeled as current attention.
- Timeline rows use occurrence time, show observation time only when different, and exclude replayed canonical repository telemetry duplicates.

## Automated evidence

The focused Inbox, live projection, and evidence observer suite passed 31/31 after the terminal-attention correction. The exact candidate then passed:

```text
npm run verify
tests 214
pass 214
fail 0
```

Schema validation accepted 56 documents against 24 schemas, Doctor reported 35 pass, one pre-existing stale parallel-plan warning, and zero failures, and `git diff --check` passed.

## Live UI evidence

A live snapshot at the final integrated revision reported 37 Work Items: 1 active, 2 awaiting QA, 4 awaiting approval, 2 queued, 0 blocked, and 28 terminal. The inspection showed:

- snapshot current and the loopback stream live;
- six primary attention cards plus one collapsed remainder summary;
- nine current Work Items before `Terminal history · 28`;
- occurrence-labelled canonical timeline rows without adjacent replay duplicates;
- document width 405 pixels inside a 420-pixel viewport, with no horizontal overflow;
- a compact two-column metrics layout and readable current attention.

Every WI-0034 affected implementation, test, and operations-document path is byte-identical between the candidate and inspected integrated revision. The inspection harness supplied only a page-local captured-snapshot adapter because Codex's embedded QA browser removes page networking APIs; the production server and private Tailscale route were unchanged.

## Boundary

This evidence covers current-state presentation, draft reconciliation logic, and local/private visual behavior. It does not authorize remote Agent Commands, release, deployment, or a public Dashboard.
