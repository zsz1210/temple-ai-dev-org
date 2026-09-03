# Risk review — WI-0123

Risk is Standard because the exported resolver and a versioned managed schema change, but the work remains local, deterministic, reversible, and non-executing.

The main risks are rejecting a legitimate internal option, allowing another input/output grammar mismatch, or hiding malformed collections through normalization. Mitigation is explicit precondition errors, separate type-error recording before safe iteration, generated-output closure tests, full verification, and separate Independent QA.

Rollback is a revert of the exact candidate. No Provider, model, external system, deployment, publication, or release action is involved.
