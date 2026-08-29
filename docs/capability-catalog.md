# Capability catalog

Temple keeps installed Skills deliberately small. A Skill belongs in `project-overlay/` only when most product repositories need it and its trigger is distinct. Other useful capabilities remain here with source, version, license, intended Position, and an explicit adoption state.

The Matt Pocock catalog was reviewed at commit `6654f6b60cd9d5be8b54c6fafe44346dabeb3b76` under the MIT License. Temple does not vendor or invoke that repository at runtime.

All candidates recorded in the earlier review remain preserved below. A candidate is not silently dropped when it is not installed; its state changes only after a documented pilot or adoption decision.

| Capability | Intended Position | State | Temple decision |
|---|---|---|---|
| `domain-modeling` | Product Manager, Tech Lead | Core, independently implemented | Install now for Project Charter, ubiquitous language, boundary, invariant, Spec, and ADR work. |
| `project-documentation` | Product Manager, Tech Lead, Quality & Evaluation Engineer | Phase 1.5 core candidate | Independently implement human-facing README and documentation lifecycle work. Ground commands, examples, links, and claims in repository evidence; keep it distinct from AI-facing instruction design. |
| `tdd` | Developer, Quality & Evaluation Engineer | Optional candidate | Evaluate a Temple-native version on a real project; require observable red/green evidence and public-interface test seams. |
| `diagnosing-bugs` | Developer, Quality & Evaluation Engineer | Optional candidate | Preserve for bounded reproduction and feedback-loop design; add repository evidence and redaction rules before adoption. |
| `prototype` | UX Designer, Developer | Optional candidate | Evaluate for answering one risky product or technical question without turning a prototype into an implied production commitment. |
| `research` | Product Manager, Tech Lead | Adaptation candidate | Preserve the primary-source and cited-artifact discipline. Remove upstream assumptions that a background agent is always available and that every research request authorizes a repository write. |
| `resolving-merge-conflicts` | Developer, Tech Lead | Optional candidate | Useful for an active merge or rebase, but adapt its unconditional “never abort” and automatic commit behavior to project intent, user-owned changes, and explicit completion authority. |
| `code-review` | Tech Lead, Independent QA | Adaptation candidate | The concept fits independent review, but upstream assumptions about subagents, setup, and issue trackers must not become hidden requirements. |
| `improve-codebase-architecture` | Tech Lead | Adaptation candidate | Preserve the deep-module and locality lens; validate how it interacts with ADRs, bounded contexts, and existing architecture. |
| `security-review` | Quality & Evaluation Engineer, Independent QA | Optional pack candidate | Adapt the OWASP review taxonomy for security-sensitive changes and explicit audits. Keep it out of the default core; a future implementation needs CC-BY-4.0 attribution and project-specific threat boundaries. |
| `writing-great-skills` | Toolkit maintainer | Maintainer inspiration | Apply centrally through `docs/skill-design.md`; do not install it into every product repository. |
| `writing-for-agents` | Toolkit maintainer | Maintainer inspiration | Use for project-facing instruction quality; do not add another runtime capability without a distinct trigger. |
| `handoff` | Engineering Manager | Do not adopt as-is | Temple already stores canonical handoffs in the repository; temporary handoff documents would create a competing truth. |
| `to-spec` | Product Manager, Tech Lead | Do not adopt as-is | Overlaps the Temple lifecycle and assumes a separate planning model. Revisit only if a pilot exposes a concrete gap. |
| `to-tickets` | Engineering Manager | Do not adopt as-is | Depends on an issue-tracker workflow that Phase 1 intentionally does not require. |
| `wayfinder` | Engineering Manager, Product Manager, Tech Lead | Do not adopt as-is | Its decision-map idea is useful for work larger than one context window, but its issue-tracker canonical state, subagent assumptions, and ticket model overlap Temple work items and Phase 3 planning. |
| `triage` | Engineering Manager, Product Manager | Defer to Phase 5 | Requires configured issue-tracker labels, comments, and external writes. Revisit only when Temple intentionally adds issue-tracker integration and approval policy. |

## Adoption gate

A candidate moves into an optional pack or the core overlay only after:

1. a real work item demonstrates a repeated need;
2. its trigger does not overlap an installed Skill;
3. license and pinned upstream provenance are recorded;
4. the Temple-native behavior preserves canonical state and human approval boundaries;
5. tests and independent QA show that it improves the outcome without creating hidden tools or services.

AiPet is the next portability pilot and will identify which candidate deserves the first optional pack. Phase 1.5 will exercise `domain-modeling` during a greenfield Project Charter and evaluate `project-documentation` against the first human-facing README and documentation baseline.

The most likely first optional pack remains `tdd` plus `diagnosing-bugs`, but this is a hypothesis for the AiPet pilot, not an installation decision. `research`, merge-conflict help, and security review stay available for later packs without adding recurring context to every project now.

## Sources reviewed but not adopted

- OpenAI Codex's `code-review-testing` is specific to the Codex Rust repository and its `core/suite` integration-test conventions, so source reputation does not make it a generic Temple capability.
- Vercel's agent-skills catalog is useful for stack-specific guidance, but the reviewed repository revision did not expose a GitHub-detected repository license. Do not copy it into an open-source distribution until the relevant skill's license and provenance are clear. Project environments may use separately installed, appropriately licensed stack plugins instead.

## Reviewed sources

- Catalog: <https://github.com/mattpocock/skills/tree/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76>
- License: <https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/LICENSE>
- Skill index and usage signals: <https://skills.sh/mattpocock/skills>
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
