# Product specification: human-readable Workspace status

## User problem

Temple Workspace currently exposes correct data but makes ordinary users decode internal concepts such as snapshot currency, canonical provenance, freshness quality, and lifecycle enum names. Work Item cards also look like static status rows even though they expand.

## Intended experience

A user opening **Work** can immediately answer:

1. What work is open?
2. What is happening with each item?
3. Which sections or rows can I open for more information?
4. When was the page last updated?

The first reading layer uses everyday product language. Technical traceability remains available one interaction deeper.

## Information hierarchy

### Primary layer

- Work Item ID and title
- one human status lozenge
- visible chevron and `View details` / `Hide details`
- distinct groups for `Testing`, `Waiting for release decision`, and `Planned`
- one quiet `Last updated …` timestamp when data is current

### Detail layer

- workflow stage and responsible role
- supporting evidence and unresolved count
- registered Codex task details
- a nested `Technical details` disclosure for canonical enum, revision, provenance, and freshness

### Exception layer

An outdated or failed refresh is not quiet metadata. It becomes one prominent warning that states the last usable update when known and explains that local actions are unavailable. Existing information remains readable.

## Human status labels

| Observer category | Human label |
|---|---|
| `active` | In progress |
| `blocked` | Blocked |
| `qa_pending` | Testing |
| `approval_pending` | Waiting for release decision |
| `queued` | Planned |
| `terminal` | Complete, Cancelled, or Finished according to canonical state |

## Copy boundary

The primary Workspace may say `source`, `details`, `workflow stage`, `role`, and `last updated`. It should not require the user to understand `canonical`, `projection`, `provenance`, `freshness quality`, or transport mechanics. Those terms may remain in Health, technical disclosures, and operator documentation where they are necessary.

## Acceptance authority

The Work Item criteria in `.ai-org/work-items/WI-0049.json` are the acceptance authority for this gate-evidence item. No new lifecycle rule is introduced.

