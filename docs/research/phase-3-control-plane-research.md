# Phase 3 control-plane research

- Status: Research snapshot for design review
- Researched: 2026-08-30
- Scope: Local real-time observation, replay, approvals, and read-only GitHub evidence

## Research question

What can Temple safely promise in a local real-time control plane without turning generated telemetry into project truth, assuming unsupported Codex Desktop integration, or weakening existing approval boundaries?

This review used primary specifications and official product documentation. It is a design input, not implementation or validation evidence.

## Findings

### Codex exposes a strong managed-session protocol, not a universal Desktop event bus

The official [Codex App Server documentation](https://learn.chatgpt.com/docs/app-server) describes a bidirectional protocol with thread, turn, and item primitives; streamed plan, diff, token-usage, completion, and approval events; and thread history reads. The [Codex SDK documentation](https://developers.openai.com/codex/sdk/) also supports starting, continuing, and resuming programmatic threads.

These sources are sufficient for a Temple-managed Codex provider. They do not establish that an independent process can attach to every task already running in Codex Desktop and receive its complete live event stream. The provider must therefore advertise capabilities instead of Temple presenting unavailable data as complete.

### The upstream protocol does not provide Temple's replay contract

App Server exposes persisted thread reads and terminal item notifications, but its documented notifications do not define a durable consumer cursor that Temple can acknowledge and replay after disconnection. Temple must assign its own local cursor, journal normalized events, and reconcile the provider snapshot after reconnect. A completed item is authoritative; transient deltas are display aids.

### Stable source identity is the right deduplication boundary

The [CloudEvents specification](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md) defines `source` plus `id` as the unique identity of an event and permits consumers to treat a repeated pair as a duplicate. Temple can reuse that identity rule without adopting a CloudEvents transport or service dependency.

The [W3C Trace Context recommendation](https://www.w3.org/TR/trace-context/) provides an interoperable `trace-id` and parent relationship. Temple should make trace correlation optional so a future OpenTelemetry adapter can map into the event model without making distributed tracing a Phase 3 dependency.

### Occurrence time and observation time must remain distinct

The stable [OpenTelemetry Logs data model](https://opentelemetry.io/docs/specs/otel/logs/data-model/) distinguishes the time an event occurred from the time it was observed and supports trace, resource, and attribute correlation. Temple needs the same distinction because repository events, provider events, and GitHub observations can arrive late or out of order.

The OpenTelemetry [generative-AI semantic conventions](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/) also treat model inputs, outputs, tool arguments, and results as potentially sensitive. Temple should not store prompts, hidden reasoning, raw command output, tool arguments, or tool results in its telemetry journal by default.

### Browser streaming needs a resumable read channel, not a second control protocol

The [WHATWG Server-Sent Events specification](https://html.spec.whatwg.org/dev/server-sent-events.html) defines automatic reconnection and `Last-Event-ID`. Phase 3 is predominantly server-to-browser observation, so local HTTP plus SSE is simpler than adding a browser WebSocket protocol. Human actions can use ordinary authenticated POST requests.

### Alerts should be stateful and actionable

Prometheus [alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/) distinguish pending and firing states and support a `for` duration to avoid noisy transient alerts. Its [alerting practices](https://prometheus.io/docs/practices/alerting/) emphasize actionable, symptom-oriented alerts.

Kubernetes API conditions include status, reason, message, last transition time, and observed generation in its [custom-resource definition](https://kubernetes.io/docs/reference/kubernetes-api/apiextensions/custom-resource-definition-v1/) model. Temple can use a smaller equivalent condition model so an alert reveals whether it was calculated from the current revision or stale state.

### GitHub observation can be read-only and revision-bound

GitHub provides read endpoints for [pull requests](https://docs.github.com/en/rest/pulls/pulls) and [check runs for a Git reference](https://docs.github.com/en/rest/checks/runs). [Conditional requests](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api#use-conditional-requests-if-appropriate) allow ETag-based polling without repeatedly transferring unchanged data. The adapter must bind a PR and its checks to the exact head SHA and must not turn an observation into accepted gate evidence automatically.

### A local journal can be shared by linked worktrees without entering Git history

Git's [`rev-parse --git-common-dir`](https://git-scm.com/docs/git-rev-parse) identifies the repository directory shared by linked worktrees, and [Git worktree documentation](https://git-scm.com/docs/git-worktree.html) describes the common repository administration area. A default state path below that common directory lets local worktrees share one generated control-plane journal while keeping high-frequency telemetry out of commits. A configurable state path remains necessary for nonstandard environments.

## Design consequences

1. Repository Work Items, evidence, approvals, policies, and the canonical audit stream remain authoritative.
2. Provider telemetry is generated, local, rebuildable, capability-labelled, and never satisfies a gate by itself.
3. A Temple-managed App Server connection may provide live plans, diffs, items, token usage, and runtime approval requests. Existing Desktop tasks receive only the capabilities that a supported provider can prove.
4. The control plane owns a monotonic local cursor and reconciles snapshots after reconnect; it does not claim upstream exactly-once delivery.
5. Every view shows provenance, freshness, revision, and capability quality.
6. Runtime permissions, business answers, and governance approvals use separate request types and authority paths.
7. GitHub remains a read-only evidence source in Phase 3.
8. Raw model or tool content is excluded by default; summaries and metadata are preferred.

## Evidence gaps retained for implementation

- Verify the exact App Server schema and event behavior against a pinned Codex version during implementation.
- Test resume, interruption, process crash, provider restart, and an approval request that becomes unanswerable during disconnect.
- Confirm filesystem and lock behavior for linked worktrees on macOS, Linux, and Windows.
- Measure local event-to-browser latency instead of inferring it from protocol support.
- Use fixture-backed GitHub tests first, followed by an explicitly authorized read-only repository test.
- Treat cross-clone and multi-machine event convergence as a later reliability concern; the proposed journal is local to one Git common directory.

## Rejected assumptions

- Every Codex Desktop task is live-observable.
- A transport notification is canonical project state.
- Reconnecting to a provider reproduces every transient delta.
- A visible test result automatically satisfies a lifecycle gate.
- A runtime `Allow` response is a product, release, or High-Assurance approval.
- Token usage is monetary cost without an explicit, versioned price source.
