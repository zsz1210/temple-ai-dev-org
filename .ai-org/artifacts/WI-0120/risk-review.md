# Risk review — WI-0120

- **False acceptance remains possible:** mitigated by compiling the real managed schema and retaining the exact malformed counterexample.
- **Schema rejects valid resolver output:** mitigated by validating multi-step, pinned, fallback, unresolved, null-resource, and media-extension outputs.
- **Schema and semantic validator drift:** mitigated by routing cataloged route documents through both layers and testing cross-field invariants separately.
- **Project-owned policy overwritten during repair:** prohibited; only the managed route schema and code/tests may change.
- **Authority expands during repair:** prohibited; automatic execution and Provider contact remain fixed false.
- **Historical evidence is rewritten:** prohibited; the WI-0119 closeout remains unchanged and this repair has its own Work Item.

Residual risk after correction remains limited to future Provider compatibility, real model quality, cost, and automatic execution, all of which stay outside this Work Item.
