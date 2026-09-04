# WI-0143 approved scope

## Question

When the task, repository evidence, model, reasoning effort, tooling, and quality gate are held constant, does Routed Context perform differently from Full-load Context for a bounded single-repository recovery task and a bounded multi-repository coordination task?

## Acceptance criteria

1. WI-0141 remains immutable, and WI-0143 writes only to its own artifact root and disposable laboratory.
2. The protocol contains an exact revision, harness digest, treatment-package digests, fixed condition order, fixed model and reasoning effort, per-condition and aggregate limits, privacy rules, zero retry, and zero fallback.
3. Each task/repetition pair runs adjacently, with the leading treatment counterbalanced across the four blocks.
4. Cache balance is evaluated per matched pair. The protocol predeclares a maximum two-percentage-point cache-share difference, based on the retained WI-0141 first-wave near-pair observations (0.10 and 0.50 percentage points) with a conservative engineering margin. This is a diagnostic threshold, not a statistical estimate.
5. If any pair exceeds that threshold, or cache usage is missing, causal efficiency claims are blocked while descriptive measurements remain visible.
6. Objective correctness is the primary gate. Efficiency cannot compensate for a quality regression.
7. Preparation, rehearsal, and preflight perform no model generation. Live execution remains blocked until an exact human approval matches the frozen protocol.

## Non-goals

- proving a universal Token-saving claim;
- comparing Terra, Luna, Sol, or a future model;
- granting automatic model-routing authority;
- deriving billed cost from Token counts;
- changing the Context Capsule implementation during the measurement;
- rewriting historical observations.
