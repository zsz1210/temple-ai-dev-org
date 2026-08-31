# WI-0071 Technical Design

## Decision

Extend the existing Learning v2 contract instead of creating a second promotion database. The Learning Index remains the compact pointer and lifecycle registry; each full Skill Proposal is a project-owned JSON record under `.ai-org/learning/proposals/`. Status and Observer derive candidate and approval attention from those canonical sources.

The system automates detection and proposal management, but it never writes `.agents/skills/`. An accepted proposal creates one ordinary Work Item whose later execution is governed by `$skill-authoring`.

## Deterministic candidate model

`buildSkillPromotionCandidates(index, now)` evaluates every Practice and returns both eligible entries and blockers.

An entry is eligible only when:

- `kind` is `practice`;
- `status` is `active`;
- `confidence` is `high`;
- `revalidation.last_result` is `confirmed`;
- it is not contradicted, deprecated, rejected, accepted, or deferred until a future date;
- the union of direct `source_work_items` and source Work Items from `derived_from` Lessons contains at least two distinct IDs.

This threshold proves recurrence only. It does not decide that Skill is the correct destination. The Tech Lead still records alternatives and overlap review when creating a proposal.

## Learning Index extension

Keep the current `promotion.target`, `promotion.status`, and `promotion.reference`, and add optional compact correlation fields:

- `proposal_id`;
- `review_after`;
- `work_item_id`.

Add `deferred` to promotion statuses. Existing v2 entries remain valid because new fields are optional. A new or updated entry always writes all compact promotion fields. `reference` points to the canonical proposal JSON.

## Proposal record

Each `.ai-org/learning/proposals/SKILL-PROPOSAL-####.json` record uses `temple.skill-proposal/v1` and contains:

- source Learning ID and evidence Work Items;
- proposed Skill name, summary, trigger, and neighboring non-trigger;
- authority statement, risk class, dependencies, alternatives, overlap review, and evidence references;
- proposal status and created/updated actor and time;
- decision reason, review time, and linked authoring Work Item when present.

`validateSkillProposal` and `validateLearningRepository` reject unsafe names, invalid paths, status/decision mismatches, missing references, or broken correlation. `schema validate` invokes the repository validator for the Learning document so proposal records are checked without adding a second always-installed index.

## CLI

Add three bounded actions:

```text
temple learning skill-candidates . [--json]
temple learning propose-skill . --learning-id PRACTICE-#### --work-item WI-#### \
  --skill-name name --summary text --trigger text --non-trigger text \
  --authority text --risk-class low|standard|high|critical \
  --alternative text --overlap-review text [--dependency text] [--evidence ref]
temple learning decide-skill . --proposal-id SKILL-PROPOSAL-#### \
  --decision approve|reject|defer --principal-id id --reason text \
  [--review-after timestamp]
```

Proposal creation requires a Design-stage Work Item owned and actively claimed by the assigned Tech Lead Agent Identity. It checks the exact `.agents/skills/<name>` path and existing Capability Registry for a name collision. The recorded overlap review remains necessary because exact search cannot prove semantic non-overlap.

Decision is explicit, local, and idempotent. Rejection creates no Work Item. Deferral requires a future `review_after`. Approval creates or recovers exactly one linked internal Work Item.

## Approved Work Item creation

The generated Work Item:

- is titled `Author project Skill <name>`;
- is an internal child of the proposal-review Work Item;
- uses `gate-evidence`, `not-applicable`, and sequential mode;
- declares `.agents/skills/<name>/**` and the proposal record as its affected paths and evidence;
- states that dependency installation, publication, core/pack promotion, and execution of the target procedure are excluded;
- carries acceptance requiring `$skill-authoring`, routing and authority scenarios, repository verification, and separate Independent QA.

Approval replay searches for an existing Work Item that already references the proposal before allocating a new ID. This recovers the crash window between Work Item creation and proposal correlation without duplicate authoring work.

## Observer and Now

Status and Observer include:

- eligible candidate counts and details;
- `skill_candidate_ready` attention for eligible Practices without a proposal;
- `skill_proposal_pending` attention for proposed Skills;
- `skill_proposal_review_due` for deferred proposals whose review time has arrived;
- `invalid_skill_promotion` when a referenced proposal is missing or invalid.

The current Management Console already renders unknown attention types in the Now attention list, including label, message, and suggested action. No dashboard layout or remote command surface changes are required. Decisions remain local through Codex or the repository-pinned CLI.

## Concurrency and rollback

All proposal and decision mutations run under the project mutation lock. Proposal creation writes the proposal record before updating the Learning Index and removes the new record if the index or event write fails. Decision replay is idempotent. Approval recovers an already-created authoring Work Item by proposal evidence before creating another.

Rollback is local and reversible:

1. reject or defer a proposal before authoring;
2. cancel the generated Work Item through the normal lifecycle if approval is withdrawn;
3. do not delete Learning evidence or rewrite event history;
4. no Skill file exists until a separately authorized authoring lifecycle reaches Build.

## Verification

- Unit/CLI tests for candidate blockers, proposal validation, exact collisions, role/claim enforcement, approve/reject/defer, duplicate replay, and generated Work Item scope.
- Observer/status tests for candidate, pending, due, invalid, and no-attention states.
- Schema validation and Doctor on an initialized fixture.
- Full `npm run verify`.
- Runtime visual inspection of the existing Now attention card using a fixture projection; private view remains read-only because no decision endpoint is added.

## Overlap boundary

WI-0069 owns usage-policy changes. WI-0071 starts after its Developer candidate and changes only Learning promotion fields in the shared schema/catalog/lock surface. WI-0043 retains ownership of broader Dashboard information architecture; WI-0071 relies on the existing generic attention renderer and does not change navigation or layout.
