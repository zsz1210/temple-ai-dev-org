# Diagnostic comparison: stopped execution, one complete pair

## Outcome

The approved live experiment actually ran and stopped at stage 6/16 on
`revision-boundary`, not quota, aggregate Tokens, time or a failing product test.
It consumed 363,137 observed Operational Tokens over 615,117 ms (10.25 minutes).
Two complete deliveries passed; the third Builder passed but its Verifier stopped
before running product tests. Ten planned stages were not attempted. Family B
maintenance never started. The whole experiment is inconclusive, not completed.
No retry, fallback, reset, purchase, refill or extra model judge was performed.

Source: `df40202bcc44a97494e67acb2cc743b03ec3a012`.
Protocol: `sha256:c75e1d6b46081c30de8e109ae9f15a400dde0b6a01f12ce71d20cfd3d37a1c25`.
The run and eight-subject evidence manifest passed `verify-seal`. Old sealed
laboratories are unchanged. The consumed approval cannot authorize a rerun.

## All attempted stages

| Subject | Family | Format | Stage | Operational Tokens | Actor seconds | Outcome |
| --- | --- | --- | --- | ---: | ---: | --- |
| 1 | Replication | Full | Builder | 67,115 | 134.437 | Passed |
| 1 | Replication | Full | Verifier | 44,519 | 59.166 | Passed |
| 2 | Replication | Model | Builder | 110,047 | 158.293 | Passed |
| 2 | Replication | Model | Verifier | 44,962 | 63.645 | Passed |
| 3 | Replication | Model | Builder | 63,068 | 161.971 | Passed |
| 3 | Replication | Model | Verifier | 33,426 | 36.306 | Stopped on revision syntax boundary |

The stage warning at 80,000 Tokens is not a hard stop; subject 2 Builder exceeded
that warning but stayed within the aggregate envelope. Subject 3's partial cost
is retained, not dropped from the consumed total. Provider usage is last-observed,
not billing-final; `usage_complete=false` describes the incomplete experiment.

## The only complete matched pair

| Metric | Full subject 1 | Model subject 2 | Model difference |
| --- | ---: | ---: | ---: |
| Operational Tokens | 111,634 | 155,009 | +38.85% |
| Actor seconds | 193.603 | 221.938 | +14.64% |
| Input Tokens | 1,233,387 | 1,156,516 | Lower input volume |
| Cached input Tokens | 1,128,704 | 1,009,152 | Cache uncontrolled |
| Non-cached input Tokens | 104,683 | 147,364 | Higher for Model |
| Output Tokens | 6,951 | 7,645 | Higher for Model |
| Total input + output Tokens | 1,240,338 | 1,164,161 | Not equivalent to Operational Tokens |
| Final acceptance | Pass | Pass | Same measured outcome |

This reverses the direction of the earlier WI-0220 sample. Do not pool them or
claim Model is generally worse: there is only one complete adjacent pair, the
reverse-order pair is incomplete, and cache is uncontrolled. Model's larger
non-cached input component explains the arithmetic, not a causal mechanism.
Smaller representation/total input is not sufficient evidence of lower operational
cost. No default or route should change from these samples.

## Diagnostic observations

Across the six attempted stages, all six completed product-test commands exited
zero and had recognized reporter summaries. Full Builder ran twice; other
completed actors ran once; the stopped Verifier ran none. Thus no test-failure
repair sequence was observed in this run, unlike WI-0220. This does not prove
absence of coding revisions or other work before a passing invocation.

Of 34 observed eligible cat/context-entry command completions, 28 emitted at least
one whole-source observation (76 source events in total). Zero source events were
classified `same-content-again`. The other six command completions did not yield a
matched whole-source event and are not counted as zero-byte reads. This denominator
does not cover every search/range read or all prompt context. No claim that all
source consumption was measured, or that all repeated reasoning was absent, follows.

The current evidence does not support prioritizing removal of repeated whole-file
reads as the cause of this pair's cost difference. Nor can it identify a test-error
class that never occurred. Fresh Verifier reads remain distinct from Builder reads.
No individual command's Token cost is inferred from these observations.

## Stop diagnosis and limits

The rejected event was family `git`, operation `git-diff`, envelope
`zsh-lc-literal`, roles `option` and `git-revision`. The policy's `gitRevision`
accepts only HEAD or a full 40-character lowercase SHA, optionally with the exact
commit dereference suffix. A supplied revision operand did not match that grammar.
Raw arguments were deliberately not retained, so its actual value is unknown.
This is not evidence that the submitted product candidate was wrong or that the
Verifier accessed an external repository.

The same command also has a completed event with exit 0. The event guard observed
and interrupted the actor after a reported command; it is not proof the command
was prevented from executing. Sandbox filesystem boundaries are a separate control.
One command's started/completed rejection events must not count as two failures.

Do not guess a raw command, weaken the policy, or relabel this as a valid delivery.
The full fixed schedule stopped as designed and cannot provide the planned
two-family comparison. The initial generation-free `command-nonzero` probe failure
remains separately disclosed in readiness; its later eight-subject success does
not establish the earlier failure's cause.

## Recommended next work, without a new live run

1. Audit the documented actor command contract against the revision grammar using
   deterministic local tests. Decide whether safe read-only comparison forms are
   missing, or the actor simply violated a clearly stated bound. Do not infer the
   exact unretained operand from this sample.
2. If broader Git syntax is necessary, design a bounded normalization/validation
   rule first, preserving repository/path containment and rejecting external or
   ambiguous expressions. If not, provide precise allowed examples equally to both
   arms and test real installed CLI usage before another approval.
3. Retain Full as default and Model as opt-in. Do not keep adding samples merely
   to recover an expected saving. A further live attempt requires new authority
   and must preserve this stopped result in its analysis.

The authorized attempt is over. Readiness and software checks (687/687) are not
additional live samples. No release or npm publication follows from this report.
