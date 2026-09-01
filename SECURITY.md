# Security

## Supported versions

Temple is still preparing its first public Alpha. No public version is supported yet. After publication, security fixes will target the latest public Alpha only unless a release note states otherwise; older Alpha builds may be asked to upgrade before a fix is provided.

## Report a vulnerability

Do not disclose a suspected vulnerability, credential, private prompt, customer record, or repository evidence in a public issue. Before the repository becomes public, the maintainer must enable GitHub private vulnerability reporting and verify the **Security → Report a vulnerability** flow. Until that private route is available, public security reporting is not ready and publication remains blocked.

This Alpha project does not promise a response-time SLA. A public release must name the supported version and private reporting route in its release notes.

## Repository and project data

- Do not commit API keys, GitHub tokens, private prompts, or customer data to this repository.
- Initialization configuration should contain only Agent display names and Position assignments, never model credentials.
- `temple init` does not overwrite managed files whose contents differ. It also leaves an existing `AGENTS.md` unchanged unless integration is explicitly requested.
- Archify is an optional visualization adapter. It must never receive authority to approve a release or modify canonical state.

## Private Dashboard viewer

The optional Tailscale viewer keeps Temple bound to `127.0.0.1` and trusts a Tailscale identity header only for an exact runtime `*.ts.net` Host behind Tailscale Serve. Its projection excludes the Human Inbox, Agent Commands, session secrets, daemon paths, and raw events, and all remote mutations are rejected. Never bind the control plane directly to a LAN or tailnet address, invoke Funnel for it, or treat tailnet membership as Agent-command authority. Restrict the Serve endpoint with Tailscale grants; the launcher does not change network policy.

## Federation participant inspection

Federation treats every participant checkout as untrusted input. A participant path must resolve to the exact Git worktree root and remain inside the explicit federation root. Inspection runs Git noninteractively with a bounded environment, skips ambient global and system configuration, disables executable `core.fsmonitor`, repository hooks, credential helpers, replacement objects, and all transport protocols, and forbids lazy fetch. Missing objects and hostile or inconsistent repository state degrade the participant to `unknown`; they do not authorize a network request, participant write, or lifecycle mutation.
