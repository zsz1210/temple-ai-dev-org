# Representative comparison v11 stop report

## Outcome

The exact-approved v11 run stopped fail-closed during the first arm's parallel Build wave. No arm completed and the evaluator did not start.

- Protocol digest: `d729c503d8e8a9d35e0eb6367fda51fa76dbf34e7db45a5ef0a0408166283040`
- Candidate turns completed: 1 of 10
- Candidate Operational Tokens observed: 108,271
- Retry count: 0
- Fallback count: 0
- Generated repositories: all 10 clean after stop

## Observed stop

The Minimal Responsible Design turn completed. When the three Terra Build turns began, the gateway turn reported an allowed read-only repository discovery command, but the harness rejected the Provider's command item as `command-cwd-outside-arm`. The sibling turns were interrupted and awaited before the stop record was written.

Local Codex runtime evidence records the thread and turn cwd as the exact arm root, and the model-declared nested `exec_command.workdir` as that same arm root. Therefore the v10/v11 assumption that the App Server command item's client-facing `cwd` is a stable authorization boundary is not supported for nested Code Mode commands.

## Required correction

Do not retry v11. Preserve the Provider-reported cwd as diagnostic evidence, but authorize execution from the frozen turn environment plus the installed Provider's arm write boundary and network denial, then validate each parsed command/action and every explicit path against the arm boundary. The installed Provider schema does not yet expose the newer restricted-read fields, so v12 must not claim that protection. Add a generation-free replay for the nested Code Mode presentation mismatch, retain exact rejection for explicit paths outside the arm, then freeze a new protocol digest and require a new exact approval.
