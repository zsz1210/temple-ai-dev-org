# ADR-0070: Opt-in tool-output compression with exact original readback

- Status: Accepted for an optional local adapter
- Date: 2026-09-19

## Context

A bounded four-arm synthetic diagnostic found lower total input with Headroom
and Jev, but no reduction in answer turns and slower combined execution. This
does not support automatic compression or semantic selection for every task.

## Decision

Provide explicit `adapter headroom-view` and `adapter headroom-read` commands.
Default operation returns the original. Only caller-classified large log/JSON
tool output, an explicit enable flag, a trusted local Python runtime and an
exclusive original snapshot permit compression. Retain mandatory instructions,
canonical evidence, approvals and code outside this lossy view.

Pin `headroom-ai==0.37.0` (upstream tag `v0.37.0`) and `tiktoken==0.14.0`.
Headroom's Apache-2.0 LICENSE and NOTICE and tiktoken's MIT license were reviewed.
Temple distributes its own wrapper, not upstream code or a Python environment.
No dependency download, installation, model call or global configuration occurs.
The configured Python environment is operator-trusted; version checks are not a
complete supply-chain attestation. Operators retain its lockfile and notices.

The first supported compression runner is macOS with OS-enforced network denial,
isolated Python startup, constrained writes, fresh scratch and no persistent
worker. Other platforms safely return originals. The snapshot uses exclusive
creation, restrictive permissions and a digest; readback rejects missing, changed
or unsupported files. No canonical state is mutated. The caller owns retention.

Compression failure, unavailable runtime, unsupported input, a CCR marker or no
net envelope reduction yields the exact original. CCR cannot outlive this worker,
so native CCR and proxy functionality are explicitly outside this contract.

Report bytes, local token estimates, worker/total elapsed time and readback cost
separately. Actual model tokens remain unknown. Jev is a replaceable upstream
selector, never a mandatory dependency or implicitly authorized paid call.

## Consequences

Ordinary Temple and Codex workflows are unchanged. Explicit tool wrappers can use
this adapter and request exact originals. This is not interception of arbitrary
Codex tools or conversation history. The initial 16 KiB threshold and 1 MiB bound
are conservative operational limits, not measured optimal routing decisions.
Real-task efficacy and cross-platform confinement require separate validation.
