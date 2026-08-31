# Bounded multi-repository validation programs

Use a validation program when a local experiment spans several authoritative repositories and model turns must stay inside a predeclared resource envelope. It is an experiment control, not a general task queue or remote-command gateway.

## What the program controls

A `temple.validation-program/v1` manifest declares:

- the coordinator and every participant repository;
- ordered waves and at most one concurrent turn per repository;
- the Work Item, Position, model request, instruction file, and write allowlist for each turn;
- hard and warning ceilings for turns, attempts, concurrency, Tokens, wall-clock time, and disk growth;
- zero retry, no fallback, no network access, no external write, no API-key use, no usage reset, no deployment, no publication, and ¥0 external spend.

Start from `.ai-org/templates/validation-program.json`, copy it to the project-owned `.ai-org/project/validation-program.json`, and replace the example IDs, paths, turns, and ceilings. Do not edit the framework template in place.

## Inspect before execution

```bash
node ./templew.mjs experiment inspect . \
  --manifest .ai-org/project/validation-program.json \
  --allowed-root /absolute/path/to/local-experiment-root
```

Inspection performs no model generation and changes no canonical state. It rejects:

- a participant or instruction symlink that escapes the allowed root;
- a project-identity mismatch;
- duplicate participant, wave, order, or turn identities;
- an unknown participant or two simultaneous turns for one repository;
- unsafe or over-broad paths;
- a turn outside its participant allowlist;
- a non-5.6 model, unsupported reasoning value, mutable approval policy, or network access;
- retry, fallback, credential, external-spend, deployment, or publication authority;
- warning ceilings above their hard ceilings or plans that exceed turn, attempt, or concurrency limits.

`temple schema validate` also validates a project-owned manifest when it exists. JSON Schema handles document shape; the runtime validator handles cross-field and safety invariants.

## Execution is adapter-owned

Temple intentionally does not expose a generic `experiment run` CLI command. The reusable `runValidationProgram` module accepts a reviewed model adapter and supplies the safety state machine around it. This prevents a local manifest from silently becoming authority to start arbitrary model work.

The adapter receives one turn, its resolved instruction path, an abort signal, and an `onUsage` callback. It must:

1. use the exact requested model, reasoning effort, sandbox, approval, and network policy;
2. report cumulative Provider Token usage through `onUsage`;
3. honor an interrupt request or abort signal;
4. make no retry or fallback attempt;
5. leave the repository clean at a new exact candidate revision, or report failure.

The runner persists state before launch. A process restart skips completed turns. A turn found in `running` state is ambiguous and stops the program; it is never relaunched automatically.

## What stops the program

The runner stops before another launch when any hard ceiling is reached. During a turn, Token and timeout callbacks request interruption. After a turn, Temple inspects:

- exact before and after revisions;
- committed and uncommitted changed paths since the turn started;
- project and aggregate disk growth;
- elapsed time and Token counters;
- durable attempt and wave checkpoints.

A dirty repository at the start of a participant or turn is a stop. A changed path outside the turn allowlist is a stop. A failed or interrupted turn is one consumed attempt and receives no automatic retry.

Runtime state and events default to `.ai-org/runtime/validation-program/<program-id>/`. Treat this as local operational data and exclude it from Git before starting a program. Copy only the bounded evidence needed for review into a project-owned Work Item artifact.

## Cross-repository usage report

After participant Work Items are closed and their usage journals are available, build a read-only aggregate:

```bash
node ./templew.mjs experiment report . \
  --manifest .ai-org/project/validation-program.json \
  --allowed-root /absolute/path/to/local-experiment-root \
  --no-write
```

Without `--no-write`, the coordinator writes `.ai-org/views/validation-program-report.json`. Participant repositories remain unchanged.

The report accepts only Work Items already qualified inside each repository: completed canonical Work Item, completed registered task, exact revision correlation, matching Position, known model, known task shape, and detailed Provider Token usage. Composite IDs use `project-id:WI-####`, so identical local Work Item numbers do not collide.

The observational threshold is ten distinct completed Work Items across at least two task shapes. Crossing it permits descriptive analysis only. The report always leaves these claims unauthorized:

- causal time or Token savings;
- monetary cost;
- model quality;
- automatic or recommended routing;
- enterprise readiness;
- release or participant lifecycle completion.

Unknown values remain `null`, not zero. A controlled matched evaluation and a separately authorized collaborative qualification are still required for stronger claims.

## Authority boundary

The coordinator owns the experiment protocol, checkpoints, and derived report. Each participant repository remains the authority for its own specifications, Work Items, claims, QA, release gate, and rollback. A completed experiment turn does not close a Work Item, and a qualified aggregate does not release software.
