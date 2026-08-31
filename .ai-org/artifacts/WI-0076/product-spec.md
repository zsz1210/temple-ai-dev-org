# Product specification — multi-human team governance

- Work Item: `WI-0076`
- Product Manager: `agent-yuna`
- Approved source: `WI-0043` Team information architecture review
- Status: approved by Human Principal

## User outcome

A solo maintainer, company team, or open-source project can use the same Temple organization model without treating one example team size, company title, email address, chat history, or AI runtime as identity or authority. Each accountable person can sponsor their own Agent Identities, Agents can qualify for Position pools by Discipline, bounded work remains attributable through Git and exact evidence, and Team explains durable organization state without becoming employee surveillance.

## Actors

- **Human Principal:** accountable person identified by an immutable project Principal ID.
- **Agent Identity:** durable AI participant sponsored by one accountable Principal in Collaborative or High-Assurance operation.
- **External contributor:** may submit a Git contribution without automatically becoming a Principal, Agent sponsor, Position member, or claim holder.
- **Observer and Team:** read-only projections; they do not approve, grant, claim, or infer online presence.

## Functional requirements

### Identity and personnel lifecycle

1. Principal IDs are immutable, never reused, and remain after offboarding.
2. Human display names may duplicate. Email is neither required nor a uniqueness key.
3. Principal status is `active`, `suspended`, or `inactive`. Suspended and inactive Principals cannot sponsor new work or satisfy active governance checks.
4. A local actor binding lives below the Git common directory. It records the project, Principal ID, verification class, provider subject when available, evidence reference, and observation time. It is not a credential and never enters repository state.
5. Solo permits a self-asserted `human` binding. Collaborative distinguishes self-asserted from externally verified binding. High-Assurance additionally requires current step-up evidence at its configured approval boundaries.
6. Temple validates and reports these classes but does not claim to perform provider authentication when no provider adapter supplied the evidence.

### Agents, Positions, and qualification

1. Position definitions remain framework-owned and separate from Agent Identity and Human Principal.
2. Every Position retains one default Assignment, while any number of eligible Agent Identities may join its Position pool.
3. Position Membership records Disciplines plus qualification status: `provisional`, `active`, `suspended`, `expired`, or `revoked`.
4. Active qualification may record evidence, scope, risk ceiling, qualification time, review time, and expiry. Skills, model choice, or self-description alone do not activate membership.
5. Observer may surface provisional, stale, expiring, contradicted, or missing qualification. It cannot approve membership.
6. Developer and Independent QA must remain different Agent Identities for the accepted candidate.

### Human authority and recovery

1. Position eligibility does not imply Human Authority Grant or Git-hosting permission.
2. A scoped Human Authority Grant names its holder, authority, scope, risk ceiling, status, approval provenance, grant time, and optional expiry.
3. The first Collaborative setup may use a temporary Bootstrap Owner. Retirement is permanent and requires viable governance grants plus the configured distinct approvals.
4. Ordinary personnel and work coordination may use one eligible accountable Principal. Authority expansion and critical governance change require two distinct active Principals after bootstrap.
5. Governance recovery uses project-configured trustees and threshold. Temple never hardcodes a two-of-three roster or retains a permanent hidden backdoor.
6. Account loss recovery, ordinary offboarding, and repository backup restoration remain separate procedures.

### Team and Work surfaces

1. Main navigation remains `Team`; internal source data remains the Organization projection.
2. Team contains `Responsibilities`, `People & Agents`, and `Authority` views.
3. Responsibilities is Position-first, contains no single Human Principal apex, and shows default Agent, eligible pool, Discipline coverage, qualification attention, and bounded active-work count.
4. People & Agents separates accountable people from sponsored Agents. Immutable IDs or provider handles disambiguate duplicate names; email is not displayed.
5. Authority shows explicit grants, bootstrap state, recovery readiness, approval requirements, expiry, and safeguards. Company job title never creates Temple authority.
6. Work continues to own live claims, branches, tasks, blocked work, candidate revisions, and integration joins.
7. Team V1 is read-only. Canonical mutations continue through audited repository and CLI operations.
8. Private viewers receive Agent roster, responsibility coverage, and bounded governance readiness only. Principal records, sponsorships, detailed grants, local identity binding, credentials, prompts, Inbox state, and command payloads are excluded.

### Validation and claims

1. Validation reports distinct gates: automated, simulated Collaborative, real Collaborative, representative pilot, and High-Assurance drill.
2. Local multiple-clone testing may satisfy only the simulated gate.
3. Real Collaborative evidence requires at least two distinct humans operating independently administered environments. Counts beyond the behaviorally required distinctions are not a product team-size rule.
4. Repository coordination guarantees visible conflicts, no silent canonical-record loss, and recoverability. It does not claim cross-machine atomic claim prevention or a distributed lock.

## Profile behavior

- **Solo:** one implicit accountable `human`, self-asserted local binding allowed, authority detail collapsed, existing assignments preserved.
- **Collaborative:** several Principals, sponsorship, Position pools, identity-verification status, grants, and real-environment validation visibility.
- **High-Assurance:** the same domain model plus risk contract, exact evidence, step-up verification, distinct approvals, rollback, separation, and recovery readiness.

Profile selection follows coordination risk, not headcount.

## Exclusions

- Provider-specific authentication, credential storage, HR management, payroll, time tracking, keystroke or prompt surveillance, and employee scoring.
- Remote atomic coordination, public or remote mutation, tracker write-back, merge, deployment, publication, or production release.
- Automatically onboarding an OSS contributor or granting authority from a company title.
- Changing the accepted Human-approved Skill promotion policy.

## Acceptance evidence

- Collaboration v1 compatibility and explicit v2 migration tests.
- Fresh init and upgrade-preservation tests.
- CLI lifecycle and invalid-reference tests.
- Local binding path and repository-exclusion tests.
- Organization projection and private-viewer redaction tests.
- Responsive runtime browser review of all three Team views.
- Simulated separate-clone conflict and cold-recovery record.
- Full `npm run verify` and Independent QA on an exact committed candidate.

