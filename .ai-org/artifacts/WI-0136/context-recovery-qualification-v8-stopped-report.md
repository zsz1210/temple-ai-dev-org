# WI-0136 context-recovery qualification v8 stopped report

## Outcome

V8 completed both Terra medium candidates and then stopped because the full-load candidate could not locate the Coordinator entrypoint from the experiment workspace root. The two observations do not form a valid context-strategy comparison.

- Protocol SHA-256: `c0d4aaefd74419487fd7541f03c4fe1355661df24e1981d2a8897ee371510683`
- Observed and completed conditions: 2 of 2
- Routed recovery: passed, 67,042 Operational Tokens
- Full-load recovery: failed, 24,370 Operational Tokens
- Combined Operational Tokens: 91,412
- Retry and fallback: 0
- Preserved raw stopped record SHA-256: `ea1a7f86ebb4753a964720f0c49f847181f3eb58c34a4da67f99606c82114dae`

Both candidates requested `gpt-5.6-terra` with medium reasoning. Both threads reported high reasoning; effective per-turn effort remained unavailable.

## What happened

The routed candidate recovered all four exact revisions, the governing contract, all three slice IDs, unresolved work, and a bounded next action. Its recorded Operational Tokens were 67,042 and its turn elapsed time was 202,459 ms.

The full-load candidate attempted to read `TEMPLE.md` twice from the experiment root, concluded that the file was absent, and did not run `context resolve`. The file actually existed at `coordinator/TEMPLE.md`. It returned no revisions or governing contract and correctly described itself as blocked rather than inventing repository state.

## Additional harness defect

V8 exposed a second measurement problem: context-sequence telemetry counted command attempts at command start, regardless of command exit status. The routed candidate attempted `context resolve`, but v8 cannot prove from retained telemetry that the command succeeded. The fixture launcher also lacked an explicit local `TEMPLE_CLI_PATH`; because the package is not publicly available, a launcher invocation could otherwise fail while the observer still counted it.

## Interpretation boundary

The 67,042-versus-24,370 numbers are not an efficiency comparison. The full-load condition failed before equivalent recovery work, and the routed treatment was not success-qualified. V8 supports only these conclusions: routed recovery output was objectively correct; full-load setup was invalid; and the old observer was insufficiently strict.

## Corrective action

V9 uses root-relative `coordinator/TEMPLE.md` and `coordinator/templew.mjs` paths, supplies the local pinned CLI path to the isolated App Server, records treatment sequence only from exit-code-zero command completions, and retains separate attempt counters. Its generation-free preflight executes the exact root-relative context command in both matched fixtures and verifies the returned Work Item and Position.
