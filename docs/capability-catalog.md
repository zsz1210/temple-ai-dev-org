# Capability catalog

Temple keeps installed Skills deliberately small. A Skill belongs in `project-overlay/` only when most product repositories need it and its trigger is distinct. Other useful capabilities remain here with source, version, license, intended Position, and an explicit adoption state.

The Matt Pocock catalog was reviewed at commit `6654f6b60cd9d5be8b54c6fafe44346dabeb3b76` under the MIT License. Temple does not vendor or invoke that repository at runtime.

All candidates recorded in the earlier review remain preserved below. A candidate is not silently dropped when it is not installed; its state changes only after a documented pilot or adoption decision.

| Capability | Intended Position | State | Temple decision |
|---|---|---|---|
| `domain-modeling` | Product Manager, Tech Lead | Core, independently implemented and greenfield-validated | FlowDeck used it for the Project Charter, ubiquitous language, product boundary, Spec, and ADR baseline. |
| `project-documentation` | Product Manager, Tech Lead, Quality & Evaluation Engineer | Core, independently implemented and forward-tested | Grounds human-facing README, setup, usage, contribution, and documentation-index work in executable commands, repository links, shipped behavior, audience needs, and explicit authority. It does not own Agent instructions, product specifications, or generic prose. |
| `skill-authoring` | Any Position authoring a reusable capability; Tech Lead for promotion review | Core, independently implemented and forward-tested | Classifies whether a repeated procedure is a Skill, checks exact lock ownership, defines trigger and authority, preserves provenance, and applies a validation ladder. It creates only authorized project-owned extensions and does not install, publish, edit the lock, or promote them. |
| `tdd` | Developer, Quality & Evaluation Engineer | Build Quality optional pack; independently implemented and forward-validated | Requires observable red/green evidence, pre-agreed public test seams, and one vertical slice at a time. AiPet and FlowDeck both produced real red/green cases without copying upstream code. |
| `diagnosing-bugs` | Developer, Quality & Evaluation Engineer | Build Quality optional pack; independently implemented | Uses bounded reproduction, ranked hypotheses, a red-capable feedback loop, regression evidence, and cleanup. It is opt-in and addresses the failure pattern observed during the AiPet pilot. |
| `codebase-design` | Tech Lead, Developer | Development foundation candidate | Preserve the deep-module, small-interface, adapter, and test-seam vocabulary. Adapt it to ADRs, bounded contexts, and project authority rather than treating it as an automatic refactor command. |
| `prototype` | UX Designer, UI Designer, Developer | Optional candidate | Evaluate for answering one risky product, interaction, or visual question without turning a prototype into an implied production commitment. |
| `research` | Product Manager, Tech Lead | Adaptation candidate | Preserve the primary-source and cited-artifact discipline. Remove upstream assumptions that a background agent is always available and that every research request authorizes a repository write. |
| `resolving-merge-conflicts` | Developer, Tech Lead | Optional candidate | Useful for an active merge or rebase, but adapt its unconditional “never abort” and automatic commit behavior to project intent, user-owned changes, and explicit completion authority. |
| `code-review` | Tech Lead, Independent QA | Adaptation candidate | The concept fits independent review, but upstream assumptions about subagents, setup, and issue trackers must not become hidden requirements. |
| `improve-codebase-architecture` | Tech Lead | Adaptation candidate | Preserve the deep-module and locality lens; validate how it interacts with ADRs, bounded contexts, and existing architecture. |
| `retro` | Engineering Manager, Framework maintainer | Preserved candidate; Learning Loop foundation shipped separately | Use completed work-item evidence to propose Lessons and improvements. Alpha.10 supplies project-owned learning records and retrieval metadata, but not a retrospective procedure. Do not require private session logs, auto-edit instructions, automatic promotion, or a retrospective in every product task. |
| `security-review` | Quality & Evaluation Engineer, Independent QA | Optional pack candidate | Adapt the OWASP review taxonomy for security-sensitive changes and explicit audits. Keep it out of the default core; a future implementation needs CC-BY-4.0 attribution and project-specific threat boundaries. |
| `writing-great-skills` | Framework maintainer | Independently applied inspiration | Its trigger, progressive-disclosure, and validation ideas inform `$skill-authoring` and `docs/skill-authoring.md`; no upstream source is copied or invoked. |
| `writing-for-agents` | Framework maintainer | Maintainer inspiration | Use for project-facing instruction quality; do not add another runtime capability without a distinct trigger. |
| `handoff` | Engineering Manager | Do not adopt as-is | Temple already stores canonical handoffs in the repository; temporary handoff documents would create a competing truth. |
| `to-spec` | Product Manager, Tech Lead | Do not adopt as-is | Overlaps the Temple lifecycle and assumes a separate planning model. Revisit only if a pilot exposes a concrete gap. |
| `to-tickets` | Engineering Manager | Do not adopt as-is | Depends on an issue-tracker workflow that Phase 1 intentionally does not require. |
| `wayfinder` | Engineering Manager, Product Manager, Tech Lead | Do not adopt as-is | Its decision-map idea is useful for work larger than one context window, but its issue-tracker canonical state, subagent assumptions, and ticket model overlap Temple work items and Phase 3 planning. |
| `triage` | Engineering Manager, Product Manager | Defer to Phase 5 | Requires configured issue-tracker labels, comments, and external writes. Revisit only when Temple intentionally adds issue-tracker integration and approval policy. |

