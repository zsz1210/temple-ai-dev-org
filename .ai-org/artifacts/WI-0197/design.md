# WI-0197 minimal native child compatibility probe

## Question

Can the current Codex App Server produce one support-task parent and one native helper whose identity, selected route, terminal state, and per-thread Token observations are all safely captured by the accepted WI-0196 two-phase acquisition path?

This probe answers only that compatibility question. It does not compare Temple with a baseline, establish efficiency, tune routing, or authorize a retry.

## Single arm

- Fixture: the retained WI-0193 `support-read` scenario.
- Source: the retained `after` revision containing the Temple treatment.
- Route: `gpt-5.6-terra`, reasoning effort `medium`, exactly one parent plus at most one helper.
- The helper is informational, cannot write, cannot spawn a grandchild, and receives no follow-up turn.
- Success requires an `observed-complete` trace, exactly one verified helper, completed parent and helper terminals, per-thread usage, observed cleanup, a schema-valid parent answer, and no out-of-scope writes.

## Resource envelope

The previous live parent completed in 73.258 seconds with 32,234 observed Operational Tokens while helper usage was unavailable. The probe uses a diagnostic ceiling rather than a forecast:

- 160,000 Operational Tokens per actor;
- 320,000 Operational Tokens in the conservative two-actor counter;
- 6 minutes per actor and 15 minutes overall;
- one subject arm, two possible actor turns;
- zero retries, zero fallback, no reset, no Credit purchase, and no automatic top-up.

These limits are stop boundaries, not expected consumption, prices, or evidence that parent and child Token totals are non-duplicative.

## Seal and approval

Preparation is generation-free. It creates matched disposable sources, current App Server schemas (including thread/turn start and resume responses), request digests, source snapshots, executable bindings, a review template, and an approval template. The runner remains locked unless:

1. a distinct Quality Evaluator passes the exact candidate and seal;
2. the review evidence digest still matches;
3. the user explicitly approves that exact seal, route, limits, and funding boundary before expiry; and
4. all candidate, source, request, schema, and executable bindings remain unchanged.

One exclusive `run-once.json` prevents replay. A stopped or failed run is a result, not retry authority.

## Persistence and privacy

Before the first result write, the runner:

- retains at most 64 messages and 16 KiB per message;
- replaces fixture and source paths with fixed placeholders;
- retains a structured answer only below 32 KiB after redaction;
- preserves only the already bounded event journal, hashed actor IDs, normalized command observations, and fixed error categories;
- never retains prompts, hidden reasoning, raw tool output, credentials, or unhashed thread IDs.

The runner writes with exclusive creation and never overwrites prior evidence.

## Stop condition

The Work Item stops after generation-free tests and independent readiness. A live run requires a later exact approval. After the live arm, any non-success result stops without retry; success only authorizes analysis of compatibility, not a broader comparison.

