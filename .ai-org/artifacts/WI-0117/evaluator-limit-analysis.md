# Evaluator limit analysis — WI-0117

The first fresh-context evaluator was stopped after 10.7 seconds because it crossed the approved 20,000 operational-Token ceiling. No score was frozen, no condition mapping was unsealed, and zero retry was preserved.

The evaluator received 12,134 bytes of arm-neutral package and rubric files. The four successful Luna Medium candidate turns consumed 28,111 to 32,592 operational Tokens each. This demonstrates that 20,000 is below the observed fresh Luna Medium task baseline even when the product input is small; App Server and model context contribute to the operational counter.

A bounded replacement evaluator should therefore use a 40,000 operational-Token ceiling: 28,111, the lowest completed Luna Medium turn, plus 42.3% headroom. This is an evidence-based safety allowance, not an expected value or billing guarantee. The replacement must remain one attempt, Luna Medium, ten minutes, no tools, no network, no retry, no fallback, no purchased Credits, and no reset redemption.

Because the original approval allowed exactly one evaluator turn and zero retries, unused candidate budget cannot authorize a replacement. A separate owner approval is required even though the combined observed program remains below the original 260,000 operational-Token ceiling.
