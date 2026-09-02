# WI-0094 technical design

## Decision

Compact only the optional Management Console projection at the read-only server boundary.

1. Preserve the complete internal control-plane snapshot for lifecycle logic and local operator APIs.
2. Preserve the organization projection used by the Team and System views, but omit the duplicate Observer evidence, work, learning, attention, and timeline collections that this Console does not read.
3. Preserve live Work Item and task summaries used by the Console, but omit each task's retained Provider `items` history and the duplicate top-level task item collection.
4. Preserve Usage history summaries, totals, driver groups, qualification, unknown-state semantics, and privacy fields unchanged.
5. Keep the existing file-change invalidation and 30-second cache ceiling. A changed file must still cause a fresh projection on the next request.

## Risks and controls

- **Hidden UI dependency:** structural tests assert the required organization, Work Item, task-summary, Usage, condition, and timeline fields remain present. The existing Console tests and browser-facing full verification remain required.
- **Truth loss:** only detail collections not consumed by the read-only Console are omitted. Canonical files, retained telemetry, and the internal control-plane snapshot are unchanged.
- **Stale data:** no cache or watcher semantics change. Existing invalidation coverage remains authoritative.
- **Scope drift:** WI-0033 retains provider trust and executable/credential policy. This work changes only the read-only projection assembled after those providers have already been observed.

## Rollback

Restore `managementConsoleSnapshot` to cloning the complete internal snapshot before redaction. No data migration or retained-state rollback is required.

