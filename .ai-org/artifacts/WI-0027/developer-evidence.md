# Developer evidence — WI-0027

- Candidate revision: `591b4369ee385037a50f71e3f8651a6b15a5694d`
- Focused Observer and live-control-plane tests: 20/20 passed
- Full repository verification: 195/195 passed
- Repository checks: 93 overlay files and 10 Positions passed
- Documentation link checks: passed
- Runtime schema validation before candidate commit: 46 documents against 24 schemas, zero errors
- Doctor before candidate commit: 35 pass, 1 expected stale-plan warning, 0 fail

The Observer now selects top-level `tested_revision` before earlier candidate references. Historical evidence keeps its revision-stale classification for audit and metrics, while terminal Work Items no longer turn that history into current stale-evidence attention or conditions. Nonterminal stale evidence remains actionable.

