# Small-task overhead: composition audit and next intervention

## Decision

Keep the rejected WI-0226 operation-module prototype withdrawn. The next design
target is the **always-loaded operating contract**, not another JSON format, a
model change, a new Position, or removal of independent verification. The current
contract mixes universal safeguards with procedures for operations that an ordinary
bounded Build/Test task does not perform.

This is a design follow-up, not an adopted instruction change. Current complete-read
obligations remain in force. No live generation ran. WI-0226 still awaits formal
Test/Eval of its retained reliability subset.

## Measurement basis

Source revision: `f56b8512`. Runtime: Node.js 24.20.0. One fresh local fixture from
`test/helpers/lean-delivery-fixture.mjs`, with its actual CLI setup, product checks,
and supported Developer delivery into Test. Both stages were eligible under current
`enterWorkItemContext`; Test used the fixture's different Verifier Identity.
The fixture's integration record was left unchanged. This differs from WI-0226's
earlier explicitly confirmed integration fixture; do not subtract across reports.

For each stage, compare stage material, task material, and stage material with
`AGENTS.md` / `TEMPLE.md` supplied through existing available-whole-source support.
The fixture driver acquired both whole bodies before declaring their availability.
This simulates current-context availability, not a model's reading or comprehension.
All variants used the same stage state. No source bodies or private host paths are
retained in this report. Fixture temporary paths, timestamps and recorded test
durations can vary; these values describe this single invocation.

Count UTF-8 bytes of two-space JSON, without the CLI's trailing newline. Model
output is the existing `modelContextView` applied to that same result. No Token,
latency, cache, quality or paid-account measurement is inferred from bytes.

| Existing mode | Builder full JSON | Verifier full JSON | Builder model JSON | Verifier model JSON |
| --- | ---: | ---: | ---: | ---: |
| Stage, cold | 89,622 | 94,476 | 84,789 | 88,987 |
| Task, cold | 89,267 | 94,434 | 84,434 | 88,945 |
| Stage, two bodies already available | 68,862 | 73,716 | 64,029 | 68,227 |

The availability declaration itself adds 209 compact JSON bytes to the request,
excluding common command syntax. The tool-output reduction is 20,760 bytes per
stage; net of that declaration it is 20,551 bytes. First acquisition still costs
input and must be counted for a cold actor. A fresh Verifier cannot inherit the
Builder's availability claim. These are **existing capabilities**, not a new gain
delivered by this work. In this small inventory, task material alone saves only
355 bytes for Builder and 42 for Verifier relative to stage; it can behave
differently in a larger organization.

### Where the bytes go

Builder raw source-body strings total 60,051 bytes. Replacing every emitted body
with null in a measurement-only clone leaves 25,832 bytes of JSON structure,
provenance, selection and navigation. The serialized body contribution is 63,790
bytes, including JSON escaping: 63,790 + 25,832 = 89,622. The null-body clone is not
a usable packet and is never returned to an actor. The remaining envelope is not
automatically redundant or safe to remove.

Verifier: 62,272 raw body bytes; 66,173 serialized body contribution; 28,303-byte
null-body envelope; total 94,476. Do not add raw body bytes to serialized envelope
bytes as though they used the same accounting basis.

| Largest Builder sources | Body bytes | Interpretation |
| --- | ---: | --- |
| `TEMPLE.md` | 14,752 | Whole operating contract |
| `AGENTS.md` | 7,086 | Whole native instruction entrypoint |
| `temple.lock` | 6,573 | Already a structured exact-entry projection, not the full lock |
| Collaboration | 5,732 | Membership, sponsorship and related policy |
| `temple-work` Skill | 5,108 | Whole lifecycle procedure router |
| Workflow | 4,468 | Profile, gate and escalation definitions |
| Usage policy | 4,150 | Budget/authority and routing boundaries |
| Lean execution reference | 3,650 | Whole Build/Test procedure |

The two entry documents contain 21,838 bytes. Together with the Skill and Lean
reference, instruction bodies total 30,596 bytes. This identifies a review target;
it does not establish that those bytes are all duplicate or removable.

## Obligation map for the next candidate

Do not split by heading alone: the current initialization section also contains
ordinary handoff rules, and the tracker section contains general evidence/telemetry
boundaries. A heading-based filter would hide rules needed outside that heading.

