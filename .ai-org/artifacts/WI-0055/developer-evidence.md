# Developer evidence

Rikku implemented the accepted protocol compatibility gate at exact candidate `eef2908440d900568b07a60a221a89566615e77d`.

## Implemented

- Added explicit internal-to-wire mappings for Provider-owned sandbox and approval policies.
- Encoded `readOnly` as `read-only` and `workspaceWrite` as `workspace-write` for `thread/start` while retaining the tagged sandbox-policy objects required by `turn/start`.
- Encoded `onRequest` as `on-request` and `unlessTrusted` as `untrusted`; removed unsupported `onFailure` from the accepted caller vocabulary.
- Added fail-closed local validation before Provider contact.
- Added safe thread and turn rejection metadata: stable Temple reason, integer JSON-RPC code when present, and bounded category.
- Kept raw Provider rejection messages, prompts, hidden reasoning, credentials, and tool payloads out of returned and durable launch state.
- Updated operator documentation and captured `LESSON-0003` as a candidate Lesson rather than promoting one event into a framework-wide rule.

## Protocol evidence

- Official lifecycle: <https://developers.openai.com/codex/app-server/>
- Installed CLI: `codex-cli 0.151.0-alpha.7.2`
- Generated `ThreadStartParams` SHA-256: `792e2f32e37cece971bd616664ea2053741acbed4e9c92e9d1766427718f2ecd`
- Generated `TurnStartParams` SHA-256: `a3835e8c1e942e4b358e1a670939b89918b16c4d13105a579899892b7ade6dea`
- Detailed record: `.ai-org/artifacts/WI-0055/protocol-research.md`

## Verification

- Focused `test/control-plane-live.test.mjs`: 19 passed, 0 failed.
- Full `npm run verify`: 229 passed, 0 failed.
- Contract tests validate both sandbox mappings, all supported approval mappings, locally rejected unsupported values, no duplicate thread start, registration-before-turn, zero retry, and bounded rejection privacy.

## Boundaries

- No real `thread/start`, `turn/start`, task registration, model generation, Token observation, external write, push, deployment, publication, or release occurred.
- Passing this candidate does not claim that the next real launch, Desktop visibility, detailed Token delivery, model quality, cost, savings, or automatic routing will succeed.
