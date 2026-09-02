# WI-0107 quality evaluation

## Result

**PASS for fail-closed behavior and evidence integrity; NO-GO for Wave 5A mechanism qualification.**

The runner honored the approved zero-retry boundary. After the first candidate was rejected before generation, it recorded one launch attempt, zero completed turns, zero observed Tokens, zero disk growth, and left all four candidate repositories clean. It did not launch the remaining three candidates.

## Finding

The preflight validated the App Server transport schema but not the narrower Responses structured-output keyword subset. `uniqueItems` passed the local JSON Schema and App Server contract checks but was rejected by the provider. This is an instrumentation defect, not a product-candidate result.

## Correction review

The unsupported keyword was removed. Preflight now contains a specific regression check, passes the exact fixture, candidate, CLI, schema, model, and account controls, and performs no generation. The stopped state is intentionally retained and cannot resume automatically.

## Decision boundary

The correction does not authorize a replacement attempt. Another four-turn run requires a fresh Work Item, fresh lab root, and explicit owner authority. No Temple-versus-minimal quality or resource comparison exists from WI-0107.

