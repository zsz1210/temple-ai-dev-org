# WI-0136 representative microservice comparison

- Status: completed one matched representative pair
- Candidate protocol: `ffc48213ef3704418cb031a1fdf0621fb79763df259c9bc290d340224a4ec06c`
- Evaluator continuation protocol: `3247ab0cfcfa8664efea67cd751cae51cbaf9d0729276f03d250010e81ab9eb5`
- Candidate record: `c78c1ab4753e9aca3c095389cafe19fead5cb98328a4faf23adba71ca0303165`
- Retry / fallback: 0 / 0

## Results

| Measure | Minimal Responsible | Temple | Temple delta |
|---|---:|---:|---:|
| Objective tests | pass | pass | 0 |
| Blind score | 8/8 | 8/8 | 0 |
| Operational Tokens | 183,854 | 177,396 | -3.51% |
| Model latency | 515.2 s | 501.2 s | -2.72% |
| Integration Tokens | 57,806 | 56,440 | -2.36% |
| Exact revisions recovered | 4/4 | 4/4 | 0 |
| Boundary violations | 0 | 0 | 0 |
| Artifact bytes | 222,982 | 2,592,500 | 1062.65% |

The blind evaluator used 20,860 Operational Tokens on gpt-5.6-sol xhigh. Candidate plus evaluator usage was 382,110 Operational Tokens.

## Interpretation boundary

This is one controlled matched pair. It describes this scenario; it does not establish statistical generalization, monetary cost, or automatic routing authority. Correctness and the arm-blind score remain primary; Token, latency, and artifact differences are trade-offs rather than proof by themselves.
