# ADR-0071: Opt-in tool-output compression with exact original readback

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
creation, restrictive permissions and a digest. A one-shot Node writer anchors
the physical working directory and checks its pre-compression device/inode before
opening only the relative leaf; on macOS writes are also confined to that exact
snapshot. Parent replacement therefore cannot redirect creation. Readback rejects missing, changed
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

## Caller payload admission refinement

A bounded real-output replay found that diagnostic-envelope overhead could erase
small content savings. Add an explicit `headroom-payload` delivery path while
retaining `headroom-view` compatibility and the disabled default. Plain stdout
is byte-exact original text for passthrough/fallback; accepted compression carries
only content and exact original-readback metadata. Library diagnostics remain
separate, with an explicit CLI JSON inspection mode.

The same pinned worker counts the complete candidate model string. The parent
reconstructs that string and checks the measurement's text/digest before accepting
a minimum saving of max(256 tokens,10% of original tokens), plus fewer bytes.
These conservative bounds are not tuned efficacy or quality guarantees. Reject
before snapshot creation when savings are insufficient. Small outputs never
start the worker. A large low-gain output may still pay one compression attempt.

No global tool routing, new tokenizer dependency, model call or additional worker
invocation is introduced. Estimates exclude caller framing, history, model output
and later readback. The caller must provide original recovery and evaluate those
costs and correctness before considering automatic enablement.
