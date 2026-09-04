# Technical design — WI-0132

## Live protocol

Create a WI-0132 live protocol derived from the independently reviewed WI-0131 protocol. Pin the exact framework revision and retain the frozen fixture, launch-instruction, tool-policy, and acceptance-contract digests.

The live runner extends the provider-free harness with four explicit modes:

- `setup`: create eight fresh candidate repositories;
- `preflight`: verify repository, schema, model, context, approval, and resource boundaries without generation;
- `run`: execute each candidate once in frozen order and stop immediately on a protocol or resource violation;
- `evaluate`: run one read-only arm-neutral evaluator and freeze its scores before revealing mappings.

No mode retries or falls back. A stopped run is evidence, not permission to resume.

## Provider handshake

Generate the installed App Server JSON Schema locally and compare the ten request, response, usage, reroute, and interrupt digests previously contract-tested by Temple. Open a fresh stdio connection, initialize it, and require:

- `gpt-5.6-terra`: `medium` and `high`;
- `gpt-5.6-luna`: `max`;
- `gpt-5.6-sol`: `xhigh`.

The handshake creates no Provider turn.

## Resource envelope

The proposed ceiling is derived from WI-0130 rather than an industry benchmark. Its maximum observed candidate was 65,021 operational Tokens and six candidates used 211,526. The proposal allows 100,000 per candidate, 520,000 for all eight candidates, 60,000 for the evaluator, 580,000 combined, and 4,500,000 ms wall clock. The per-candidate ceiling is 1.54 times the observed maximum and the aggregate candidate ceiling is 2.46 times the previous six-candidate total, allowing two unobserved Sol turns without pretending to estimate their cost precisely.

These are reactive safety stops. They do not guarantee billing, included allowance, or interruption before Provider-side accounting crosses a boundary. The owner must accept the exact envelope before generation.

## Evidence flow

Each candidate produces a sealed record containing route, model acknowledgement, requested effort, detailed usage, latency, revisions, tests, and context measurement. Its paired blind package replaces resource and identity fields with nulls. The evaluator reads only sanitized packages and frozen rubrics.

The analyzer consumes the frozen eight-candidate evidence and emits three paired comparisons. The human report presents the observed results, limitations, and concrete routing or context recommendations.
