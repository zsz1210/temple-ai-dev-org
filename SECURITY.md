# Security

- Do not commit API keys, GitHub tokens, private prompts, or customer data to this repository.
- Initialization configuration should contain only Agent display names and Position assignments, never model credentials.
- `temple init` does not overwrite managed files whose contents differ. It also leaves an existing `AGENTS.md` unchanged unless integration is explicitly requested.
- Archify is an optional visualization adapter. It must never receive authority to approve a release or modify canonical state.

## Federation participant inspection

Federation treats every participant checkout as untrusted input. A participant path must resolve to the exact Git worktree root and remain inside the explicit federation root. Inspection runs Git noninteractively with a bounded environment, skips ambient global and system configuration, disables executable `core.fsmonitor`, repository hooks, credential helpers, replacement objects, and all transport protocols, and forbids lazy fetch. Missing objects and hostile or inconsistent repository state degrade the participant to `unknown`; they do not authorize a network request, participant write, or lifecycle mutation.
