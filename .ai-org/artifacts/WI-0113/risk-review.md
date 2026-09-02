# WI-0113 risk review

## Main risks and controls

- **False cost interpretation:** label the derived value an operational budget proxy and retain account cost as unknown.
- **Hidden parent-context contamination:** remove inherited Codex task identifiers and host capability routing; verify request shape before generation.
- **Endless consumption:** keep four launches, zero retries, aggregate Token and time limits, and candidate-local hard limits.
- **Silent filesystem mutation:** inspect Git state and disk after every terminal path, including interruption.
- **Unsafe continuation:** continue only after named candidate-local limits; all authority, protocol, scope, and aggregate failures remain fatal.
- **Unintended spending:** automatic Credit reload and purchased Credits remain unauthorized; usage-reset redemption remains a separate explicit action.

## Decision

Proceed. The change narrows false-positive stopping without weakening external, filesystem, retry, model, or release boundaries.
