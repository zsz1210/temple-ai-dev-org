# Wave 4 organization-scale operating boundaries

- Work Item: `WI-0105`
- Result: passed for its local deterministic scope
- External services or production actions: none
- Real multi-human, tracker, design-vendor, SRE, Security, and High-Assurance qualification: not run

## What Wave 4 answers

Wave 4 checks whether Temple's organization-scale rules are present, executable, and honest about their limits. It does not stage a fake enterprise deployment. The retained observation separates five kinds of evidence so a local fixture cannot silently become a claim about real people, production, or certification.

| Evidence class | Meaning |
|---|---|
| `verified-local` | Exact-revision behavior or configuration observed on this machine |
| `simulated` | Executable behavior using synthetic people, providers, approvals, repositories, or environments |
| `documented-policy` | A defined contract that has not been exercised in its real environment |
| `not-run` | No qualifying observation exists |
| `not-applicable` | Outside this Work Item |

## Result at a glance

The retained matrix has 15 rows across five operating boundaries. Five rows are verified locally, four are simulated, one is documented policy, and five are explicitly not run. The focused executable suite passed 83 of 83 tests. A disposable tracker rehearsal also proved that the exact `inspect --no-write` and `plan --no-write` commands leave lifecycle files and generated views unchanged.

The exact revision, command list, elapsed time, canonical snapshot, and row-by-row limitations are retained in [the machine-readable observation](../../.ai-org/artifacts/WI-0105/wave-4-operating-boundaries-observation.json).

## What is supported now

### Collaborative governance

- Membership, Agent Identity, claim eligibility, authority, recovery, and separation rules execute in local synthetic fixtures.
- This project is still deliberately `solo`: it has no Human Principals or sponsorships, and governance recovery is not configured.
- Developer Rikku and Independent QA Lulu are different Agent Identities.

This is enough to test the governance engine. It is not evidence that different people on independently administered machines can operate it successfully.

### Tracker coordination

- The current project remains repository-only with zero external providers and mappings.
- A synthetic linked-provider rehearsal kept the company-visible parent separate from an internal AI child.
- Temple rejected a tracker link on the internal child.
- A supplied external `done` observation produced a conflict and did not advance the Work Item beyond `intake`.
- Inspect and plan remained read-only, created no tracker view, and performed no external write.

No GitHub Issues or Jira request was made. Authentication, real permissions, company fields, rate limits, and concurrent edits are therefore unqualified.

### UI delivery

Temple currently defines four modes: `not-applicable`, `code-first`, `preview-first`, and `design-led`. The executable policy requires runtime visual review for every interface-bearing mode and requires a pre-implementation visual source for preview-first and design-led. Tool choice remains vendor-neutral; `required_tool` is `null`.

Code-first and preview-first have executable and retained local evidence. Design-led has a defined evidence contract but no completed end-to-end rehearsal. A real Figma connection and a real designer-to-developer handoff were not run.

### SRE and Security

Temple already has local safeguards for evidence projection, conditions, audit export, backup and recovery, private-view redaction, Agent Command boundaries, exact-revision checks, separation, rollback, and release gates. These behaviors pass in deterministic local fixtures.

Temple does have an Observer Position. It does not currently define dedicated SRE or Security Positions. Observer reports status and risk signals but cannot approve product, technical, QA, or release decisions.

Production on-call, SLI/SLO operation, incident response, vulnerability management, machine-loss disaster recovery, threat modeling, penetration testing, and security certification were not run. Existing safeguards must not be described as those operational capabilities.

### High-Assurance

The profile contract requires at least two active Human Principals, sponsorship for active Agents, Developer separation from Independent QA and Release Manager, exact candidate evidence, risk-scaled UI policy, two approvals for critical work, and verified rollback for critical work. These rules execute with synthetic actors.

The real High-Assurance drill remains `not_run`. A dedicated critical full-closeout fixture is also a useful remaining deterministic test before the real drill.

## What the result does not prove

Wave 4 makes no claim about:

- enterprise readiness or regulated use;
- several real humans or machines;
- GitHub, Jira, Figma, or another external integration;
- production monitoring, incident response, or security certification;
- financial savings or Token savings;
- deployment, publication, or release readiness.

The optional Management Console, Observer service, Usage Collector, Docker, Colima, and model generation were not started for this validation.

## Reproduce the local observation

From a clean candidate revision:

```bash
node scripts/validate-wave-4-operating-boundaries.mjs \
  --output .ai-org/artifacts/WI-0105/wave-4-operating-boundaries-observation.json
```

This command runs local executables and a disposable tracker fixture. It requires no credentials and performs no network request. Ordinary repository verification remains separate:

```bash
npm run verify
```

## Next qualification work

The unqualified boundaries should be tested independently rather than combined into one expensive demonstration:

1. add the missing deterministic critical High-Assurance closeout and design-led lifecycle cases;
2. run a real two-person, two-environment protected-PR collaboration trial;
3. run one read-only company tracker pilot with explicit permission;
4. run one real multi-party design-led handoff with a chosen design tool; and
5. design separate SRE and Security ownership before attempting production or incident-response qualification.

Each later result should preserve its own exact revision, participants, environments, actions, failures, and residual limits. Passing this local matrix does not pre-approve any of those actions.
