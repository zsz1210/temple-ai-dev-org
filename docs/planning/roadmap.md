# Temple roadmap

**English** | [日本語](roadmap.ja.md) | [繁體中文](roadmap.zh-TW.md)

Temple is building a dependable, repository-native operating model for human-directed AI development. Its first priority is not a dashboard or a release: it is making the development organization work clearly from project definition through delivery, independent review, recovery, and learning.

This roadmap was last reviewed on 3 September 2026. It is maintained by the Temple project and reviewed when evidence changes the direction or a mission reaches its exit signals.

## Vision

A solo developer, a multidisciplinary team, or a larger organization should be able to give AI Agents clear responsibilities, run safe work in parallel, recover context without relying on chat history, and make delivery decisions from evidence.

Temple should scale the operating discipline to the risk and size of the work. It should not require every project to run a service, adopt a particular design tool, collect usage telemetry, or operate a Management Console.

## How to read this roadmap

This document describes outcomes and priority. It is not the task backlog and does not promise dates for work that still depends on evidence.

- **Now** is the one active mission and has measurable exit signals.
- **Next** contains likely missions whose order may change after current validation.
- **Later** records lower-confidence directions that need stronger evidence or a new decision.
- Detailed delivery state lives in repository [Work Items](../../.ai-org/work-items/).
- Exact experiments and retained limits live in [validation records](../validation/README.md).
- Version history lives in the [changelog](../../CHANGELOG.md).
- Public-distribution gates remain in [release readiness](release-readiness.md), which is paused rather than erased.

## Evidence-backed current position

| Area | Current evidence | Boundary |
| --- | --- | --- |
| Core operating model | Implemented and exercised in bounded local pilots | Not yet qualified as production or enterprise operation |
| Clean onboarding | Deterministic install, init, bootstrap guidance, and Doctor path passed | Fresh-Agent comprehension and real newcomer adoption remain unverified |
| Existing projects and multiple repositories | Local brownfield, recovery, and multi-repository rehearsals passed within their stated limits | Real multi-human and multi-machine operation remains unrun |
| Workflow profiles | Lean, Standard, and High-Assurance contracts are implemented with deterministic escalation | Real High-Assurance operation with distinct people remains unrun |
| Execution routing | Provider-neutral, step-specific, deterministic resolution is implemented and hardened | It is read-only; it cannot launch a model or apply a recommendation |
| Controlled cross-comparison | Wave 5A and 5B produced mechanism, overhead, and candidate evidence | The result is not qualified: Wave 5A had one comparable pair and Wave 5B concluded `inconclusive` |
| Provider trust | `WI-0033` is still at Spec | Temple does not recommend Provider execution from an untrusted repository |
| Public distribution | A private Alpha candidate and historical release evidence exist | `WI-0086` remains blocked; publication is not the current mission |

`no-go` and `inconclusive` are useful terminal experiment outcomes. They are retained as evidence, not presented as unfinished implementation and not converted into proof that Temple is effective.

## Now — make the core path dependable

The current mission is to make one Console-free path understandable and reliable from start to finish:

```text
Define the product and authority
  -> create and route bounded work
  -> design and build
  -> test and evaluate
  -> independent QA and release decision
  -> recover context and retain learning
```

### Outcomes

1. **One coherent path.** A user can move from project initialization to organizational closeout through documented repository and CLI contracts without needing the Management Console.
2. **Proportionate process.** Lean work stays lean, ordinary work preserves review, and high-risk work escalates without treating every task as enterprise ceremony.
3. **Reliable continuity.** A fresh task can recover responsibility, state, evidence, and the next action from the repository rather than the title or memory of an earlier chat.
4. **Useful execution choices.** Position authority, capability selection, workflow profile, and model or tool recommendation remain separate and explainable.
5. **Evidence before claims.** Tests, comparisons, and adoption exercises answer a named question and stop at their stated evidence boundary.

### Exit signals

This mission is complete when retained evidence shows that:

- a newcomer or fresh Agent can complete the documented core path without maintainer chat history;
- the same path works in at least one greenfield and one existing-project setting;
- parallel work, handoff, Independent QA, and interruption recovery remain enforceable;
- users can tell why a workflow and execution route were selected and when human authority is required;
- friction, interventions, rework, elapsed time, and available resource usage are reported as measured or unknown; and
- optional Console, Usage observation, and external integrations can be absent without breaking the path.

The immediate work is a core-path audit: walk the real CLI and repository journey, identify missing or duplicated decisions, rank the friction by consequence, and repair only the gaps that block the outcomes above.

## Next — qualify real adoption

The order of these missions will be set by what the core-path audit finds.

### Independent adoption

- Have people who did not build Temple try one greenfield and one existing-project adoption.
- Observe where they need maintainer explanation, lose state, misread authority, or create unnecessary process.
- Turn repeated evidence into documentation, a Practice, a Skill, or a framework change through the existing promotion boundaries.

### Qualified cross-comparison

The cross-test program has started, but the comparison is **not complete**. Earlier runs established fail-closed execution and exposed protocol defects. The completed Wave 5B candidates produced provisional resource differences, but no valid blind score was frozen, so the Work Item correctly concluded `inconclusive`.

Before another generated run, Temple will:

- name one decision the experiment is meant to inform;
- choose representative task families rather than repeat only two synthetic cases;
- separate framework-versus-minimal and model-versus-model interventions;
- freeze inputs, tools, access, scoring ranges, quality gates, telemetry fields, and stop rules;
- qualify the exact Provider protocol offline; and
- define what result would cause a framework change, no change, or abandonment of the hypothesis.

Only quality-qualified pairs may enter resource comparison. A small sample can diagnose the mechanism; it cannot establish general Token, time, cost, quality, or rework savings.

### Collaboration and repository scale

- Run a real multi-human, multi-machine collaboration with independently administered environments.
- Exercise federation across separately maintained repositories and verify integration ownership and conflict recovery.
- Test the framework with mixed frontend, backend, infrastructure, design, QA, SRE, and Security responsibilities without hard-coding one team shape.

## Later — expand only with evidence

- Add Provider execution only after operator-owned trust, exact protocol contracts, and an explicit autonomy boundary exist.
- Qualify real High-Assurance operation, recovery loss scenarios, and regulated or enterprise controls with distinct Human Principals.
- Add semantic retrieval only where deterministic context routing demonstrates a measured limit.
- Consider automatic execution routing only after representative matched evidence and safe fallback behavior exist.
- Resume public release preparation only when the repository owner reopens publication and the exact candidate passes the retained release gates.

## Optional tools, not foundations

- **Management Console:** a human-readable, read-only aid for understanding state. Temple must remain usable without it.
- **Usage observation:** optional Provider telemetry for attribution and analysis. Missing observation remains unknown, not zero.
- **Local Observer or daemon:** optional for continuous collection; never required for canonical Work Items, evidence, or recovery.
- **External trackers and integrations:** coordination surfaces whose data cannot replace Temple lifecycle authority.
- **Figma, RAG, local models, and additional Skills:** supported extension choices, not universal dependencies.

## Roadmapping approach

The structure follows three useful public principles: roadmaps communicate outcomes and what is not being done; they remain distinct from delivery backlogs; and their farther-future contents carry more uncertainty. See the [UK Government Service Manual](https://www.gov.uk/service-manual/agile-delivery/developing-a-roadmap), [GitHub Projects documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects), and [Atlassian's agile roadmapping guide](https://www.atlassian.com/agile/product-management/roadmaps).
