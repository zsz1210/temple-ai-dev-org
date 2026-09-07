# WI-0228 — retained reliability acceptance

## Candidate, authority and evidence reuse

Exact Developer candidate: `5aca59ce9058877576c4d06542680fc5f71984b1`,
Developer `agent-rikku`. Reviewer `agent-lulu`, Principal `human`, performs
Quality Evaluator and subsequent distinct-from-Developer Independent QA duties.
Review checkout: `34b5bc80d4eb2c5969240cf17e04aa939bf02a0d`.

[Approved acceptance](acceptance.md) explicitly separates the retained reliability
subset from the rejected Lean prototype. This review confirmed predecessor
WI-0226 is cancelled, with its scope, acceptance criteria and two unresolved
entries unchanged. Its implementation, negative report and bounded Test/Eval
artifact are unchanged since `40fb4de6`. This does not fabricate Independent QA
for WI-0226 or treat cancellation as satisfaction of its efficiency goal.

All six accepted files remain byte-identical to the exact candidate: the
`delivery-command-policy`, `delivery-control-pair` and `evaluation-sequence`
scripts and their corresponding tests. Required native instructions, workflow,
policies and identity authority remain unchanged from the immediately preceding
review. The WI-0211 overlap resolution permits only this successor's evidence
and supported state changes; no shared source is edited.

## Test — passed for the narrowed scope

Reuse this same reviewer's just-completed [61/61 replay](../WI-0226/qa.md):
command-policy, control-pair and evaluation-sequence tests, zero failures,
cancellations or skips, 78346.2855 ms, Node.js 24.20.0. These executed real local
Git and disposable Builder/Verifier lifecycle commands with an injected provider,
not live model generation. No rerun was needed merely for the new Work Item ID.

The [Developer full-suite record](../WI-0226/report.md) supplies exact-candidate
696/696, zero failure/skip/cancel, 171302 ms. The later integrated candidate
`f706239624b3fe9748767ea58128ebf5a2b587ea` supplies
[698/698](../WI-0227/report.md), zero failure/skip/cancel, 172370 ms.
Those are attributed full-suite results, not independently rerun tests. Only
WI-0227's distributed TEMPLE and operating-contract test differ under source,
scripts, tests and distribution from the retained candidate. Six-file equivalence
supports reuse of both full-suite records for the bounded reliability scope.

## Eval — passed for the narrowed scope

The acceptance rows are satisfied by the retained mechanisms and replay:

- Documented read-only SHA prefixes and bounded HEAD ancestors resolve in real
  Git; lifecycle commands still require exact candidate revisions. Rejections
  retain an argument index and fixed category without raw revision operands.
- First rejection, hashed item and event index remain correlated despite a
  trailing exit-code-0 completion. Persisted diagnostics exclude privacy sentinels.
- Observed failed-stage cost remains in a known subtotal. Missing usage and
  incomplete runtime remain incomplete, including simultaneous budget/deadline
  stops. Dependent verification is skipped after failed Build. Independent
  continuation requires the explicit selected policy and confirmed isolation,
  cleanup and applicable validity assertions.
- Shared uncertainty, runtime stops and exhausted limits halt later dispatch;
  persistence failure cannot dispatch another actor. No retries or replacement
  samples are introduced. Historical schedules and sealed experiments are not
  resumed or changed by this helper.

The limitations in the approved acceptance and predecessor review remain binding:
observation/interruption is not OS-level prevention; caller isolation, protocol,
assessment and persistence require separate qualification; optional artifact
digests are syntax-validated rather than independently fetched; known usage is
not settled account or parent/child billing. The helper is not a newly launchable
experiment. No Token, speed, quality or broad efficiency improvement is claimed.
The withdrawn prototype's 90573 → 94969 Full JSON result (+4.85%) and failed
inventory check remain negative evidence, not superseded by this acceptance.

## Independent QA — passed for the narrowed scope

After the supported Test/Eval handoff, Independent QA re-resolved current
authority, claimed as `agent-lulu` (not Developer `agent-rikku`), and rechecked
all six files against exact candidate `5aca59ce9058877576c4d06542680fc5f71984b1`.
No differences exist. The approved successor acceptance, predecessor state and
historical artifacts also remain unchanged during review. Prior source inspection
and the same reviewer's recent replay remain applicable to this exact scope.

The acceptance mapping above preserves exact lifecycle revision authority,
privacy-bounded diagnostics, observed cost and incompleteness, dependent skipping,
explicit continuation and global uncertainty stops. No concrete P1/P2 blocker,
new behavioral claim or lost scope limitation was found. Distinct-from-Developer
Independent QA supports advancing WI-0228 alone to Release Gate. This is neither
historical QA for WI-0226 nor Release Manager closeout or integration approval.

## Boundary

The supported sequential transitions are complete through Release Gate, owned by
`release_manager` / `agent-mog`, with no active claim and no unresolved successor
findings. Compact Status confirms the exact candidate and non-terminal state.
Doctor reports 36 pass, 1 warning, 0 fail: the existing generated parallel plan
is stale and must be rebuilt before future dispatch. No dispatch was performed.

No closeout, integration, source/test edit, experiment, reset, purchase, external
write, commit, push, merge or release was performed. Evidence and supported
lifecycle changes remain uncommitted for coordinator inspection.
