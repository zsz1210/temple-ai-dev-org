# Console-free core operating path audit

- Work Item: `WI-0127`
- Baseline: merged `main` revision `5a790acf8a39a47b8ddd8ed8b5247b4f10beea16`
- Date: 2026-09-03
- Result: **mechanics pass; human golden path needs consolidation and correction**
- Model generation, Console, Observer, Usage Collector, network write, deployment, publication, and external release: **not used**

## Question

Can Temple complete its core development path without optional operational tools, and can a human or fresh Agent discover that path without reconstructing it from scattered documentation?

The first answer is yes for deterministic local mechanics. The second is not yet demonstrated. The CLI and repository contracts work, but the public path is fragmented and contains one lifecycle contradiction.

## Current deterministic result

Two existing validators were rerun from the merged baseline.

| Rehearsal | Result | Elapsed | Verification | Retained boundary |
| --- | --- | ---: | --- | --- |
| Clean agent-led onboarding | Passed with Provider limits | 2,674 ms | Doctor 36 pass, 1 warning, 0 fail | Deterministic instruction reads; no fresh Provider session or comprehension result |
| Existing-project lifecycle | Passed | 2,634 ms | Doctor 37 pass, 0 warning, 0 fail; 2 Developer and 2 Independent QA application tests | Synthetic repository, one human, one machine, no model |

The brownfield rehearsal preserved two original commits and all original README, requirements, and contribution-policy bytes. It completed an exact-revision Work Item with different Developer and Independent QA Agent Identities and ended at `done`. The Management Console, Observer, Usage Collector, and network were absent.

These timings measure deterministic script execution on one local Mac. They do not measure a person's setup time, Agent reasoning time, Token use, productivity, or savings.

## The path that exists today

| Step | Mechanism | Current human-facing location | Audit result |
| --- | --- | --- | --- |
| Install and initialize | `temple init`, bootstrap contract, project launcher | README and Usage sections 1–2 | Mechanically verified |
| Confirm organization and authority | assignments, collaboration profile, repository integration | Initialization guidance plus several concept and operation pages | Available, but branches early into advanced modes |
| Choose work depth | Lean, Standard, or High-Assurance profile | Separate Workflow Profiles concept page | Not connected to the primary Work Item example |
| Create bounded work | `work-item create` and `configure` | Usage section 8 | Mechanically verified |
| Take active ownership | `work-item claim` and `release` | Required by Agent instructions; only parallel preparation is demonstrated in the main Usage guide | Ordinary path example missing |
| Resolve method and context | `capability find` and `context resolve` | Usage section 6 | Available, but not placed into the delivery sequence |
| Resolve execution profile | `execution resolve` | Separate concept and operation documents | Missing from the main Usage guide |
| Deliver and preserve evidence | handoff and lifecycle transitions | Usage section 11 | Mechanically verified for the synthetic Standard path |
| Evaluate and close | test, evaluation, Independent QA, `temple close` | Usage section 12 | Mechanically verified; one documented no-go outcome is wrong |
| Recover a fresh task | repository instructions, status, context capsule, evidence | Usage sections 13–14 and repository instructions | Demonstrated in an earlier bounded pilot, not one continuous public journey |
| Retain learning | Lesson, Practice, Skill Proposal | Usage sections 5 and 17 plus extension guides | Available, but not connected to closeout as a conditional next step |

## Observable friction

- The root README is 131 lines and points to the 707-line Usage guide.
- Reconstructing the complete core path requires non-contiguous Usage sections 1, 2, 6, 8, 11, 12, 13, 14, and 17, plus the 97-line Workflow Profiles page for proportionate delivery.
- The repository Agent contract and `temple-work` Skill add another 129 lines of operator guidance. Agents need those contracts, but a human should not have to assemble them into a tutorial.
- The existing brownfield fixture uses 14 Temple CLI invocations from initialization through Doctor, seven manually authored evidence documents, two generated lifecycle artifacts, and four Temple-era Git commits. These are machine-observed steps, not fourteen required human approvals.
- The executable fixture does not call `capability find`, `context resolve`, `execution resolve`, backup, or learning commands. Those capabilities therefore remain individually tested rather than proven as one coherent journey.

## Findings

### P0 — none observed

The bounded core mechanics completed without optional services or a Provider. No destructive, authority-breaking, or completion-blocking defect reproduced.

