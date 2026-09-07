# Fresh takeover comparison: repaired native runner

## Decision

The repaired instrument completed all eight planned subjects. Both approaches passed
the same product oracle in **4/4 subjects**. Temple also completed its four required
Developer-to-Test handoffs, but consumed **3.47 times the Operational Tokens** and
had **32.7% greater mean measured turn time** overall.

For this small, fully specified takeover, the tested Temple route did not demonstrate
a correctness advantage that offsets its extra work. Do not promote it as an
efficiency improvement. This supports prioritizing proportional small-task execution
and reducing repeated context/administration, not changing models or running more
of the same samples immediately.

This is a bounded diagnostic, not a general verdict on Temple, statistical proof,
or authorization to change the default workflow.

## Experiment and integrity

- Four matched pairs: two with stable requirements, two with an intentionally stale
  predecessor handoff and a newer current requirement. Order is counterbalanced.
- Model acknowledged: **gpt-5.6-terra, medium**, one fresh Build turn per subject.
  Same product facts, protected files, tools and sandbox boundaries in both arms.
- Ordinary work uses repository reading, Git, testing and a structured handoff.
  Temple additionally loads its organization instructions and completes Lean Build
  bookkeeping into Test. This tests that specific route, not every optional Temple
  route, model or project size. Initialization/setup costs are not in actor totals.
- Each exact current candidate passed 46 oracle input vectors plus the applicable
  public/additional regression suite in a separate sandbox. No model self-report
  was accepted as proof of product correctness.
- Eight subjects completed, all usage observations complete, all owned provider exits
  confirmed and terminal lists empty. No stop, retry, replacement, fallback, reset,
  purchase or refill. Postflight found no matching owned experiment App Server.
- **341927 Operational Tokens**, versus the approved 800000 ceiling. Whole harness
  elapsed **1060.229 seconds (17m 40s)**, versus sixty minutes. Each subject stayed
  below 100000 Operational Tokens and eight minutes.

The [invalid v1 run](report.md) is preserved separately: its 92302 observed Tokens
are not part of these comparisons, and its last subject accounting remains incomplete.
Including that failed batch gives a recorded subtotal of 434229 Operational Tokens,
not a complete billed total. Coordinator development/review and offline checks are
also excluded from subject totals, not free or zero-cost.

## Results by situation

Each mean below has only two subjects per arm. Time is the measured model turn plus
bounded cleanup; it is not token-generation speed or full organizational delivery time.

| Situation | Product correctness, ordinary / Temple | Mean Operational Tokens, ordinary / Temple | Token change | Mean seconds, ordinary / Temple | Time change |
| --- | --- | ---: | ---: | ---: | ---: |
| Stable requirements | 2/2 / 2/2 | 23288.5 / 74033 | +217.9% | 75.24 / 160.25 | +113.0% |
| Changed requirements | 2/2 / 2/2 | 14991.5 / 58650.5 | +291.2% | 148.36 / 136.50 | -8.0% |
| Overall | 4/4 / 4/4 | 19140 / 66341.75 | +246.6% | 111.80 / 148.38 | +32.7% |

The apparent changed-requirement time advantage is not consistent across pairs:
ordinary took 238.490 seconds in pair 3 but 58.236 in pair 4; Temple took 140.979
and 132.018. Do not turn this small, variable sample into a speedup claim. Temple
used more Operational Tokens in every pair.

## Every subject

| Pair | Situation | Arm | Operational Tokens | Turn seconds | Completed commands | Product oracle | Frozen strict handoff predicate |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| 1 | Stable | Ordinary | 29411 | 92.290 | 7 | Pass | Pass |
| 1 | Stable | Temple | 64673 | 159.435 | 12 | Pass | Reject |
| 2 | Stable | Temple | 83393 | 161.071 | 15 | Pass | Pass |
| 2 | Stable | Ordinary | 17166 | 58.196 | 6 | Pass | Pass |
| 3 | Changed | Ordinary | 19927 | 238.490 | 6 | Pass | Pass |
| 3 | Changed | Temple | 60341 | 140.979 | 13 | Pass | Reject |
| 4 | Changed | Temple | 56960 | 132.018 | 12 | Pass | Pass |
| 4 | Changed | Ordinary | 10056 | 58.236 | 5 | Pass | Pass |

