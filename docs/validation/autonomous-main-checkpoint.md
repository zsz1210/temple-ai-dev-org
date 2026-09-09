# Autonomous delivery main checkpoint

This checkpoint consolidates the optional shared execution entry, delivery reports,
compact operating instructions, provider framing repairs, and repository-only
evaluation instruments. It is a source integration checkpoint, not an npm release
or a change to the default workflow profile.

## Delivery behavior

The [shared autonomous entry](../operations/autonomous-delivery.md) lets an eligible
Developer choose implementation methods within an approved scope. Programs perform
fixed checks and administration; an eligible reviewer supplies the required
verification. Standard and High-Assurance keep their named gates and independent
identities. High-Assurance keeps its risk and Human Principal requirements.
Organizational Done does not authorize deployment or an external action.

The individual CLI remains available for explicit stage work and recovery. Scope,
authority or revision drift invalidates automatic continuation. Failed checks,
interrupted sessions and incomplete usage coverage remain visible in reports.
The Console distinguishes canonical lifecycle completion from completion of a
common-entry session; partial timing is not presented as completed delivery time.
See [ADR-0065](../adr/0065-unified-autonomous-delivery.md) for the preserved contracts.

## Bounded observations

The local paired-entry diagnostic recorded 12 terminal observations: 11 accepted
and one instrument-invalid observation. There were no unrun cells or product repair
rounds. Four fresh-process handoff resumptions completed. A source repair divided
the observations into two segments; the invalid observation was retained.

Five pairs were valid for comparison within the same source segment. Both arms
used Temple Standard: **individual Temple CLI operations** versus **Temple's shared
autonomous entry**. There was no ordinary Codex arm without Temple. Builders used
GPT-6 Astra Medium and blind reviewers used GPT-5.6 Terra Medium.

| Measurement across five valid pairs | Individual Temple CLI | Shared autonomous entry |
| --- | ---: | ---: |
| Coordinator operations | 140 | 70 |
| Temple CLI invocations | 125 | 70 |
| Summed delivery elapsed time | 863,644 ms | 881,402 ms |
| Observed operational tokens | 239,240 | 227,825 |
| Gross input tokens | 652,039 | 704,170 |
| Cached input tokens | 440,448 | 504,704 |
| Output tokens | 27,649 | 28,359 |

Operational tokens mean non-cached input plus output. Cache was uncontrolled, so
these descriptive observations do not establish causal token savings. The shared
entry reduced fixed coordination in this diagnostic but was slightly slower in
the accepted pairs. One invalid observation left the six-of-six common-entry
acceptance criterion unmet. Retain the entry as a candidate; these observations do
not justify a default migration, universal efficiency claim or a monetary estimate.

The original local Work Item journals retain exact revisions, failures and detailed
accounting. They are intentionally outside this public projection. This summary is
a maintainer-reported diagnostic, not a publicly reproducible live-run receipt.
Unknown call and outer coordination usage remain unknown.

## Reusable validation and experiment preparation

The [evaluation catalog](../../scripts/evaluation-catalog/README.md) separates
scenario complexity, risk, process modes, models and revisions as data. Its offline
planner and qualification tests do not authorize generation. Before any future live
comparison, freeze the question, acceptance, models, modes, repetitions, cache
interpretation, and full verification/repair/cleanup reserves.

Historical live runners under `scripts/` may require original approved local Work
Item artifacts and revisions. A public checkout does not include that authority and
is not launch-ready merely because those runners exist. Do not replace missing
approval records with the offline fixtures. The learning-review test inputs under
`test/fixtures/learning-review/` preserve budget and scenario regression contracts
without importing instance-specific authority.

For source validation, run `npm ci`, then `npm run verify`. The Console browser
gate is `npm run test:browser`; the delivery-panel gate is
`node scripts/verify-delivery-panel-browser.mjs`. Both browser gates use local
Chrome. The delivery-panel gate creates temporary synthetic records and exercises
the real local API; it does not depend on historical Work Items. Validation output
and screenshots are local artifacts, not part of the public source checkpoint.

The delivery-panel gate waits for the mobile sidebar to finish closing before
capture. This removes the need for the checkpoint's separate capture-only waiting
wrapper. A navigation failure still times out; layout, API and content checks remain
unchanged. This is a bounded evidence-quality fix, not measured model-cost savings.

## Disposition of earlier research proposals

After the main checkpoint, the maintainer authorized resolving the remaining four
research merge proposals. Their original branches and observations remain available;
closing a proposal does not mark its stopped experiment accepted or publish its local
authority records as framework policy.

| Earlier proposal | Disposition | What remains applicable |
| --- | --- | --- |
| [PR #74](https://github.com/zsz1210/temple-ai-dev-org/pull/74): continuity comparison design | Archive the original design-only merge proposal. Its reusable fixture and runner work has progressed into the checkpoint. | Give ordinary and Temple arms equivalent product facts and competent handoffs; distinguish stable takeover from changed requirements and Build-stage acceptance from full delivery. A future run still needs a new frozen protocol. |
| [PR #81](https://github.com/zsz1210/temple-ai-dev-org/pull/81): stopped instruction comparison | Archive as an inconclusive historical observation. | Preserve budget-censored rows, observed lower bounds and unrun subjects. The completed ordinary row cannot establish superiority over an incomplete Temple row. |
| [PR #82](https://github.com/zsz1210/temple-ai-dev-org/pull/82): evidence reuse and scoped Learning | Archive the project-instance merge proposal; retain its inventory and project-local Learning in the original branch. | Check historical evidence compatibility before paying for new observations. Reuse is conditional and descriptive; do not pool incompatible contracts or promote a project Practice to a framework-wide default. |
| [PR #83](https://github.com/zsz1210/temple-ai-dev-org/pull/83): Learning loop and stopped compact trial | Archive the stopped trial and defer the automatic Learning-loop design. Later runner repairs are already covered by the checkpoint. | Retain the original instrument rejection separately from post-hoc validation. Outcome receipts, deduplication, applied-guidance tracking and automatic retrospective execution remain unimplemented proposals. |

This disposition does not install a background reviewer, add a mandatory model call
after every Work Item, activate a Practice, change Learning schemas or select a new
default workflow. Existing [Engineering Learning](../extensions/engineering-learning.md)
keeps its explicit validation and promotion boundaries. A future Learning feature
must demonstrate a concrete retrieval/application gap and bounded overhead before
implementation; the old draft's existence is not enough to restart it.
