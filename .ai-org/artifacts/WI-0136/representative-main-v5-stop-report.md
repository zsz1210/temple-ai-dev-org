# Representative comparison v5 stop report

Protocol `4b6c78cfa4b367787eb79a1d555dcfa387d2048d656741f7611f64c48b5f64f6` passed exact approval and preflight, then ran once with zero retry and zero fallback. It completed the Minimal Responsible Design turn before the concurrent Build wave stopped on a command-policy violation. The Temple arm and blind evaluator did not start.

The stopped run observed 125,681 candidate Operational Tokens. The completed Design used 47,032. The orders-catalog Build retained 33,432 and the exact stop reason: the model requested the read-only command `git -C ../../orders status --short`. The command was issued from a Provider-reported working directory inside the fixture, but the allowlist compared only literal command prefixes and could not validate the normalized target path. It rejected the command rather than allowing unresolved traversal.

The v5 partial-stage repair worked: the active Design and stopped Build telemetry are retained. Inspection after the main result also found two sibling Build App Server processes briefly alive. They were terminated and no process remains. A successor must validate Git `-C` targets by resolving the Provider-reported command working directory and requiring an exact fixture repository root, and it must interrupt and await every sibling turn before writing the final stopped-run. Literal `../../` prefixes must not be globally allowlisted.

V5 provides no completed arm and no Temple-versus-minimal result. A successor must use fresh matched repositories, preserve the v5 resource envelope, freeze a new runner and Provider digest, and receive separate exact approval. It must not resume or retry this lab.
