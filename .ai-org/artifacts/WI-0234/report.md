# Continuity experiment: invalid instrument, not an A/B result

## Outcome

The approved comparison started and was stopped after seven requested subjects.
There are **zero valid comparison samples**. The eighth subject never started.
Do not use this run to rank Terra, compare Temple with ordinary work, select a
default workflow, or claim efficiency improvements.

The experiment runner disabled `code_mode_host`, which this installed Codex needs
to dispatch the model's local command tools. Several completed replies explicitly
reported `code-mode host is disabled`. All seven observations contain zero command
executions and zero file changes; the six completed replies did not identify a
current candidate. Some replies nevertheless supplied a SHA and passing-test claim.
Those claims were rejected, not accepted as execution evidence.

## Retained resource observations

| Subject | State | Arm | Observed Operational Tokens | Turn wall time | Usability |
| --- | --- | --- | ---: | ---: | --- |
| 1 | Stable | Ordinary | 10884 | 59.766 s | Invalid instrument |
| 2 | Stable | Temple | 13545 | 24.636 s | Invalid instrument |
| 3 | Stable | Temple | 24597 | 23.276 s | Invalid instrument |
| 4 | Stable | Ordinary | 10319 | 24.693 s | Invalid instrument |
| 5 | Changed requirement | Ordinary | 10222 | 23.577 s | Invalid instrument |
| 6 | Changed requirement | Temple | 13787 | 26.072 s | Invalid instrument |
| 7 | Changed requirement | Temple | 8948 | 24.435 s | Interrupted; partial usage |
| 8 | Changed requirement | Ordinary | — | — | Not launched |

Observed subtotal: **92302 Operational Tokens**, including 83354 from the six
completed turns and 8948 observed before stopping the seventh. Last-turn accounting
is incomplete; this is not a final billed total. Overall harness elapsed time was
216.103 seconds. Turn time includes bounded cleanup. Coordinator development,
offline verification, setup and independent review costs are excluded, not zero.
No purchase, refill, reset, fallback, replacement subject or experiment retry was
performed. Limits were eight subjects, 800000 Operational Tokens and sixty minutes.

## Why the safeguards did not prevent the waste

1. The readiness checks exercised App Server `command/exec`, not the model-facing
   native dispatch host. The direct command route worked under named permissions,
   but this was insufficient evidence that a model could call those commands.
2. The runner treated a completed model turn with a syntactically valid JSON reply
   as completed execution, then treated its absent/current-candidate failure as a
   candidate rejection. It did not stop the batch on the shared tool unavailability.
3. The strict completion schema required a candidate SHA even when the model could
   not execute. A blocked outcome needs its own honest representation; a required
   SHA field is not proof that such a candidate exists.
4. The parent inspected the first candidate rejection after later subjects had
   already started. Manual monitoring was not an adequate substitute for the missing
   automatic shared-validity stop. The parent halted the owned experiment provider;
   the recorded wire stop is consequently `provider-exit`.

These are instrument-design failures. The initial 748/748 offline pass and source
review did not prove the native model-tool route. A narrow positive control cannot
be promoted into a broader runtime-readiness claim.

## Containment and next decision

Both default live entrypoints are now withdrawn with
`native-tool-route-unqualified` before filesystem access or model generation.
There is no flag or environment variable to reopen them. Simulated offline tests
remain available. Frozen protocol and run files were not rewritten after stopping.
The owned App Server exit was confirmed; the final background-terminal query was
interrupted and remains unconfirmed. The private run directory is retained.

Do not rerun this protocol. Before proposing any new model spending:

- qualify the actual native dispatch route, keeping the required host available
  while restricting its real tools; do not merely relax the filesystem sandbox;
- use explicit completed/blocked result variants and require observed execution,
  candidate and test evidence before accepting a completed execution;
- stop automatically after the first missing-tool or unqualified-execution result,
  preserving that cause separately from interruption and cleanup observations;
- provide a supported cancellation channel instead of relying on manual process
  termination, with partial accounting and all-attempt preservation;
- review one end-to-end capability check before authorizing another full matrix.

The current zero-retry approval does not authorize repeating the invalid subjects.
The eight-subject comparative design remains untested, not disproved.

## Evidence identity

- Instrument at launch: `3629933ce0ee811225408515aa9ec09e796a0132`.
- Frozen protocol: `sha256:1e8019c88e912d571104beceeed047ba95a3c7ac86dc0378135466ebd03bc9ce`.
- Sealed run: `sha256:2d787026028867967f1ef62f44c18d9b5b9e3def1025fbd673b3db6269e28f10`.
- Installed provider: Codex CLI 0.153.1; model acknowledged Terra medium.
- Isolated runtime: bundled Node 24.19.0. Full offline suite: Node 24.20.0.
- Prelaunch full verification: 748/748, zero failures/cancellations/skips,
  411406.463041 ms test duration. Package unchanged: 415 files, 895603 packed bytes,
  3510029 unpacked bytes. Doctor: 36 pass, one existing stale parallel-plan warning.
- Actual isolated oracle controls: current requirement passed and stale requirement
  failed in both arms, with no model generation. This qualifies those controls only.

Public evidence omits account identity, private absolute paths, raw prompts and
reasoning. The private protocol, observations and seal remain separate from this
interpretation so the invalid run cannot silently become a new passing experiment.

## Withdrawal verification

Candidate `ace0f073931240495755744c228d14a021f12a86` passed the complete offline
verification: **749/749**, zero failed/cancelled/skipped, 411140.183834 ms test
duration. The new regression confirms both default live entrypoints reject before
filesystem reads, approval consumption or generation. This verifies containment,
not restoration of native tool execution or the validity of the failed comparison.
No matching experiment App Server remained in the post-stop process inspection.
Protocol and run digests matched the retained seal after withdrawal. The final
terminal-list uncertainty remains explicit; process inspection does not erase it.
