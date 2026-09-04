# WI-0138 Developer verification

- Candidate revision: `c2ebaa1d7e5da8c43bf7d382ddeaae2d8ff61c99`
- Position: Developer
- Agent Identity: Rikku (`agent-rikku`)
- Result: generation-free preparation passed; live generation remains blocked by exact approval

## Implemented

- Deterministic single-repository and coordinator-led multi-repository cold-handoff fixtures.
- Matched `legacy-expanded` and `stage-aware` context packages generated from one clean source per shape.
- Body-free source manifests with paths, categories, byte counts, content digests, and selection digests.
- Strict single- and multi-repository recovery schemas with deterministic correctness evaluation.
- Fresh sequential Terra medium candidate execution through the installed Codex App Server.
- Read-only command and path boundaries, memory isolation, no network, zero retry, zero fallback, and stopped-run retention.
- Protocol-bound approval, generation-free rehearsal, Provider preflight, live execution, and analysis commands.
- A human-facing experiment description and interpretation boundary.

## Generation-free evidence

- Protocol: `45717b859f2f88a4dd182d4bb7c7968839eb154e0f3ad9671e4d53e3986ad382`.
- Harness source digest: `2878c9594374757ec9593a15c9997aa807ee61264e9cc024652ef65891a80d80`.
- Harness readiness: 26/26 checks passed with 0 Operational Tokens and no model generation.
- Provider preflight: lab, source binding, Provider contract, and readiness passed; `exact-approval` is the only blocker.
- Full repository verification: 405/405 tests passed; repository, documentation-link, and package-boundary checks passed.
- Related context and microservice regression set: 56/56 tests passed.

## Static treatment difference

| Shape | Legacy bytes | Stage-aware bytes | Difference |
|---|---:|---:|---:|
| Single repository | 40,093 | 14,389 | -64.11% |
| Coordinator-led multi-repository | 34,164 | 11,644 | -65.92% |

Both pairs use identical repository manifests. These deterministic byte reductions qualify the fixture for a live comparison; they are not Token, latency, quality, cost, or population-wide savings claims.

## Remaining boundary

No live candidate has run. The project usage policy requires exact approval of the frozen protocol before four Provider turns may start. The implementation does not authorize Credits purchase, automatic refill, reset use, retry, fallback, reroute, release, or publication.
