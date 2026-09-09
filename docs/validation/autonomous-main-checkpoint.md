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

The next bounded improvement is reducing repair and requalification overhead,
while retaining complete failure accounting. It requires its own scope and evidence.
