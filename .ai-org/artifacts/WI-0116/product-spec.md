# Product specification — WI-0116

## Outcome

A human reviewer can see where Wave 5A spent observed Tokens and time, which comparisons qualified, and why no savings or causal claim follows. A later Wave 5B run has a machine-checkable score-freeze and mapping-unseal protocol that fails closed when evaluator access separation is not evidenced.

## Acceptance

1. One deterministic command reads the retained WI-0113 experiment result and emits a versioned analysis document.
2. Aggregate totals, per-candidate shares, cache ratio, qualified-pair deltas, and quality exclusions are recomputed rather than copied as prose.
3. Unknown billing, provider internals, prompt-causality, and statistical significance remain explicitly unknown.
4. The evaluator protocol hashes its arm-neutral input manifest, rejects forbidden mapping fields, requires a fresh evaluator context attestation, freezes scores before unsealing, and rejects compromised ordering.
5. Tests exercise valid and adversarial observations without generation.
