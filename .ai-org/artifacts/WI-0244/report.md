# Small-task cost audit: what the evidence can actually tell us

## Decision

**No specific redundant Lean operation has been established in WI-0242. Do not
remove workflow safeguards or claim a cost reduction from this audit.** The one
implemented improvement explains future unknown classifications with bounded,
privacy-safe reason counters. It improves diagnosability, not observed efficiency.

## Retained observations

The original protocol and run digests still match their seal. Inspection used
only the retained synthetic experiment and its Git records, not unrelated account
or task history. [Audit data](audit.json) separates observations from unknowns.

| Question | Finding | Limit |
| --- | --- | --- |
| Was exactly the same command repeated? | 14 completed events, 14 unique command/cwd hashes | Different spellings can still repeat semantic work; timestamps are not per-command CPU duration |
| Were formal delivery operations duplicated? | One claim, handoff, release and transition; one evidence artifact and finish receipt | This says nothing about extra read-only/status/preview commands |
| Were optional normalized evidence entries added? | None in the recorded delta | Unlike an older attempt, that specific extra-registration pattern is absent |
| Where did command output go? | 96,689 of 100,487 observed bytes belong to unknown commands | Output bytes are not Tokens and cannot establish waste |
| What did the failed command do? | One nonzero exit | The command body/cause is unavailable in the sealed export |

The retained ledger intentionally stores command/cwd hashes, not raw command or
output bodies. Consequently the twelve unknown commands cannot be reclassified
from that evidence. We did not search unrelated provider history to bypass this
boundary. Work Item/receipt files establish durable outcomes, not the complete
execution/read sequence. Semantic rereads, unnecessary preparation and individual
operation Token cost remain unknown.

## One narrow improvement

The observation record is now v3 and adds six fixed reasons for commands that
already fall into `unknown`:

- command unavailable or not text;
- command above the existing length limit;
- outer command outside the literal parser;
- unsupported shell-wrapper shape;
- shell body outside the literal parser;
- otherwise unsupported literal command.

Each reason gets a count and observed-output-byte sum. This distinguishes missing
telemetry from parser limitations without retaining raw inputs. A non-literal
reason does not distinguish safe chaining, expansion, malformed syntax or harmful
behavior, and never grants execution permission. All original classifications
remain unchanged; complex scripts are not split or assigned speculative actions.

The existing event count, duplicate-ID, missing-ID, command length and output caps
still apply. Missing/capped output remains explicitly signaled by the existing
availability counters; a reason's zero observed bytes is not proof of no output.
Two six-key maps do not grow with command content. No per-command trace, new
prompt, installed integration, Console requirement or raw-data retention is added.
Old v2 evidence stays v2; missing reason maps must not be interpreted as historical
zero counts or filled by replaying absent command strings.

## Offline measurements and limitations

An ordered synthetic 10,000-event replay produced identical legacy category,
byte, deduplication and availability fields. Both versions classified 7,500 events
unknown; the new version explains their parser coverage reasons rather than
pretending to recognize more operations. Serialized state grew from 510 to 927
bytes, **417 bytes** for this corpus. The single local timing sample was 6.679 ms
before and 7.628 ms after, not a general performance guarantee. See
[offline check](offline-check.json). No provider or model was contacted.

## What remains before workflow tuning

The current evidence does not justify another Position, another router, mandatory
previews or removing verification. Keep the existing Lean path. First identify
a concrete operation-level cost from a separately authorized, privacy-reviewed
observation where those facts exist; do not rerun a full comparison merely to
populate counters. The unchanged 62,917 Operational Tokens still belong to the
old completed attempt, not this diagnostic improvement.

If a later live sample is approved, its frozen instrument must include the new
record version and still name the decision it can change. Changed-spec coverage
remains missing. No live preparation/run, Learning promotion, policy change,
merge or release was performed by this audit.
