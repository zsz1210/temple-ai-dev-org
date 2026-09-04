# Quality and evaluation report — WI-0130

## Decision

The retained report is accurate for the observed run and suitable as diagnostic evidence. It does not qualify the intended Lean Core Path claim, a framework-wide effectiveness claim, or automatic model routing.

## Independent checks

- Recomputed the three retained lab digests and matched the canonical observation:
  - candidate evidence: `d06e92781b7f2dc4543e43d411eb81f738f671adfb4978022be9d6d39206926d`
  - final analysis: `421855b4aeff407ed3f450a90f63d48613a85950db4709f13f00f1cfd20b377c`
  - frozen blind scores: `67650a866f8d05b563a2cf7a0c3e232e8196e2eccd452dad2a84d2f980fe8078`
- Confirmed all seven effectiveness-pilot regression tests pass at `4fbb0fb4a7fa17e5ab71e5f76053190a562d2b70`.
- Confirmed documentation links pass and the project schema is valid with zero errors or warnings.
- Confirmed the retained operational total is `236648 / 520000`, with six candidate turns and one evaluator turn, no retries, and no fallback.
- Confirmed the human report does not convert gross cached throughput into budget or monetary cost.

## Result interpretation

The A/B comparison shows no measured quality improvement from the observed Standard Temple process. The one jointly correct case used 17.61% more operational Tokens and was 3.92% faster under Temple Fixed. The other case failed in both fixed arms.

The B/C comparison shows a quality recovery on one ambiguous invariant and no quality gain on the already-correct case. Across both cases, the adaptive arm used 76.46% more operational Tokens and 233.60% more candidate time. This supports redesigning the broad `bounded-quality` rule, not enabling automatic routing.

## Limitations that must remain visible

1. The Temple arms actually used `standard`; the registered protocol required `lean`.
2. Only two implementation cases were sampled.
3. The identity invariant was clearer in the held-out rubric than in the task statement.
4. Requested models were acknowledged, but effective turn reasoning effort was not directly observed.
5. Candidate latency excludes an exact retained evaluator-latency field.

## Evaluation outcome

`pass` for the integrity of the retained diagnostic evidence and report. `no-go / inconclusive` for the intended Lean effectiveness claim and any automatic routing policy change.