## Development capability packs

Development Skills are a separate layer from Temple's organization lifecycle. A project can keep the same Positions, handoffs, gates, and canonical state while deliberately installing only the development pack its current work needs.

| Pack | Candidate capabilities | Adoption order |
|---|---|---|
| Build quality | `tdd`, `diagnosing-bugs` | Available opt-in. The AiPet pilot supplied a real red-to-green case; alpha.6 adds independent Skills, pack CLI, checksum boundaries, scenario tests, and clean-project install/remove/upgrade tests. |
| Architecture | `codebase-design`, `improve-codebase-architecture` | Later. Pilot on a bounded architecture work item with an ADR and measurable locality or interface outcome. |
| Review | `code-review`, `security-review` | Later. Preserve standards/spec review separation and add the security pack only for explicit security-sensitive scope. |
| Exploration | `prototype`, `research` | Later. Keep prototypes throwaway and research read-only unless a repository artifact is authorized. |
| Git and improvement | `resolving-merge-conflicts`, `retro` | Later. Trigger only during an actual conflict or an explicitly requested retrospective. First validate the alpha.10 Learning Loop records before defining a retrospective Skill. |

These packs are not role replacements. Owen can still hold Developer while invoking a build-quality Skill, and Stella can still independently evaluate its evidence. Packs change reusable development procedure; Position assignment determines responsibility and approval boundaries.

## Distribution and extension classes

Capabilities and their origins are separate concerns:

| Distribution class | Default | Owner under the current release | Examples |
|---|---|---|---|
| Core | Installed by `init` | Framework through exact lock entries | Decision, domain, documentation, Skill authoring, lifecycle |
| Official pack | Explicit opt-in | Framework after installation | Build Quality |
| Project extension | Created locally | Product repository | A domain- or stack-specific repeated procedure |
| Third-party extension | Selected locally | Product repository until a dedicated lifecycle exists | A separately reviewed external Skill |

An initialized repository can create collision-free project Skills under `.agents/skills/<name>/`. It must not edit `temple.lock` to claim them as managed. The current alpha has no Skill registry, custom-pack installer, dependency resolver, automated routing evaluator, or third-party updater; see [Extending a project with Skills](skill-authoring.md).

## Adoption gate

A candidate moves into an optional pack or the core overlay only after:

1. a real work item demonstrates a repeated need;
2. its trigger does not overlap an installed Skill;
3. license and pinned upstream provenance are recorded;
4. the Temple-native behavior preserves canonical state and human approval boundaries;
5. tests and independent QA show that it improves the outcome without creating hidden tools or services.

AiPet completed the second existing-repository portability pilot through `WI-0001`. The accepted Simulator slice produced a real red-to-green test-observation failure, a six-test public-seam suite, screenshot evidence, a clean detached exact-revision QA run, and organizational closeout. Alpha.6 uses that evidence for the independently implemented Build Quality pack; it remains opt-in and does not copy or load upstream source.