| Obligation | Keep always available | Procedure loaded when needed | Required preservation check |
| --- | --- | --- | --- |
| Authority and identity | Repository authority; Position/Identity separation; no inferred approval | Current actor/sponsor records | Ineligible or same-Identity verification rejected |
| Scope and acceptance | Approved scope, exact ownership, applicable gates, unresolved work | Named current contracts and evidence | Stale scope/candidate and overlapping claims remain visible |
| Initialization | Pending bootstrap blocks governed mutation; provider loading is not proven | Full bootstrap procedure for a current init/pending merge | Fresh and continuity paths retain explicit reads and checks |
| Delivery | One exact-candidate evidence result; normal independent review | Current lifecycle operation in existing `temple-work` references | No duplicate narrative required; no self-certification |
| Parallel work | Ordinary sequential work needs no dispatch plan; overlap still coordinates | Existing parallel reference only before actual dispatch | No worker launch from rejected/stale plans |
| Trackers and telemetry | Observations never grant authority or prove acceptance | Existing tracker/observer procedure for those operations | No external write or completion inferred |
| High-Assurance and UI | Consequence/profile and UI triggers cannot be bypassed | Applicable risk/UI procedure before relevant mutation | Out-of-scope tasks escalate before work |
| Learning | No automatic promotion of a single lesson | Capture/revalidation procedure when changing learning | Lookup remains bounded; promotion intentional |
| Integration and experiments | No implied merge/release/publication or extra experiment | Applicable project integration or frozen experiment protocol | Stop at approved outcome; no retries or provider calls added |

### Selected implementation slice

1. Refactor the managed operating contract and its native routing instructions
   together. Retain a short universal contract plus explicit applicability rules;
   reuse existing authoritative procedure references rather than creating a new
   family of operation modules. Every removed paragraph must map to a retained
   safeguard or a named, correctly triggered procedure. Do not shorten text merely
   by deleting qualifications.
2. Preserve project-owned entrypoint modifications and exact managed-file ownership.
   Older installations continue reading their existing whole contract until a
   reviewed upgrade applies the new version. No runtime selector may silently
   omit parts of an old or independently required whole-source contract.
3. Measure total first-entry + required follow-up reads for both cold Builder and
   fresh Verifier. Include new routing/provenance overhead and recovery/exception
   paths. Compare against the same installed fixture, not just the shortened file.
4. Reject the candidate if normal cold delivery does not reduce complete required
   input, or any authority/acceptance/recovery obligation loses its destination.
   Report extra reads on exception paths rather than hiding them. No arbitrary
   Token target is set from this byte audit.

This is more substantial than moving half a procedure to another file: it changes
which specialized procedures are obligatory for a given operation. It therefore
needs instruction/upgrade regression coverage and separate semantic review before
adoption. The current source has not been changed to implement this slice.

## Administrative duplication: act on evidence, not suspicion

- Existing Lean `finish` already composes lifecycle administration and full
  diagnostics. Do not rerun Status/Doctor solely to repeat its fresh successful
  receipt. Changed state or a failed diagnostic still requires the appropriate check.
- Keep one substantive result and reference it from the generated handoff. A claim,
  a handoff, and a result serve different purposes; counting three artifacts is not
  proof of three redundant reports.
- Full repository verification belongs on a final behavioral candidate. A new role
  alone does not invalidate unchanged evidence. The independent reviewer still
  needs its own acceptance judgment and any risk-focused reproduction.
- This audit observes one entry and one handoff, not a live Agent's repeated reads
  or repair loop. It does not attribute prior operational Tokens to duplicate
  administration. Preserve that uncertainty until observations establish a cause.

## Reproduction and stop condition

Use the named fixture at the pinned source. Acquire entries through
`src/context-enter.mjs` for `developer` and then `quality_evaluator`, performing
`cli(deliveryArgs(f))` between them. For each, hold Work Item, Identity, Principal
and stage constant; compare default stage, `material: "task"`, and
`availableWholeSources` containing the two acquired path/source-SHA256 records.
Measure the complete object and its existing Model view. For envelope accounting,
clone the cold object, replace only each `packet.sources[].body` with null, and
subtract its serialized byte count. Always clean the disposable fixture in finally.

The executed assertions required eligible acquisition, unchanged source hashes,
null bodies only for the two declared sources, and identical remaining bodies.
The bounded audit stops here: measured composition, selected intervention and its
preservation checks. No new runtime format, model test, policy default, publication,
or formal acceptance was added.
