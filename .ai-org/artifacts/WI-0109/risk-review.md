# WI-0109 risk review

- **False confidence:** replay covers interpretation logic, not live transport availability or future undocumented Provider behavior. Exact schema preflight remains required.
- **Mock mirrors implementation:** fixture expectations are grounded in the installed App Server schema and the two retained real failures; the live runner imports the tested helpers instead of duplicating them.
- **Unsafe command acceptance:** every parsed action must independently match the allowlist; missing, empty, malformed, mixed, or shell-control-bearing actions fail closed.
- **Usage fabrication:** missing or non-integer Token fields remain unavailable and produce `usage-missing` for an otherwise completed turn.
- **Privacy:** fixtures and replay results exclude prompts, responses, reasoning, credentials, and account details.
- **Authority creep:** passing the offline gate does not authorize another model run, release, or publication.