FlowDeck then exercised `domain-modeling` and the Build Quality pack in a greenfield iOS lifecycle through exact-revision closeout. It also showed that a human-facing README must be grounded in executable commands and actual product boundaries. Alpha.8 independently implements `$project-documentation` and forward-tests it against Temple's trilingual README redesign; the audit found stale Skill-state claims, a failing documented verification command, missing Git and repository-access prerequisites, and an overstated revision guarantee before the documents were accepted. The pilot did not justify installing `research`, merge-conflict help, architecture, review, security, retrospective, or a new system-permission Skill. Those candidates remain preserved without adding recurring context to every project now. Alpha.9 adds a governed way for a project to create its own Skills without making every candidate part of core. Alpha.10 preserves learning as indexed Lessons and Practices first; it does not treat storage as proof that the `retro` candidate is ready.

## Sources reviewed but not adopted

- OpenAI Codex's `code-review-testing` is specific to the Codex Rust repository and its `core/suite` integration-test conventions, so source reputation does not make it a generic Temple capability.
- Vercel's agent-skills catalog is useful for stack-specific guidance, but the reviewed repository revision did not expose a GitHub-detected repository license. Do not copy it into an open-source distribution until the relevant skill's license and provenance are clear. Project environments may use separately installed, appropriately licensed stack plugins instead.
- Matt Pocock's `implement` and in-progress `implement-spec` are too broad and overlap Temple lifecycle ownership, testing, review, issue-tracker, and subagent assumptions. `setup-pre-commit` is Node/Husky-specific, `git-guardrails-claude-code` is Claude-specific, and `wizard` targets human-only setup operations. Preserve their ideas through narrower packs when a real project demonstrates the need; do not install them as generic core Skills.

## Reviewed sources

- Catalog: <https://github.com/mattpocock/skills/tree/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76>
- License: <https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/LICENSE>
- Skill index and usage signals: <https://skills.sh/mattpocock/skills>
- `tdd`: <https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/skills/engineering/tdd/SKILL.md>
- `diagnosing-bugs`: <https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/skills/engineering/diagnosing-bugs/SKILL.md>
- `codebase-design`: <https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/skills/engineering/codebase-design/SKILL.md>
- `code-review`: <https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/skills/engineering/code-review/SKILL.md>
- `improve-codebase-architecture`: <https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/skills/engineering/improve-codebase-architecture/SKILL.md>
- `prototype`: <https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/skills/engineering/prototype/SKILL.md>
- `retro`: <https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/skills/in-progress/retro/SKILL.md>
- `research`: <https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/skills/engineering/research/SKILL.md>
- `resolving-merge-conflicts`: <https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/skills/engineering/resolving-merge-conflicts/SKILL.md>
- `wayfinder`: <https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/skills/engineering/wayfinder/SKILL.md>
- `triage`: <https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/skills/engineering/triage/SKILL.md>

Additional reviewed sources:

- OWASP `code-review-security`, CC-BY-4.0, reviewed at `79fea6b9115b55687818f8c4073844ee9ba907a6`: <https://github.com/OWASP/secure-agent-playbook/tree/79fea6b9115b55687818f8c4073844ee9ba907a6/plugins/code-security-skills/skills/code-review-security>
- OpenAI Codex `code-review-testing`, reviewed but rejected as repository-specific at `6478a751fde8884b2fdc76486fe23175a8e795d4`: <https://github.com/openai/codex/blob/6478a751fde8884b2fdc76486fe23175a8e795d4/.codex/skills/code-review-testing/SKILL.md>
- Vercel Agent Skills, reviewed but not distributable until license provenance is clear at `063bee94c3f4df8453406c830b0a7df0f2860278`: <https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278>

README and documentation lifecycle sources reviewed as inspiration, not vendored dependencies:

- Hypergiant `accelint-readme-writer`, Apache-2.0, reviewed at `459a846a65544cf311164059f2ea4623ec443b02`: <https://github.com/gohypergiant/agent-skills/tree/459a846a65544cf311164059f2ea4623ec443b02/skills/accelint-readme-writer>
- AsyrafHussin `project-docs`, MIT, reviewed at `1aa0ff717c10309226c9e678f00873976450fd76`: <https://github.com/AsyrafHussin/agent-skills/tree/1aa0ff717c10309226c9e678f00873976450fd76/skills/project-docs>
