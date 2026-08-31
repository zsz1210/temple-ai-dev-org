# Domain glossary

Project-owned vocabulary for product decisions, implementation, tests, and handoffs. Only confirmed terms belong in this file; unresolved protocol gaps stay explicit.

## Requested turn reasoning effort

- Status: confirmed
- Bounded context: Temple Provider-owned task launch and task registry
- Definition: The reasoning effort Temple sends in the `turn/start.effort` field for one turn.
- Examples: A launch request containing `effort: "max"` records `requested_reasoning_effort: "max"`.
- Non-examples: A value returned by `thread/start`; an inference from output Token counts; a model family default.
- Invariants: It records intent, not proof that the Provider executed the turn with that value.
- Owner or authoritative source: Temple launch request plus the installed App Server `TurnStartParams` schema.
- Related terms: Observed thread reasoning effort; effective turn reasoning effort.
- Supersedes: Ambiguous use of `reasoning_effort` as both request and observation.
- Last confirmed: 2026-08-31

## Observed thread reasoning effort

- Status: confirmed
- Bounded context: Codex App Server `thread/start` acknowledgement
- Definition: The nullable thread-level `reasoningEffort` returned by the Provider when a thread is created.
- Examples: `thread/start` returns `reasoningEffort: "xhigh"` while a later `turn/start` requests `max`.
- Non-examples: A direct acknowledgement of the effective effort for the individual turn.
- Invariants: It must never be labeled as effective turn reasoning unless a future inspected protocol explicitly defines that equivalence.
- Owner or authoritative source: Installed App Server `ThreadStartResponse` schema.
- Related terms: Requested turn reasoning effort; effective turn reasoning effort.
- Supersedes: Treating the thread acknowledgement as the effective turn value.
- Last confirmed: 2026-08-31

## Effective turn reasoning effort

- Status: confirmed
- Bounded context: Provider-observed turn execution metadata
- Definition: A reasoning effort explicitly acknowledged by the Provider as the value actually used for one identified turn.
- Examples: A future protocol event or response that names both a turn ID and its effective effort.
- Non-examples: The request sent by Temple; the thread-level acknowledgement; an estimate derived from reasoning-output Tokens.
- Invariants: The value remains `null` when the inspected Provider protocol exposes no direct turn-effective acknowledgement.
- Owner or authoritative source: The exact installed Provider protocol and its versioned wire contract.
- Related terms: Requested turn reasoning effort; observed thread reasoning effort.
- Supersedes: Guessed or fallback effective reasoning labels.
- Last confirmed: 2026-08-31

## Compatibility reasoning effort

- Status: confirmed
- Bounded context: Legacy `temple.tasks/v1` and usage consumers
- Definition: A backwards-compatible projection stored in the legacy `reasoning_effort` field together with an explicit `reasoning_effort_source`.
- Examples: `xhigh` with source `provider-thread`; `max` with source `canonical-requested` when no Provider observation exists.
- Non-examples: An independently proven effective-turn value when the source is not `provider-turn`.
- Invariants: Consumers must inspect the source and must not label this field alone as effective turn reasoning.
- Owner or authoritative source: Temple task compatibility policy.
- Related terms: Requested turn reasoning effort; observed thread reasoning effort; effective turn reasoning effort.
- Supersedes: Source-less legacy reasoning metadata.
- Last confirmed: 2026-08-31

## Unresolved terminology

| Conflict | Affected contexts | Decision owner | Evidence needed | Revisit trigger |
|---|---|---|---|---|
| Whether a future App Server thread default constrains or is overridden by each turn | Provider launch, usage attribution, Workspace | Tech Lead | Versioned official and installed schema that acknowledges the effective value for a specific turn | App Server adds turn-effective reasoning metadata or changes override semantics |
