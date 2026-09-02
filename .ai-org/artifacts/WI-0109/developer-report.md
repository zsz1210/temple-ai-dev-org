# WI-0109 developer report

## Implemented

- Added `src/app-server-protocol-replay.mjs`, a pure interpretation layer for command actions, detailed Token usage, terminal state, Provider schema rejection, model reroutes, runtime requests, turn correlation, and structured completion.
- Refactored the Wave 5A live runner to import the same helpers tested by offline replay instead of maintaining private copies.
- Added ten bounded synthetic event scenarios grounded in the installed App Server `ItemStartedNotification` schema and retained WI-0107/WI-0108 failure categories.
- Added eight focused regression tests covering successful replay, allowed wrapped commands, forbidden/mixed/missing actions, numeric usage validation, terminal classification, structured completion, event precedence, live-runner integration, purity, and fixture privacy.
- Updated the human validation plan with the offline gate, its command, and its limits.

## Verification

- Module and live runner syntax checks: pass.
- Focused protocol and validation-program suite: 20/20 pass.
- Exact installed-schema/no-generation live-runner preflight: pass; no Codex turn started.
- Full repository verification: 288/288 pass.
- Documentation links, package boundary, and diff checks: pass.

## Boundary

No model generation, account action, external write, deployment, publication, release, or merge occurred. The offline gate reduces known protocol-regression risk but does not authorize or guarantee another live Luna run.

Candidate revision: `04ce81c0421526f6d10566dd41debbee660dd4cb`.
