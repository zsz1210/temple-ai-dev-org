# Technical design — WI-0130

## Experiment construction

Reuse the content-addressed `idempotent-command` and `compatible-event-evolution` fixtures from WI-0106. Create a new exclusive lab containing one framework snapshot, one coordinator, and six independent candidate repositories. The historical fixtures remain immutable.

The setup command initializes both Temple conditions from the same current framework revision and follows the current Lean Core Path. Each Temple candidate contains an Execution Request for the Build step:

- condition B pins profile `standard`;
- condition C requests `advisory` resolution for task kind `bounded`, risk `low`.

The runner verifies that these resolve to Terra medium and Luna max respectively before it creates a generation-ready manifest. Condition A receives only the frozen minimal responsible instructions. All candidates receive the same product task and candidate execution instruction.

## Provider boundary

Use Codex App Server v2 through the installed `codex` binary. Preflight must:

- match the exact CLI version and non-experimental schema digests;
- perform `initialize` plus `model/list` without starting a turn;
- confirm Terra medium, Luna max, and Sol xhigh;
- verify fixture, instruction, policy, protocol, and candidate revision digests;
- validate clean candidate repositories and condition isolation;
- require an exact WI-0130 owner approval record; and
- refuse generation on any blocker.

Each candidate gets one ephemeral thread and one turn, network disabled, workspace writes limited to its own repository, no subagent, no retry, no fallback, and a structured five-field completion. App Server command actions are checked against the frozen allowlist. A request for additional authority, a model reroute, a disallowed tool, a path escape, missing detailed usage, or a hard limit stops the candidate.

## Evaluation and analysis

After objective tests, export arm-neutral packages and sealed mappings. A fresh Sol xhigh evaluator context receives only the blind packages and frozen rubrics, cannot use tools, and returns integer `0..100` scores. Scores are frozen before mappings are joined. Invalid output is retained once and produces an inconclusive blind-quality result.

The analyzer compares only matched, quality-qualified pairs:

- A versus B: Temple process delta;
- B versus C: adaptive-route delta.

It reports each case, median paired deltas, direction counts, and absolute totals. With two cases, the output is descriptive and diagnostic only. It does not compute a p-value or statistical-superiority claim.
