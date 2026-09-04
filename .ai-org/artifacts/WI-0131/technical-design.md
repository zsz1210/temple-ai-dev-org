# Technical design — WI-0131

## Native Lean setup

The successor runner creates Temple candidates with the repository-pinned CLI and explicitly supplies `--workflow-profile lean`, `--risk-tier low`, and `--scope-class bounded`. It advances `intake → build` with the six Lean gate requirements and rejects any effective-profile drift before generation.

## Comparable inputs

Each case carries a versioned acceptance contract. The runner validates every contract dimension, hashes the product task, contract, candidate instruction, and routed Context Capsule, and records UTF-8 byte counts by context component. A/B share the same task and route; B/C/D share the same Temple treatment.

## Routing boundary

The default shadow policy uses Terra medium for explicit bounded work. Luna max is an advisory escalation for semantic ambiguity and invariant-sensitive work. Sol xhigh remains the flagship route for consequential high/critical work and the optional ceiling arm in the experiment. Routing never contacts a Provider or starts a task.

## Evaluation

Objective held-out tests are primary. Blind qualitative review is secondary and must use one fresh, arm-neutral evaluator context. The report separates A→B process effect, B→C efficient-escalation effect, and C→D flagship-ceiling effect. No cross-arm delta is presented as a pure model effect.

The analyzer supports incomplete or invalid arms without silently retrying. Live execution remains disabled unless a new exact approval record matches the protocol digest, allowed models, turn count, time limit, and operational Token ceiling.
