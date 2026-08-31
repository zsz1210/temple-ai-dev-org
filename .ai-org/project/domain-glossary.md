# Domain glossary

Project-owned vocabulary for product decisions, implementation, tests, and handoffs. Only confirmed terms belong in this file; unresolved protocol gaps stay explicit.

## Human Principal

- Status: confirmed
- Bounded context: Temple project accountability and governance
- Definition: An accountable human identity with an immutable project Principal ID. It is neither a Position nor a reporting-hierarchy title.
- Examples: A maintainer sponsoring an Agent Identity; two distinct reviewers satisfying a critical governance approval.
- Non-examples: A GitHub team, company job title, email address, Agent Identity, or Codex task.
- Invariants: IDs are never reused; display names may duplicate; inactive history remains attributable.
- Owner or authoritative source: Collaboration state and ADR-0038.
- Related terms: Local Actor Binding; Human Authority Grant; Agent sponsorship.
- Last confirmed: 2026-08-31

## Agent Identity

- Status: confirmed
- Bounded context: Temple organization and work attribution
- Definition: A durable project identity for an AI participant, separate from a model, runtime worker, Codex task, and Human Principal.
- Examples: `agent-rikku` holding Developer membership and claiming one Work Item.
- Non-examples: A temporary subagent process, model name, chat title, or human account.
- Invariants: Collaborative and High-Assurance active Agents have accountable sponsorship; one Agent cannot implement and independently QA the same candidate.
- Owner or authoritative source: Assignments, collaboration state, and ADR-0002.
- Related terms: Position Membership; default Assignment; Runtime worker.
- Last confirmed: 2026-08-31

## Position Membership

- Status: confirmed
- Bounded context: Temple responsibility eligibility
- Definition: The project record that makes one Agent Identity eligible for one framework Position with bounded Disciplines and qualification state.
- Examples: A provisionally qualified Developer membership covering `frontend`; an active membership with evidence and review date.
- Non-examples: The Position definition, default Assignment, active Work claim, Human Authority Grant, Skill, or company title.
- Invariants: Membership may be provisional, active, suspended, expired, or revoked; Skill discovery and model selection do not grant membership.
- Owner or authoritative source: Collaboration state and ADR-0038.
- Related terms: Position; Discipline; default Assignment; qualification.
- Last confirmed: 2026-08-31

## Default Assignment

- Status: confirmed
- Bounded context: Temple Position ownership fallback
- Definition: The single Agent Identity selected as the default owner of a Position when no bounded Work claim selects another eligible pool member.
- Examples: `agent-rikku` as the default Developer while other active Developer members remain eligible.
- Non-examples: Exclusive Position membership, human employment assignment, or current runtime activity.
- Invariants: Every configured Position has one active default Assignment; the Position pool may contain many eligible Agents.
- Owner or authoritative source: `.ai-org/project/assignments.json` and organization policy.
- Related terms: Position Membership; Work claim.
- Last confirmed: 2026-08-31

## Human Authority Grant

- Status: confirmed
- Bounded context: Temple governance authorization
- Definition: A scoped, time-bounded project record allowing one Human Principal to perform or approve a named governance action up to a stated risk ceiling.
- Examples: Project-scoped identity administration; revision-scoped high-risk release approval.
- Non-examples: Position Membership, sponsorship, GitHub repository permission, job title, or Skill invocation.
- Invariants: Grants do not arise from titles; authority expansion follows the configured distinct-approval rule; expired or revoked grants confer no authority.
- Owner or authoritative source: Collaboration state and ADR-0038.
- Related terms: Bootstrap Owner; governance recovery; Position authority.
- Last confirmed: 2026-08-31

## Bootstrap Owner

- Status: confirmed
- Bounded context: Initial Collaborative governance setup
- Definition: A temporary Human Principal allowed to establish the first viable scoped governance grants before ordinary multi-principal approval rules can operate.
- Examples: The first project maintainer configuring initial authority holders and recovery trustees.
- Non-examples: A permanent superuser, production credential, hidden backdoor, or Human Principal hierarchy apex.
- Invariants: Retirement is explicit and permanent; retirement requires viable grants and configured recovery; it cannot be silently recreated.
- Owner or authoritative source: Collaboration state and ADR-0038.
- Related terms: Human Authority Grant; governance recovery.
- Last confirmed: 2026-08-31

## Local Actor Binding

- Status: confirmed
- Bounded context: One local Git clone and its linked worktrees
- Definition: A generated private mapping below the Git common directory from the current local operator to a project Principal ID plus an evidence-labelled verification class.
- Examples: Solo `human` with self-asserted verification; a provider subject imported from an external verified observation.
- Non-examples: A repository Principal record, credential, authorization grant, email registry, or proof created merely by selecting a Principal ID.
- Invariants: It is never version-controlled; Temple reports rather than fabricates unavailable provider verification.
- Owner or authoritative source: Local identity runtime contract and ADR-0038.
- Related terms: Human Principal; provider identity; step-up verification.
- Last confirmed: 2026-08-31

## Simulated Collaborative validation

- Status: confirmed
- Bounded context: Temple validation evidence
- Definition: A controlled exercise using separate local clones, fixtures, processes, or synthetic identities to test collaboration mechanics without two independently accountable humans.
- Examples: Two clones competing for one claim and recovering from a Git conflict on one machine.
- Non-examples: Real Collaborative validation or proof of organizational adoption.
- Invariants: It cannot satisfy the real-environment gate and must retain its environment limitation.
- Owner or authoritative source: Collaborative validation plan.
- Related terms: Real Collaborative validation; repository coordination backend.
- Last confirmed: 2026-08-31

## Real Collaborative validation

- Status: confirmed
- Bounded context: Temple validation evidence
- Definition: A retained test in which at least two distinct Human Principals operate independently administered environments through real Git hosting, pull requests, checks, and conflict recovery.
- Examples: Two contributors use their own machines and identities while a distinct Agent performs Independent QA on the integrated revision.
- Non-examples: One person with multiple accounts, two worktrees on one machine, or deterministic fixtures.
- Invariants: Team size beyond required responsibility distinctions is not prescribed; repository coordination still does not become a distributed lock.
- Owner or authoritative source: Collaborative validation plan and ADR-0038.
- Related terms: Simulated Collaborative validation; representative team pilot.
- Last confirmed: 2026-08-31

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