### Separate product correctness from handoff formatting

The frozen predicate additionally requires an empty `unresolved` array. Subjects 2
and 6 placed a routine next-owner/later-QA boundary statement there while explicitly
reporting no implementation issue. Both passed the product oracle and completed
Temple administration. The frozen outcome remains **ordinary 4/4, Temple 2/4**;
it has not been silently rescored.

Post-run interpretation: these two rejects identify ambiguous handoff semantics,
not observed product defects. Future schemas should separate real blockers from
`next_position` and `out_of_scope`. Validate that fix offline against both benign
handoff statements and genuine blockers before another comparison. Never teach an
Agent to hide unresolved risks merely to obtain a passing score.

## What to improve next

1. **Prioritize the small-task route.** Keep responsibility, authorization, protected
   scope, exact revision and necessary tests. Avoid forcing every small change through
   the broadest context-reading and reporting path. Reuse the existing context-entry
   and Lean mechanisms where eligible; do not create a new permanent Position just
   to bypass governance. This experiment did not test all those optional routes.
2. **Separate handoff fields.** Fix the blocker/next-owner distinction above. Preserve
   the current results and test the evaluator with labelled offline fixtures first.
3. **Measure the remaining overhead before removing it.** Temple issued 52 completed
   commands versus 24 for ordinary work. That establishes extra execution, but command
   counts alone do not prove which reads or operations caused the Token difference.
   Capture only bounded command categories and context-byte counts in a future
   instrument; do not collect raw prompts or reasoning to obtain this breakdown.
4. **Automate deterministic records, retain human judgments.** Revision, test exit
   code, scope and evidence references can be captured once and reused. Approval,
   unresolved risks and independent acceptance must not be inferred from those facts.
5. **Do not spend another batch yet.** First make a bounded workflow/schema improvement
   and pass offline fixtures. Any later live comparison should change one factor,
   retain the same task/model/oracle, and use an approved new protocol. A more complex
   continuity stress case is a separate question, not a way to rescue this result.

## Measurement limits

Operational Tokens = input minus cached input plus output. Reasoning Tokens are a
subset of output and are not added again. This unit is not Credits or money. The
[sanitized observations](comparison-v2.json) retain each component, exact candidate,
cleanup outcome and original strict score.

Provider caching was observed, not reset or experimentally controlled. Both orderings
were used, but two repetitions per situation cannot remove provider/cache variability
or establish statistical significance. Commands and turn times measure Build takeover,
not later Independent QA, integration, long-term maintenance or enterprise coordination.
The harness took 12.169 seconds beyond summed subject elapsed times; preparation,
instrument repairs and full local verification are outside that harness interval.

The first planned subject supplied the actual native-tool canary: seven completed
commands and an accepted current candidate. All later subjects were checked before
the next dispatch. This restores the failed instrument's observed route; it does not
claim a universal sandbox certification. The oracle's legacy `live_sandbox_qualified`
field remains false because the pure fixture never self-certifies a provider boundary.

## Evidence

- [Repair and verification](native-repair.md): candidate
  `87466e5d298efee0479e0499fddba8ce7aecaef8`, complete offline verification **754/754**.
- Frozen v2 protocol:
  `sha256:73fd8ea310fd7f8785c4c54eba2451bbd71aa7fe282e3cc0060e22093b66f887`.
- Sealed run:
  `sha256:c8be1d4a36aaa697b3e50f694b16c721bb66ac77a55b6f4ab2d952e9c1e6e356`.
- Protocol and run hashes matched the seal after completion. The private originals
  remain unchanged; the public-safe extract excludes host paths and account identity.

This report completes the approved experiment and its analysis. It does not publish,
merge, release, retune global policy or begin another experiment.
