# Collaboration rehearsal and closeout analysis

This analysis separates the previous two-account rehearsal, the subsequent
closeout implementation (WI-0250/0251), and this integration. They are not one
controlled before/after benchmark.

## What the rehearsal established

The retained five-case separate-account report records four passes and one pass
after rework. Two physical Macs used different GitHub and Codex accounts, with
one human operator. Both product items reached accepted and the isolated product
integration passed 7/7. This establishes bounded collaboration and recovery paths,
not independent human onboarding or production maturity.

Contributor proposals used their own identity without pretending to be the
manager. Ordinary completion preserved the isolated maturity warning without
failing. Failed diagnostics survived a fresh clone, and origin recovery did not
repeat lifecycle writes. Competing claims named both owners and rejected writes.

The rework was caused by the coordinator requesting a new top-level JSON artifact
after the product candidate, outside the allowed descendant paths. Moving it
later did not undo the intervening history. The guard was correct; the extra
delivery was real orchestration overhead. The wrong context-route argument and
unclear actor readiness were separate usability problems.

Recorded developer-B delivery to PR was about 470 seconds, while its finish command
took 1.234 seconds. A verifier's evidence-writing/orchestration window was 82.308
seconds versus a 0.278-second full toy test command. These windows include AI and
tool coordination; they are not filesystem latency or matched manual baselines.
The 52 local commands totalled 32.409 seconds of process time, not wall time.
Five nonzero exits included intended rejection controls and harness errors.
Provider token usage and billed cost for that rehearsal were not captured.

## What the closeout change established

WI-0250/0251 moved duration/exit/revision/result collection into a deterministic
report operation and distinguished contributor eligibility from task readiness.
On both hosts, one three-test attempt remained exactly one attempt after reuse
and three report exports. Reports did not reexecute tests or grant acceptance.

| Measurement | Local Node 24.20.0 | Remote Node 24.7.0 |
| --- | ---: | ---: |
| Original attempt elapsed | 199.08 ms | 183.09 ms |
| Reuse lookup | 7.11 ms | 43.10 ms |
| Three report exports, range | 66.17-72.30 ms | 125.05-127.19 ms |

These are small-fixture diagnostic observations with three export samples per
host. Different host/runtime conditions prohibit a host-speed claim. The report
operation itself invokes no model; that does not make agent orchestration free.
There is no matched baseline proving end-to-end token or billing savings.

Initial full verification passed 1,288 tests in 266.75 seconds, but distinct remote
QA found a combined-state bug: an active claimant was still blocked by a differing
planned assignment. The correction preserves the plan as a note and gives the
current valid claim precedence. Final full verification passed 1,288 tests in
266.78 seconds. Remote recheck used three affected tests (0.32 seconds wall) plus
an independent combined-case/no-write probe, explicitly reusing unchanged
measurement and package coverage. The second full run was justified by a source
change; duplicate unchanged full verification would not have been.

This is evidence for focused independent challenge, not for adding more review
layers. One passing suite does not establish correctness of every state combination.
The new work also exposed avoidable coordination costs: omitted packaging scope
required a mechanical child item, overlapping claims required sequential repair,
and an absolute evidence link needed correction. Those costs belong in the account.

## Observed reviewer token counters

The remote session was gpt-5.6-sol / xhigh, not a Terra/GPT-6 comparison. Narrow
inspection of its task-start/task-complete and token-count metadata established
that the resumed CLI totals are cumulative: the first resumed total equals the
previous final total plus the resumed request's `last_token_usage` in every field.
No messages containing hidden reasoning or credentials were extracted, and no
quota or reset endpoint was queried.

| Counter | Initial review | Resumed recheck increment | Session total |
| --- | ---: | ---: | ---: |
| Input, including cached | 1,521,108 | 921,503 | 2,442,611 |
| Cached input, subset of input | 1,409,280 | 908,544 | 2,317,824 |
| Uncached input, derived difference | 111,828 | 12,959 | 124,787 |
| Output, including reasoning | 17,721 | 4,646 | 22,367 |
| Reasoning, subset of output | 9,857 | 1,731 | 11,588 |
| Wall time, task start to complete | 825.249 s | 126.282 s | Not continuous |

Raw final counters are preserved in WI-0250's two review records. The metadata
source is remote session `01a0b044-ef77-7f01-af96-11e93d5b2f28`, with turns
`01a0b044-efef-77f3-9e2f-5d788c8dd8fb` and
`01a0b054-9534-7c21-95e7-88e9cbf208b3`. The resumed first request reports input
110,022 / cached 107,648 / output 516, bringing cumulative values to
1,631,130 / 1,516,928 / 18,237. This resolves the earlier counter-semantics
uncertainty without rewriting the historical review report.

Cached input is already included in input and reasoning already in output. Do
not double-add either subset. These aggregate requests repeatedly carry context;
they are not unique prompt size, purchased credits, or an invoice. Billed cost
remains unknown. The initial first token-count event occurred 405.004 seconds after
task start; the metadata alone cannot separate queueing, model latency and runtime
startup. The shorter recheck also did less work, so this is not a causal speedup
estimate for Temple or context reuse.

## Integration and next decision

The integration preserves main's physical-byte/mode safety checks and the older
branch's bounded descendant allowance, including hidden changes and reverted
history. A new combined regression checks hidden physical changes after a committed
handoff. Canonical main WI-0247 stays intact; the colliding recovery record and its
evidence/event delta are archived with immutable source identities, not renumbered
or replayed as current lifecycle facts.

Integration verification added a second substantive reason to retain independent
judgment. After 1,294/1,294 local tests and 101/101 remote affected tests passed, the
remote reviewer independently changed a pre-candidate approved-scope artifact.
The verifier incorrectly accepted it because the own-artifact directory was too
broadly allowed. That candidate was rejected, preserved, and returned to Build.
The correction protects gate authority regardless of its directory, checks its
physical bytes, and limits ordinary artifact additions. The final integration
record separately identifies the corrected candidate and its qualification.

This failure is distinct from the stale error-message assertion that caused one
earlier full rerun. The former is a product defect found by an independent probe;
the latter is test-maintenance overhead that better affected-test selection could
have caught earlier. Passing counts are evidence of covered behavior, not a proof
that all authority combinations are correct. Additional process stages would not
automatically improve this; focused counterexamples did.

The next useful validation is one small task by a genuinely independent teammate,
starting from a qualified version and receiving only the written entry guide.
Record time to first meaningful change, unexplained blockers, help requests,
actual repeated tests, evidence preparation and total delivery time. Keep existing
functional safeguards and distinct acceptance; simplify repeated administration
where those measurements show friction. There is no evidence here that Temple
beats ordinary mode on total cost, nor a reason to add another governance layer.

## Sources

- [Closeout measurement observations](../WI-0250/measurements.md).
- [Initial independent review](../WI-0250/independent-review-attempt-01.md).
- [Corrected independent review](../WI-0250/independent-review-final.md).
- [Qualified closeout report](../WI-0250/report.md).
- [Recovery branch snapshot](recovery-history.json), preserving original paths
  and source bytes. Its comparison/results files retain the earlier repair data.
- The separate-account rehearsal source files are external to this repository:
  `temple-collaboration-rehearsal-2026-09-17/separate-account/report.zh-TW.md`,
  `cases.json`, `metrics.json` and `observations/timeline.jsonl`. A compact,
  provenance-bound measurement excerpt accompanies this analysis.
