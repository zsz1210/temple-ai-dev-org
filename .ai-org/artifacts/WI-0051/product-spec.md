# Product specification: instrumentation-pilot repository

## User problem

Temple's usage surface can describe exact Work Item and task correlation, but the current host has not produced a provider-owned detailed Token observation for a registered active task. Before building a multi-repository benchmark, the measurement path needs one minimal real task whose scope and outcome are easy to verify.

## Pilot repository

- Project name: Temple Instrumentation Pilot
- Project ID: `temple-instrumentation-pilot`
- Location: `<LOCAL_HOME>/Documents/ChatGPT/temple-effectiveness-lab/instrumentation-pilot`
- Data: synthetic only
- Interface: none (`not-applicable`)

## Synthetic product behavior

The repository exposes a dependency-free Node.js function:

```text
summarizeAvailability(items) -> {
  total,
  available,
  reserved,
  outOfStock
}
```

Each item is an object with a `status` value of `available`, `reserved`, or `out_of_stock`.

### Acceptance rules

- An empty array returns zero for every count.
- Valid items produce deterministic total and per-status counts.
- A non-array input fails with a clear `TypeError`.
- A non-object item or unsupported status fails with a clear error.
- The implementation has no runtime dependency and performs no I/O or network access.
- Node's built-in test runner covers the success and rejection paths.
- A short README example matches the tested API.

## Instrumentation outcome

The task is successful as a product candidate when the acceptance rules pass. The instrumentation pilot is separately classified as:

- `observed`: a detailed provider usage event matches the exact repository Work Item, registered task, Position, model, and candidate revision;
- `partial`: an event exists but at least one required dimension or Token field is unavailable;
- `unavailable`: the provider bridge cannot produce a correlatable detailed event within the fixed task boundary.

All three are valid experimental outcomes. Zero observations mean unavailable, not zero Tokens.

## Stop boundary

After one task result, one observation attempt, exact verification, and Independent QA disposition, freeze this sample. Do not add another feature, create another task, change models, or begin the four-repository rehearsal.

## Authority

The confirmed names and budget in `human-approval.md`, the Work Item criteria in `.ai-org/work-items/WI-0051.json`, and this specification govern the pilot. Chat titles and task completion alone do not establish acceptance.

