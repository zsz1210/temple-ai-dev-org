# WI-0111 risk review

- **Under-blocking:** tests cover operators after quoted data, substitution in double quotes, newlines, malformed quotes, and mixed actions.
- **Over-blocking:** the exact persisted WI-0110 `search` action and quoted literal metacharacters are positive fixtures.
- **Parser ambiguity:** the scanner is intentionally conservative, rejects malformed input, and never evaluates or rewrites shell text.
- **Protocol drift:** the exact installed schema digest and shared-helper preflight remain required.
- **Cost:** all work is deterministic and local; no model generation is authorized.