### P1 — no single human golden path

The framework has the required pieces, but its primary guide is a reference manual organized by capability. A first-time user cannot follow one short sequence from initialization to closeout and recovery without jumping across multiple sections and concept pages.

**Consequence:** successful mechanics can still feel complicated, and an Agent can omit a step whose contract exists elsewhere.

### P1 — the documented no-go state contradicts runtime behavior

The Usage guide says `temple close --decision no-go` returns a Work Item to `blocked`. Current source closes the approved attempt as terminal `concluded` with outcome `no-go` or `inconclusive`.

**Consequence:** a user may look for an active blocker or attempt to resume work that has intentionally ended.

### P1 — proportionate workflow is not part of the primary creation path

Standard remains the default. Lean is documented on a separate concept page, while the main Work Item example does not show the profile, low-risk eligibility, or the evidence bundle needed to enter Build.

**Consequence:** small Solo changes may inherit Standard ceremony even though Temple now supports a justified Lean path.

### P1 — ordinary claim and release are not demonstrated

The Agent contract requires claims around active ownership. The Usage guide explains claims inside `parallel prepare` and mentions release in that context, but it does not demonstrate the ordinary sequential `work-item claim` and `work-item release` path.

**Consequence:** users may treat the assigned Agent as an active runtime owner or leave stale claims behind.

### P2 — context, capability, and execution routing are disconnected from delivery

Capability and context discovery appear before Work Item creation in the reference guide. Execution Route has no command example in the main Usage guide. None is shown at the moment when an Agent chooses how to perform a Work Item step.

**Consequence:** Temple's differentiated routing layer exists but is easy to skip, and responsibility can again become confused with model choice.

### P2 — recovery and learning are separate destinations

Recovery is documented as an operation and learning as an extension. The closeout path does not tell the reader when to stop, when to capture a Lesson, or how a fresh task resumes from the closed or next Work Item.

**Consequence:** the repository can preserve continuity, but the human journey does not make the loop visible.

### P2 — deterministic success is not comprehension evidence

The onboarding validator reads the named instruction files and confirms zero authority side effects, but it does not start a fresh Codex or Claude task. The brownfield fixture writes correct artifacts programmatically.

**Consequence:** Temple knows the machinery works; it does not yet know that an unaided user or fresh Agent understands what to do.

### P3 — optional Console test stability remains separate

`WI-0126` observed one full-suite Console refresh timeout that did not reproduce in two focused runs or two later full runs. It does not affect this Console-free result and should remain a separate test-stability signal unless it reproduces.

## Recommended next work

1. **Create one short Core Path guide and make it the primary post-init destination.** Show one Lean path first, explain when Standard or High-Assurance replaces it, and link rather than duplicate advanced details.
2. **Correct lifecycle guidance.** Fix the terminal `concluded` no-go behavior, add ordinary claim and release, and show gate evidence at the step where it is needed.
3. **Place routing in the journey.** Show capability, bounded context, and read-only Execution Route resolution before execution without implying automatic launch authority.
4. **Add a deterministic golden-path contract.** Keep it small and separate from every-PR CI if it creates nested repositories; verify commands and documentation markers together.
5. **Run one fresh-Agent comprehension exercise.** Only after the guide is stable, ask a new task to complete the bounded path without maintainer chat history and record interventions as observations.
6. **Resume cross-comparison later.** Use the corrected core path as the Temple treatment, then run representative task families under a pre-qualified evaluator contract. Do not repeat Wave 5 merely to increase the run count.

The first three items form one bounded documentation and journey change. The fresh-Agent exercise and qualified cross-comparison remain separate validations because they invoke a Provider and answer different questions.

## Reproduce the mechanical baseline

From a clean Temple checkout with dependencies installed:

```bash
node scripts/validate-agent-led-onboarding.mjs
node scripts/validate-brownfield-adoption.mjs
```

Both runners use disposable local repositories and stop at their documented evidence boundary.

## Related evidence

- [Greenfield agent-led onboarding](greenfield-agent-led-onboarding.md)
- [Wave 1 adoption evidence](wave-1-adoption-evidence.md)
- [Greenfield cold-task recovery](greenfield-cold-task-recovery-result.md)
- [Evidence-driven Lean Mode retrospective](evidence-driven-lean-mode.md)
- [Wave 5 controlled comparison](wave-5-controlled-comparison-plan.md)
