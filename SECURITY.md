# Security

- Do not commit API keys, GitHub tokens, private prompts, or customer data to this repository.
- Initialization configuration should contain only Agent display names and Position assignments, never model credentials.
- `temple init` does not overwrite managed files whose contents differ. It also leaves an existing `AGENTS.md` unchanged unless integration is explicitly requested.
- Archify is an optional visualization adapter. It must never receive authority to approve a release or modify canonical state.
