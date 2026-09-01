# WI-0083 Evaluation Report

- Position: Quality & Evaluation Engineer
- Agent Identity: Lulu (`agent-lulu`)
- Candidate revision: `ad10d528113963673724d9b02004b62e87aaafbe`
- Evaluation result: pass with retained product limits

## Evaluated product behavior

The shipped behavior answers a narrower question than automatic model optimization:

> Given project-owned results for the same cases and the same declared task shape, is there a profile that passes the quality gate and also satisfies the project's configured resource decision contract?

It does not answer:

> Which model should Temple run automatically for any future task?

The first question is implemented as a deterministic, read-only evaluation. The second remains unavailable.

## Adversarial outcomes

- A challenger that uses fewer Tokens but fails one quality case is rejected.
- A challenger with another input digest, source revision, case set, task shape, effective model, reasoning profile, or statistical contract is rejected.
- An expired record becomes stale and cannot provide a current advisory.
- Unknown fields that could carry raw prompts or another undeclared payload are rejected; all named privacy-retention flags must be false.
- An unsafe path, symlinked file, repository escape, missing file, invalid JSON document, or file larger than one MiB fails closed.
- A qualified comparison in `shadow` mode remains `qualified-shadow` rather than an advisory.
- Even if a project writes `recommendation_mode: automatic`, this implementation performs no provider call, model switch, policy change, lifecycle transition, budget override, or release action.

## Remaining evidence gap

The repository fixture demonstrates evaluator correctness, not real-world model performance. A project must separately approve its cases, rubric, statistical assumptions, provider and budget, then record fresh comparable results. Temple's own policy currently configures no such source, so no project-qualified model recommendation exists for Temple itself.
