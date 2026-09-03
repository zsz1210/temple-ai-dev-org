# Risk review — WI-0121

- **Over-constraining valid output:** test every resolver mode and Provider-neutral mapping.
- **Duplicating Schema and semantic checks inconsistently:** assign structural/nullability checks to Schema and cross-field consistency to the pure semantic validator; test the combined boundary.
- **Leaving another bypass:** hand the exact candidate back to the same separate Independent QA task that found both earlier gaps.
- **Expanding execution authority:** prohibited; v1 remains non-executing and read-only.
- **Losing failed-attempt history:** prohibited; parent WI-0120 stays blocked with Attempt 1 evidence until this child passes.
