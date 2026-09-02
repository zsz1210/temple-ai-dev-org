# Technical Design — WI-0096

## Design

Add `removeTemporaryTree(targetPath)` beside the fixture helpers. It calls `fs.rm` with:

- `recursive: true`
- `force: true`
- `maxRetries: 5`
- `retryDelay: 100`

Route the main fixture root and both standalone Phase 4B state-directory cleanup hooks through this helper. Node performs retries only for retryable recursive-removal failures; a persistent failure still rejects the test cleanup.

## Verification

Run the complete `test/phase-4b.test.mjs`, both supported Node.js full verification lanes, Doctor, and a fresh hosted full run. Keep the Node.js 24 browser gate as a regression check even though UI is unaffected.
