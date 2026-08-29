# Capability catalog

Temple keeps installed Skills deliberately small. A Skill belongs in `project-overlay/` only when most product repositories need it and its trigger is distinct. Other useful capabilities remain here with source, version, license, intended Position, and an explicit adoption state.

The Matt Pocock catalog was reviewed at commit `6654f6b60cd9d5be8b54c6fafe44346dabeb3b76` under the MIT License. Temple does not vendor or invoke that repository at runtime.

| Capability | Intended Position | State | Temple decision |
|---|---|---|---|
| `domain-modeling` | Product Manager, Tech Lead | Core, independently implemented | Install now for Project Charter, ubiquitous language, boundary, invariant, Spec, and ADR work. |
| `project-documentation` | Product Manager, Tech Lead, Quality & Evaluation Engineer | Phase 1.5 core candidate | Independently implement human-facing README and documentation lifecycle work. Ground commands, examples, links, and claims in repository evidence; keep it distinct from AI-facing instruction design. |
| `tdd` | Developer, Quality & Evaluation Engineer | Optional candidate | Evaluate a Temple-native version on a real project; require observable red/green evidence and public-interface test seams. |
| `diagnosing-bugs` | Developer, Quality & Evaluation Engineer | Optional candidate | Preserve for bounded reproduction and feedback-loop design; add repository evidence and redaction rules before adoption. |
| `prototype` | UX Designer, Developer | Optional candidate | Evaluate for answering one risky product or technical question without turning a prototype into an implied production commitment. |
| `code-review` | Tech Lead, Independent QA | Adaptation candidate | The concept fits independent review, but upstream assumptions about subagents, setup, and issue trackers must not become hidden requirements. |
| `improve-codebase-architecture` | Tech Lead | Adaptation candidate | Preserve the deep-module and locality lens; validate how it interacts with ADRs, bounded contexts, and existing architecture. |
| `writing-great-skills` | Toolkit maintainer | Maintainer inspiration | Apply centrally through `docs/skill-design.md`; do not install it into every product repository. |
| `writing-for-agents` | Toolkit maintainer | Maintainer inspiration | Use for project-facing instruction quality; do not add another runtime capability without a distinct trigger. |
| `handoff` | Engineering Manager | Do not adopt as-is | Temple already stores canonical handoffs in the repository; temporary handoff documents would create a competing truth. |
| `to-spec` | Product Manager, Tech Lead | Do not adopt as-is | Overlaps the Temple lifecycle and assumes a separate planning model. Revisit only if a pilot exposes a concrete gap. |
| `to-tickets` | Engineering Manager | Do not adopt as-is | Depends on an issue-tracker workflow that Phase 1 intentionally does not require. |

## Adoption gate

A candidate moves into an optional pack or the core overlay only after:

1. a real work item demonstrates a repeated need;
2. its trigger does not overlap an installed Skill;
3. license and pinned upstream provenance are recorded;
4. the Temple-native behavior preserves canonical state and human approval boundaries;
5. tests and independent QA show that it improves the outcome without creating hidden tools or services.

AiPet is the next portability pilot and will identify which candidate deserves the first optional pack. Phase 1.5 will exercise `domain-modeling` during a greenfield Project Charter and evaluate `project-documentation` against the first human-facing README and documentation baseline.

## Reviewed sources

- Catalog: <https://github.com/mattpocock/skills/tree/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76>
- License: <https://github.com/mattpocock/skills/blob/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76/LICENSE>
- Skill index and usage signals: <https://skills.sh/mattpocock/skills>

README and documentation lifecycle sources reviewed as inspiration, not vendored dependencies:

- Hypergiant `accelint-readme-writer`, Apache-2.0, reviewed at `459a846a65544cf311164059f2ea4623ec443b02`: <https://github.com/gohypergiant/agent-skills/tree/459a846a65544cf311164059f2ea4623ec443b02/skills/accelint-readme-writer>
- AsyrafHussin `project-docs`, MIT, reviewed at `1aa0ff717c10309226c9e678f00873976450fd76`: <https://github.com/AsyrafHussin/agent-skills/tree/1aa0ff717c10309226c9e678f00873976450fd76/skills/project-docs>
