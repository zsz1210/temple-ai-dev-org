# Quality evaluation - WI-0135

## Decision

Pass for the registered diagnostic scope at revision `7394ec9a659f65909bf8ab80ba7b2989fc9c8731`.

The implementation preserves the frozen four-arm behavior while adding a two-arm path through the same controlled runner. The retained analysis reproduces from the local lab evidence, all resource totals reconcile, and the textual report states the neutral result without claiming Token savings or framework-wide superiority.

## Evidence reviewed

- Exact protocol and approval validation: pass.
- Four isolated candidates and one fresh evaluator: complete.
- Public and held-out tests: 4 / 4 pass.
- Blind packages: four complete scores, all frozen before mapping unseal.
- Candidate operational Tokens: 126,755 / 174,000.
- Combined operational Tokens: 149,982 / 209,000.
- Retry, fallback, reroute, network access, and out-of-scope writes: zero.
- Focused regression suite: 12 / 12 pass.
- Recomputed A/B analysis deep-equals retained analysis after excluding only its provenance digest.
- Documentation links: pass.

## Interpretation

Optimized Temple has equal objective and blind-reviewed quality. It is 19.7718% faster in aggregate but uses 1.7589% more operational Tokens. The registered v3 classifier therefore returns `neutral`, because both Token and latency improvements were required. Routing and model defaults remain unchanged.

## Limitations

- Four candidate turns over two narrow cases are diagnostic, not statistically representative.
- Both arms requested Terra medium and acknowledged Terra. The App Server reported thread-level high while effective turn effort remained unavailable, so the comparison establishes a matched request but not a proven effective effort value.
- Monetary cost, human intervention, rework, and long-running multi-Agent continuity were not measured.
- The local lab is intentionally outside Git; retained observations bind its generated evidence by digest without storing raw prompts, responses, or hidden reasoning.
